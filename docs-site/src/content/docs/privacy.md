---
title: Privacy and consent
description: Data boundaries for lookup and the optional companion intake.
---

## PleaseVote lookup

The browser stores only the last submitted address in localStorage when the visitor chooses to submit it. Civic responses are not stored in localStorage, server databases, analytics events, or logs. Provider keys stay server-side. The service should use request IDs and metrics that cannot reconstruct an address.

Lookup activity must not become a political roster, targeted direct-mail list, inferred preference signal, or outreach trigger. The product is neutral information infrastructure.

## Optional companion

The companion accepts independently supplied name/contact details and purpose/channel preferences only after an explicit checkbox consent. It records consent timestamp, source, status, revocation, and deletion metadata. It does not link records to PleaseVote addresses, infer political preference, scrape contacts, expose exports, send messages, or feed RAG tables.

Deployment uses a separate service and Postgres schema with a least-privilege role inside the existing private Oracle network. That is an accepted operational compromise and requires role audits and migration review. Tailscale/ZeroTier is for administrators, never a runtime dependency.
