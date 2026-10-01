package companion

import (
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"strings"
	"time"
)

const (
	maxRequestBodyBytes = 32 << 10
	maxNameLength       = 200
	maxEmailLength      = 254
	maxPhoneLength      = 64
	maxPostalLength     = 500
	maxSourceLength     = 100
	maxListValues       = 20
	maxListValueLength  = 100
)

// HandlerConfig configures the separate consent intake HTTP service.
type HandlerConfig struct {
	Store  Store
	Logger *slog.Logger
	Clock  func() time.Time
}

type handler struct {
	store  Store
	logger *slog.Logger
	clock  func() time.Time
}

type intakeRequest struct {
	Name            string   `json:"name"`
	Email           string   `json:"email"`
	Phone           string   `json:"phone"`
	PostalAddress   string   `json:"postalAddress"`
	Purposes        []string `json:"purposes"`
	Channels        []string `json:"channels"`
	ConsentAccepted bool     `json:"consentAccepted"`
	Source          string   `json:"source"`
}

type errorBody struct {
	Error string `json:"error"`
}

// NewHandler creates an intake-only handler. It does not expose list, export,
// search, messaging, or lookup-linkage endpoints.
func NewHandler(config HandlerConfig) http.Handler {
	logger := config.Logger
	if logger == nil {
		logger = slog.Default()
	}
	clock := config.Clock
	if clock == nil {
		clock = time.Now
	}
	return &handler{store: config.Store, logger: logger, clock: clock}
}

func (h *handler) ServeHTTP(writer http.ResponseWriter, request *http.Request) {
	writer.Header().Set("Cache-Control", "no-store")
	writer.Header().Set("X-Content-Type-Options", "nosniff")
	writer.Header().Set("Referrer-Policy", "no-referrer")
	switch request.URL.Path {
	case "/healthz":
		if request.Method != http.MethodGet {
			h.writeError(writer, http.StatusMethodNotAllowed, "only GET is supported")
			return
		}
		h.writeJSON(writer, http.StatusOK, map[string]string{"status": "ok"})
	case "/v1/consents":
		if request.Method != http.MethodPost {
			h.writeError(writer, http.StatusMethodNotAllowed, "only POST is supported")
			return
		}
		h.createConsent(writer, request)
	default:
		h.writeError(writer, http.StatusNotFound, "the requested companion route does not exist")
	}
}

func (h *handler) createConsent(writer http.ResponseWriter, request *http.Request) {
	if h.store == nil {
		h.writeError(writer, http.StatusInternalServerError, "the consent store is not configured")
		return
	}
	decoder := json.NewDecoder(http.MaxBytesReader(writer, request.Body, maxRequestBodyBytes))
	decoder.DisallowUnknownFields()
	var body intakeRequest
	if err := decoder.Decode(&body); err != nil {
		h.writeError(writer, http.StatusBadRequest, "request body is invalid")
		return
	}
	if err := decoder.Decode(&struct{}{}); err != io.EOF {
		h.writeError(writer, http.StatusBadRequest, "request body must contain one JSON object")
		return
	}
	name := strings.TrimSpace(body.Name)
	if name == "" || len(name) > maxNameLength {
		h.writeError(writer, http.StatusBadRequest, fmt.Sprintf("name is required and must be %d characters or fewer", maxNameLength))
		return
	}
	if !body.ConsentAccepted {
		h.writeError(writer, http.StatusBadRequest, "explicit consent is required")
		return
	}
	if len(body.Purposes) > maxListValues || len(body.Channels) > maxListValues {
		h.writeError(writer, http.StatusBadRequest, "too many purpose or channel values")
		return
	}
	if err := validateOptionalFields(body.Email, body.Phone, body.PostalAddress, body.Source); err != nil {
		h.writeError(writer, http.StatusBadRequest, err.Error())
		return
	}
	purposes, err := cleanStrings(body.Purposes)
	if err != nil {
		h.writeError(writer, http.StatusBadRequest, err.Error())
		return
	}
	channels, err := cleanStrings(body.Channels)
	if err != nil {
		h.writeError(writer, http.StatusBadRequest, err.Error())
		return
	}
	intake := Intake{
		Name:            name,
		Email:           strings.TrimSpace(body.Email),
		Phone:           strings.TrimSpace(body.Phone),
		PostalAddress:   strings.TrimSpace(body.PostalAddress),
		Purposes:        purposes,
		Channels:        channels,
		ConsentAccepted: true,
		Source:          strings.TrimSpace(body.Source),
	}
	receipt, err := h.store.CreateConsent(request.Context(), intake, h.clock())
	if err != nil {
		h.logger.Error("consent intake failed", "error_code", "store_failure")
		h.writeError(writer, http.StatusInternalServerError, "the consent record could not be stored")
		return
	}
	h.writeJSON(writer, http.StatusCreated, receipt)
}

func validateOptionalFields(email, phone, postalAddress, source string) error {
	limits := []struct {
		name  string
		value string
		limit int
	}{
		{name: "email", value: email, limit: maxEmailLength},
		{name: "phone", value: phone, limit: maxPhoneLength},
		{name: "postalAddress", value: postalAddress, limit: maxPostalLength},
		{name: "source", value: source, limit: maxSourceLength},
	}
	for _, field := range limits {
		if len(strings.TrimSpace(field.value)) > field.limit {
			return fmt.Errorf("%s must be %d characters or fewer", field.name, field.limit)
		}
	}
	return nil
}

func cleanStrings(values []string) ([]string, error) {
	cleaned := make([]string, 0, len(values))
	for _, value := range values {
		if trimmed := strings.TrimSpace(value); trimmed != "" {
			if len(trimmed) > maxListValueLength {
				return nil, fmt.Errorf("purpose and channel values must be %d characters or fewer", maxListValueLength)
			}
			cleaned = append(cleaned, trimmed)
		}
	}
	return cleaned, nil
}

func (h *handler) writeError(writer http.ResponseWriter, status int, message string) {
	h.writeJSON(writer, status, errorBody{Error: message})
}

func (h *handler) writeJSON(writer http.ResponseWriter, status int, value any) {
	writer.Header().Set("Content-Type", "application/json; charset=utf-8")
	writer.WriteHeader(status)
	_ = json.NewEncoder(writer).Encode(value)
}
