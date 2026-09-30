# PleaseVote rebuild

## Goal

Rebuild PleaseVote as a neutral, accessible voter-information portal with a
TypeScript React Router frontend, a native Go provider API, deterministic Civic
fixture coverage, and an isolated consent-intake companion.

## Acceptance criteria

- The frontend retrieves and presents live or explicitly labelled VIP test data
  through the stable OpenAPI contract.
- Radius, geocoding, election fallback, contest, location, discovery, print,
  theme, privacy, and accessibility behavior are covered by automated tests.
- The application never exposes provider credentials or treats a Civic result
  as an assigned polling place without an API-supported assignment signal.
- Node 24 and pnpm are the documented frontend toolchain; Go is the production
  server runtime; the repository is ready to publish from `main`.

## Verification

```sh
bash scripts/verify.sh
```
