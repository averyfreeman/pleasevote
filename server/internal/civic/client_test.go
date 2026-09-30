package civic

import (
	"context"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"testing"

	"github.com/averyfreeman/pleasevote/server/internal/provider"
)

func fixtureBytes(t *testing.T, name string) []byte {
	t.Helper()
	_, sourceFile, _, ok := runtime.Caller(0)
	if !ok {
		t.Fatal("runtime.Caller failed")
	}
	path := filepath.Join(filepath.Dir(sourceFile), "../../../fixtures/civic", name)
	contents, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("read fixture %s: %v", path, err)
	}
	return contents
}

func TestHTTPClientVoterInfoDecodesOfficialCivicFields(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/civicinfo/v2/voterinfo" {
			t.Fatalf("path = %q, want /civicinfo/v2/voterinfo", r.URL.Path)
		}
		if got := r.URL.Query().Get("address"); got != "211 Garrett Place, Columbus, OH 43214" {
			t.Fatalf("address query = %q", got)
		}
		if got := r.URL.Query().Get("electionId"); got != "2000" {
			t.Fatalf("electionId query = %q", got)
		}
		if got := r.URL.Query().Get("key"); got != "civic-secret" {
			t.Fatalf("key query = %q", got)
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write(fixtureBytes(t, "voterinfo-2000-columbus.json"))
	}))
	defer server.Close()

	client, err := NewHTTPClient(Config{
		BaseURL:    server.URL + "/civicinfo/v2",
		APIKey:     "civic-secret",
		HTTPClient: server.Client(),
	})
	if err != nil {
		t.Fatalf("NewHTTPClient: %v", err)
	}
	electionID := int64(2000)
	response, err := client.VoterInfo(context.Background(), "211 Garrett Place, Columbus, OH 43214", &electionID)
	if err != nil {
		t.Fatalf("VoterInfo: %v", err)
	}

	if response.Election.ID != "2000" {
		t.Fatalf("election id = %q, want 2000", response.Election.ID)
	}
	if len(response.PollingLocations) != 2 {
		t.Fatalf("polling location count = %d, want 2", len(response.PollingLocations))
	}
	if response.PollingLocations[0].Latitude == nil || float64(*response.PollingLocations[0].Latitude) != 40.0545821 {
		t.Fatalf("first polling latitude = %#v", response.PollingLocations[0].Latitude)
	}
	if len(response.PollingLocations[0].Address.AddressLine) != 1 || response.PollingLocations[0].Address.AddressLine[0] != "93 W Weisheimer Rd" {
		t.Fatalf("display address lines = %#v", response.PollingLocations[0].Address.AddressLine)
	}
	if response.PollingLocations[1].Latitude != nil {
		t.Fatalf("missing polling latitude decoded as %#v", response.PollingLocations[1].Latitude)
	}
	if response.PollingLocations[0].Name != "" {
		t.Fatalf("polling location name = %q, want empty per Civic semantics", response.PollingLocations[0].Name)
	}
	if response.EarlyVoteSites[0].VoterServices != "In-person early voting" {
		t.Fatalf("early-vote services = %q", response.EarlyVoteSites[0].VoterServices)
	}
	if response.Contests[0].Candidates[0].Name != "Ada Lovelace" {
		t.Fatalf("candidate = %q", response.Contests[0].Candidates[0].Name)
	}
	if response.Contests[1].ReferendumText == "" {
		t.Fatal("referendum full text was not decoded")
	}
	if response.State[0].ElectionAdministrationBody.HoursOfOperation == "" {
		t.Fatal("administration hours were not decoded")
	}
}

func TestHTTPClientListElectionsUsesTypedResponse(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/civicinfo/v2/elections" {
			t.Fatalf("path = %q", r.URL.Path)
		}
		if got := r.URL.Query().Get("key"); got != "civic-secret" {
			t.Fatalf("key query = %q", got)
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write(fixtureBytes(t, "elections-live.json"))
	}))
	defer server.Close()

	client, err := NewHTTPClient(Config{BaseURL: server.URL + "/civicinfo/v2", APIKey: "civic-secret", HTTPClient: server.Client()})
	if err != nil {
		t.Fatalf("NewHTTPClient: %v", err)
	}
	response, err := client.ListElections(context.Background())
	if err != nil {
		t.Fatalf("ListElections: %v", err)
	}
	if len(response.Elections) != 2 || response.Elections[0].ID != "3000" {
		t.Fatalf("elections = %#v", response.Elections)
	}
}

func TestHTTPClientClassifiesNoDataAndRedactsCredentials(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		_, _ = w.Write([]byte(`{"error":{"message":"no voter data for this address"}}`))
	}))
	defer server.Close()

	client, err := NewHTTPClient(Config{BaseURL: server.URL + "/civicinfo/v2", APIKey: "civic-secret", HTTPClient: server.Client()})
	if err != nil {
		t.Fatalf("NewHTTPClient: %v", err)
	}
	_, err = client.VoterInfo(context.Background(), "private address", nil)
	if err == nil || !provider.IsNoData(err) {
		t.Fatalf("VoterInfo error = %v, want no-data error", err)
	}
	if strings.Contains(err.Error(), "civic-secret") || strings.Contains(err.Error(), "private address") {
		t.Fatalf("provider error leaked sensitive data: %v", err)
	}
}

func TestHTTPClientRequiresEnvironmentSuppliedCredential(t *testing.T) {
	_, err := NewHTTPClient(Config{BaseURL: "https://example.test/civicinfo/v2"})
	if err == nil || !provider.IsKind(err, provider.KindConfiguration) {
		t.Fatalf("NewHTTPClient error = %v, want configuration error", err)
	}
}
