// Package voterinfo selects Civic election data and projects it into the
// stable provider-boundary model consumed by the HTTP API.
package voterinfo

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"log/slog"
	"math"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/averyfreeman/pleasevote/server/internal/civic"
	"github.com/averyfreeman/pleasevote/server/internal/geocoding"
	"github.com/averyfreeman/pleasevote/server/internal/provider"
)

// TestElectionID is the stable Civic VIP fixture election documented for API testing.
const TestElectionID int64 = 2000

// Mode identifies whether the result came from a live provider or the
// explicitly labelled local Civic test fixture.
type Mode string

const (
	// ModeLive is data selected from an upcoming non-test election.
	ModeLive Mode = "live"
	// ModeTestFixture is deterministic local Civic sample data selected only in
	// debug mode.
	ModeTestFixture Mode = "test-fixture"
)

// Config supplies the external provider seams and clock used by Service.
type Config struct {
	Civic    civic.Client
	Fixture  civic.Client
	Geocoder geocoding.Client
	Now      func() time.Time
	Debug    bool
	Logger   *slog.Logger
}

// Service is the election-selection and geocoding application boundary.
type Service struct {
	civic          civic.Client
	fixture        civic.Client
	geocoder       geocoding.Client
	now            func() time.Time
	testElectionID int64
	debug          bool
	logger         *slog.Logger
}

// LookupResult is a lossless, frontend-ready combination of geocoded origin
// and Civic voter information.
type LookupResult struct {
	Address           string
	NormalizedAddress civic.Address
	Origin            geocoding.Result
	Election          civic.Election
	Mode              Mode
	Warning           string
	PollingLocations  []civic.PollingLocation
	EarlyVoteSites    []civic.PollingLocation
	DropOffLocations  []civic.PollingLocation
	Contests          []civic.Contest
	Administration    []civic.StateInformation
	OtherElections    []civic.Election
	Sources           []civic.Source
	MailOnly          bool
	ProviderStatus    string
	DataSource        string
}

// NewService creates the selection service without making provider calls.
func NewService(config Config) *Service {
	now := config.Now
	if now == nil {
		now = time.Now
	}
	logger := config.Logger
	if logger == nil {
		logger = slog.Default()
	}
	return &Service{
		civic:          config.Civic,
		fixture:        config.Fixture,
		geocoder:       config.Geocoder,
		now:            now,
		testElectionID: TestElectionID,
		debug:          config.Debug,
		logger:         logger,
	}
}

// Elections returns the currently advertised Civic election list.
func (s *Service) Elections(ctx context.Context) (civic.ElectionsResponse, error) {
	response, _, err := s.elections(ctx)
	return response, err
}

// ElectionsWithSource returns the advertised elections and whether the list
// itself came from the local debug fixture.
func (s *Service) ElectionsWithSource(ctx context.Context) (civic.ElectionsResponse, Mode, error) {
	return s.elections(ctx)
}

// Divisions proxies the official Civic division search through the same
// server-side provider boundary as voter information.
func (s *Service) Divisions(ctx context.Context, query string) (civic.DivisionSearchResponse, error) {
	client, err := s.operationClient("civic.divisions")
	if err != nil {
		return civic.DivisionSearchResponse{}, err
	}
	return client.Divisions(ctx, query)
}

// DivisionsByAddress proxies the official Civic address division lookup.
func (s *Service) DivisionsByAddress(ctx context.Context, address string) (civic.DivisionsByAddressResponse, error) {
	client, err := s.operationClient("civic.divisionsByAddress")
	if err != nil {
		return civic.DivisionsByAddressResponse{}, err
	}
	return client.DivisionsByAddress(ctx, address)
}

func (s *Service) operationClient(operation string) (civic.Client, error) {
	if s != nil && s.civic != nil {
		return s.civic, nil
	}
	if s != nil && s.debug && s.fixture != nil {
		return s.fixture, nil
	}
	return nil, &provider.Error{Kind: provider.KindConfiguration, Operation: operation, Message: "Civic provider is not configured"}
}

func (s *Service) elections(ctx context.Context) (civic.ElectionsResponse, Mode, error) {
	if s == nil || s.civic == nil {
		if s != nil && s.debug && s.fixture != nil {
			response, err := s.fixture.ListElections(ctx)
			if err == nil {
				return ensureTestElection(response), ModeTestFixture, nil
			}
		}
		return civic.ElectionsResponse{}, ModeLive, &provider.Error{Kind: provider.KindConfiguration, Operation: "civic.elections", Message: "Civic provider is not configured"}
	}
	response, err := s.civic.ListElections(ctx)
	if err != nil {
		if s.debug && s.fixture != nil {
			fixtureResponse, fixtureErr := s.fixture.ListElections(ctx)
			if fixtureErr == nil {
				s.logger.DebugContext(ctx, "using Civic fixture election list", "operation", "civic.elections", "reason", "live_list_failed")
				return ensureTestElection(fixtureResponse), ModeTestFixture, nil
			}
		}
		return civic.ElectionsResponse{}, ModeLive, err
	}
	if s.debug {
		if len(response.Elections) == 0 && s.fixture != nil {
			fixtureResponse, fixtureErr := s.fixture.ListElections(ctx)
			if fixtureErr == nil {
				s.logger.DebugContext(ctx, "using Civic fixture election list", "operation", "civic.elections", "reason", "live_list_empty")
				return ensureTestElection(fixtureResponse), ModeTestFixture, nil
			}
		}
		response = ensureTestElection(response)
	}
	return response, ModeLive, nil
}

// Lookup geocodes an address and selects the nearest upcoming live election.
// In debug mode, a missing usable live result is served by the local Civic
// election 2000 fixture. Normal mode never substitutes local fixture data.
// An explicit election ID is never silently replaced.
func (s *Service) Lookup(ctx context.Context, address string, requestedElectionID *int64) (LookupResult, error) {
	trimmedAddress := strings.TrimSpace(address)
	if trimmedAddress == "" {
		return LookupResult{}, &provider.Error{Kind: provider.KindInvalidRequest, Operation: "lookup", Message: "address is required"}
	}
	if s == nil || s.geocoder == nil || (s.civic == nil && !(s.debug && s.fixture != nil)) {
		return LookupResult{}, &provider.Error{Kind: provider.KindConfiguration, Operation: "lookup", Message: "lookup providers are not configured"}
	}
	if requestedElectionID != nil && *requestedElectionID <= 0 {
		return LookupResult{}, &provider.Error{Kind: provider.KindInvalidRequest, Operation: "lookup", Message: "electionId must be positive"}
	}
	s.logger.DebugContext(ctx, "starting Civic lookup", "operation", "lookup", "address_fingerprint", addressFingerprint(trimmedAddress), "explicit_election", requestedElectionID != nil)

	origin, err := s.geocoder.Geocode(ctx, trimmedAddress)
	if err != nil {
		return LookupResult{}, err
	}
	if !validPoint(origin.Location) {
		return LookupResult{}, &provider.Error{Kind: provider.KindInvalidResponse, Operation: "geocoding.lookup", Message: "geocoding returned invalid coordinates"}
	}

	if requestedElectionID != nil {
		if *requestedElectionID == s.testElectionID && s.debug && s.fixture != nil {
			return s.lookupFixture(ctx, trimmedAddress, origin)
		}
		if s.civic == nil {
			return LookupResult{}, noVoterInformationError("civic.voterinfo")
		}
		response, lookupErr := s.civic.VoterInfo(ctx, trimmedAddress, requestedElectionID)
		if lookupErr != nil {
			return LookupResult{}, lookupErr
		}
		if err := validateElectionResponse(response, strconv.FormatInt(*requestedElectionID, 10)); err != nil {
			return LookupResult{}, err
		}
		if !response.HasUserInformation() {
			return LookupResult{}, noVoterInformationError("civic.voterinfo")
		}
		mode := ModeLive
		warning := ""
		return project(trimmedAddress, origin, response, mode, warning), nil
	}

	elections, err := s.Elections(ctx)
	if err != nil {
		return LookupResult{}, err
	}
	for _, election := range upcomingLiveElections(elections.Elections, s.now(), s.testElectionID) {
		electionID, parseErr := strconv.ParseInt(election.ID, 10, 64)
		if parseErr != nil || electionID <= 0 {
			continue
		}
		response, lookupErr := s.civic.VoterInfo(ctx, trimmedAddress, &electionID)
		if lookupErr != nil {
			if provider.IsNoData(lookupErr) {
				continue
			}
			return LookupResult{}, lookupErr
		}
		if err := validateElectionResponse(response, election.ID); err != nil {
			return LookupResult{}, err
		}
		if !response.HasUserInformation() {
			continue
		}
		return project(trimmedAddress, origin, response, ModeLive, ""), nil
	}

	if s.debug && s.fixture != nil {
		return s.lookupFixture(ctx, trimmedAddress, origin)
	}
	return LookupResult{}, noVoterInformationError("civic.voterinfo")
}

const testElectionWarning = "Sample data from Civic's VIP Test Election (2000) is shown for debugging. These locations, contests, and hours are not matched to the submitted address or a current election. Confirm current details with the official election administrator."

func noVoterInformationError(operation string) error {
	return &provider.Error{Kind: provider.KindNoData, Operation: operation, Message: "Civic returned no voter information"}
}

func project(address string, origin geocoding.Result, response civic.VoterInfoResponse, mode Mode, warning string) LookupResult {
	dataSource := "live"
	if mode == ModeTestFixture {
		dataSource = "test-fixture"
	}
	if warning == "" && response.Status != "" && !strings.EqualFold(strings.TrimSpace(response.Status), "success") {
		warning = "Civic returned useful records with a partial provider status. Review the official election links before relying on these details."
	}
	return LookupResult{
		Address:           address,
		NormalizedAddress: response.NormalizedInput,
		Origin:            origin,
		Election:          response.Election,
		Mode:              mode,
		Warning:           warning,
		PollingLocations:  nonNilPollingLocations(response.PollingLocations),
		EarlyVoteSites:    nonNilPollingLocations(response.EarlyVoteSites),
		DropOffLocations:  nonNilPollingLocations(response.DropOffLocations),
		Contests:          nonNilContests(response.Contests),
		Administration:    nonNilAdministration(response.State),
		OtherElections:    nonNilElections(response.OtherElections),
		Sources:           collectSources(response),
		MailOnly:          response.MailOnly,
		ProviderStatus:    response.Status,
		DataSource:        dataSource,
	}
}

func (s *Service) lookupFixture(ctx context.Context, address string, origin geocoding.Result) (LookupResult, error) {
	testID := s.testElectionID
	response, err := s.fixture.VoterInfo(ctx, address, &testID)
	if err != nil {
		return LookupResult{}, err
	}
	if err := validateElectionResponse(response, strconv.FormatInt(s.testElectionID, 10)); err != nil {
		return LookupResult{}, err
	}
	if !response.HasUserInformation() {
		return LookupResult{}, noVoterInformationError("civic.fixture.voterinfo")
	}
	s.logger.DebugContext(ctx, "using Civic test fixture", "operation", "civic.voterinfo", "election_id", s.testElectionID, "address_fingerprint", addressFingerprint(address))
	return project(address, origin, response, ModeTestFixture, testElectionWarning), nil
}

func ensureTestElection(response civic.ElectionsResponse) civic.ElectionsResponse {
	for _, election := range response.Elections {
		if election.ID == strconv.FormatInt(TestElectionID, 10) {
			return response
		}
	}
	response.Elections = append(response.Elections, civic.Election{ID: "2000", Name: "VIP Test Election", ElectionDay: "2031-12-06", OCDDivisionID: "ocd-division/country:us"})
	return response
}

func addressFingerprint(address string) string {
	digest := sha256.Sum256([]byte(address))
	return hex.EncodeToString(digest[:])[:12]
}

func validateElectionResponse(response civic.VoterInfoResponse, expectedID string) error {
	if response.Election.ID == "" || response.Election.ID != expectedID {
		return &provider.Error{Kind: provider.KindInvalidResponse, Operation: "civic.voterinfo", Message: "Civic response did not identify the requested election"}
	}
	return nil
}

func nonNilPollingLocations(values []civic.PollingLocation) []civic.PollingLocation {
	if values == nil {
		return []civic.PollingLocation{}
	}
	return values
}

func nonNilContests(values []civic.Contest) []civic.Contest {
	if values == nil {
		return []civic.Contest{}
	}
	return values
}

func nonNilAdministration(values []civic.StateInformation) []civic.StateInformation {
	if values == nil {
		return []civic.StateInformation{}
	}
	return values
}

func nonNilElections(values []civic.Election) []civic.Election {
	if values == nil {
		return []civic.Election{}
	}
	return values
}

func validPoint(point geocoding.Point) bool {
	return !math.IsNaN(point.Latitude) && !math.IsInf(point.Latitude, 0) &&
		!math.IsNaN(point.Longitude) && !math.IsInf(point.Longitude, 0) &&
		point.Latitude >= -90 && point.Latitude <= 90 &&
		point.Longitude >= -180 && point.Longitude <= 180
}

func upcomingLiveElections(elections []civic.Election, now time.Time, testElectionID int64) []civic.Election {
	today := now.Format("2006-01-02")
	selected := make([]civic.Election, 0, len(elections))
	for _, election := range elections {
		id, err := strconv.ParseInt(election.ID, 10, 64)
		if err != nil || id <= 0 || id == testElectionID {
			continue
		}
		if _, err := time.Parse("2006-01-02", election.ElectionDay); err != nil || election.ElectionDay < today {
			continue
		}
		selected = append(selected, election)
	}
	sort.SliceStable(selected, func(i, j int) bool {
		if selected[i].ElectionDay == selected[j].ElectionDay {
			return selected[i].ID < selected[j].ID
		}
		return selected[i].ElectionDay < selected[j].ElectionDay
	})
	return selected
}

func collectSources(response civic.VoterInfoResponse) []civic.Source {
	seen := make(map[string]struct{})
	result := make([]civic.Source, 0)
	add := func(source civic.Source) {
		key := source.Name + "\x00" + strconv.FormatBool(source.Official)
		if _, exists := seen[key]; exists {
			return
		}
		seen[key] = struct{}{}
		result = append(result, source)
	}
	for _, location := range append(append(append([]civic.PollingLocation{}, response.PollingLocations...), response.EarlyVoteSites...), response.DropOffLocations...) {
		for _, source := range location.Sources {
			add(source)
		}
	}
	for _, contest := range response.Contests {
		for _, source := range contest.Sources {
			add(source)
		}
	}
	for _, state := range response.State {
		for _, source := range state.Sources {
			add(source)
		}
		if state.LocalJurisdiction != nil {
			for _, source := range state.LocalJurisdiction.Sources {
				add(source)
			}
		}
	}
	return result
}
