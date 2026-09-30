---
title: Development
description: Run PleaseVote locally.
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

Before starting the API, configure server-side access to the [Google Maps Platform Geocoding API](https://developers.google.com/maps/documentation/geocoding) and the [Google Civic Information API](https://developers.google.com/civic-information). The frontend does not need provider credentials.

```bash
go run ./server/cmd/pleasevote-api
```

The production shape is one Go process serving `build/client` and `/api`. Nginx supplies TLS and proxying.

Before publishing changes, run the single verification entrypoint:

```bash
pnpm run verify
```

It runs the copy-policy check, TypeScript typechecking, unit tests, the static build, Go tests/vet, and the docs build. Use `pnpm run test:e2e` for the Playwright scenario suite and `pnpm run test:a11y` for axe checks.
