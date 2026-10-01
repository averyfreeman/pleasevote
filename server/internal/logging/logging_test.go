package logging

import (
	"log/slog"
	"testing"
)

func TestParseLevelSupportsNamedOperationalLevels(t *testing.T) {
	tests := map[string]slog.Level{
		"DEBUG":    slog.LevelDebug,
		"INFO":     slog.LevelInfo,
		"WARN":     slog.LevelWarn,
		"ERROR":    slog.LevelError,
		"FAILURE":  slog.Level(12),
		"OFF":      slog.Level(100),
		"DISABLED": slog.Level(100),
	}
	for input, want := range tests {
		got, err := ParseLevel(input)
		if err != nil {
			t.Fatalf("ParseLevel(%q): %v", input, err)
		}
		if got != want {
			t.Errorf("ParseLevel(%q) = %v, want %v", input, got, want)
		}
	}
}

func TestParseLevelRejectsUnknownValues(t *testing.T) {
	if _, err := ParseLevel("VERBOSE"); err == nil {
		t.Fatal("ParseLevel accepted an unknown level")
	}
}
