---
title: API and data model
description: The normalized TypeScript contracts that keep provider details usable and honest.
---

The browser receives a stable response from Go instead of a raw Google payload. The TypeScript interfaces in `app/lib/types.ts` are explicit and readonly.

## Top-level `LookupResponse`

| Field | Meaning |
| --- | --- |
| `address` | The submitted query, retained for the current response only. |
| `normalizedAddress` | The geocoder/provider's accepted address; not proof of residency or eligibility. |
| `origin` | Server-geocoded coordinates used for distance calculations. |
| `election` | Election id, name, date, and Civic division. |
| `mode` | `live` or `test-fallback`. |
| `warning` | Required visitor-facing explanation when test data or uncertainty applies. |
| `pollingLocations` | Civic `pollingLocations[]`, presented as election-day locations rather than assignments. |
| `earlyVoteSites` | Civic `earlyVoteSites[]` with the provider's hours text. |
| `dropOffLocations` | Civic `dropOffLocations[]`. |
| `contests` | Candidate contests, referenda, and ballot questions. |
| `administration` | State/local election office identity, links, and correspondence information. |
| `otherElections` | Other election choices returned for the address. |
| `sources` | Preserved provider attribution. |
| `retrieval` | Endpoint, fallback flag, request election, and safe retrieval timestamp. |

## Location semantics

`VotingLocation.point` is optional. When present, `app/lib/domain.ts` calculates a Haversine distance from `origin`, sorts by distance, and places the record inside or outside the selected radius. When absent or invalid, the record goes into a visible “without coordinates” group. Coordinates of `0,0` are valid.

## TSDoc

The source code is the authoritative detailed reference. Run `pnpm run docs:typecheck` to generate Markdown TypeDoc output for the public TypeScript domain and API modules.
