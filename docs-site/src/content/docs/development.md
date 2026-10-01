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
pnpm run api
```

To exercise the deterministic Civic election `2000` sample with any address,
run the single debug command:

```bash
pnpm run api:debug
```

Debug mode enables the local fixture and `DEBUG` terminal logs together. The
browser labels fixture records as sample data unrelated to the submitted
address. Override verbosity with
`--log-level=DEBUG|INFO|WARN|ERROR|FAILURE|OFF|DISABLED`; there are no separate
provider/fixture/auto modes. `PLEASEVOTE_CIVIC_BASE_URL` and
`PLEASEVOTE_GEOCODING_BASE_URL` are available for local provider stubs.

The production shape is one Go process serving `build/client` and `/api`. Nginx supplies TLS and proxying.

Before publishing changes, run the single verification entrypoint:

```bash
pnpm run verify
```

It runs the copy-policy check, TypeScript typechecking, unit tests, the static build, Go tests/vet, and the docs build. Use `pnpm run test:e2e` for the Playwright scenario suite and `pnpm run test:a11y` for axe checks.

Backend-only checks are also available as memorable pnpm commands:

```bash
pnpm run api:test
pnpm run api:race
pnpm run api:vet
pnpm run api:verify
```
