---
title: Privacy and consent
description: Data boundaries for lookup and the optional companion intake.
---

## PleaseVote lookup

The browser stores only the last submitted address in localStorage after submission. Civic responses are not stored in localStorage, a server database, analytics events, or logs. Provider credentials stay on the server. Request IDs and metrics must not reconstruct an address.

Lookup activity must not become a political roster, targeted mailing list, inferred preference signal, or outreach trigger. PleaseVote is neutral information infrastructure.

## Optional companion

The companion accepts independently supplied contact details and purpose/channel preferences only after explicit checkbox consent. It records consent, source, status, revocation, and deletion metadata. It does not link records to PleaseVote addresses, infer political preference, scrape contacts, expose exports, send messages, or feed RAG tables.

Deployment uses a separate service and Postgres schema with a least-privilege role inside the existing private Oracle network. That compromise requires role audits and migration review. Tailscale/ZeroTier is for administrators, never a runtime dependency.
