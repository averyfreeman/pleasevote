# Environment changes

## 2026-09-29 — provider-boundary rebuild

- Standardized the frontend workspace on Node 24 LTS and pnpm 12.6.0.
- Removed Bun lock/tooling, npm's docs lockfile, the Vercel React Router preset, and the obsolete Vercel runtime configuration.
- Updated React Router, React, Vite, Tailwind, DaisyUI, Playwright, Vitest, TypeDoc, and type packages through the new pnpm lockfile.
- Kept React Router v7 + Vite in SPA mode; route data now uses `clientLoader` because server `loader` exports are invalid in SPA builds.
- Added a native Go provider service for server-only Google Civic and Maps credentials, OpenAPI, live/test election selection, geocoding, validation, errors, redacted logs, and static frontend serving.
- Added the separate consent companion service and Postgres schema with no lookup-address linkage, exports, messaging, or political inference.
- Added Vitest/Playwright/axe coverage, Go unit/httptest/race/vet checks, and generated TypeDoc/ purple Astro Starlight documentation.

## Credential handling

`get-keys.sh` is a local ignored helper supplied by the operator. It reads keys from outside the repository and exports `GOOGLE_CIVIC_API_KEY` and `GMAPS_API_KEY` for the Go service. No key is stored in the repository, browser bundle, fixture, test output, or logs.
