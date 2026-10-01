// Package httpapi exposes the stable, credential-free HTTP contract consumed by
// the PleaseVote frontend.
package httpapi

import (
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"math"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync/atomic"
	"time"

	"github.com/averyfreeman/pleasevote/server/internal/civic"
	"github.com/averyfreeman/pleasevote/server/internal/geocoding"
	"github.com/averyfreeman/pleasevote/server/internal/provider"
	"github.com/averyfreeman/pleasevote/server/internal/voterinfo"
)

const (
	apiVersion       = "v1"
	providerName     = "google-civic-information-api"
	maxAddressLength = 500
	requestIDHeader  = "X-Request-ID"
)

var requestCounter atomic.Uint64

// Point is the public geocoded origin shape.
type Point = geocoding.Point

// Administration is a normalized Civic state/local administration record.
type Administration = civic.StateInformation

// PublicLocation is the normalized location shape consumed by the frontend.
// It retains provider hours and provenance while making category, identity,
// and coordinates explicit.
type PublicLocation struct {
	ID            string         `json:"id"`
	Kind          string         `json:"kind"`
	Address       civic.Address  `json:"address"`
	Notes         string         `json:"notes,omitempty"`
	PollingHours  string         `json:"pollingHours,omitempty"`
	VoterServices string         `json:"voterServices,omitempty"`
	StartDate     string         `json:"startDate,omitempty"`
	EndDate       string         `json:"endDate,omitempty"`
	Point         *Point         `json:"point,omitempty"`
	Sources       []civic.Source `json:"sources"`
}

// PublicContest is the normalized contest shape. It keeps the provider's
// sparse referendum and candidate fields instead of selecting only offices.
type PublicContest struct {
	ID                         string            `json:"id"`
	Type                       string            `json:"type"`
	PrimaryParty               string            `json:"primaryParty,omitempty"`
	ElectorateSpecifications   string            `json:"electorateSpecifications,omitempty"`
	Special                    string            `json:"special,omitempty"`
	BallotTitle                string            `json:"ballotTitle,omitempty"`
	Office                     string            `json:"office,omitempty"`
	Level                      []string          `json:"level,omitempty"`
	Roles                      []string          `json:"roles,omitempty"`
	District                   *civic.District   `json:"district,omitempty"`
	NumberElected              *civic.Integer    `json:"numberElected,omitempty"`
	NumberVotingFor            *civic.Integer    `json:"numberVotingFor,omitempty"`
	BallotPlacement            *civic.Integer    `json:"ballotPlacement,omitempty"`
	Candidates                 []civic.Candidate `json:"candidates"`
	ReferendumTitle            string            `json:"referendumTitle,omitempty"`
	ReferendumSubtitle         string            `json:"referendumSubtitle,omitempty"`
	ReferendumURL              string            `json:"referendumUrl,omitempty"`
	ReferendumBrief            string            `json:"referendumBrief,omitempty"`
	ReferendumText             string            `json:"referendumText,omitempty"`
	ReferendumPassageThreshold string            `json:"referendumPassageThreshold,omitempty"`
	ReferendumEffectOfAbstain  string            `json:"referendumEffectOfAbstain,omitempty"`
	Sources                    []civic.Source    `json:"sources"`
}

// PublicAdministration flattens the nested state/local Civic tree into one
// card while retaining official links and source labels.
type PublicAdministration struct {
	Name                                string                   `json:"name,omitempty"`
	ElectionInfoURL                     string                   `json:"electionInfoUrl,omitempty"`
	ElectionRegistrationURL             string                   `json:"electionRegistrationUrl,omitempty"`
	ElectionRegistrationConfirmationURL string                   `json:"electionRegistrationConfirmationUrl,omitempty"`
	VotingLocationFinderURL             string                   `json:"votingLocationFinderUrl,omitempty"`
	BallotInfoURL                       string                   `json:"ballotInfoUrl,omitempty"`
	ElectionRulesURL                    string                   `json:"electionRulesUrl,omitempty"`
	ElectionNoticeText                  string                   `json:"electionNoticeText,omitempty"`
	ElectionNoticeURL                   string                   `json:"electionNoticeUrl,omitempty"`
	AbsenteeVotingInfoURL               string                   `json:"absenteeVotingInfoUrl,omitempty"`
	VoterServices                       []string                 `json:"voterServices"`
	HoursOfOperation                    string                   `json:"hoursOfOperation,omitempty"`
	CorrespondenceAddress               *civic.Address           `json:"correspondenceAddress,omitempty"`
	PhysicalAddress                     *civic.Address           `json:"physicalAddress,omitempty"`
	ElectionOfficials                   []civic.ElectionOfficial `json:"electionOfficials"`
	Jurisdiction                        string                   `json:"jurisdiction,omitempty"`
	Sources                             []civic.Source           `json:"sources"`
}

// Retrieval records safe provenance and correlation metadata for a response.
type Retrieval struct {
	APIVersion     string `json:"apiVersion"`
	RequestID      string `json:"requestId"`
	RetrievedAt    string `json:"retrievedAt"`
	Provider       string `json:"provider"`
	ElectionID     string `json:"electionId,omitempty"`
	CivicEndpoint  string `json:"civicEndpoint"`
	FallbackUsed   bool   `json:"fallbackUsed"`
	DataSource     string `json:"dataSource,omitempty"`
	ProviderStatus string `json:"providerStatus,omitempty"`
}

// LookupResponse is the direct frontend-facing v1 lookup shape. It intentionally
// contains the entered address but never stores it in logs or server state.
type LookupResponse struct {
	Address           string                 `json:"address"`
	NormalizedAddress civic.Address          `json:"normalizedAddress"`
	Origin            Point                  `json:"origin"`
	Election          civic.Election         `json:"election"`
	Mode              voterinfo.Mode         `json:"mode"`
	Warning           string                 `json:"warning,omitempty"`
	PollingLocations  []PublicLocation       `json:"pollingLocations"`
	EarlyVoteSites    []PublicLocation       `json:"earlyVoteSites"`
	DropOffLocations  []PublicLocation       `json:"dropOffLocations"`
	Contests          []PublicContest        `json:"contests"`
	Administration    []PublicAdministration `json:"administration"`
	OtherElections    []civic.Election       `json:"otherElections"`
	Sources           []civic.Source         `json:"sources"`
	MailOnly          bool                   `json:"mailOnly"`
	Retrieval         Retrieval              `json:"retrieval"`
}

// DiscoveryResponse reuses the lookup projection while making the separate
// alternate-place eligibility warning and jurisdiction comparison explicit.
type DiscoveryResponse struct {
	LookupResponse
	JurisdictionComparison string `json:"jurisdictionComparison"`
}

// ElectionsResponse is the direct frontend-facing v1 election-list shape.
type ElectionsResponse struct {
	Elections []civic.Election `json:"elections"`
	Retrieval Retrieval        `json:"retrieval"`
}

// DivisionsResponse is the normalized wrapper around Civic's official search
// response, with safe retrieval metadata for browser diagnostics.
type DivisionsResponse struct {
	Results   []civic.Division `json:"results"`
	Kind      string           `json:"kind,omitempty"`
	Retrieval Retrieval        `json:"retrieval"`
}

// DivisionsByAddressResponse preserves Civic's map-shaped address response.
type DivisionsByAddressResponse struct {
	Divisions       map[string]civic.Division `json:"divisions"`
	NormalizedInput civic.Address             `json:"normalizedInput"`
	Kind            string                    `json:"kind,omitempty"`
	Retrieval       Retrieval                 `json:"retrieval"`
}

// PublicError is the redacted error object returned to the frontend.
type PublicError struct {
	Code      string `json:"code"`
	Message   string `json:"message"`
	Retryable bool   `json:"retryable"`
}

type errorResponse struct {
	OK        bool        `json:"ok"`
	Error     PublicError `json:"error"`
	Retrieval Retrieval   `json:"retrieval"`
}

// Config supplies the service and logger used by the HTTP handler.
type Config struct {
	Service   *voterinfo.Service
	Logger    *slog.Logger
	Clock     func() time.Time
	StaticDir string
}

type handler struct {
	service   *voterinfo.Service
	logger    *slog.Logger
	clock     func() time.Time
	static    http.Handler
	staticDir string
}

// NewHandler creates the native net/http API boundary.
func NewHandler(config Config) http.Handler {
	logger := config.Logger
	if logger == nil {
		logger = slog.Default()
	}
	clock := config.Clock
	if clock == nil {
		clock = time.Now
	}
	return &handler{service: config.Service, logger: logger, clock: clock, staticDir: config.StaticDir}
}

func (h *handler) ServeHTTP(responseWriter http.ResponseWriter, request *http.Request) {
	requestID := requestID(request)
	responseWriter.Header().Set(requestIDHeader, requestID)
	switch request.URL.Path {
	case "/healthz":
		if request.Method != http.MethodGet {
			h.writeError(responseWriter, requestID, http.StatusMethodNotAllowed, "method_not_allowed", "only GET is supported", false, "healthz")
			return
		}
		h.writeJSON(responseWriter, http.StatusOK, map[string]string{"status": "ok"})
	case "/api/v1/openapi.json":
		if request.Method != http.MethodGet {
			h.writeError(responseWriter, requestID, http.StatusMethodNotAllowed, "method_not_allowed", "only GET is supported", false, "openapi")
			return
		}
		h.writeOpenAPI(responseWriter)
	case "/api/v1/elections":
		if request.Method != http.MethodGet {
			h.writeError(responseWriter, requestID, http.StatusMethodNotAllowed, "method_not_allowed", "only GET is supported", false, "elections")
			return
		}
		h.handleElections(responseWriter, requestID, request)
	case "/api/v1/divisions":
		if request.Method != http.MethodGet {
			h.writeError(responseWriter, requestID, http.StatusMethodNotAllowed, "method_not_allowed", "only GET is supported", false, "divisions")
			return
		}
		h.handleDivisions(responseWriter, requestID, request)
	case "/api/v1/divisionsByAddress":
		if request.Method != http.MethodGet {
			h.writeError(responseWriter, requestID, http.StatusMethodNotAllowed, "method_not_allowed", "only GET is supported", false, "divisionsByAddress")
			return
		}
		h.handleDivisionsByAddress(responseWriter, requestID, request)
	case "/api/v1/lookup":
		if request.Method != http.MethodGet {
			h.writeError(responseWriter, requestID, http.StatusMethodNotAllowed, "method_not_allowed", "only GET is supported", false, "lookup")
			return
		}
		h.handleLookup(responseWriter, requestID, request)
	case "/api/v1/discovery":
		if request.Method != http.MethodGet {
			h.writeError(responseWriter, requestID, http.StatusMethodNotAllowed, "method_not_allowed", "only GET is supported", false, "discovery")
			return
		}
		h.handleDiscovery(responseWriter, requestID, request)
	case "/api/docs":
		if request.Method != http.MethodGet {
			h.writeError(responseWriter, requestID, http.StatusMethodNotAllowed, "method_not_allowed", "only GET is supported", false, "docs")
			return
		}
		h.writeDocs(responseWriter)
	default:
		if h.staticDir != "" {
			h.serveStatic(responseWriter, request)
			return
		}
		h.writeError(responseWriter, requestID, http.StatusNotFound, "not_found", "the requested API route does not exist", false, "route")
	}
}

func (h *handler) handleElections(responseWriter http.ResponseWriter, requestID string, request *http.Request) {
	if h.service == nil {
		h.writeError(responseWriter, requestID, http.StatusInternalServerError, "server_configuration", "the voter-information service is not configured", false, "elections")
		return
	}
	elections, mode, err := h.service.ElectionsWithSource(request.Context())
	if err != nil {
		h.writeProviderError(responseWriter, requestID, err, "elections")
		return
	}
	retrieval := h.retrieval(requestID, "")
	retrieval.CivicEndpoint = "elections"
	retrieval.DataSource = dataSource(mode)
	h.writeJSON(responseWriter, http.StatusOK, ElectionsResponse{
		Elections: nonNilElections(elections.Elections),
		Retrieval: retrieval,
	})
}

func (h *handler) handleDivisions(responseWriter http.ResponseWriter, requestID string, request *http.Request) {
	query := strings.TrimSpace(request.URL.Query().Get("query"))
	if len(query) > maxAddressLength {
		h.writeError(responseWriter, requestID, http.StatusBadRequest, "invalid_request", "query is too long", false, "divisions")
		return
	}
	if h.service == nil {
		h.writeError(responseWriter, requestID, http.StatusInternalServerError, "server_configuration", "the voter-information service is not configured", false, "divisions")
		return
	}
	divisions, err := h.service.Divisions(request.Context(), query)
	if err != nil {
		h.writeProviderError(responseWriter, requestID, err, "divisions")
		return
	}
	retrieval := h.retrieval(requestID, "")
	retrieval.CivicEndpoint = "divisions"
	h.writeJSON(responseWriter, http.StatusOK, DivisionsResponse{Results: nonNilDivisions(divisions.Results), Kind: divisions.Kind, Retrieval: retrieval})
}

func (h *handler) handleDivisionsByAddress(responseWriter http.ResponseWriter, requestID string, request *http.Request) {
	address := strings.TrimSpace(request.URL.Query().Get("address"))
	if address == "" {
		h.writeError(responseWriter, requestID, http.StatusBadRequest, "invalid_request", "address is required", false, "divisionsByAddress")
		return
	}
	if len(address) > maxAddressLength {
		h.writeError(responseWriter, requestID, http.StatusBadRequest, "invalid_request", "address is too long", false, "divisionsByAddress")
		return
	}
	if h.service == nil {
		h.writeError(responseWriter, requestID, http.StatusInternalServerError, "server_configuration", "the voter-information service is not configured", false, "divisionsByAddress")
		return
	}
	divisions, err := h.service.DivisionsByAddress(request.Context(), address)
	if err != nil {
		h.writeProviderError(responseWriter, requestID, err, "divisionsByAddress")
		return
	}
	retrieval := h.retrieval(requestID, "")
	retrieval.CivicEndpoint = "divisionsByAddress"
	h.writeJSON(responseWriter, http.StatusOK, DivisionsByAddressResponse{Divisions: nonNilDivisionMap(divisions.Divisions), NormalizedInput: divisions.NormalizedInput, Kind: divisions.Kind, Retrieval: retrieval})
}

func nonNilElections(values []civic.Election) []civic.Election {
	if values == nil {
		return []civic.Election{}
	}
	return values
}

func (h *handler) handleLookup(responseWriter http.ResponseWriter, requestID string, request *http.Request) {
	address := strings.TrimSpace(request.URL.Query().Get("address"))
	if address == "" {
		h.writeError(responseWriter, requestID, http.StatusBadRequest, "invalid_request", "address is required", false, "lookup")
		return
	}
	if len(address) > maxAddressLength {
		h.writeError(responseWriter, requestID, http.StatusBadRequest, "invalid_request", "address is too long", false, "lookup")
		return
	}

	electionID, err := electionID(request.URL.Query().Get("electionId"))
	if err != nil {
		h.writeError(responseWriter, requestID, http.StatusBadRequest, "invalid_request", err.Error(), false, "lookup")
		return
	}
	if h.service == nil {
		h.writeError(responseWriter, requestID, http.StatusInternalServerError, "server_configuration", "the voter-information service is not configured", false, "lookup")
		return
	}
	lookup, err := h.service.Lookup(request.Context(), address, electionID)
	if err != nil {
		h.writeProviderError(responseWriter, requestID, err, "lookup")
		return
	}
	response := h.lookupResponse(lookup, requestID)
	h.writeJSON(responseWriter, http.StatusOK, response)
}

func (h *handler) handleDiscovery(responseWriter http.ResponseWriter, requestID string, request *http.Request) {
	address := strings.TrimSpace(request.URL.Query().Get("address"))
	if address == "" {
		h.writeError(responseWriter, requestID, http.StatusBadRequest, "invalid_request", "address is required", false, "discovery")
		return
	}
	if len(address) > maxAddressLength {
		h.writeError(responseWriter, requestID, http.StatusBadRequest, "invalid_request", "address is too long", false, "discovery")
		return
	}
	electionID, err := electionID(request.URL.Query().Get("electionId"))
	if err != nil {
		h.writeError(responseWriter, requestID, http.StatusBadRequest, "invalid_request", err.Error(), false, "discovery")
		return
	}
	if h.service == nil {
		h.writeError(responseWriter, requestID, http.StatusInternalServerError, "server_configuration", "the voter-information service is not configured", false, "discovery")
		return
	}
	lookup, err := h.service.Lookup(request.Context(), address, electionID)
	if err != nil {
		h.writeProviderError(responseWriter, requestID, err, "discovery")
		return
	}
	response := h.lookupResponse(lookup, requestID)
	response.Warning = "This alternate-place discovery lookup does not establish voter eligibility at this place. Confirm the current rules with the official election administrator."
	h.writeJSON(responseWriter, http.StatusOK, DiscoveryResponse{LookupResponse: response, JurisdictionComparison: "unknown"})
}

func (h *handler) lookupResponse(lookup voterinfo.LookupResult, requestID string) LookupResponse {
	retrieval := h.retrieval(requestID, lookup.Election.ID)
	retrieval.FallbackUsed = lookup.Mode == voterinfo.ModeTestFixture
	retrieval.DataSource = lookup.DataSource
	retrieval.ProviderStatus = lookup.ProviderStatus
	return LookupResponse{
		Address:           lookup.Address,
		NormalizedAddress: lookup.NormalizedAddress,
		Origin:            lookup.Origin.Location,
		Election:          lookup.Election,
		Mode:              lookup.Mode,
		Warning:           lookup.Warning,
		PollingLocations:  publicLocations(lookup.PollingLocations, "polling"),
		EarlyVoteSites:    publicLocations(lookup.EarlyVoteSites, "early-vote"),
		DropOffLocations:  publicLocations(lookup.DropOffLocations, "drop-off"),
		Contests:          publicContests(lookup.Contests),
		Administration:    publicAdministration(lookup.Administration),
		OtherElections:    lookup.OtherElections,
		Sources:           lookup.Sources,
		MailOnly:          lookup.MailOnly,
		Retrieval:         retrieval,
	}
}

func publicLocations(values []civic.PollingLocation, kind string) []PublicLocation {
	locations := make([]PublicLocation, 0, len(values))
	for index, value := range values {
		address := value.Address
		if address.LocationName == "" && value.Name != "" {
			address.LocationName = value.Name
		}
		point := publicPoint(value.Latitude, value.Longitude)
		locations = append(locations, PublicLocation{
			ID:            fmt.Sprintf("%s-%d", kind, index),
			Kind:          kind,
			Address:       address,
			Notes:         value.Notes,
			PollingHours:  value.PollingHours,
			VoterServices: value.VoterServices,
			StartDate:     value.StartDate,
			EndDate:       value.EndDate,
			Point:         point,
			Sources:       nonNilSources(value.Sources),
		})
	}
	return locations
}

func publicPoint(latitude *civic.Coordinate, longitude *civic.Coordinate) *Point {
	if latitude == nil || longitude == nil {
		return nil
	}
	point := &Point{Latitude: float64(*latitude), Longitude: float64(*longitude)}
	if math.IsNaN(point.Latitude) || math.IsInf(point.Latitude, 0) ||
		math.IsNaN(point.Longitude) || math.IsInf(point.Longitude, 0) ||
		point.Latitude < -90 || point.Latitude > 90 ||
		point.Longitude < -180 || point.Longitude > 180 {
		return nil
	}
	return point
}

func publicContests(values []civic.Contest) []PublicContest {
	contests := make([]PublicContest, 0, len(values))
	for index, value := range values {
		contests = append(contests, PublicContest{
			ID:                         fmt.Sprintf("contest-%d", index),
			Type:                       value.Type,
			PrimaryParty:               value.PrimaryParty,
			ElectorateSpecifications:   value.ElectorateSpecifications,
			Special:                    value.Special,
			BallotTitle:                value.BallotTitle,
			Office:                     value.Office,
			Level:                      value.Level,
			Roles:                      value.Roles,
			District:                   value.District,
			NumberElected:              value.NumberElected,
			NumberVotingFor:            value.NumberVotingFor,
			BallotPlacement:            value.BallotPlacement,
			Candidates:                 nonNilCandidates(value.Candidates),
			ReferendumTitle:            value.ReferendumTitle,
			ReferendumSubtitle:         value.ReferendumSubtitle,
			ReferendumURL:              value.ReferendumURL,
			ReferendumBrief:            value.ReferendumBrief,
			ReferendumText:             value.ReferendumText,
			ReferendumPassageThreshold: value.ReferendumPassageThreshold,
			ReferendumEffectOfAbstain:  value.ReferendumEffectOfAbstain,
			Sources:                    nonNilSources(value.Sources),
		})
	}
	return contests
}

func publicAdministration(values []civic.StateInformation) []PublicAdministration {
	records := make([]PublicAdministration, 0, len(values))
	for _, value := range values {
		body := value.ElectionAdministrationBody
		if body == nil && value.LocalJurisdiction != nil {
			body = value.LocalJurisdiction.ElectionAdministrationBody
		}
		record := PublicAdministration{
			Name:         value.Name,
			Jurisdiction: "",
			Sources:      append([]civic.Source{}, value.Sources...),
		}
		if value.LocalJurisdiction != nil {
			record.Jurisdiction = value.LocalJurisdiction.Name
			record.Sources = append(record.Sources, value.LocalJurisdiction.Sources...)
		}
		if body != nil {
			record.Name = firstNonEmpty(body.Name, record.Name)
			record.ElectionInfoURL = body.ElectionInfoURL
			record.ElectionRegistrationURL = body.ElectionRegistrationURL
			record.ElectionRegistrationConfirmationURL = body.ElectionRegistrationConfirmationURL
			record.VotingLocationFinderURL = body.VotingLocationFinderURL
			record.BallotInfoURL = body.BallotInfoURL
			record.ElectionRulesURL = body.ElectionRulesURL
			record.ElectionNoticeText = body.ElectionNoticeText
			record.ElectionNoticeURL = body.ElectionNoticeURL
			record.AbsenteeVotingInfoURL = body.AbsenteeVotingInfoURL
			record.VoterServices = nonNilStrings(body.VoterServices)
			record.HoursOfOperation = body.HoursOfOperation
			record.CorrespondenceAddress = body.CorrespondenceAddress
			record.PhysicalAddress = body.PhysicalAddress
			record.ElectionOfficials = nonNilElectionOfficials(body.ElectionOfficials)
		}
		if record.VoterServices == nil {
			record.VoterServices = []string{}
		}
		if record.ElectionOfficials == nil {
			record.ElectionOfficials = []civic.ElectionOfficial{}
		}
		record.Sources = nonNilSources(record.Sources)
		records = append(records, record)
	}
	return records
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if value != "" {
			return value
		}
	}
	return ""
}

func nonNilSources(values []civic.Source) []civic.Source {
	if values == nil {
		return []civic.Source{}
	}
	return values
}

func nonNilCandidates(values []civic.Candidate) []civic.Candidate {
	if values == nil {
		return []civic.Candidate{}
	}
	return values
}

func nonNilStrings(values []string) []string {
	if values == nil {
		return []string{}
	}
	return values
}

func nonNilElectionOfficials(values []civic.ElectionOfficial) []civic.ElectionOfficial {
	if values == nil {
		return []civic.ElectionOfficial{}
	}
	return values
}

func nonNilDivisions(values []civic.Division) []civic.Division {
	if values == nil {
		return []civic.Division{}
	}
	return values
}

func nonNilDivisionMap(values map[string]civic.Division) map[string]civic.Division {
	if values == nil {
		return map[string]civic.Division{}
	}
	return values
}

func dataSource(mode voterinfo.Mode) string {
	if mode == voterinfo.ModeTestFixture {
		return "test-fixture"
	}
	return "live"
}

func (h *handler) writeDocs(responseWriter http.ResponseWriter) {
	responseWriter.Header().Set("Content-Type", "text/html; charset=utf-8")
	responseWriter.WriteHeader(http.StatusOK)
	_, _ = responseWriter.Write([]byte(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>PleaseVote API docs</title><style>body{font:16px system-ui;max-width:52rem;margin:3rem auto;padding:0 1rem;line-height:1.6;background:#10071d;color:#f6edff}a{color:#e9d5ff}</style></head><body><h1>PleaseVote API</h1><p>This service provides neutral voter-information data. The machine-readable contract is available at <a href="/api/v1/openapi.json">/api/v1/openapi.json</a>.</p><p>Provider keys remain server-side. Lookup records are not assignments or legal eligibility determinations.</p></body></html>`))
}

func (h *handler) serveStatic(responseWriter http.ResponseWriter, request *http.Request) {
	cleanPath := filepath.Clean("/" + strings.TrimPrefix(request.URL.Path, "/"))
	filePath := filepath.Join(h.staticDir, cleanPath)
	if info, err := os.Stat(filePath); err == nil && !info.IsDir() {
		http.ServeFile(responseWriter, request, filePath)
		return
	}
	indexPath := filepath.Join(h.staticDir, "index.html")
	if _, err := os.Stat(indexPath); err == nil {
		http.ServeFile(responseWriter, request, indexPath)
		return
	}
	h.writeJSON(responseWriter, http.StatusNotFound, map[string]string{"error": "static frontend is not built"})
}

func electionID(value string) (*int64, error) {
	if value == "" {
		return nil, nil
	}
	parsed, err := strconv.ParseInt(value, 10, 64)
	if err != nil || parsed <= 0 {
		return nil, fmt.Errorf("electionId must be a positive integer")
	}
	return &parsed, nil
}

func (h *handler) retrieval(requestID string, electionID string) Retrieval {
	return Retrieval{
		APIVersion:    apiVersion,
		RequestID:     requestID,
		RetrievedAt:   h.clock().UTC().Format(time.RFC3339),
		Provider:      providerName,
		ElectionID:    electionID,
		CivicEndpoint: "voterinfo",
	}
}

func (h *handler) writeProviderError(responseWriter http.ResponseWriter, requestID string, err error, operation string) {
	status, publicError := classifyError(err)
	pLog := slog.String("operation", operation)
	var providerError *provider.Error
	if errors.As(err, &providerError) {
		pLog = slog.String("operation", providerError.Operation)
	}
	h.logger.Error("provider boundary request failed",
		slog.String("request_id", requestID),
		pLog,
		slog.String("error_code", publicError.Code),
		slog.Int("status", status),
	)
	h.writeError(responseWriter, requestID, status, publicError.Code, publicError.Message, publicError.Retryable, operation)
}

func classifyError(err error) (int, PublicError) {
	var providerError *provider.Error
	if !errors.As(err, &providerError) {
		return http.StatusInternalServerError, PublicError{Code: "internal_error", Message: "the voter-information service could not complete the request"}
	}
	switch providerError.Kind {
	case provider.KindInvalidRequest:
		return http.StatusBadRequest, PublicError{Code: "invalid_request", Message: "the provider rejected the request"}
	case provider.KindNoData:
		if strings.HasPrefix(providerError.Operation, "geocoding.") {
			return http.StatusUnprocessableEntity, PublicError{Code: "address_not_found", Message: "the address could not be located"}
		}
		return http.StatusNotFound, PublicError{Code: "no_data", Message: "no voter information is available for that request"}
	case provider.KindUnauthorized:
		return http.StatusBadGateway, PublicError{Code: "upstream_authentication", Message: "an upstream provider rejected its configured credential"}
	case provider.KindRateLimited, provider.KindUnavailable, provider.KindNetwork:
		return http.StatusBadGateway, PublicError{Code: "upstream_unavailable", Message: "an upstream provider is temporarily unavailable", Retryable: providerError.Retryable}
	case provider.KindInvalidResponse:
		return http.StatusBadGateway, PublicError{Code: "upstream_invalid_response", Message: "an upstream provider returned unusable data"}
	case provider.KindConfiguration:
		return http.StatusInternalServerError, PublicError{Code: "server_configuration", Message: "the voter-information service is not configured"}
	default:
		return http.StatusInternalServerError, PublicError{Code: "internal_error", Message: "the voter-information service could not complete the request"}
	}
}

func (h *handler) writeError(responseWriter http.ResponseWriter, requestID string, status int, code string, message string, retryable bool, operation string) {
	h.logger.Error("HTTP request failed",
		slog.String("request_id", requestID),
		slog.String("operation", operation),
		slog.String("error_code", code),
		slog.Int("status", status),
	)
	h.writeJSON(responseWriter, status, errorResponse{
		OK:        false,
		Error:     PublicError{Code: code, Message: message, Retryable: retryable},
		Retrieval: h.retrieval(requestID, ""),
	})
}

func (h *handler) writeJSON(responseWriter http.ResponseWriter, status int, value any) {
	responseWriter.Header().Set("Content-Type", "application/json; charset=utf-8")
	responseWriter.WriteHeader(status)
	_ = json.NewEncoder(responseWriter).Encode(value)
}

func requestID(request *http.Request) string {
	provided := strings.TrimSpace(request.Header.Get(requestIDHeader))
	if provided != "" && len(provided) <= 64 {
		valid := true
		for _, character := range provided {
			if !(character == '-' || character == '_' || character == '.' || character >= '0' && character <= '9' || character >= 'A' && character <= 'Z' || character >= 'a' && character <= 'z') {
				valid = false
				break
			}
		}
		if valid {
			return provided
		}
	}
	return fmt.Sprintf("pv-%d", requestCounter.Add(1))
}
