package companion

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"strings"
	"time"
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
	decoder := json.NewDecoder(http.MaxBytesReader(writer, request.Body, 32<<10))
	decoder.DisallowUnknownFields()
	var body intakeRequest
	if err := decoder.Decode(&body); err != nil {
		h.writeError(writer, http.StatusBadRequest, "request body is invalid")
		return
	}
	name := strings.TrimSpace(body.Name)
	if name == "" || len(name) > 200 {
		h.writeError(writer, http.StatusBadRequest, "name is required and must be 200 characters or fewer")
		return
	}
	if !body.ConsentAccepted {
		h.writeError(writer, http.StatusBadRequest, "explicit consent is required")
		return
	}
	if len(body.Purposes) > 20 || len(body.Channels) > 20 {
		h.writeError(writer, http.StatusBadRequest, "too many purpose or channel values")
		return
	}
	intake := Intake{
		Name:            name,
		Email:           strings.TrimSpace(body.Email),
		Phone:           strings.TrimSpace(body.Phone),
		PostalAddress:   strings.TrimSpace(body.PostalAddress),
		Purposes:        cleanStrings(body.Purposes),
		Channels:        cleanStrings(body.Channels),
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

func cleanStrings(values []string) []string {
	cleaned := make([]string, 0, len(values))
	for _, value := range values {
		if trimmed := strings.TrimSpace(value); trimmed != "" && len(trimmed) <= 100 {
			cleaned = append(cleaned, trimmed)
		}
	}
	return cleaned
}

func (h *handler) writeError(writer http.ResponseWriter, status int, message string) {
	h.writeJSON(writer, status, errorBody{Error: message})
}

func (h *handler) writeJSON(writer http.ResponseWriter, status int, value any) {
	writer.Header().Set("Content-Type", "application/json; charset=utf-8")
	writer.WriteHeader(status)
	_ = json.NewEncoder(writer).Encode(value)
}
