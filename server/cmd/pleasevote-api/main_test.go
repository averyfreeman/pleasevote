package main

import "testing"

func TestParseRuntimeConfigDebugDefaultsToDebugLogging(t *testing.T) {
	config, err := parseRuntimeConfig([]string{"--debug"})
	if err != nil {
		t.Fatalf("parseRuntimeConfig: %v", err)
	}
	if !config.debug || config.logLevel != "DEBUG" {
		t.Fatalf("debug config = %#v, want debug with DEBUG level", config)
	}
}

func TestParseRuntimeConfigHonorsExplicitLogLevel(t *testing.T) {
	config, err := parseRuntimeConfig([]string{"--debug", "--log-level=ERROR"})
	if err != nil {
		t.Fatalf("parseRuntimeConfig: %v", err)
	}
	if config.logLevel != "ERROR" {
		t.Fatalf("log level = %q, want ERROR", config.logLevel)
	}
}

func TestParseRuntimeConfigRejectsUnknownLogLevel(t *testing.T) {
	if _, err := parseRuntimeConfig([]string{"--log-level=VERBOSE"}); err == nil {
		t.Fatal("parseRuntimeConfig accepted an unknown log level")
	}
}

func TestParseRuntimeConfigRetainsDeploymentProviderOverrides(t *testing.T) {
	t.Setenv("PLEASEVOTE_CIVIC_BASE_URL", "http://civic.test/v2")
	t.Setenv("PLEASEVOTE_GEOCODING_BASE_URL", "http://maps.test/geocode")
	t.Setenv("PLEASEVOTE_ADDR", ":9090")
	t.Setenv("PLEASEVOTE_STATIC_DIR", "/tmp/pleasevote-static")

	config, err := parseRuntimeConfig(nil)
	if err != nil {
		t.Fatalf("parseRuntimeConfig: %v", err)
	}
	if config.civicBaseURL != "http://civic.test/v2" || config.geocodingBaseURL != "http://maps.test/geocode" || config.addr != ":9090" || config.staticDir != "/tmp/pleasevote-static" {
		t.Fatalf("deployment overrides = %#v", config)
	}
}

func TestParseRuntimeConfigHasOneDebugSwitch(t *testing.T) {
	if _, err := parseRuntimeConfig([]string{"--provider=fixture"}); err == nil {
		t.Fatal("legacy provider mode was accepted; use --debug")
	}
}
