package civic

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"github.com/averyfreeman/pleasevote/server/internal/provider"
)

const defaultBaseURL = "https://www.googleapis.com/civicinfo/v2"

// Client is the typed boundary used by the voter-information service.
type Client interface {
	ListElections(context.Context) (ElectionsResponse, error)
	VoterInfo(context.Context, string, *int64) (VoterInfoResponse, error)
	Divisions(context.Context, string) (DivisionSearchResponse, error)
	DivisionsByAddress(context.Context, string) (DivisionsByAddressResponse, error)
}

// Config configures the Civic HTTP adapter. APIKey must come from the process
// environment; it is never accepted from a request.
type Config struct {
	BaseURL    string
	APIKey     string
	HTTPClient *http.Client
	Logger     *slog.Logger
}

// HTTPClient is a credentialed, typed Civic Information API adapter.
type HTTPClient struct {
	baseURL    *url.URL
	apiKey     string
	httpClient *http.Client
	logger     *slog.Logger
}

// NewHTTPClient constructs a Civic adapter without making a network request.
func NewHTTPClient(config Config) (*HTTPClient, error) {
	baseURL := config.BaseURL
	if baseURL == "" {
		baseURL = defaultBaseURL
	}
	if strings.TrimSpace(config.APIKey) == "" {
		return nil, &provider.Error{Kind: provider.KindConfiguration, Operation: "civic.configure", Message: "GOOGLE_CIVIC_API_KEY is required"}
	}
	parsed, err := url.Parse(baseURL)
	if err != nil || parsed.Scheme == "" || parsed.Host == "" {
		return nil, &provider.Error{Kind: provider.KindConfiguration, Operation: "civic.configure", Message: "Civic base URL is invalid"}
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

// ListElections returns the elections advertised by Civic.
func (c *HTTPClient) ListElections(ctx context.Context) (ElectionsResponse, error) {
	var response ElectionsResponse
	if err := c.getJSON(ctx, "elections", nil, &response); err != nil {
		return ElectionsResponse{}, err
	}
	return response, nil
}

// VoterInfo returns Civic voter data for an address and optional election ID.
func (c *HTTPClient) VoterInfo(ctx context.Context, address string, electionID *int64) (VoterInfoResponse, error) {
	if strings.TrimSpace(address) == "" {
		return VoterInfoResponse{}, &provider.Error{Kind: provider.KindInvalidRequest, Operation: "civic.voterinfo", Message: "address is required"}
	}
	query := url.Values{"address": []string{address}}
	if electionID != nil {
		query.Set("electionId", strconv.FormatInt(*electionID, 10))
	}
	var response VoterInfoResponse
	if err := c.getJSON(ctx, "voterinfo", query, &response); err != nil {
		return VoterInfoResponse{}, err
	}
	return response, nil
}

// Divisions searches the official Civic division index. The query is optional
// and may be an OCD identifier or a human-readable division name.
func (c *HTTPClient) Divisions(ctx context.Context, queryValue string) (DivisionSearchResponse, error) {
	query := url.Values{}
	if strings.TrimSpace(queryValue) != "" {
		query.Set("query", queryValue)
	}
	var response DivisionSearchResponse
	if err := c.getJSON(ctx, "divisions", query, &response); err != nil {
		return DivisionSearchResponse{}, err
	}
	return response, nil
}

// DivisionsByAddress resolves the official Civic divisions for an address.
func (c *HTTPClient) DivisionsByAddress(ctx context.Context, address string) (DivisionsByAddressResponse, error) {
	if strings.TrimSpace(address) == "" {
		return DivisionsByAddressResponse{}, &provider.Error{Kind: provider.KindInvalidRequest, Operation: "civic.divisionsByAddress", Message: "address is required"}
	}
	query := url.Values{"address": []string{address}}
	var response DivisionsByAddressResponse
	if err := c.getJSON(ctx, "divisionsByAddress", query, &response); err != nil {
		return DivisionsByAddressResponse{}, err
	}
	return response, nil
}

func (c *HTTPClient) getJSON(ctx context.Context, path string, query url.Values, destination any) error {
	requestURL := *c.baseURL
	requestURL.Path = strings.TrimRight(c.baseURL.Path, "/") + "/" + strings.TrimLeft(path, "/")
	requestQuery := requestURL.Query()
	requestQuery.Set("key", c.apiKey)
	for key, values := range query {
		for _, value := range values {
			requestQuery.Add(key, value)
		}
	}
	requestURL.RawQuery = requestQuery.Encode()

	request, err := http.NewRequestWithContext(ctx, http.MethodGet, requestURL.String(), nil)
	if err != nil {
		return &provider.Error{Kind: provider.KindConfiguration, Operation: "civic.request", Message: "Civic request could not be created"}
	}
	request.Header.Set("Accept", "application/json")
	logAttrs := []any{"operation", "civic." + path, "has_address", query.Get("address") != ""}
	if electionID := query.Get("electionId"); electionID != "" {
		logAttrs = append(logAttrs, "election_id", electionID)
	}
	c.logger.DebugContext(ctx, "Civic request", logAttrs...)
	response, err := c.httpClient.Do(request)
	if err != nil {
		c.logger.DebugContext(ctx, "Civic request failed", "operation", "civic."+path, "network_error", true)
		return &provider.Error{Kind: provider.KindNetwork, Operation: "civic.request", Retryable: true, Message: "Civic API request failed"}
	}
	defer response.Body.Close()
	c.logger.DebugContext(ctx, "Civic response", "operation", "civic."+path, "status", response.StatusCode)

	if response.StatusCode < http.StatusOK || response.StatusCode >= http.StatusMultipleChoices {
		return civicHTTPError("civic."+path, response.StatusCode)
	}
	decoder := json.NewDecoder(io.LimitReader(response.Body, 2<<20))
	if err := decoder.Decode(destination); err != nil {
		if errors.Is(err, io.EOF) {
			return &provider.Error{Kind: provider.KindInvalidResponse, Operation: "civic." + path, StatusCode: response.StatusCode, Message: "Civic API returned an empty response"}
		}
		return &provider.Error{Kind: provider.KindInvalidResponse, Operation: "civic." + path, StatusCode: response.StatusCode, Message: "Civic API returned invalid JSON"}
	}
	return nil
}

func civicHTTPError(operation string, statusCode int) error {
	kind := provider.KindUnavailable
	retryable := false
	message := "Civic API returned an upstream error"
	switch {
	case statusCode == http.StatusBadRequest:
		kind = provider.KindInvalidRequest
		message = "Civic API rejected the request"
	case statusCode == http.StatusNotFound:
		kind = provider.KindNoData
		message = "Civic API has no data for the request"
	case statusCode == http.StatusUnauthorized || statusCode == http.StatusForbidden:
		kind = provider.KindUnauthorized
		message = "Civic API rejected the configured credential"
	case statusCode == http.StatusTooManyRequests:
		kind = provider.KindRateLimited
		retryable = true
		message = "Civic API rate limit reached"
	case statusCode >= http.StatusInternalServerError:
		retryable = true
		message = "Civic API is temporarily unavailable"
	default:
		message = fmt.Sprintf("Civic API returned HTTP %d", statusCode)
	}
	return &provider.Error{Kind: kind, Operation: operation, StatusCode: statusCode, Retryable: retryable, Message: message}
}
