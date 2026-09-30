# PleaseVote product specification

## One-sentence mission

Help every visitor retrieve reliable, understandable voter information for a place and turn it into a practical plan for an election-related visit.

## Non-goals

PleaseVote does not facilitate voting, register voters, accept ballots, determine legal eligibility, recommend candidates, persuade voters, build political profiles, sell lookup data, or send political outreach from lookup activity.

## Primary workflow

1. A visitor lands on a concise explanation of the service.
2. The visitor enters a street address, city, state, and ZIP code. The browser may remember the last address locally on that device, with a clear remove control.
3. The Go service geocodes the address with Google Maps and asks Google Civic for elections and voter information. API keys remain server-side.
4. The service chooses an upcoming live election when usable. If it cannot obtain usable live voter data, it requests Civic's deterministic VIP test election (`2000`) and returns an explicit test-data warning.
5. The service normalizes the response into the versioned API envelope. It preserves election-day locations, early-vote sites, drop-off sites, contests, candidates, referenda, administration records, other elections, provenance, and retrieval metadata.
6. The client composes a voting plan. It calculates distances from the submitted address, defaults to 25 miles, lets the visitor choose 5–50 miles, sorts by distance, shows the nearest ten initially, and provides explicit controls for all results, outside-radius results, and records with missing coordinates.
7. The visitor opens individual location and contest records to disaggregate the details they need. Directions open in an external maps service; the site does not claim an assigned polling location from Civic's `pollingLocations[]` alone.
8. The visitor can review official administration links and use the print/save-as-PDF view. The first page emphasizes location, hours, directions, contacts, and alternatives; contests follow.
9. The visitor may run a separate out-and-about discovery lookup. It is independently geocoded and queried, is compared only at a broad jurisdiction level, and always says that it does not establish eligibility.

## API contract

The Go service exposes:

- `GET /api/v1/elections` — available elections.
- `GET /api/v1/lookup?address=&electionId=` — the primary voting plan source data.
- `GET /api/v1/discovery?address=&electionId=` — an independent alternate-place lookup.
- `GET /api/v1/openapi.json` — machine-readable contract.
- `GET /api/docs` — human-readable API reference in deployments that enable it.

Provider calls are time-bounded, validate upstream JSON, redact secrets from logs, and return safe error codes. An address is never included in a request ID or ordinary log line.

## Acceptance criteria

- Landing page has a visible, labelled address input, election countdown, explanation of purpose, and light/dark/system switcher.
- Address lookup triggers a same-origin API request and renders a normalized election response without provider credentials in the browser.
- Venice, California fixture/live probes with election `2000` retain hundreds of locations, contests, early-vote records, and drop-off records; Columbus sparse data and no-data responses are rendered as explicit states.
- A coordinate of `0,0` is treated as valid, while absent/invalid coordinates are retained in a separate review group.
- Location cards show source status, hours exactly as supplied, distance when calculable, and a directions link.
- Contest disclosures expose all candidates and referenda without silently truncating the response.
- A test-election response has a prominent warning and is never presented as current.
- Keyboard and screen-reader users can complete the primary workflow; axe and Playwright smoke checks pass.
- `pnpm run typecheck`, unit tests with coverage, build, Go tests/vet, and end-to-end scenarios pass.

## Privacy and companion boundary

A separate consent companion may accept independently supplied volunteer/contact information using explicit checkbox consent. It may store name, optional contact fields, purpose/channel preferences, consent timestamp/source/status, revocation, and deletion metadata in a separate schema with a least-privilege role. It must not link to PleaseVote addresses, infer political preference, scrape contacts, export rosters, or send messages in this release.

