---
title: Endpoint reference
description: What each endpoint and Civic response field means.
---

## Browser-facing endpoints

The Go service keeps provider credentials on the server. It turns the upstream Google responses into a smaller, stable response for the browser. See the [Google Maps Platform Geocoding API](https://developers.google.com/maps/documentation/geocoding) and [Google Civic Information API](https://developers.google.com/civic-information) documentation for the upstream services.

### `GET /api/v1/elections`

No address is required. Returns the elections available through the server-side Civic connection. Each election has `id`, `name`, `electionDay`, and optional `ocdDivisionId`. The homepage uses this for the countdown and can fall back safely if the service is unavailable.

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

When Civic returns useful fields with a non-success status, the response keeps
those records and exposes the safe `providerStatus` in `retrieval`. The
`mailOnly` flag is informational; it never hides election-day, early-vote, or
ballot drop-off records. Location `voterServices` text is preserved for the
visitor.

### `GET /api/v1/divisions`

Optional query parameter: `query`. This proxies Civic's official division
search shape with `results`, `ocdId`, `name`, and any returned `aliases`.

### `GET /api/v1/divisionsByAddress`

Required query parameter: `address`. This preserves Civic's official map-shaped
`divisions` response and `normalizedInput` address, including any
`alsoKnownAs` identifiers supplied for each map entry.

Useful upstream fields are kept. Missing fields stay unknown, and the UI tells visitors what needs confirmation.

### `GET /api/v1/discovery`

Required query parameter: `address`. Optional query parameter: `electionId`. This looks up another place independently. The response includes a broad jurisdiction comparison where possible and always includes a warning: it does not establish voter eligibility there.

### `GET /api/v1/openapi.json` and `GET /api/docs`

The former is machine-readable and the latter is human-readable. The OpenAPI file is the compatibility contract for the Go service, TypeScript UI, tests, and future Rust/WASM experiments. `mode: "test-fixture"` is emitted only by the explicit debug fixture path.

## Error codes

Errors use `{ ok: false, error: { code, message, field?, requestId? } }`. Codes distinguish invalid input, geocoding failure, provider no-data, provider failure, and internal failure. Messages are safe for visitors. Provider credentials, raw payloads, and submitted addresses never appear in request IDs or ordinary logs.
