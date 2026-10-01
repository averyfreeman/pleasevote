package geocoding

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"net/url"
	"strings"

	"github.com/averyfreeman/pleasevote/server/internal/provider"
)

const defaultBaseURL = "https://maps.googleapis.com/maps/api/geocode/json"

// Client is the typed boundary used to resolve the user's address.
type Client interface {
	Geocode(context.Context, string) (Result, error)
}

// Config configures the Google Geocoding HTTP adapter. APIKey must come from
// the process environment and is never accepted from a request.
type Config struct {
	BaseURL    string
	APIKey     string
	HTTPClient *http.Client
	Logger     *slog.Logger
}

// HTTPClient is a credentialed Google Geocoding API adapter.
type HTTPClient struct {
	baseURL    *url.URL
	apiKey     string
	httpClient *http.Client
	logger     *slog.Logger
}

type apiResponse struct {
	Status       string `json:"status"`
	ErrorMessage string `json:"error_message,omitempty"`
	Results      []struct {
		FormattedAddress string `json:"formatted_address"`
		Geometry         struct {
			Location struct {
				Latitude  *float64 `json:"lat"`
				Longitude *float64 `json:"lng"`
			} `json:"location"`
		} `json:"geometry"`
	} `json:"results"`
}

// NewHTTPClient constructs a geocoding adapter without making a network request.
func NewHTTPClient(config Config) (*HTTPClient, error) {
	baseURL := config.BaseURL
	if baseURL == "" {
		baseURL = defaultBaseURL
	}
	if strings.TrimSpace(config.APIKey) == "" {
		return nil, &provider.Error{Kind: provider.KindConfiguration, Operation: "geocoding.configure", Message: "GMAPS_API_KEY is required"}
	}
	parsed, err := url.Parse(baseURL)
	if err != nil || parsed.Scheme == "" || parsed.Host == "" {
		return nil, &provider.Error{Kind: provider.KindConfiguration, Operation: "geocoding.configure", Message: "geocoding base URL is invalid"}
	}
	client := config.HTTPClient
	if client == nil {
		client = http.DefaultClient
	}
	logger := config.Logger
	if logger == nil {
		logger = slog.Default()
	}
	return &HTTPClient{baseURL: parsed, apiKey: config.APIKey, httpClient: client, logger: logger}, nil
}

// Geocode resolves an address to its first provider result.
func (c *HTTPClient) Geocode(ctx context.Context, address string) (Result, error) {
	if strings.TrimSpace(address) == "" {
		return Result{}, &provider.Error{Kind: provider.KindInvalidRequest, Operation: "geocoding.lookup", Message: "address is required"}
	}
	requestURL := *c.baseURL
	query := requestURL.Query()
	query.Set("address", address)
	query.Set("key", c.apiKey)
	requestURL.RawQuery = query.Encode()
	request, err := http.NewRequestWithContext(ctx, http.MethodGet, requestURL.String(), nil)
	if err != nil {
		return Result{}, &provider.Error{Kind: provider.KindConfiguration, Operation: "geocoding.request", Message: "geocoding request could not be created"}
	}
	request.Header.Set("Accept", "application/json")
	c.logger.DebugContext(ctx, "Geocoding request", "operation", "geocoding.lookup", "has_address", true)
	response, err := c.httpClient.Do(request)
	if err != nil {
		c.logger.DebugContext(ctx, "Geocoding request failed", "operation", "geocoding.lookup", "network_error", true)
		return Result{}, &provider.Error{Kind: provider.KindNetwork, Operation: "geocoding.request", Retryable: true, Message: "geocoding request failed"}
	}
	defer response.Body.Close()
	c.logger.DebugContext(ctx, "Geocoding response", "operation", "geocoding.lookup", "status", response.StatusCode)
	if response.StatusCode < http.StatusOK || response.StatusCode >= http.StatusMultipleChoices {
		return Result{}, geocodingHTTPError(response.StatusCode)
	}
	var decoded apiResponse
	decoder := json.NewDecoder(io.LimitReader(response.Body, 1<<20))
	if err := decoder.Decode(&decoded); err != nil {
		if errors.Is(err, io.EOF) {
			return Result{}, &provider.Error{Kind: provider.KindInvalidResponse, Operation: "geocoding.lookup", Message: "geocoding API returned an empty response"}
		}
		return Result{}, &provider.Error{Kind: provider.KindInvalidResponse, Operation: "geocoding.lookup", Message: "geocoding API returned invalid JSON"}
	}
	if decoded.Status != "OK" {
		return Result{}, geocodingStatusError(decoded.Status)
	}
	if len(decoded.Results) == 0 {
		return Result{}, &provider.Error{Kind: provider.KindNoData, Operation: "geocoding.lookup", Message: "geocoding returned no result"}
	}
	first := decoded.Results[0]
	if first.Geometry.Location.Latitude == nil || first.Geometry.Location.Longitude == nil {
		return Result{}, &provider.Error{Kind: provider.KindInvalidResponse, Operation: "geocoding.lookup", Message: "geocoding result did not include coordinates"}
	}
	return Result{
		FormattedAddress: first.FormattedAddress,
		Location: Point{
			Latitude:  *first.Geometry.Location.Latitude,
			Longitude: *first.Geometry.Location.Longitude,
		},
	}, nil
}

func geocodingStatusError(status string) error {
	switch status {
	case "ZERO_RESULTS":
		return &provider.Error{Kind: provider.KindNoData, Operation: "geocoding.lookup", Message: "geocoding returned no result"}
	case "REQUEST_DENIED", "INVALID_REQUEST":
		return &provider.Error{Kind: provider.KindUnauthorized, Operation: "geocoding.lookup", Message: "geocoding API rejected the configured request"}
	case "OVER_QUERY_LIMIT":
		return &provider.Error{Kind: provider.KindRateLimited, Operation: "geocoding.lookup", Retryable: true, Message: "geocoding API rate limit reached"}
	default:
		return &provider.Error{Kind: provider.KindUnavailable, Operation: "geocoding.lookup", Retryable: true, Message: "geocoding API returned an unavailable status"}
	}
}

func geocodingHTTPError(statusCode int) error {
	switch {
	case statusCode == http.StatusBadRequest:
		return &provider.Error{Kind: provider.KindInvalidRequest, Operation: "geocoding.lookup", StatusCode: statusCode, Message: "geocoding API rejected the request"}
	case statusCode == http.StatusUnauthorized || statusCode == http.StatusForbidden:
		return &provider.Error{Kind: provider.KindUnauthorized, Operation: "geocoding.lookup", StatusCode: statusCode, Message: "geocoding API rejected the configured credential"}
	case statusCode == http.StatusTooManyRequests:
		return &provider.Error{Kind: provider.KindRateLimited, Operation: "geocoding.lookup", StatusCode: statusCode, Retryable: true, Message: "geocoding API rate limit reached"}
	default:
		return &provider.Error{Kind: provider.KindUnavailable, Operation: "geocoding.lookup", StatusCode: statusCode, Retryable: statusCode >= http.StatusInternalServerError, Message: "geocoding API returned an upstream error"}
	}
}
