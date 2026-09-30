// Package voterinfo selects Civic election data and projects it into the
// stable provider-boundary model consumed by the HTTP API.
package voterinfo

import (
	"context"
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

// Mode identifies whether the result came from a current election or the
// explicitly labelled Civic test election fallback.
type Mode string

const (
	// ModeLive is data selected from an upcoming non-test election.
	ModeLive Mode = "live"
	// ModeTestFallback is data selected from Civic's VIP election 2000.
	ModeTestFallback Mode = "test-fallback"
)

// Config supplies the external provider seams and clock used by Service.
type Config struct {
	Civic    civic.Client
	Geocoder geocoding.Client
	Now      func() time.Time
}

// Service is the election-selection and geocoding application boundary.
type Service struct {
	civic          civic.Client
	geocoder       geocoding.Client
	now            func() time.Time
	testElectionID int64
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
}

// NewService creates the selection service without making provider calls.
func NewService(config Config) *Service {
	now := config.Now
	if now == nil {
		now = time.Now
	}
	return &Service{
		civic:          config.Civic,
		geocoder:       config.Geocoder,
		now:            now,
		testElectionID: TestElectionID,
	}
}

// Elections returns the currently advertised Civic election list.
func (s *Service) Elections(ctx context.Context) (civic.ElectionsResponse, error) {
	if s == nil || s.civic == nil {
		return civic.ElectionsResponse{}, &provider.Error{Kind: provider.KindConfiguration, Operation: "civic.elections", Message: "Civic provider is not configured"}
	}
	return s.civic.ListElections(ctx)
}

// Lookup geocodes an address and selects the nearest upcoming live election.
// When no live election returns usable voter data, it makes one explicit query
// for Civic's documented VIP election 2000 and marks the result as a test
// fallback. An explicit election ID is never silently replaced.
func (s *Service) Lookup(ctx context.Context, address string, requestedElectionID *int64) (LookupResult, error) {
	trimmedAddress := strings.TrimSpace(address)
	if trimmedAddress == "" {
		return LookupResult{}, &provider.Error{Kind: provider.KindInvalidRequest, Operation: "lookup", Message: "address is required"}
	}
	if s == nil || s.civic == nil || s.geocoder == nil {
		return LookupResult{}, &provider.Error{Kind: provider.KindConfiguration, Operation: "lookup", Message: "lookup providers are not configured"}
	}
	if requestedElectionID != nil && *requestedElectionID <= 0 {
		return LookupResult{}, &provider.Error{Kind: provider.KindInvalidRequest, Operation: "lookup", Message: "electionId must be positive"}
	}

	origin, err := s.geocoder.Geocode(ctx, trimmedAddress)
	if err != nil {
		return LookupResult{}, err
	}
	if !validPoint(origin.Location) {
		return LookupResult{}, &provider.Error{Kind: provider.KindInvalidResponse, Operation: "geocoding.lookup", Message: "geocoding returned invalid coordinates"}
	}

	if requestedElectionID != nil {
		response, lookupErr := s.civic.VoterInfo(ctx, trimmedAddress, requestedElectionID)
		if lookupErr != nil {
			return LookupResult{}, lookupErr
		}
		if err := validateElectionResponse(response, strconv.FormatInt(*requestedElectionID, 10)); err != nil {
			return LookupResult{}, err
		}
		mode := ModeLive
		warning := ""
		if *requestedElectionID == s.testElectionID {
			mode = ModeTestFallback
			warning = testElectionWarning
		}
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

	testID := s.testElectionID
	testResponse, err := s.civic.VoterInfo(ctx, trimmedAddress, &testID)
	if err != nil {
		return LookupResult{}, err
	}
	if err := validateElectionResponse(testResponse, strconv.FormatInt(s.testElectionID, 10)); err != nil {
		return LookupResult{}, err
	}
	if !testResponse.HasUserInformation() {
		return LookupResult{}, &provider.Error{Kind: provider.KindNoData, Operation: "civic.voterinfo.test-fallback", Message: "VIP test election returned no voter information"}
	}
	return project(trimmedAddress, origin, testResponse, ModeTestFallback, testElectionWarning), nil
}

const testElectionWarning = "This is Civic's VIP Test Election (2000) data, not a current election. Confirm the current election and official details before making a voting plan."

func project(address string, origin geocoding.Result, response civic.VoterInfoResponse, mode Mode, warning string) LookupResult {
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
	}
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
