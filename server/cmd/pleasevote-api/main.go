// Command pleasevote-api serves the native Go provider boundary.
package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/averyfreeman/pleasevote/server/internal/civic"
	"github.com/averyfreeman/pleasevote/server/internal/geocoding"
	"github.com/averyfreeman/pleasevote/server/internal/httpapi"
	"github.com/averyfreeman/pleasevote/server/internal/voterinfo"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stderr, &slog.HandlerOptions{Level: slog.LevelInfo}))
	providerHTTPClient := &http.Client{Timeout: 10 * time.Second}
	civicClient, err := civic.NewHTTPClient(civic.Config{APIKey: firstEnvironment("GOOGLE_CIVIC_API_KEY", "CIVIC_API_KEY"), HTTPClient: providerHTTPClient})
	if err != nil {
		logger.Error("Civic provider configuration failed", "error_code", "server_configuration")
		os.Exit(1)
	}
	geocoder, err := geocoding.NewHTTPClient(geocoding.Config{APIKey: firstEnvironment("GMAPS_API_KEY", "GOOGLE_MAPS_API_KEY"), HTTPClient: providerHTTPClient})
	if err != nil {
		logger.Error("geocoding provider configuration failed", "error_code", "server_configuration")
		os.Exit(1)
	}

	service := voterinfo.NewService(voterinfo.Config{Civic: civicClient, Geocoder: geocoder})
	server := &http.Server{
		Addr:              firstEnvironmentOr("PLEASEVOTE_ADDR", ":8080"),
		Handler:           httpapi.NewHandler(httpapi.Config{Service: service, Logger: logger, StaticDir: firstEnvironmentOr("PLEASEVOTE_STATIC_DIR", "build/client")}),
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

	logger.Info("PleaseVote API listening", "addr", server.Addr)
	if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		logger.Error("HTTP server stopped unexpectedly", "error_code", "server_runtime")
		os.Exit(1)
	}
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
