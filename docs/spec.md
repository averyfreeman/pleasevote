# PleaseVote product specification

## One-sentence mission

Help people find reliable, understandable election information for a place and use it with confidence.

## Non-goals

PleaseVote does not facilitate voting, register voters, accept ballots, determine legal eligibility, recommend candidates, persuade voters, build political profiles, sell lookup data, or send political outreach from lookup activity.

## Primary workflow

1. A visitor lands on a short explanation of the service.
2. They enter a street address, city, state, and ZIP code. The browser may remember the last address on that device, with a clear remove control.
3. Go geocodes the address with Google Maps and asks Civic for election information. Credentials stay on the server.
4. The service chooses a usable upcoming election. If live voter data is unavailable, it requests Civic’s deterministic VIP test election (`2000`) and shows a clear test-data warning.
5. The service returns election-day locations, early voting, drop-off sites, contests, candidates, questions, election-office links, other elections, source labels, and retrieval details.
6. The client shows the results near the submitted address, using a 25-mile default and a 5–50 mile display range. It starts with the nearest ten and keeps distant or coordinate-free records available.
7. Visitors can open a place or contest for more detail. Directions open in an external maps service; Civic’s `pollingLocations[]` data is not treated as an assigned polling place.
8. Official links and a print/save-as-PDF view make the information easier to take along.
9. A separate lookup can check another place. It does not establish eligibility there.

## API contract

The Go service exposes:

- `GET /api/v1/elections` — available elections.
- `GET /api/v1/lookup?address=&electionId=` — the primary voting plan source data.
- `GET /api/v1/discovery?address=&electionId=` — an independent alternate-place lookup.
- `GET /api/v1/openapi.json` — machine-readable contract.
- `GET /api/docs` — human-readable API reference in deployments that enable it.

Provider calls are time-bounded, validate upstream JSON, keep credentials out of logs, and return safe error codes. An address is never included in a request ID or ordinary log line.

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
