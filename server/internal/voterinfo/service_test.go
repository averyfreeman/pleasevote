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
	service := newTestService(client, time.Date(2030, time.January, 1, 0, 0, 0, 0, time.UTC))

	lookup, err := service.Lookup(context.Background(), "211 Garrett Place", nil)
	if err != nil {
		t.Fatalf("Lookup: %v", err)
	}
	if lookup.Mode != ModeTestFallback || lookup.Election.ID != "2000" {
		t.Fatalf("fallback lookup = %#v", lookup)
	}
	if lookup.Warning == "" || len(client.requestedIDs) != 2 || client.requestedIDs[1] != TestElectionID {
		t.Fatalf("fallback metadata or calls = %#v, %#v", lookup, client.requestedIDs)
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
	service := newTestService(client, time.Date(2030, time.January, 1, 0, 0, 0, 0, time.UTC))

	lookup, err := service.Lookup(context.Background(), "211 Garrett Place", nil)
	if err != nil {
		t.Fatalf("Lookup: %v", err)
	}
	if lookup.Mode != ModeTestFallback || len(client.requestedIDs) != 2 || client.requestedIDs[1] != TestElectionID {
		t.Fatalf("fallback after no-data response = %#v, calls = %#v", lookup, client.requestedIDs)
	}
}

func TestServiceDoesNotTreatAdministrationOnlyLiveResponseAsUsable(t *testing.T) {
	client := &fakeCivicClient{
		elections: civic.ElectionsResponse{Elections: []civic.Election{{
			ID: "3000", Name: "Upcoming Election", ElectionDay: "2030-05-05",
		}}},
		voterInfo: map[int64]civic.VoterInfoResponse{
			3000: {
				Election: civic.Election{ID: "3000", Name: "Upcoming Election", ElectionDay: "2030-05-05"},
				State:    []civic.StateInformation{{Name: "Ohio"}},
			},
			2000: {
				Election:         civic.Election{ID: "2000", Name: "VIP Test Election", ElectionDay: "2031-12-06"},
				PollingLocations: []civic.PollingLocation{{Address: civic.Address{Line1: "VIP Test Hall"}}},
			},
		},
	}
	service := newTestService(client, time.Date(2030, time.January, 1, 0, 0, 0, 0, time.UTC))

	lookup, err := service.Lookup(context.Background(), "211 Garrett Place", nil)
	if err != nil {
		t.Fatalf("Lookup: %v", err)
	}
	if lookup.Mode != ModeTestFallback || lookup.Election.ID != "2000" {
		t.Fatalf("administration-only response suppressed fallback: %#v", lookup)
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
	return NewService(Config{
		Civic: client,
		Geocoder: fakeGeocoder{result: geocoding.Result{
			FormattedAddress: "211 Garrett Pl, Columbus, OH 43214, USA",
			Location:         geocoding.Point{Latitude: 40.0541, Longitude: -83.0222},
		}},
		Now: func() time.Time { return now },
	})
}
