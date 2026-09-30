package provider

import (
	"fmt"
	"testing"
)

func TestErrorClassificationSurvivesWrapping(t *testing.T) {
	err := &Error{Kind: KindNoData, Operation: "civic.voterinfo", Message: "no data"}
	wrapped := fmt.Errorf("lookup failed: %w", err)
	if !IsKind(wrapped, KindNoData) || !IsNoData(wrapped) {
		t.Fatalf("wrapped error was not classified: %v", wrapped)
	}
}
