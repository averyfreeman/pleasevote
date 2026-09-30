---
title: Deployment
description: Deploy the Go service and static UI on a VPS.
---

1. Build the frontend with Node 24 and pnpm: `pnpm install --frozen-lockfile && pnpm run build`.
2. Build the Go binary with `go build -o pleasevote ./server/cmd/pleasevote-api`.
3. Configure server-side credentials for the [Google Maps Platform Geocoding API](https://developers.google.com/maps/documentation/geocoding) and the [Google Civic Information API](https://developers.google.com/civic-information). Do not put them in the frontend bundle, repository, or image.
4. Configure the Go service to serve `build/client`, listen on a private/local interface, and expose `/api/v1`.
5. Put nginx in front for TLS, compression, security headers, and SPA fallback to `index.html`.
6. Run `pnpm run verify`, `go test ./...`, and a gated live probe before release.

The service is intentionally small enough to run on a VPS. Rust/WASM is a future implementation option behind the OpenAPI contract, not a prerequisite for correctness.
