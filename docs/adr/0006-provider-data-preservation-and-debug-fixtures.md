# ADR 0006: Preserve useful provider data and keep debugging local

- Status: accepted
- Date: 2026-10-01

## Context

Google Civic can return useful location, contest, and administration fields alongside a non-success status. It also returns sparse location records, including records without latitude/longitude, and can mark an election `mailOnly` while still publishing ballot drop-off or in-person service information. Treating any one of those signals as a reason to discard the response makes the portal less useful and obscures the provider behavior we need to diagnose.

The documented election `2000` sample is stable for testing but can return 404 for arbitrary addresses when queried from the live provider. It must not be presented as current, address-specific election data.

## Decision

The Civic adapter preserves provider status and all useful arrays. The service considers locations, contests, administration records, or `mailOnly` evidence useful regardless of the status string; it records the status in redacted retrieval metadata and gives the visitor a confirmation warning when appropriate. The UI keeps election-day, early-vote, and drop-off sections independent and renders `voterServices` on each card. Records without coordinates remain visible in an always-open review group.

The API command has one data/debug switch: `--debug`. It enables the embedded Civic 2000 fixture for any address and defaults the terminal logger to `DEBUG`. `--log-level` can narrow or disable logs using `DEBUG`, `INFO`, `WARN`, `ERROR`, `FAILURE`, `OFF`, or `DISABLED`. Normal mode uses live Civic data only and never substitutes the local fixture. Fixture responses use `mode: "test-fixture"`, `dataSource: "test-fixture"`, and a prominent sample-data warning.

## Consequences

The browser can show more of what Civic actually returned and operators can reproduce the 2000 path without memorizing provider sample addresses. The UI must distinguish sample data from a real address lookup, and official election-office links remain the authority for eligibility, assignment, hours, and current rules. Debug logs may include safe operation names, status codes, counts, and hashed address fingerprints, but never raw addresses, credentials, full provider URLs, or raw upstream bodies.
