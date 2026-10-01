package httpapi

import (
	"bytes"
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/averyfreeman/pleasevote/server/internal/civic"
	"github.com/averyfreeman/pleasevote/server/internal/geocoding"
	"github.com/averyfreeman/pleasevote/server/internal/provider"
	"github.com/averyfreeman/pleasevote/server/internal/voterinfo"
)

type handlerCivicClient struct {
	elections        civic.ElectionsResponse
	lookup           civic.VoterInfoResponse
	divisions        civic.DivisionSearchResponse
	divisionsAddress civic.DivisionsByAddressResponse
	err              error
}

func (f handlerCivicClient) ListElections(context.Context) (civic.ElectionsResponse, error) {
	return f.elections, f.err
}

func (f handlerCivicClient) VoterInfo(context.Context, string, *int64) (civic.VoterInfoResponse, error) {
	return f.lookup, f.err
}

func (f handlerCivicClient) Divisions(context.Context, string) (civic.DivisionSearchResponse, error) {
	return f.divisions, f.err
}

func (f handlerCivicClient) DivisionsByAddress(context.Context, string) (civic.DivisionsByAddressResponse, error) {
	return f.divisionsAddress, f.err
}

type handlerGeocoder struct {
	result geocoding.Result
	err    error
}

func (f handlerGeocoder) Geocode(context.Context, string) (geocoding.Result, error) {
	return f.result, f.err
}

func TestLookupReturnsFrontendFacingStableShape(t *testing.T) {
	service := voterinfo.NewService(voterinfo.Config{
		Civic: handlerCivicClient{
			elections: civic.ElectionsResponse{Elections: []civic.Election{{ID: "3000", Name: "Sample Election", ElectionDay: "2030-05-05"}}},
			lookup: civic.VoterInfoResponse{
				Election:        civic.Election{ID: "3000", Name: "Sample Election", ElectionDay: "2030-05-05"},
				NormalizedInput: civic.Address{Line1: "211 Garrett Place", City: "Columbus", State: "OH", Zip: "43214"},
				PollingLocations: []civic.PollingLocation{{
					Address:      civic.Address{LocationName: "Community Center", Line1: "1 Main St", City: "Columbus", State: "OH", Zip: "43214"},
					PollingHours: "Tue, May 5: 6:30 am - 7:30 pm",
					Latitude:     coordinate(40.05),
					Longitude:    coordinate(-83.02),
					Sources:      []civic.Source{{Name: "Voting Information Project", Official: true}},
				}},
				Contests: []civic.Contest{{Type: "General", Office: "Mayor", Candidates: []civic.Candidate{{Name: "Ada Lovelace"}}}},
				State:    []civic.StateInformation{{Name: "Ohio", Sources: []civic.Source{{Name: "Ohio Secretary of State", Official: true}}}},
			},
		},
		Geocoder: handlerGeocoder{result: geocoding.Result{
			FormattedAddress: "211 Garrett Pl, Columbus, OH 43214, USA",
			Location:         geocoding.Point{Latitude: 40.0541, Longitude: -83.0222},
		}},
		Now: func() time.Time { return time.Date(2030, time.January, 1, 0, 0, 0, 0, time.UTC) },
	})
	handler := NewHandler(Config{Service: service, Clock: func() time.Time { return time.Date(2030, time.January, 1, 0, 0, 0, 0, time.UTC) }})

	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodGet, "/api/v1/lookup?address=211+Garrett+Place", nil)
	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("status = %d, body = %s", recorder.Code, recorder.Body.String())
	}
	var response struct {
		Address           string                  `json:"address"`
		NormalizedAddress civic.Address           `json:"normalizedAddress"`
		Origin            Point                   `json:"origin"`
		Election          civic.Election          `json:"election"`
		Mode              string                  `json:"mode"`
		PollingLocations  []civic.PollingLocation `json:"pollingLocations"`
		Contests          []civic.Contest         `json:"contests"`
		Administration    []Administration        `json:"administration"`
		Sources           []civic.Source          `json:"sources"`
		Retrieval         Retrieval               `json:"retrieval"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &response); err != nil {
		t.Fatalf("decode lookup response: %v", err)
	}
	if response.Address != "211 Garrett Place" || response.NormalizedAddress.City != "Columbus" {
		t.Fatalf("address fields = %#v", response)
	}
	if response.Origin.Latitude != 40.0541 || response.Origin.Longitude != -83.0222 {
		t.Fatalf("origin = %#v", response.Origin)
	}
	if response.Mode != string(voterinfo.ModeLive) || response.Election.ID != "3000" {
		t.Fatalf("election mode = %q, election = %#v", response.Mode, response.Election)
	}
	if len(response.PollingLocations) != 1 || len(response.Contests) != 1 || len(response.Administration) != 1 || len(response.Sources) != 2 {
		t.Fatalf("aggregated fields = %#v", response)
	}
	if response.PollingLocations == nil {
		t.Fatal("pollingLocations must be an array, not null")
	}
	if response.Retrieval.APIVersion != "v1" || response.Retrieval.Provider != "google-civic-information-api" || response.Retrieval.RequestID == "" {
		t.Fatalf("retrieval = %#v", response.Retrieval)
	}
	if strings.Contains(recorder.Body.String(), `"assigned"`) {
		t.Fatalf("response uses forbidden assigned label: %s", recorder.Body.String())
	}
}

func TestLookupPreservesMailOnlyLocationsAndVoterServices(t *testing.T) {
	service := voterinfo.NewService(voterinfo.Config{
		Civic: handlerCivicClient{
			elections: civic.ElectionsResponse{Elections: []civic.Election{{ID: "3000", Name: "Washington Election", ElectionDay: "2030-05-05"}}},
			lookup: civic.VoterInfoResponse{
				Status:   "partial",
				Election: civic.Election{ID: "3000", Name: "Washington Election", ElectionDay: "2030-05-05"},
				PollingLocations: []civic.PollingLocation{{
					Address:       civic.Address{LocationName: "Election Day Site", Line1: "1 Main St"},
					VoterServices: "Accessible voting and same-day registration",
				}},
				DropOffLocations: []civic.PollingLocation{{
					Address:       civic.Address{LocationName: "Ballot Drop Box", Line1: "2 Main St"},
					VoterServices: "Ballot drop-off",
				}},
				State:    []civic.StateInformation{{Name: "Washington"}},
				MailOnly: true,
			},
		},
		Geocoder: handlerGeocoder{result: geocoding.Result{Location: geocoding.Point{Latitude: 47.6, Longitude: -122.3}}},
		Now:      func() time.Time { return time.Date(2030, time.January, 1, 0, 0, 0, 0, time.UTC) },
	})
	handler := NewHandler(Config{Service: service})
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/api/v1/lookup?address=1+Main+St", nil))

	if recorder.Code != http.StatusOK {
		t.Fatalf("status = %d, body = %s", recorder.Code, recorder.Body.String())
	}
	var response struct {
		PollingLocations []struct {
			VoterServices string `json:"voterServices"`
		} `json:"pollingLocations"`
		DropOffLocations []struct {
			VoterServices string `json:"voterServices"`
		} `json:"dropOffLocations"`
		MailOnly  bool      `json:"mailOnly"`
		Warning   string    `json:"warning"`
		Retrieval Retrieval `json:"retrieval"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &response); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if len(response.PollingLocations) != 1 || response.PollingLocations[0].VoterServices == "" {
		t.Fatalf("polling services were lost: %#v", response.PollingLocations)
	}
	if len(response.DropOffLocations) != 1 || response.DropOffLocations[0].VoterServices != "Ballot drop-off" {
		t.Fatalf("drop-off services were lost: %#v", response.DropOffLocations)
	}
	if !response.MailOnly {
		t.Fatal("mailOnly was not preserved as informational metadata")
	}
	if response.Retrieval.ProviderStatus != "partial" || response.Warning == "" {
		t.Fatalf("partial provider status was not surfaced safely: %#v", response)
	}
}

func TestLookupValidationUsesStructuredErrorWithoutCallingProviders(t *testing.T) {
	service := voterinfo.NewService(voterinfo.Config{
		Civic:    handlerCivicClient{},
		Geocoder: handlerGeocoder{},
	})
	handler := NewHandler(Config{Service: service})
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/api/v1/lookup", nil))

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, body = %s", recorder.Code, recorder.Body.String())
	}
	var response errorResponse
	if err := json.Unmarshal(recorder.Body.Bytes(), &response); err != nil {
		t.Fatalf("decode error response: %v", err)
	}
	if response.Error.Code != "invalid_request" || response.Error.Message == "" || response.Retrieval.APIVersion != "v1" {
		t.Fatalf("error response = %#v", response)
	}
}

func TestLookupUpstreamFailureLogsOnlyRedactedStructuredFields(t *testing.T) {
	var logs bytes.Buffer
	logger := slog.New(slog.NewTextHandler(&logs, nil))
	service := voterinfo.NewService(voterinfo.Config{
		Civic:    handlerCivicClient{},
		Geocoder: handlerGeocoder{err: &provider.Error{Kind: provider.KindUnavailable, Operation: "geocoding", Message: "provider unavailable"}},
	})
	handler := NewHandler(Config{Service: service, Logger: logger})
	address := "123 Secret Address, Columbus, OH 43214"
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/api/v1/lookup?address="+strings.ReplaceAll(address, " ", "+"), nil))

	if recorder.Code != http.StatusBadGateway {
		t.Fatalf("status = %d, body = %s", recorder.Code, recorder.Body.String())
	}
	if strings.Contains(logs.String(), address) || strings.Contains(logs.String(), "provider unavailable") {
		t.Fatalf("logs leaked sensitive/provider detail: %s", logs.String())
	}
	if !strings.Contains(logs.String(), "upstream_unavailable") {
		t.Fatalf("logs omitted structured error code: %s", logs.String())
	}
}

func TestElectionsReturnsVersionedResponse(t *testing.T) {
	service := voterinfo.NewService(voterinfo.Config{
		Civic:    handlerCivicClient{elections: civic.ElectionsResponse{Elections: []civic.Election{{ID: "3000", Name: "Sample Election"}}}},
		Geocoder: handlerGeocoder{},
	})
	handler := NewHandler(Config{Service: service})
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/api/v1/elections", nil))

	if recorder.Code != http.StatusOK {
		t.Fatalf("status = %d, body = %s", recorder.Code, recorder.Body.String())
	}
	if !strings.Contains(recorder.Body.String(), `"elections"`) || !strings.Contains(recorder.Body.String(), `"apiVersion":"v1"`) {
		t.Fatalf("elections response = %s", recorder.Body.String())
	}
}

func TestDivisionRoutesPreserveOfficialCivicShapes(t *testing.T) {
	service := voterinfo.NewService(voterinfo.Config{
		Civic: handlerCivicClient{
			divisions: civic.DivisionSearchResponse{Kind: "civicinfo#divisionSearchResponse", Results: []civic.Division{{OCDID: "ocd-division/country:us/state:wa", Name: "Washington", Aliases: []string{"ocd-division/country:us/state:wa/cd:1"}}}},
			divisionsAddress: civic.DivisionsByAddressResponse{
				Kind:            "civicinfo#divisionSearchResponse",
				NormalizedInput: civic.Address{Line1: "1 Main St", State: "WA"},
				Divisions:       map[string]civic.Division{"ocd-division/country:us/state:wa": {Name: "Washington", AlsoKnownAs: []string{"ocd-division/country:us/state:wa/cd:1"}}},
			},
		},
		Geocoder: handlerGeocoder{},
	})
	handler := NewHandler(Config{Service: service})

	search := httptest.NewRecorder()
	handler.ServeHTTP(search, httptest.NewRequest(http.MethodGet, "/api/v1/divisions?query=Washington", nil))
	if search.Code != http.StatusOK || !strings.Contains(search.Body.String(), "ocd-division/country:us/state:wa") {
		t.Fatalf("division search response = %d %s", search.Code, search.Body.String())
	}

	byAddress := httptest.NewRecorder()
	handler.ServeHTTP(byAddress, httptest.NewRequest(http.MethodGet, "/api/v1/divisionsByAddress?address=1+Main+St", nil))
	if byAddress.Code != http.StatusOK || !strings.Contains(byAddress.Body.String(), `"divisions"`) || !strings.Contains(byAddress.Body.String(), `"normalizedInput"`) {
		t.Fatalf("division address response = %d %s", byAddress.Code, byAddress.Body.String())
	}
}

func TestOpenAPIRouteReturnsJSONDocument(t *testing.T) {
	handler := NewHandler(Config{})
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/api/v1/openapi.json", nil))

	if recorder.Code != http.StatusOK || !strings.Contains(recorder.Header().Get("Content-Type"), "application/json") {
		t.Fatalf("openapi response = %d %q %s", recorder.Code, recorder.Header().Get("Content-Type"), recorder.Body.String())
	}
	var document map[string]any
	if err := json.Unmarshal(recorder.Body.Bytes(), &document); err != nil {
		t.Fatalf("decode OpenAPI document: %v", err)
	}
	if document["openapi"] != "3.1.0" {
		t.Fatalf("openapi version = %#v", document["openapi"])
	}
	paths, ok := document["paths"].(map[string]any)
	if !ok {
		t.Fatalf("OpenAPI paths have unexpected type: %#v", document["paths"])
	}
	lookup, ok := paths["/api/v1/lookup"].(map[string]any)
	if !ok {
		t.Fatal("OpenAPI document omitted /api/v1/lookup")
	}
	get, ok := lookup["get"].(map[string]any)
	if !ok || get["operationId"] != "lookupVoterInformation" {
		t.Fatalf("OpenAPI lookup operation = %#v", lookup["get"])
	}
}

func coordinate(value float64) *civic.Coordinate {
	coordinate := civic.Coordinate(value)
	return &coordinate
}

func TestPublicLocationsRetainsRecordsWithInvalidCoordinates(t *testing.T) {
	locations := publicLocations([]civic.PollingLocation{
		{
			Address:   civic.Address{Line1: "Invalid point"},
			Latitude:  coordinate(91),
			Longitude: coordinate(-181),
		},
		{
			Address:   civic.Address{Line1: "Zero point"},
			Latitude:  coordinate(0),
			Longitude: coordinate(0),
		},
	}, "polling")

	if len(locations) != 2 {
		t.Fatalf("location count = %d, want 2", len(locations))
	}
	if locations[0].Point != nil {
		t.Fatalf("invalid coordinates were exposed: %#v", locations[0].Point)
	}
	if locations[1].Point == nil || locations[1].Point.Latitude != 0 || locations[1].Point.Longitude != 0 {
		t.Fatalf("zero coordinates were not preserved: %#v", locations[1].Point)
	}
}
