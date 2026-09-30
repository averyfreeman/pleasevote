# Environment changes

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

The Go service requires two server-side credentials: one for the [Google Maps Platform Geocoding API](https://developers.google.com/maps/documentation/geocoding) and one for the [Google Civic Information API](https://developers.google.com/civic-information). Neither belongs in the browser bundle, fixtures, test output, logs, or repository.
