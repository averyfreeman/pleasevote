# Environment changes

## 2026-10-01 — Civic debugging and provider preservation

- Added `pnpm run api`, `api:debug`, `api:test`, `api:race`, `api:vet`, and `api:verify` as the memorable backend workflow.
- Added the `--debug` and `--log-level` API flags; debug mode embeds Civic election 2000 sample data and defaults to `DEBUG` logs.
- Added `PLEASEVOTE_CIVIC_BASE_URL`, `CIVIC_BASE_URL`, `PLEASEVOTE_GEOCODING_BASE_URL`, and `GEOCODING_BASE_URL` for provider stubs/deployment while retaining the existing address and static-directory variables.
- No credential values or raw addresses were added to source, fixtures, logs, screenshots, or documentation.

## 2026-09-30 — companion deployment and release packaging

- Hardened the intake-only companion's JSON boundary, response headers, validation, and graceful shutdown.
- Added the companion OpenAPI contract, PostgreSQL constraint documentation, non-root container images, and a local separated compose stack.
- Added CI for the Node 24/pnpm 12 and Go verification gate plus provider/companion image builds.
- Extended the verification entrypoint to require the companion and packaging artifacts and to build the documentation site.

## 2026-09-30 — accessible visual and reference build

- Made `pnpm run docs:build` regenerate TypeDoc before building the Astro/Starlight site.
- Added generated-reference navigation for TypeDoc and the OpenAPI boundary.
- No runtime credentials, provider behavior, or deployment settings changed.

## 2026-09-30 — toolchain verification

- Pinned pnpm 12.6.0 and Go 1.24.0 in `mise.toml` alongside Node 24.21.0.
- The verification entrypoint now rejects unsupported Node or pnpm majors and runs Go tests with the race detector.

## 2026-09-30 — copy and credential documentation pass

- Added `pnpm run copy:check` to keep public documentation free of internal credential-loading details.
- Added official Google Maps Platform and Google Civic Information links to the setup documentation.
- No API contract, provider behavior, or runtime configuration changed.

## 2026-09-29 — provider-boundary rebuild

- Standardized the frontend workspace on Node 24 LTS and pnpm 12.6.0.
- Removed Bun lock/tooling, npm's docs lockfile, the Vercel React Router preset, and the obsolete Vercel runtime configuration.
- Updated React Router, React, Vite, Tailwind, DaisyUI, Playwright, Vitest, TypeDoc, and type packages through the new pnpm lockfile.
- Kept React Router v7 + Vite in SPA mode; route data now uses `clientLoader` because server `loader` exports are invalid in SPA builds.
- Added a native Go provider service for server-only Google Civic and Maps credentials, OpenAPI, live/test election selection, geocoding, validation, errors, redacted logs, and static frontend serving.
- Added the separate consent companion service and Postgres schema with no lookup-address linkage, exports, messaging, or political inference.
- Added Vitest/Playwright/axe coverage, Go unit/httptest/race/vet checks, generated TypeDoc, and purple Astro Starlight documentation.

## Credential handling

Normal live-provider mode requires two server-side credentials: one for the [Google Maps Platform Geocoding API](https://developers.google.com/maps/documentation/geocoding) and one for the [Google Civic Information API](https://developers.google.com/civic-information). Debug fixture mode can omit the Civic credential, but still needs geocoding for the submitted address. Neither credential belongs in the browser bundle, fixtures, test output, logs, or repository.
