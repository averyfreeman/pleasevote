# PleaseVote domain context

## Product purpose

PleaseVote is a neutral voter-information portal. It helps a visitor retrieve, understand, and carry official election information for an address. It does not register a voter, determine a voter's legal eligibility, endorse a candidate, cast a ballot, or create political profiles.

The product's governing success criterion is **vote-ability**: a person should be able to find the relevant place, hours, official links, contests, and candidates, understand uncertainty, and take that information with them.

## Canonical language

- **Submitted address**: the address entered for the primary lookup.
- **Normalized address**: the address accepted by the geocoder/provider; it is not proof that a person lives there.
- **Election-day location**: a location returned in Civic `pollingLocations[]`. It is a place where the provider says voting may be available on election day. Do not call it an assigned polling place unless an authoritative source explicitly says so.
- **Early-vote site**: a location returned in Civic `earlyVoteSites[]` with provider-supplied hours.
- **Ballot drop-off location**: a location returned in Civic `dropOffLocations[]`.
- **Contest**: a candidate contest, referendum, or ballot question returned by Civic.
- **Administration record**: election-office identity, official links, and correspondence information.
- **Discovery lookup**: an independent lookup for a different place, useful for travel or work. It is not a voter-eligibility lookup.
- **Voting plan**: the composed visitor view containing election status, locations, hours, contests, administration links, provenance, warnings, and print controls.
- **Partial provider status**: a Civic response status that is not `success` even though the response still contains useful records; the status is retained and the records remain reviewable.
- **Test fixture**: the local Civic election `2000` sample used only by the server's explicit debug mode. Fixture locations and contests are examples, not address-specific results.

## Invariants

1. The browser never receives a Google Civic or Maps API key and never calls those providers directly.
2. Every provider record is preserved or explicitly explained when it cannot be distance-filtered; missing coordinates are never silently discarded.
3. The default location radius is 25 miles. Visitors may choose 5 through 50 miles. The radius is a display filter, not an eligibility decision.
4. Distance is calculated from the server-geocoded submitted address using the Haversine formula. Hard-coded origin coordinates are forbidden.
5. A live lookup is preferred. Normal mode never substitutes local fixture data. Explicit debug mode may use the local Civic election `2000` fixture for any submitted address and must label it prominently as sample data unrelated to that address.
6. Useful Civic locations, drop-offs, contests, and administration records remain visible even when a non-success provider status accompanies them. `mailOnly` is informational and never suppresses published records.
7. A missing or sparse API field is rendered as missing or unknown; the UI does not invent hours, candidates, offices, eligibility, or assignment.
8. Source attribution is visible. Official and non-official records are distinguishable.
9. PleaseVote stores only the last submitted address in browser localStorage when the visitor uses the address form. It does not persist Civic responses or log raw addresses.
10. Political profiling, targeted rosters, scraped contact lists, and lookup-address-based outreach are outside this product's scope.
11. Accessibility is a release requirement: keyboard operation, semantic landmarks, focus visibility, screen-reader names/live regions, contrast, reduced motion, and automated axe checks are required.

## Ownership boundaries

| Boundary | Owner | Responsibility |
| --- | --- | --- |
| Provider adapters | Go service | Google Civic/Maps authentication, validation, timeouts, explicit debug fixtures, redaction, normalized API envelope |
| Stable API contract | OpenAPI | Versioned request/response/error shapes shared by Go and TypeScript |
| Domain presentation | TypeScript | Radius filtering, aggregation, labels, accessible interaction, print view |
| Visual system | Tailwind + DaisyUI | Responsive layout, light/dark/system themes, contrast, reduced motion |
| Companion consent intake | Separate Go service/schema | Explicit voluntary consent record only; no linkage to PleaseVote lookup data |

## Data confidence

The Google Civic API response is a provider response, not a legal determination. PleaseVote must show the source, preserve uncertainty, and direct the visitor to official election administration for final confirmation. The product should fail safely when the provider returns no data, sparse data, malformed data, or a test election.
