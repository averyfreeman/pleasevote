package httpapi

import (
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"testing"
)

func TestOpenAPISourceDocumentsFrontendLookupShape(t *testing.T) {
	_, sourceFile, _, ok := runtime.Caller(0)
	if !ok {
		t.Fatal("runtime.Caller failed")
	}
	path := filepath.Join(filepath.Dir(sourceFile), "../../../contracts/openapi.yaml")
	contents, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("read OpenAPI source: %v", err)
	}
	document := string(contents)
	for _, required := range []string{
		"/api/v1/lookup:",
		"/api/v1/divisions:",
		"/api/v1/divisionsByAddress:",
		"address:",
		"normalizedAddress:",
		"origin:",
		"pollingLocations:",
		"earlyVoteSites:",
		"dropOffLocations:",
		"contests:",
		"administration:",
		"otherElections:",
		"sources:",
		"retrieval:",
		"mode:",
		"test-fixture",
		"voterServices:",
		"providerStatus:",
		"eligible to vote on election day",
	} {
		if !strings.Contains(document, required) {
			t.Errorf("OpenAPI source does not document %q", required)
		}
	}
}
