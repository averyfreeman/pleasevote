// Package logging centralizes the small set of operator-facing levels exposed
// by the PleaseVote API command.
package logging

import (
	"fmt"
	"io"
	"log/slog"
	"strings"
)

const disabledLevel slog.Level = 100

// ParseLevel converts the documented command-line level names to slog levels.
// FAILURE is intentionally above ERROR so it can be selected as a narrower
// operational stream; OFF and DISABLED suppress all records.
func ParseLevel(value string) (slog.Level, error) {
	switch strings.ToUpper(strings.TrimSpace(value)) {
	case "DEBUG":
		return slog.LevelDebug, nil
	case "INFO":
		return slog.LevelInfo, nil
	case "WARN", "WARNING":
		return slog.LevelWarn, nil
	case "ERROR":
		return slog.LevelError, nil
	case "FAILURE":
		return slog.Level(12), nil
	case "OFF", "DISABLED":
		return disabledLevel, nil
	default:
		return 0, fmt.Errorf("log level must be DEBUG, INFO, WARN, ERROR, FAILURE, OFF, or DISABLED")
	}
}

// ResolveLevel applies the debug default while preserving an explicit level.
func ResolveLevel(debug bool, configured string) (slog.Level, string, error) {
	name := strings.ToUpper(strings.TrimSpace(configured))
	if name == "" {
		if debug {
			name = "DEBUG"
		} else {
			name = "INFO"
		}
	}
	level, err := ParseLevel(name)
	return level, name, err
}

// NewLogger returns a structured terminal logger and the normalized level
// name used to configure it.
func NewLogger(debug bool, configured string, output io.Writer) (*slog.Logger, string, error) {
	level, name, err := ResolveLevel(debug, configured)
	if err != nil {
		return nil, "", err
	}
	if output == nil {
		output = io.Discard
	}
	return slog.New(slog.NewTextHandler(output, &slog.HandlerOptions{Level: level})), name, nil
}
