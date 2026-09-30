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
| `pnpm run test:e2e` | Landing, address lookup, fallback warning, and contest disclosure scenarios in Playwright. |
| `pnpm run test:a11y` | Keyboard smoke and axe checks on the landing workflow. |
| `go test ./...` | Provider adapters, validation, fallback, normalization, redaction, and HTTP contract behavior using `httptest`. |
| `go vet ./...` | Go static correctness checks. |
| `pnpm run verify` | The repository gate used before a Git-BBQ commit. |

Browser scenarios use deterministic route fixtures. Live checks are separate; an outage must not make correctness tests flaky.

## Critical cases

- A `0,0` coordinate is valid.
- A missing coordinate is visible, not silently filtered.
- A live election with an empty voter response can trigger election `2000`, but test data has a warning.
- A no-data address has a useful error and official fallback path.
- Sparse candidates, referenda, source labels, and hours render without invented values.
- No browser bundle contains provider credentials.
