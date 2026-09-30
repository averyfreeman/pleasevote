package geocoding

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

func geocodingFixtureBytes(t *testing.T, name string) []byte {
	t.Helper()
	_, sourceFile, _, ok := runtime.Caller(0)
	if !ok {
		t.Fatal("runtime.Caller failed")
	}
	path := filepath.Join(filepath.Dir(sourceFile), "../../../fixtures/geocoding", name)
	contents, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("read fixture %s: %v", path, err)
	}
	return contents
}

func TestHTTPClientGeocodeDecodesGoogleLocation(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/maps/api/geocode/json" {
			t.Fatalf("path = %q", r.URL.Path)
		}
		if got := r.URL.Query().Get("address"); got != "211 Garrett Place, Columbus, OH 43214" {
			t.Fatalf("address query = %q", got)
		}
		if got := r.URL.Query().Get("key"); got != "maps-secret" {
			t.Fatalf("key query = %q", got)
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write(geocodingFixtureBytes(t, "columbus.json"))
	}))
	defer server.Close()

	client, err := NewHTTPClient(Config{BaseURL: server.URL + "/maps/api/geocode/json", APIKey: "maps-secret", HTTPClient: server.Client()})
	if err != nil {
		t.Fatalf("NewHTTPClient: %v", err)
	}
	result, err := client.Geocode(context.Background(), "211 Garrett Place, Columbus, OH 43214")
	if err != nil {
		t.Fatalf("Geocode: %v", err)
	}
	if result.FormattedAddress != "211 Garrett Pl, Columbus, OH 43214, USA" {
		t.Fatalf("formatted address = %q", result.FormattedAddress)
	}
	if result.Location.Latitude != 40.0541 || result.Location.Longitude != -83.0222 {
		t.Fatalf("location = %#v", result.Location)
	}
}

func TestHTTPClientClassifiesZeroResultsWithoutLeakingAddress(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status":"ZERO_RESULTS","error_message":"not found"}`))
	}))
	defer server.Close()

	client, err := NewHTTPClient(Config{BaseURL: server.URL + "/maps/api/geocode/json", APIKey: "maps-secret", HTTPClient: server.Client()})
	if err != nil {
		t.Fatalf("NewHTTPClient: %v", err)
	}
	_, err = client.Geocode(context.Background(), "secret residential address")
	if err == nil || !provider.IsNoData(err) {
		t.Fatalf("Geocode error = %v, want no-data error", err)
	}
	if strings.Contains(err.Error(), "secret residential address") || strings.Contains(err.Error(), "maps-secret") {
		t.Fatalf("geocoding error leaked sensitive data: %v", err)
	}
}

func TestHTTPClientRejectsSuccessfulResultWithoutCoordinates(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status":"OK","results":[{"formatted_address":"Incomplete"}]}`))
	}))
	defer server.Close()

	client, err := NewHTTPClient(Config{BaseURL: server.URL + "/maps/api/geocode/json", APIKey: "maps-secret", HTTPClient: server.Client()})
	if err != nil {
		t.Fatalf("NewHTTPClient: %v", err)
	}
	_, err = client.Geocode(context.Background(), "211 Garrett Place")
	if err == nil || !provider.IsKind(err, provider.KindInvalidResponse) {
		t.Fatalf("Geocode error = %v, want invalid-response error", err)
	}
}
