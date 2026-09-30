# PleaseVote consent companion

This is a separate, intake-only Go service for people who voluntarily offer contact details for a stated purpose. It is deliberately not a CRM, roster exporter, messaging service, or lookup analytics service.

The service accepts name, optional contact fields, purpose/channel preferences, explicit checkbox consent, source, and consent timing. It rejects unknown fields, including lookup addresses, so the service cannot accidentally accept a linked PleaseVote lookup record.

Production persistence is PostgreSQL in the separate `companion` schema using a least-privilege role. Apply [`schema.sql`](schema.sql) after reviewing role grants. Keep the service on the private network; Tailscale/ZeroTier is for administrator access, not runtime connectivity.

```bash
PLEASEVOTE_COMPANION_DATABASE_URL='postgres://...' go run ./companion/cmd/pleasevote-companion
```

There are no list, export, search, messaging, RAG, or address-linkage endpoints in this release.
