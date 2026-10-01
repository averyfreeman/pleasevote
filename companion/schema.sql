-- Apply with a least-privilege role dedicated to the companion service.
-- This schema deliberately contains no PleaseVote lookup address, election,
-- contest, candidate, or inferred-preference column.
CREATE SCHEMA IF NOT EXISTS companion;

CREATE TABLE IF NOT EXISTS companion.consent_intakes (
  id text PRIMARY KEY,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  email text CHECK (email IS NULL OR char_length(email) <= 254),
  phone text CHECK (phone IS NULL OR char_length(phone) <= 64),
  postal_address text CHECK (postal_address IS NULL OR char_length(postal_address) <= 500),
  purposes jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(purposes) = 'array'),
  channels jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(channels) = 'array'),
  consent_accepted boolean NOT NULL CHECK (consent_accepted = true),
  consented_at timestamptz NOT NULL,
  source text CHECK (source IS NULL OR char_length(source) <= 100),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'deleted')),
  revoked_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS consent_intakes_status_idx
  ON companion.consent_intakes (status);

-- Example deployment role (replace names before applying):
-- REVOKE ALL ON SCHEMA companion FROM PUBLIC;
-- REVOKE ALL ON TABLE companion.consent_intakes FROM PUBLIC;
-- GRANT USAGE ON SCHEMA companion TO pleasevote_companion;
-- GRANT INSERT ON companion.consent_intakes TO pleasevote_companion;
-- A separate operator role should handle revocation/deletion workflows.
