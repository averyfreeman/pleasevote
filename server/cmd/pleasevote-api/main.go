// Command pleasevote-api serves the native Go provider boundary.
package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/averyfreeman/pleasevote/server/internal/civic"
	"github.com/averyfreeman/pleasevote/server/internal/geocoding"
	"github.com/averyfreeman/pleasevote/server/internal/httpapi"
	"github.com/averyfreeman/pleasevote/server/internal/logging"
	"github.com/averyfreeman/pleasevote/server/internal/voterinfo"
)

type runtimeConfig struct {
	debug            bool
	logLevel         string
	addr             string
	staticDir        string
	civicBaseURL     string
	geocodingBaseURL string
}

func main() {
	runtime, err := parseRuntimeConfig(os.Args[1:])
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(2)
	}
	logger, resolvedLogLevel, err := logging.NewLogger(runtime.debug, runtime.logLevel, os.Stderr)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(2)
	}

	providerHTTPClient := &http.Client{Timeout: 10 * time.Second}
	fixtureClient := civic.NewFixtureClient()
	var civicClient civic.Client
	configuredCivic, civicErr := civic.NewHTTPClient(civic.Config{
		BaseURL:    runtime.civicBaseURL,
		APIKey:     firstEnvironment("GOOGLE_CIVIC_API_KEY", "CIVIC_API_KEY"),
		HTTPClient: providerHTTPClient,
		Logger:     logger,
	})
	if civicErr != nil {
		if !runtime.debug {
			logger.Error("Civic provider configuration failed", "error_code", "server_configuration")
			os.Exit(1)
		}
		// Leave the live client unset so the service can report its explicit
		// debug-fixture provenance instead of presenting fixture data as live.
		civicClient = nil
		logger.Warn("live Civic provider is unavailable; debug mode will use the local fixture", "error_code", "civic_fixture_only")
	} else {
		civicClient = configuredCivic
	}

	geocoder, err := geocoding.NewHTTPClient(geocoding.Config{
		BaseURL:    runtime.geocodingBaseURL,
		APIKey:     firstEnvironment("GMAPS_API_KEY", "GOOGLE_MAPS_API_KEY"),
		HTTPClient: providerHTTPClient,
		Logger:     logger,
	})
	if err != nil {
		logger.Error("geocoding provider configuration failed", "error_code", "server_configuration")
		os.Exit(1)
	}

	service := voterinfo.NewService(voterinfo.Config{Civic: civicClient, Fixture: fixtureClient, Geocoder: geocoder, Debug: runtime.debug, Logger: logger})
	server := &http.Server{
		Addr:              runtime.addr,
		Handler:           httpapi.NewHandler(httpapi.Config{Service: service, Logger: logger, StaticDir: runtime.staticDir}),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	shutdownContext, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	go func() {
		<-shutdownContext.Done()
		shutdown, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := server.Shutdown(shutdown); err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Error("HTTP server shutdown failed", "error_code", "server_shutdown")
		}
	}()

	logger.Info("PleaseVote API listening", "addr", server.Addr, "debug", runtime.debug, "log_level", resolvedLogLevel)
	if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		logger.Error("HTTP server stopped unexpectedly", "error_code", "server_runtime")
		os.Exit(1)
	}
}

func parseRuntimeConfig(args []string) (runtimeConfig, error) {
	flags := flag.NewFlagSet("pleasevote-api", flag.ContinueOnError)
	flags.SetOutput(os.Stderr)
	debug := flags.Bool("debug", false, "enable the local Civic 2000 fixture and detailed diagnostics")
	logLevel := flags.String("log-level", firstEnvironment("PLEASEVOTE_LOG_LEVEL"), "terminal log level: DEBUG, INFO, WARN, ERROR, FAILURE, OFF, or DISABLED")
	if err := flags.Parse(args); err != nil {
		return runtimeConfig{}, err
	}
	if flags.NArg() != 0 {
		return runtimeConfig{}, fmt.Errorf("unexpected argument %q", flags.Arg(0))
	}
	_, _, err := logging.ResolveLevel(*debug, *logLevel)
	if err != nil {
		return runtimeConfig{}, err
	}
	return runtimeConfig{
		debug:            *debug,
		logLevel:         normalizedLogLevel(*debug, *logLevel),
		addr:             firstEnvironmentOr("PLEASEVOTE_ADDR", ":8080"),
		staticDir:        firstEnvironmentOr("PLEASEVOTE_STATIC_DIR", "build/client"),
		civicBaseURL:     firstEnvironment("PLEASEVOTE_CIVIC_BASE_URL", "CIVIC_BASE_URL"),
		geocodingBaseURL: firstEnvironment("PLEASEVOTE_GEOCODING_BASE_URL", "GEOCODING_BASE_URL"),
	}, nil
}

func normalizedLogLevel(debug bool, configured string) string {
	value := strings.ToUpper(strings.TrimSpace(configured))
	if value != "" {
		return value
	}
	if debug {
		return "DEBUG"
	}
	return "INFO"
}

func firstEnvironment(names ...string) string {
	for _, name := range names {
		if value := os.Getenv(name); value != "" {
			return value
		}
	}
	return ""
}

func firstEnvironmentOr(name string, fallback string) string {
	if value := os.Getenv(name); value != "" {
		return value
	}
	return fallback
}
