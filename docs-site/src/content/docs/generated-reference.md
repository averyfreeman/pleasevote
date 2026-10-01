---
title: Generated references
description: Generated TypeScript contracts and the OpenAPI source boundary.
---

The source code and OpenAPI contract are authoritative. These references are generated or maintained from those sources during the verification build, so they are useful for browsing but should not be edited directly.

## TypeDoc

The TypeDoc Markdown output covers the browser-facing API client, voter-plan domain projection, and readonly response contracts:

- [TypeDoc index](../typedoc/index.md)
- [API client reference](../typedoc/api/index.md)
- [Domain projection reference](../typedoc/domain/index.md)
- [Response types reference](../typedoc/types/index.md)

Generate the output with `pnpm run docs:typecheck`. The root `pnpm run docs:build` command generates it before building this site.

## OpenAPI

The provider boundary is maintained in [`contracts/openapi.yaml`](https://github.com/averyfreeman/pleasevote/blob/main/contracts/openapi.yaml). The Go service also exposes the same public contract at `GET /api/v1/openapi.json` and human-readable endpoint information at `GET /api/docs`.

Provider credentials never belong in the browser bundle or in these references.

## Consent companion

The isolated intake service has its own OpenAPI boundary in
[`companion/openapi.yaml`](https://github.com/averyfreeman/pleasevote/blob/main/companion/openapi.yaml).
It exposes only health and consent-intake operations; its receipt does not echo
the submitted contact fields or connect them to a voter lookup.
