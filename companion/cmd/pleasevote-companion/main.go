// Command pleasevote-companion serves the separately deployed, intake-only
// consent companion. It never reads PleaseVote lookup data.
package main

import (
	"context"
	"database/sql"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/averyfreeman/pleasevote/companion"
	_ "github.com/jackc/pgx/v5/stdlib"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stderr, nil))
	databaseURL := os.Getenv("PLEASEVOTE_COMPANION_DATABASE_URL")
	if databaseURL == "" {
		logger.Error("companion database URL is required", "error_code", "server_configuration")
		os.Exit(1)
	}
	database, err := sql.Open("pgx", databaseURL)
	if err != nil {
		logger.Error("companion database could not open", "error_code", "server_configuration")
		os.Exit(1)
	}
	defer database.Close()
	database.SetMaxOpenConns(4)
	database.SetMaxIdleConns(2)
	database.SetConnMaxIdleTime(5 * time.Minute)
	pingContext, cancelPing := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancelPing()
	if err := database.PingContext(pingContext); err != nil {
		logger.Error("companion database is unavailable", "error_code", "server_configuration")
		os.Exit(1)
	}
	server := &http.Server{
		Addr:              environmentOr("PLEASEVOTE_COMPANION_ADDR", ":8081"),
		Handler:           companion.NewHandler(companion.HandlerConfig{Store: companion.NewSQLStore(database), Logger: logger}),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      10 * time.Second,
		IdleTimeout:       60 * time.Second,
		MaxHeaderBytes:    16 << 10,
	}

	shutdownContext, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	go func() {
		<-shutdownContext.Done()
		shutdown, cancelShutdown := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancelShutdown()
		if err := server.Shutdown(shutdown); err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Error("companion HTTP shutdown failed", "error_code", "server_shutdown")
		}
	}()

	logger.Info("PleaseVote consent companion listening", "addr", server.Addr)
	if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		logger.Error("companion server stopped", "error_code", "server_runtime")
		os.Exit(1)
	}
}

func environmentOr(name, fallback string) string {
	if value := os.Getenv(name); value != "" {
		return value
	}
	return fallback
}
