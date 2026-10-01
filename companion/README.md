# PleaseVote consent companion

This is a separate, intake-only Go service for people who voluntarily offer contact details for a stated purpose. It is deliberately not a CRM, roster exporter, messaging service, or lookup analytics service.

The service accepts name, optional contact fields, purpose/channel preferences, explicit checkbox consent, source, and server-assigned consent timing. It rejects unknown fields, including lookup addresses, so the service cannot accidentally accept a linked PleaseVote lookup record. The response is a receipt only; submitted contact values are never echoed.

Production persistence is PostgreSQL in the separate `companion` schema using a least-privilege role. Apply [`schema.sql`](schema.sql) after reviewing role grants. Keep the service on the private network; Tailscale/ZeroTier is for administrator access, not runtime connectivity.

```bash
export PLEASEVOTE_COMPANION_DATABASE_URL='postgres://...'
go run ./companion/cmd/pleasevote-companion
```

The machine-readable boundary is [`openapi.yaml`](openapi.yaml). There are no list, export, search, messaging, RAG, or address-linkage endpoints in this release. `GET /healthz` is a process check; `POST /v1/consents` is the only write route.

## Container

Build the companion image from the repository root. It is a separate non-root
distroless image and does not contain the frontend or provider service:

```bash
docker build --file companion/Dockerfile --tag pleasevote-companion:local .
docker run --rm --read-only --tmpfs /tmp:rw,noexec,nosuid \
  --env-file /run/secrets/pleasevote-companion.env \
  --publish 127.0.0.1:8081:8081 pleasevote-companion:local
```

The runtime role should be able to insert into `companion.consent_intakes` but
should not be used for migrations or operator revocation/deletion workflows.
