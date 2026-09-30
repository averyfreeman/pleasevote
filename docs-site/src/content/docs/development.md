---
title: Development
description: Run the PLEASE VOTE™ application locally.
---

Install dependencies with Node 24 and pnpm:

```bash
corepack enable
pnpm install
```

Run the frontend during development:

```bash
pnpm run dev
```

Run the Go API service separately with keys loaded by the ignored `get-keys.sh` helper when available. Keys must remain in the environment and never in TypeScript, fixtures, logs, or Git.

```bash
source ./get-keys.sh
go run ./server
```

The production shape is one Go process serving `build/client` and `/api`. Nginx supplies TLS and proxying.

Before publishing changes, run the single verification entrypoint:

```bash
pnpm run verify
```

It runs TypeScript typechecking, unit tests, the static build, Go tests/vet, and the docs build when those workspaces are present. Use `pnpm run test:e2e` for the Playwright scenario suite and `pnpm run test:a11y` for axe checks.
