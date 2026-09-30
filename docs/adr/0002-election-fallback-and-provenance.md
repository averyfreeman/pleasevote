# ADR 0002: Prefer live elections and label deterministic test fallback

- Status: accepted
- Date: 2026-09-29

## Context

Civic can return an upcoming election with no usable voter data, while election `2000` is a stable VIP test dataset. A blank page is not useful for development, but showing old data as current would be dangerous.

## Decision

The backend lists elections, selects a usable upcoming live election first, and treats a response with no usable voter records as a fallback condition. It then requests election `2000` when configured. The normalized response includes `mode: "test-fallback"`, retrieval metadata, and a prominent visitor-facing warning. The client preserves the records for deterministic testing but never calls them current election information.

## Consequences

Developers can verify large and sparse payloads without waiting for live election data. Production monitoring must make fallback usage visible, and UI tests must assert the warning rather than merely checking that a page rendered.

