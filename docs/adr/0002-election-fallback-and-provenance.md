# ADR 0002: Prefer live elections and make test fixtures explicitly opt-in

- Status: accepted
- Date: 2026-09-29

## Context

Civic can return an upcoming election with no usable voter data, while election `2000` is a stable VIP test dataset. Civic's documented 2000 endpoint can return 404 for arbitrary addresses, so a normal live lookup must not depend on that test endpoint. A blank page is not useful for development, but showing old data as current would be dangerous.

## Decision

The backend lists elections and selects a usable upcoming live election first. Normal mode uses the live Civic provider only; if no usable live records exist it returns a redacted no-data response instead of silently substituting election `2000`. The single `--debug` flag enables detailed terminal diagnostics and the embedded election `2000` fixture. In debug mode, an explicit `electionId=2000` or a missing usable live result uses the fixture for any submitted address. The normalized response includes `mode: "test-fixture"`, `dataSource: "test-fixture"`, retrieval metadata, and a prominent warning that the records are sample data unrelated to the submitted address.

## Consequences

Developers can run `pnpm run api:debug` and verify large and sparse payloads without relying on a Civic 2000 address allowlist or waiting for live election data. Production monitoring must make fixture usage visible, and UI tests must assert the warning rather than merely checking that a page rendered. The normal `pnpm run api` command never reads the local fixture.
