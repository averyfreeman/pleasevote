package voterinfo

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/averyfreeman/pleasevote/server/internal/civic"
	"github.com/averyfreeman/pleasevote/server/internal/geocoding"
	"github.com/averyfreeman/pleasevote/server/internal/provider"
)

type fakeCivicClient struct {
	elections    civic.ElectionsResponse
	electionErr  error
	voterInfo    map[int64]civic.VoterInfoResponse
	voterErrors  map[int64]error
	requestedIDs []int64
}

func (f *fakeCivicClient) ListElections(context.Context) (civic.ElectionsResponse, error) {
	return f.elections, f.electionErr
}

func (f *fakeCivicClient) VoterInfo(_ context.Context, _ string, electionID *int64) (civic.VoterInfoResponse, error) {
	if electionID == nil {
		return civic.VoterInfoResponse{}, errors.New("test expected explicit election id")
	}
	f.requestedIDs = append(f.requestedIDs, *electionID)
	if err := f.voterErrors[*electionID]; err != nil {
		return civic.VoterInfoResponse{}, err
	}
	return f.voterInfo[*electionID], nil
}

func (f *fakeCivicClient) Divisions(context.Context, string) (civic.DivisionSearchResponse, error) {
	return civic.DivisionSearchResponse{}, nil
}

func (f *fakeCivicClient) DivisionsByAddress(context.Context, string) (civic.DivisionsByAddressResponse, error) {
	return civic.DivisionsByAddressResponse{}, nil
}

type fakeGeocoder struct {
	result geocoding.Result
	err    error
}

func (f fakeGeocoder) Geocode(context.Context, string) (geocoding.Result, error) {
	return f.result, f.err
}

func TestServiceSelectsNearestUpcomingLiveElection(t *testing.T) {
	client := &fakeCivicClient{
		elections: civic.ElectionsResponse{Elections: []civic.Election{
			{ID: "3001", Name: "Later Election", ElectionDay: "2030-11-05"},
			{ID: "3000", Name: "Upcoming Election", ElectionDay: "2030-05-05"},
			{ID: "2000", Name: "VIP Test Election", ElectionDay: "2031-12-06"},
		}},
		voterInfo: map[int64]civic.VoterInfoResponse{3000: {
			Election:         civic.Election{ID: "3000", Name: "Upcoming Election", ElectionDay: "2030-05-05"},
			PollingLocations: []civic.PollingLocation{{Address: civic.Address{Line1: "1 Main St"}}},
		}},
	}
	service := newTestService(client, time.Date(2030, time.January, 1, 0, 0, 0, 0, time.UTC))

	lookup, err := service.Lookup(context.Background(), "211 Garrett Place", nil)
	if err != nil {
		t.Fatalf("Lookup: %v", err)
	}
	if lookup.Mode != ModeLive || lookup.Election.ID != "3000" {
		t.Fatalf("lookup selection = %#v", lookup)
	}
	if len(client.requestedIDs) != 1 || client.requestedIDs[0] != 3000 {
		t.Fatalf("requested election IDs = %#v", client.requestedIDs)
	}
}

func TestServiceFallsBackToVIPTestElectionWhenLiveDataIsEmpty(t *testing.T) {
	client := &fakeCivicClient{
		elections: civic.ElectionsResponse{Elections: []civic.Election{{
			ID: "3000", Name: "Upcoming Election", ElectionDay: "2030-05-05",
		}, {ID: "2000", Name: "VIP Test Election", ElectionDay: "2031-12-06"}}},
		voterInfo: map[int64]civic.VoterInfoResponse{
			3000: {Election: civic.Election{ID: "3000", Name: "Upcoming Election"}},
			2000: {
				Election:         civic.Election{ID: "2000", Name: "VIP Test Election", ElectionDay: "2031-12-06"},
				PollingLocations: []civic.PollingLocation{{Address: civic.Address{Line1: "VIP Test Hall"}}},
			},
		},
	}
	service := newTestServiceWithConfig(client, client, true, time.Date(2030, time.January, 1, 0, 0, 0, 0, time.UTC))

	lookup, err := service.Lookup(context.Background(), "211 Garrett Place", nil)
	if err != nil {
		t.Fatalf("Lookup: %v", err)
	}
	if lookup.Mode != ModeTestFixture || lookup.Election.ID != "2000" {
		t.Fatalf("fallback lookup = %#v", lookup)
	}
	if lookup.Warning == "" || len(client.requestedIDs) != 2 || client.requestedIDs[1] != TestElectionID {
		t.Fatalf("fallback metadata or calls = %#v, %#v", lookup, client.requestedIDs)
	}
}

func TestServiceDebugElectionListUsesFixtureWhenLiveListIsEmpty(t *testing.T) {
	live := &fakeCivicClient{}
	fixture := &fakeCivicClient{elections: civic.ElectionsResponse{Elections: []civic.Election{{
		ID: "2000", Name: "VIP Test Election", ElectionDay: "2031-12-06",
	}}}}
	service := newTestServiceWithConfig(live, fixture, true, time.Date(2030, time.January, 1, 0, 0, 0, 0, time.UTC))

	response, mode, err := service.ElectionsWithSource(context.Background())
	if err != nil {
		t.Fatalf("ElectionsWithSource: %v", err)
	}
	if mode != ModeTestFixture || len(response.Elections) != 1 || response.Elections[0].ID != "2000" {
		t.Fatalf("debug election list = mode %q, response %#v", mode, response)
	}
}

func TestServiceFallsBackWhenLiveElectionReportsNoData(t *testing.T) {
	client := &fakeCivicClient{
		elections: civic.ElectionsResponse{Elections: []civic.Election{{
			ID: "3000", Name: "Upcoming Election", ElectionDay: "2030-05-05",
		}}},
		voterErrors: map[int64]error{
			3000: &provider.Error{Kind: provider.KindNoData, Operation: "civic.voterinfo", Message: "no voter data"},
		},
		voterInfo: map[int64]civic.VoterInfoResponse{2000: {
			Election:         civic.Election{ID: "2000", Name: "VIP Test Election", ElectionDay: "2031-12-06"},
			PollingLocations: []civic.PollingLocation{{Address: civic.Address{Line1: "VIP Test Hall"}}},
		}},
	}
	service := newTestServiceWithConfig(client, client, true, time.Date(2030, time.January, 1, 0, 0, 0, 0, time.UTC))

	lookup, err := service.Lookup(context.Background(), "211 Garrett Place", nil)
	if err != nil {
		t.Fatalf("Lookup: %v", err)
	}
	if lookup.Mode != ModeTestFixture || len(client.requestedIDs) != 2 || client.requestedIDs[1] != TestElectionID {
		t.Fatalf("fallback after no-data response = %#v, calls = %#v", lookup, client.requestedIDs)
	}
}

func TestServicePreservesUsefulNonSuccessLiveStatus(t *testing.T) {
	client := &fakeCivicClient{
		elections: civic.ElectionsResponse{Elections: []civic.Election{{
			ID: "3000", Name: "Upcoming Election", ElectionDay: "2030-05-05",
		}}},
		voterInfo: map[int64]civic.VoterInfoResponse{
			3000: {
				Status:           "invalid",
				Election:         civic.Election{ID: "3000", Name: "Upcoming Election", ElectionDay: "2030-05-05"},
				PollingLocations: []civic.PollingLocation{{Address: civic.Address{Line1: "Stale result"}}},
			},
		},
	}
	service := newTestService(client, time.Date(2030, time.January, 1, 0, 0, 0, 0, time.UTC))

	lookup, err := service.Lookup(context.Background(), "211 Garrett Place", nil)
	if err != nil {
		t.Fatalf("Lookup: %v", err)
	}
	if lookup.Mode != ModeLive || lookup.Election.ID != "3000" || len(lookup.PollingLocations) != 1 {
		t.Fatalf("non-success live response was not preserved: %#v", lookup)
	}
}

func TestServiceRejectsEmptyExplicitElectionWithoutFallback(t *testing.T) {
	client := &fakeCivicClient{
		elections: civic.ElectionsResponse{Elections: []civic.Election{{ID: "3000", Name: "Upcoming Election", ElectionDay: "2030-05-05"}}},
		voterInfo: map[int64]civic.VoterInfoResponse{3000: {Election: civic.Election{ID: "3000", Name: "Upcoming Election"}}},
	}
	service := newTestService(client, time.Date(2030, time.January, 1, 0, 0, 0, 0, time.UTC))
	explicitID := int64(3000)

	_, err := service.Lookup(context.Background(), "211 Garrett Place", &explicitID)
	if err == nil || !provider.IsNoData(err) {
		t.Fatalf("explicit empty lookup error = %v, want no-data error", err)
	}
	if len(client.requestedIDs) != 1 || client.requestedIDs[0] != 3000 {
		t.Fatalf("explicit empty lookup calls = %#v", client.requestedIDs)
	}
}

func TestServicePreservesAdministrationOnlyLiveResponse(t *testing.T) {
	client := &fakeCivicClient{
		elections: civic.ElectionsResponse{Elections: []civic.Election{{
			ID: "3000", Name: "Upcoming Election", ElectionDay: "2030-05-05",
		}}},
		voterInfo: map[int64]civic.VoterInfoResponse{
			3000: {
				Election: civic.Election{ID: "3000", Name: "Upcoming Election", ElectionDay: "2030-05-05"},
				State:    []civic.StateInformation{{Name: "Ohio"}},
			},
		},
	}
	service := newTestService(client, time.Date(2030, time.January, 1, 0, 0, 0, 0, time.UTC))

	lookup, err := service.Lookup(context.Background(), "211 Garrett Place", nil)
	if err != nil {
		t.Fatalf("Lookup: %v", err)
	}
	if lookup.Mode != ModeLive || lookup.Election.ID != "3000" || len(lookup.Administration) != 1 {
		t.Fatalf("administration-only response was suppressed: %#v", lookup)
	}
}

func TestServiceNormalModeDoesNotUseLocalTestFixture(t *testing.T) {
	client := &fakeCivicClient{
		elections: civic.ElectionsResponse{Elections: []civic.Election{{
			ID: "3000", Name: "Upcoming Election", ElectionDay: "2030-05-05",
		}}},
		voterErrors: map[int64]error{
			3000: &provider.Error{Kind: provider.KindNoData, Operation: "civic.voterinfo", Message: "no voter data"},
			2000: &provider.Error{Kind: provider.KindNoData, Operation: "civic.voterinfo", Message: "no voter data"},
		},
	}
	fixture := &fakeCivicClient{voterInfo: map[int64]civic.VoterInfoResponse{2000: {
		Election:         civic.Election{ID: "2000", Name: "VIP Test Election", ElectionDay: "2031-12-06"},
		PollingLocations: []civic.PollingLocation{{Address: civic.Address{Line1: "Fixture Hall"}}},
	}}}
	service := newTestServiceWithConfig(client, fixture, false, time.Date(2030, time.January, 1, 0, 0, 0, 0, time.UTC))

	_, err := service.Lookup(context.Background(), "any address", nil)
	if err == nil || !provider.IsNoData(err) {
		t.Fatalf("normal lookup error = %v, want no-data error", err)
	}
	if len(client.requestedIDs) != 1 || client.requestedIDs[0] != 3000 {
		t.Fatalf("normal live calls = %#v, want only live election", client.requestedIDs)
	}
	if len(fixture.requestedIDs) != 0 {
		t.Fatalf("normal mode called local fixture: %#v", fixture.requestedIDs)
	}
}

func TestServiceDebugModeUsesFixtureForExplicitTestElectionAndAnyAddress(t *testing.T) {
	live := &fakeCivicClient{voterErrors: map[int64]error{
		2000: &provider.Error{Kind: provider.KindNoData, Operation: "civic.voterinfo", Message: "live test election has no data"},
	}}
	fixture := &fakeCivicClient{voterInfo: map[int64]civic.VoterInfoResponse{2000: {
		Election:         civic.Election{ID: "2000", Name: "VIP Test Election", ElectionDay: "2031-12-06"},
		NormalizedInput:  civic.Address{Line1: "Fixture sample address"},
		PollingLocations: []civic.PollingLocation{{Address: civic.Address{Line1: "Fixture Hall"}}},
	}}}
	service := newTestServiceWithConfig(live, fixture, true, time.Date(2030, time.January, 1, 0, 0, 0, 0, time.UTC))
	electionID := TestElectionID

	lookup, err := service.Lookup(context.Background(), "an arbitrary debugging address", &electionID)
	if err != nil {
		t.Fatalf("Lookup: %v", err)
	}
	if lookup.Mode != ModeTestFixture || lookup.Election.ID != "2000" || len(lookup.PollingLocations) != 1 {
		t.Fatalf("debug fixture lookup = %#v", lookup)
	}
	if len(live.requestedIDs) != 0 || len(fixture.requestedIDs) != 1 || fixture.requestedIDs[0] != TestElectionID {
		t.Fatalf("debug fixture calls = live %#v, fixture %#v", live.requestedIDs, fixture.requestedIDs)
	}
}

func TestServiceNormalExplicitTestElectionReturnsLiveNoDataInsteadOfUsingFixture(t *testing.T) {
	live := &fakeCivicClient{voterErrors: map[int64]error{
		TestElectionID: &provider.Error{Kind: provider.KindNoData, Operation: "civic.voterinfo", Message: "Civic has no data for this address"},
	}}
	fixture := &fakeCivicClient{voterInfo: map[int64]civic.VoterInfoResponse{TestElectionID: {
		Election:         civic.Election{ID: "2000", Name: "VIP Test Election"},
		PollingLocations: []civic.PollingLocation{{Address: civic.Address{Line1: "Fixture Hall"}}},
	}}}
	service := newTestServiceWithConfig(live, fixture, false, time.Date(2030, time.January, 1, 0, 0, 0, 0, time.UTC))
	electionID := TestElectionID

	_, err := service.Lookup(context.Background(), "any address", &electionID)
	if err == nil || !provider.IsNoData(err) {
		t.Fatalf("normal explicit test lookup error = %v, want live no-data", err)
	}
	if len(live.requestedIDs) != 1 || live.requestedIDs[0] != TestElectionID || len(fixture.requestedIDs) != 0 {
		t.Fatalf("normal explicit test calls = live %#v, fixture %#v", live.requestedIDs, fixture.requestedIDs)
	}
}

func TestServiceDebugFixtureOnlyRejectsUnsupportedExplicitElection(t *testing.T) {
	fixture := &fakeCivicClient{voterInfo: map[int64]civic.VoterInfoResponse{TestElectionID: {
		Election:         civic.Election{ID: "2000", Name: "VIP Test Election"},
		PollingLocations: []civic.PollingLocation{{Address: civic.Address{Line1: "Fixture Hall"}}},
	}}}
	service := newTestServiceWithConfig(nil, fixture, true, time.Date(2030, time.January, 1, 0, 0, 0, 0, time.UTC))
	electionID := int64(3000)

	_, err := service.Lookup(context.Background(), "any address", &electionID)
	if err == nil || !provider.IsNoData(err) {
		t.Fatalf("fixture-only explicit lookup error = %v, want no-data error", err)
	}
}

func TestServiceDoesNotSilentlyReplaceExplicitElection(t *testing.T) {
	client := &fakeCivicClient{
		elections:   civic.ElectionsResponse{Elections: []civic.Election{{ID: "3000", Name: "Upcoming Election", ElectionDay: "2030-05-05"}}},
		voterErrors: map[int64]error{3000: &provider.Error{Kind: provider.KindNoData, Operation: "civic.voterinfo", Message: "no voter data"}},
	}
	service := newTestService(client, time.Date(2030, time.January, 1, 0, 0, 0, 0, time.UTC))
	explicitID := int64(3000)

	_, err := service.Lookup(context.Background(), "211 Garrett Place", &explicitID)
	if err == nil || !provider.IsNoData(err) {
		t.Fatalf("explicit lookup error = %v, want no-data error", err)
	}
	if len(client.requestedIDs) != 1 || client.requestedIDs[0] != 3000 {
		t.Fatalf("explicit lookup calls = %#v", client.requestedIDs)
	}
}

func TestServiceReturnsGeocodingFailureBeforeCivicLookup(t *testing.T) {
	client := &fakeCivicClient{}
	service := NewService(Config{
		Civic:    client,
		Geocoder: fakeGeocoder{err: &provider.Error{Kind: provider.KindNoData, Operation: "geocoding", Message: "address not found"}},
		Now:      func() time.Time { return time.Date(2030, time.January, 1, 0, 0, 0, 0, time.UTC) },
	})

	_, err := service.Lookup(context.Background(), "not a real address", nil)
	if err == nil || !provider.IsNoData(err) {
		t.Fatalf("Lookup error = %v, want geocoding no-data error", err)
	}
	if len(client.requestedIDs) != 0 {
		t.Fatalf("Civic was called after geocoding failure: %#v", client.requestedIDs)
	}
}

func newTestService(client *fakeCivicClient, now time.Time) *Service {
	return newTestServiceWithConfig(client, nil, false, now)
}

func newTestServiceWithConfig(client civic.Client, fixture civic.Client, debug bool, now time.Time) *Service {
	return NewService(Config{
		Civic:   client,
		Fixture: fixture,
		Debug:   debug,
		Geocoder: fakeGeocoder{result: geocoding.Result{
			FormattedAddress: "211 Garrett Pl, Columbus, OH 43214, USA",
			Location:         geocoding.Point{Latitude: 40.0541, Longitude: -83.0222},
		}},
		Now: func() time.Time { return now },
	})
}
