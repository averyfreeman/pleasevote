package companion

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
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
	var receipt Receipt
	if err := json.Unmarshal(recorder.Body.Bytes(), &receipt); err != nil {
		t.Fatalf("decode receipt: %v", err)
	}
	if receipt.Status != "active" || len(store.Records) != 1 || store.Records[0].Intake.Name != "Avery" || store.Records[0].Intake.Email != "a@example.test" {
		t.Fatalf("stored consent = %#v, receipt = %#v", store.Records, receipt)
	}
}
