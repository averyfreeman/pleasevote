package companion

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func TestConsentIntakeRequiresExplicitConsentAndRejectsLookupFields(t *testing.T) {
	store := &MemoryStore{}
	handler := NewHandler(HandlerConfig{Store: store, Clock: func() time.Time { return time.Date(2030, time.January, 2, 3, 4, 5, 0, time.UTC) }})

	for _, body := range []string{
		`{"name":"Avery","consentAccepted":false}`,
		`{"name":"Avery","consentAccepted":true,"lookupAddress":"1 Main St"}`,
	} {
		request := httptest.NewRequest(http.MethodPost, "/v1/consents", bytes.NewBufferString(body))
		recorder := httptest.NewRecorder()
		handler.ServeHTTP(recorder, request)
		if recorder.Code != http.StatusBadRequest {
			t.Fatalf("status = %d, body = %s", recorder.Code, recorder.Body.String())
		}
	}
}

func TestConsentIntakeStoresOnlyVoluntaryFieldsAndReturnsReceipt(t *testing.T) {
	store := &MemoryStore{}
	handler := NewHandler(HandlerConfig{Store: store, Clock: func() time.Time { return time.Date(2030, time.January, 2, 3, 4, 5, 0, time.UTC) }})
	body := `{"name":" Avery ","email":"a@example.test","purposes":["volunteer"],"channels":["email"],"consentAccepted":true,"source":"form"}`
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, httptest.NewRequest(http.MethodPost, "/v1/consents", bytes.NewBufferString(body)))
	if recorder.Code != http.StatusCreated {
		t.Fatalf("status = %d, body = %s", recorder.Code, recorder.Body.String())
	}
	if recorder.Header().Get("Cache-Control") != "no-store" || recorder.Header().Get("X-Content-Type-Options") != "nosniff" {
		t.Fatalf("privacy headers = %#v", recorder.Header())
	}
	var receipt Receipt
	if err := json.Unmarshal(recorder.Body.Bytes(), &receipt); err != nil {
		t.Fatalf("decode receipt: %v", err)
	}
	if receipt.Status != "active" || len(store.Records) != 1 || store.Records[0].Intake.Name != "Avery" || store.Records[0].Intake.Email != "a@example.test" {
		t.Fatalf("stored consent = %#v, receipt = %#v", store.Records, receipt)
	}
	if strings.Contains(recorder.Body.String(), "a@example.test") || strings.Contains(recorder.Body.String(), "Avery") {
		t.Fatalf("receipt exposed submitted contact data: %s", recorder.Body.String())
	}
}

func TestConsentIntakeRejectsTrailingJSONAndOversizedFields(t *testing.T) {
	handler := NewHandler(HandlerConfig{Store: &MemoryStore{}})
	tests := []string{
		`{"name":"Avery","consentAccepted":true} {}`,
		`{"name":"Avery","email":"` + strings.Repeat("x", 255) + `","consentAccepted":true}`,
		`{"name":"Avery","consentAccepted":true,"purposes":["` + strings.Repeat("x", 101) + `"]}`,
	}
	for _, body := range tests {
		recorder := httptest.NewRecorder()
		handler.ServeHTTP(recorder, httptest.NewRequest(http.MethodPost, "/v1/consents", bytes.NewBufferString(body)))
		if recorder.Code != http.StatusBadRequest {
			t.Fatalf("status = %d, body = %s", recorder.Code, recorder.Body.String())
		}
	}
}

func TestCompanionRoutesStayIntakeOnly(t *testing.T) {
	handler := NewHandler(HandlerConfig{Store: &MemoryStore{}})
	for _, route := range []string{"/v1/consents", "/v1/lookup", "/v1/export", "/v1/messages"} {
		recorder := httptest.NewRecorder()
		handler.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, route, nil))
		if recorder.Code != http.StatusMethodNotAllowed && recorder.Code != http.StatusNotFound {
			t.Fatalf("route %s status = %d", route, recorder.Code)
		}
	}
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/healthz", nil))
	if recorder.Code != http.StatusOK || recorder.Header().Get("Cache-Control") != "no-store" {
		t.Fatalf("health response = %d, headers = %#v", recorder.Code, recorder.Header())
	}
}

func TestConsentIntakeRedactsStoreFailures(t *testing.T) {
	handler := NewHandler(HandlerConfig{Store: failingStore{}})
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, httptest.NewRequest(http.MethodPost, "/v1/consents", bytes.NewBufferString(`{"name":"Avery","consentAccepted":true}`)))
	if recorder.Code != http.StatusInternalServerError || strings.Contains(recorder.Body.String(), "database") {
		t.Fatalf("store failure response = %d, body = %s", recorder.Code, recorder.Body.String())
	}
}

type failingStore struct{}

func (failingStore) CreateConsent(_ context.Context, _ Intake, _ time.Time) (Receipt, error) {
	return Receipt{}, errors.New("database password must not escape")
}
