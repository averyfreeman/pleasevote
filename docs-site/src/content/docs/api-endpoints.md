---
title: Endpoint reference
description: What each API endpoint and Civic response node means.
---

## Browser-facing endpoints

### `GET /api/v1/elections`

No address is required. Returns the elections visible to the configured Civic key. Each election has `id`, `name`, `electionDay`, and optional `ocdDivisionId`. The homepage uses this for the countdown but can render a safe fallback if the service is unavailable.

### `GET /api/v1/lookup`

Required query parameter: `address`. Optional query parameter: `electionId`.

The endpoint geocodes the address, calls Civic `voterinfo`, and normalizes these provider nodes:

- `election`: selected election identity and election day.
- `normalizedInput`: returned as `normalizedAddress`.
- `pollingLocations`: election-day locations where the provider says voting may be available. This is not an assigned-location determination.
- `earlyVoteSites`: early voting locations and `pollingHours` text.
- `dropOffLocations`: ballot drop-off locations and `pollingHours` text.
- `contests`: every candidate contest and ballot question. `office`, `district`, `candidates`, `referendumTitle`, `referendumSubtitle`, and `referendumUrl` remain sparse/optional.
- `state[].electionAdministrationBody`: administration name, registration, location finder, ballot, rules, and information URLs.
- `state[].local_jurisdiction`: local jurisdiction name and source attribution.
- `otherElections`: alternatives returned by Civic, if any.
- `sources`: official/non-official provider labels.

Provider fields are not silently discarded because they are inconvenient. Missing fields appear as unknown, and the UI explains what needs confirmation.

### `GET /api/v1/discovery`

Required query parameter: `address`. Optional `electionId`. This independently geocodes and queries another place. The response includes a broad jurisdiction comparison where possible and always includes a warning: discovery does not establish voter eligibility at that place.

### `GET /api/v1/openapi.json` and `GET /api/docs`

The former is machine-readable and the latter is human-readable. The OpenAPI file is the compatibility contract for the Go service, TypeScript UI, tests, and future Rust/WASM experiments.

## Error codes

Errors use `{ ok: false, error: { code, message, field?, requestId? } }`. Codes distinguish invalid input, geocoding failure, provider no-data, provider failure, and internal failure. Messages are safe for visitors. API keys, raw provider payloads, and submitted addresses never appear in request IDs or ordinary logs.
