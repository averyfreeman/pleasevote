---
title: Deployment
description: Deploy the provider service, static UI, and isolated consent companion.
---

## Provider service

The root image is a multi-stage build: Node 24 and pnpm compile the static
React Router client, then Go 1.24 compiles the native API. The final image is a
non-root distroless runtime and contains no provider credential or build-time
secret.

```sh
docker build --file Dockerfile --tag pleasevote:local .
docker run --rm --read-only --tmpfs /tmp:rw,noexec,nosuid \
  --env-file /run/secrets/pleasevote-provider.env \
  --publish 127.0.0.1:8080:8080 pleasevote:local
```

Supply the Google Maps Platform geocoding and Google Civic Information
credentials at runtime through the host secret manager. Never pass them as
Docker build arguments, bake them into an image, or expose them to the browser.
The image listens on `:8080` and serves the compiled client from
`/app/build/client` by default.

Runtime configuration keeps the normal image live-provider-only. Set
`PLEASEVOTE_ADDR`, `PLEASEVOTE_STATIC_DIR`,
`PLEASEVOTE_CIVIC_BASE_URL`, or `PLEASEVOTE_GEOCODING_BASE_URL` when the
deployment needs a different bind address, static directory, or provider
endpoint. The API command also accepts `--log-level=DEBUG|INFO|WARN|ERROR|FAILURE|OFF|DISABLED`.
Use `pnpm run api:debug` only for local diagnostics; it enables the embedded
Civic 2000 sample fixture and labels every returned record as non-current,
non-address-specific test data.

## Consent companion

The companion is a different image, process, network policy, and PostgreSQL
schema. It must not share the provider service's database role or receive
lookup addresses. Apply [`companion/schema.sql`](https://github.com/averyfreeman/pleasevote/blob/main/companion/schema.sql)
with a migration role, then grant the runtime role only the minimum insert
access described in that file.

```sh
docker build --file companion/Dockerfile --tag pleasevote-companion:local .
docker run --rm --read-only --tmpfs /tmp:rw,noexec,nosuid \
  --env-file /run/secrets/pleasevote-companion.env \
  --publish 127.0.0.1:8081:8081 pleasevote-companion:local
```

The companion exposes only `GET /healthz` and `POST /v1/consents`; keep it
behind TLS, an intake-specific rate limit, and the private network boundary.
Do not publish its port to the public internet without an explicit reverse
proxy policy. The companion's machine-readable contract is
[`companion/openapi.yaml`](https://github.com/averyfreeman/pleasevote/blob/main/companion/openapi.yaml).

## Local container stack

`compose.yaml` runs the provider service, companion, and a dedicated Postgres
container. Set `COMPANION_DB_PASSWORD` plus the two provider credentials in the
shell or secret environment before starting it; the companion has no host port
mapping by default.

```sh
COMPANION_DB_PASSWORD='use-a-local-secret' docker compose up --build
```

The compose file is a development shape, not a production secret manager.
Use managed Postgres, encrypted backups, migration review, and a separate
database role in production.

## Release gate

Run the same gate used by CI before deployment:

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium webkit
bash scripts/verify.sh
docker build --file Dockerfile --tag pleasevote:verify .
docker build --file companion/Dockerfile --tag pleasevote-companion:verify .
```

The GitHub Actions verification workflow runs the Node 24/pnpm 12, Go race and
vet, unit, browser, accessibility, OpenAPI, documentation, and image-build
checks. A live provider probe remains a separately gated operational check.

The service is intentionally small enough to run on a VPS. Rust/WASM is a
future implementation option behind the OpenAPI contract, not a prerequisite
for correctness.
