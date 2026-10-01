// Package companion contains the deliberately separate, intake-only consent
// boundary. It has no dependency on PleaseVote lookup addresses or contests.
package companion

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"
)

// Intake is voluntarily supplied by a person for a stated non-lookup purpose.
// There is intentionally no address-lookup, election, candidate, or inferred
// political-preference field in this type.
type Intake struct {
	Name            string
	Email           string
	Phone           string
	PostalAddress   string
	Purposes        []string
	Channels        []string
	ConsentAccepted bool
	Source          string
}

// Receipt is the only response body returned after an intake is stored.
type Receipt struct {
	ID          string    `json:"id"`
	Status      string    `json:"status"`
	ConsentedAt time.Time `json:"consentedAt"`
}

// Store is the least-privilege persistence seam for consent intake.
type Store interface {
	CreateConsent(context.Context, Intake, time.Time) (Receipt, error)
}

// SQLStore persists only the fields in the companion schema.
type SQLStore struct {
	DB *sql.DB
}

// NewSQLStore creates a Postgres-backed consent store. The caller owns DB
// lifecycle and must grant the runtime role access only to companion tables.
func NewSQLStore(db *sql.DB) *SQLStore { return &SQLStore{DB: db} }

// CreateConsent inserts a consent record without allowing caller-controlled
// SQL identifiers or a link to PleaseVote lookup data.
func (s *SQLStore) CreateConsent(ctx context.Context, intake Intake, now time.Time) (Receipt, error) {
	if s == nil || s.DB == nil {
		return Receipt{}, errors.New("companion database is not configured")
	}
	intake, err := normalizeIntake(intake)
	if err != nil {
		return Receipt{}, err
	}
	id, err := newID("ci")
	if err != nil {
		return Receipt{}, fmt.Errorf("create consent id: %w", err)
	}
	purposes, err := json.Marshal(nonNilStrings(intake.Purposes))
	if err != nil {
		return Receipt{}, fmt.Errorf("encode consent purposes: %w", err)
	}
	channels, err := json.Marshal(nonNilStrings(intake.Channels))
	if err != nil {
		return Receipt{}, fmt.Errorf("encode consent channels: %w", err)
	}
	_, err = s.DB.ExecContext(ctx, `
		INSERT INTO companion.consent_intakes
		  (id, name, email, phone, postal_address, purposes, channels,
		   consent_accepted, consented_at, source, status)
		VALUES ($1, $2, NULLIF($3, ''), NULLIF($4, ''), NULLIF($5, ''),
		        $6::jsonb, $7::jsonb, $8, $9, NULLIF($10, ''), 'active')
	`, id, intake.Name, intake.Email, intake.Phone, intake.PostalAddress, purposes, channels, intake.ConsentAccepted, now.UTC(), intake.Source)
	if err != nil {
		return Receipt{}, fmt.Errorf("store consent intake: %w", err)
	}
	return Receipt{ID: id, Status: "active", ConsentedAt: now.UTC()}, nil
}

// MemoryStore is a race-safe test double. It must not be used as production
// persistence because process memory is neither durable nor access-controlled.
type MemoryStore struct {
	mu      sync.Mutex
	Records []struct {
		Intake Intake
		Receipt
	}
}

// CreateConsent records an intake in memory for deterministic tests.
func (s *MemoryStore) CreateConsent(_ context.Context, intake Intake, now time.Time) (Receipt, error) {
	if s == nil {
		return Receipt{}, errors.New("memory store is not configured")
	}
	intake, err := normalizeIntake(intake)
	if err != nil {
		return Receipt{}, err
	}
	id, err := newID("test")
	if err != nil {
		return Receipt{}, err
	}
	receipt := Receipt{ID: id, Status: "active", ConsentedAt: now.UTC()}
	s.mu.Lock()
	s.Records = append(s.Records, struct {
		Intake Intake
		Receipt
	}{Intake: intake, Receipt: receipt})
	s.mu.Unlock()
	return receipt, nil
}

func normalizeIntake(intake Intake) (Intake, error) {
	intake.Name = strings.TrimSpace(intake.Name)
	if intake.Name == "" || len(intake.Name) > maxNameLength {
		return Intake{}, fmt.Errorf("name is required and must be %d characters or fewer", maxNameLength)
	}
	if !intake.ConsentAccepted {
		return Intake{}, errors.New("explicit consent is required")
	}
	if len(intake.Purposes) > maxListValues || len(intake.Channels) > maxListValues {
		return Intake{}, errors.New("too many purpose or channel values")
	}
	intake.Email = strings.TrimSpace(intake.Email)
	intake.Phone = strings.TrimSpace(intake.Phone)
	intake.PostalAddress = strings.TrimSpace(intake.PostalAddress)
	intake.Source = strings.TrimSpace(intake.Source)
	if err := validateOptionalFields(intake.Email, intake.Phone, intake.PostalAddress, intake.Source); err != nil {
		return Intake{}, err
	}
	var err error
	if intake.Purposes, err = cleanStrings(intake.Purposes); err != nil {
		return Intake{}, err
	}
	if intake.Channels, err = cleanStrings(intake.Channels); err != nil {
		return Intake{}, err
	}
	return intake, nil
}

func nonNilStrings(values []string) []string {
	if values == nil {
		return []string{}
	}
	return values
}

func newID(prefix string) (string, error) {
	bytes := make([]byte, 12)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return prefix + "_" + hex.EncodeToString(bytes), nil
}
