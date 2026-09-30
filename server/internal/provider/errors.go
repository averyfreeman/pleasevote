// Package provider contains shared error types for upstream provider boundaries.
package provider

import (
	"errors"
	"fmt"
)

// ErrorKind identifies a safe, stable class of provider failure.
type ErrorKind string

const (
	// KindConfiguration means a required server-side configuration value is absent or invalid.
	KindConfiguration ErrorKind = "configuration"
	// KindInvalidRequest means the upstream rejected the request as malformed.
	KindInvalidRequest ErrorKind = "invalid_request"
	// KindNoData means the provider has no result for the requested address/election.
	KindNoData ErrorKind = "no_data"
	// KindUnauthorized means the provider rejected the configured credential.
	KindUnauthorized ErrorKind = "unauthorized"
	// KindRateLimited means the provider asked the caller to slow down.
	KindRateLimited ErrorKind = "rate_limited"
	// KindUnavailable means the provider or network is temporarily unavailable.
	KindUnavailable ErrorKind = "unavailable"
	// KindInvalidResponse means the provider response could not be decoded safely.
	KindInvalidResponse ErrorKind = "invalid_response"
	// KindNetwork means the request could not reach the provider.
	KindNetwork ErrorKind = "network"
)

// Error is a provider failure with no credential, address, URL, or raw upstream body.
//
// Message is intentionally written by the adapter, not copied from an arbitrary
// upstream response. This makes Error safe to pass to structured logging.
type Error struct {
	Kind       ErrorKind
	Operation  string
	StatusCode int
	Retryable  bool
	Message    string
}

// Error returns a redacted human-readable description.
func (e *Error) Error() string {
	if e == nil {
		return "<nil>"
	}
	if e.Message != "" {
		return fmt.Sprintf("%s: %s", e.Operation, e.Message)
	}
	if e.Operation == "" {
		return string(e.Kind)
	}
	return fmt.Sprintf("%s: %s", e.Operation, e.Kind)
}

// IsKind reports whether err is a provider Error of the requested kind.
func IsKind(err error, kind ErrorKind) bool {
	var providerError *Error
	return errors.As(err, &providerError) && providerError.Kind == kind
}

// IsNoData reports whether err means that the requested provider record does not exist.
func IsNoData(err error) bool {
	return IsKind(err, KindNoData)
}
