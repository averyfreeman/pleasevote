---
title: Testing
description: Scenario, contract, accessibility, and coverage expectations.
---

## Required commands

| Command | What it proves |
| --- | --- |
| `pnpm run copy:check` | Public copy does not expose internal credential-loading details and keeps the provider links present. |
| `pnpm run typecheck` | React Router generated route types and strict TypeScript compile. |
| `pnpm run test:unit -- --run` | Haversine, radius boundaries, missing coordinates, response composition, and API error decoding. |
| `pnpm run test:unit:coverage` | V8 coverage; domain/API logic is required to remain at 100% lines, functions, and statements, with at least 90% branch coverage for defensive JSON-shape handling. |
| `pnpm run test:e2e` | Landing, address lookup, fixture warning, and contest disclosure scenarios in Playwright. |
| `pnpm run test:a11y` | Keyboard smoke and axe checks on the landing workflow. |
| `pnpm run api:test` | Backend provider adapters, validation, fixture selection, normalization, redaction, and HTTP contract behavior using `httptest`, plus OpenAPI checks. |
| `pnpm run api:race` | Backend race-detector coverage. |
| `pnpm run api:vet` | Backend static correctness checks. |
| `pnpm run api:verify` | Backend test, race, and vet sequence. |
| `go test ./...` | All Go services, including the isolated companion. |
| `pnpm run verify` | The repository gate used before a Git-BBQ commit. |

Browser scenarios use deterministic route fixtures. Live checks are separate; an outage must not make correctness tests flaky.

## Critical cases

- A `0,0` coordinate is valid.
- A missing coordinate is visible, not silently filtered.
- A live election with an empty voter response uses the local election `2000` fixture only in `--debug` mode; fixture data has a prominent warning and is not address-specific.
- A non-success Civic status does not discard useful locations, contests, or administration records.
- `mailOnly` does not suppress election-day or ballot drop-off records.
- A no-data address has a useful error and official `vote.gov` path.
- Sparse candidates, referenda, source labels, and hours render without invented values.
- No browser bundle contains provider credentials.
