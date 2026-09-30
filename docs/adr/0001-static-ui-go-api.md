# ADR 0001: Static TypeScript UI with a native Go API service

- Status: accepted
- Date: 2026-09-29

## Context

The previous rebuild moved provider calls into browser-visible React code and used a hard-coded Columbus origin for distance calculations. It also depended on Bun and a Vercel preset even though the intended deployment is a reproducible VPS behind nginx. API credentials must never reach the browser, and the application needs a stable seam for future Rust/WASM exploration without making that exploration part of the correctness-critical release.

## Decision

Keep React Router v7 in SPA mode with Vite, Tailwind, DaisyUI, and strict TypeScript. Run a small native Go `net/http` service that serves the built static assets and owns `/api/v1`. The Go service handles Maps geocoding, Civic adapters, validation, timeouts, test-election fallback, and redacted errors. TypeScript owns the visitor view model, radius filtering, aggregation, accessible rendering, and print view.

The OpenAPI contract is the compatibility boundary. A future Rust or WASM implementation may replace a provider/domain module only after it passes the same contract and scenario suites.

## Consequences

- Provider keys are server-only and deployment remains simple.
- The browser is cacheable and can be hosted by the same Go process.
- Two language toolchains add a contract/testing burden, paid down by OpenAPI, fixtures, and explicit ownership.
- Server-side Go is chosen for operational simplicity; WASM is deferred until profiling or deployment evidence justifies it.

