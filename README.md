# PLEASE VOTE™

PleaseVote helps people find election information for an address: dates, places to vote, early voting, ballot drop-off, contests, candidates, hours, directions, and official election-office links.

It is an information service, not a voting service. It does not register voters, decide legal eligibility, endorse candidates, accept ballots, or build political profiles. Civic location records are shown as possible election-day locations—not as a guaranteed assigned place.

## Features

- Address-based lookup through Google Maps Platform and Google Civic Information.
- Live election data first, with Civic test election `2000` clearly marked when live voter data is unavailable.
- A 25-mile default radius, adjustable from 5 to 50 miles, measured from the submitted address.
- Election-day locations, early voting, drop-off locations, hours, distances, directions, and source labels.
- Contests, candidates, referenda, election-office links, and a print/save-as-PDF view.
- A separate lookup for another place, with a clear eligibility warning.
- Light, dark, and system themes; keyboard support; screen-reader labels; reduced-motion support; and axe checks.
- An optional consent companion kept separate from lookup data.

## Architecture

```mermaid
flowchart LR
    A[Visitor] --> B[React Router SPA]
    B -->|same-origin OpenAPI request| C[Native Go service]
    C --> D[Google Maps geocoding]
    C --> E[Google Civic API]
    C --> F[Stable voter-information envelope]
    F --> G[TypeScript radius and aggregation]
    G --> H[Accessible plan and print view]
```

The frontend is React Router v7 in Vite SPA mode, built with Node 24 and pnpm. Go handles provider calls, validation, timeouts, fallback, and static-file serving. The OpenAPI contract keeps both sides independently testable and leaves room for a future Rust/WASM implementation without making WASM a requirement.

## Requirements

- Node 24 LTS
- pnpm 12
- Go 1.24 or newer (the service uses standard `net/http`)
- A server-side credential for the [Google Maps Platform Geocoding API](https://developers.google.com/maps/documentation/geocoding)
- A server-side credential for the [Google Civic Information API](https://developers.google.com/civic-information)

The frontend does not need either credential. Keep both on the server and out of browser code, fixtures, logs, and commits.

## Local development

Install the workspace:

```bash
pnpm install
```

Before starting the API, configure server-side access to the [Google Maps Platform Geocoding API](https://developers.google.com/maps/documentation/geocoding) and the [Google Civic Information API](https://developers.google.com/civic-information). The frontend can run without provider credentials.

Start the frontend and Go service in separate terminals:

```bash
pnpm run dev
go run ./server/cmd/pleasevote-api
```

Only the Go service calls Google. In production it serves `build/client` and `/api` behind nginx/TLS.

## Verification

```bash
pnpm run verify
```

The verification entrypoint runs the copy-policy check, TypeScript typechecking, unit tests, the static build, Go tests/vet, and the docs build. Individual commands:

```bash
pnpm run test:unit:coverage
pnpm run test:e2e
pnpm run test:a11y
pnpm run copy:check
pnpm run docs:typecheck
pnpm run docs:build
go test ./...
go vet ./...
```

Browser scenarios use deterministic fixtures. The VIP `2000` dataset is the stable test path when current elections are empty or unavailable.

## Documentation

The purple GitHub Pages documentation covers the product specification, domain vocabulary, architecture decisions, API nodes, endpoint behavior, tests, accessibility, privacy, deployment, and generated TypeDoc. The documentation unicorn drops rainbow confetti when the test suite passes.

- Product specification: [`docs/spec.md`](docs/spec.md)
- Domain context: [`CONTEXT.md`](CONTEXT.md)
- Architecture decisions: [`docs/adr/`](docs/adr/)
- Documentation site: [`docs-site/`](docs-site/)

Built to make election information easier to use.
