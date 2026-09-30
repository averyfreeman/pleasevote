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

## Invariants

1. The browser never receives a Google Civic or Maps API key and never calls those providers directly.
2. Every provider record is preserved or explicitly explained when it cannot be distance-filtered; missing coordinates are never silently discarded.
3. The default location radius is 25 miles. Visitors may choose 5 through 50 miles. The radius is a display filter, not an eligibility decision.
4. Distance is calculated from the server-geocoded submitted address using the Haversine formula. Hard-coded origin coordinates are forbidden.
5. A live lookup is preferred. If live data is unusable, the backend may query Civic election `2000` as a deterministic fixture and must label it prominently as test data.
6. A missing or sparse API field is rendered as missing or unknown; the UI does not invent hours, candidates, offices, eligibility, or assignment.
7. Source attribution is visible. Official and non-official records are distinguishable.
8. PleaseVote stores only the last submitted address in browser localStorage when the visitor uses the address form. It does not persist Civic responses or log raw addresses.
9. Political profiling, targeted rosters, scraped contact lists, and lookup-address-based outreach are outside this product's scope.
10. Accessibility is a release requirement: keyboard operation, semantic landmarks, focus visibility, screen-reader names/live regions, contrast, reduced motion, and automated axe checks are required.

## Ownership boundaries

| Boundary | Owner | Responsibility |
| --- | --- | --- |
| Provider adapters | Go service | Google Civic/Maps authentication, validation, timeouts, redaction, fallback, normalized API envelope |
| Stable API contract | OpenAPI | Versioned request/response/error shapes shared by Go and TypeScript |
| Domain presentation | TypeScript | Radius filtering, aggregation, labels, accessible interaction, print view |
| Visual system | Tailwind + DaisyUI | Responsive layout, light/dark/system themes, contrast, reduced motion |
| Companion consent intake | Separate Go service/schema | Explicit voluntary consent record only; no linkage to PleaseVote lookup data |

## Data confidence

The Google Civic API response is a provider response, not a legal determination. PleaseVote must show the source, preserve uncertainty, and direct the visitor to official election administration for final confirmation. The product should fail safely when the provider returns no data, sparse data, malformed data, or a test election.

