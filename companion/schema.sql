-- Apply with a least-privilege role dedicated to the companion service.
-- This schema deliberately contains no PleaseVote lookup address, election,
-- contest, candidate, or inferred-preference column.
CREATE SCHEMA IF NOT EXISTS companion;

CREATE TABLE IF NOT EXISTS companion.consent_intakes (
  id text PRIMARY KEY,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  email text,
  phone text,
  postal_address text,
  purposes jsonb NOT NULL DEFAULT '[]'::jsonb,
  channels jsonb NOT NULL DEFAULT '[]'::jsonb,
  consent_accepted boolean NOT NULL CHECK (consent_accepted = true),
  consented_at timestamptz NOT NULL,
  source text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'deleted')),
  revoked_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS consent_intakes_status_idx
  ON companion.consent_intakes (status);

-- Example deployment role (replace names before applying):
-- REVOKE ALL ON SCHEMA companion FROM PUBLIC;
-- GRANT USAGE ON SCHEMA companion TO pleasevote_companion;
-- GRANT INSERT, SELECT, UPDATE ON companion.consent_intakes TO pleasevote_companion;
