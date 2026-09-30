# ADR 0004: Keep voluntary consent intake separate from voter lookup data

- Status: accepted
- Date: 2026-09-29

## Context

A future companion could help volunteers or supporters offer contact information and communication preferences. Combining that data with address lookups would create a political profiling and targeting risk that conflicts with PleaseVote's neutral information mission.

## Decision

The companion is a separately deployed, intake-only Go service with a separate Postgres schema and least-privilege role in the existing private Oracle network. It accepts only independently supplied data after an explicit checkbox consent, records consent and revocation/deletion metadata, and does not expose export, roster, messaging, RAG, lookup linkage, inferred preference, or scraped contacts. Tailscale/ZeroTier is an operator access mechanism, never a runtime dependency.

## Consequences

The separate schema is weaker isolation than a separate database, so the deployment must enforce role privileges, network boundaries, migration review, and access audit. The narrower feature set avoids turning public voter information into a covert outreach database.

