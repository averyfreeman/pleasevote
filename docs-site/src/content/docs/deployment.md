---
title: Deployment
description: The reproducible VPS shape for the Go service and static UI.
---

1. Build the frontend with Node 24 and pnpm: `pnpm install --frozen-lockfile && pnpm run build`.
2. Build the Go binary with `go build -o pleasevote ./server/cmd/pleasevote-api`.
3. Load provider credentials from an external secret runner such as `./get-keys.sh`; do not copy them into the repo or image.
4. Configure the Go service to serve `build/client`, listen on a private/local interface, and expose `/api/v1`.
5. Put nginx in front for TLS, compression, security headers, and SPA fallback to `index.html`.
6. Run `pnpm run verify`, `go test ./...`, and a gated live probe before release.

The service is intentionally small enough to run on a VPS. Rust/WASM is a future implementation option behind the OpenAPI contract, not a prerequisite for correctness.
