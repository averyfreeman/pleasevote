# ADR 0003: Treat locations as provider opportunities, not assignments

- Status: accepted
- Date: 2026-09-29

## Context

The Civic `pollingLocations[]` field identifies places where a voter may be able to vote on election day, but it does not necessarily identify one assigned polling place. The old UI called the first/nearest record a polling location and calculated distance from hard-coded Columbus coordinates.

## Decision

Use “election-day location” in the product vocabulary. Geocode the submitted address on the server and calculate Haversine distances from that origin. Default to 25 miles with a 5–50 mile visitor control. Sort by distance, initially show ten, retain all records, and separate records with missing coordinates for review. The UI must explain that radius is a convenience filter and does not determine eligibility.

## Consequences

The UI may show more than one place and may be less terse, but it is honest about Civic's semantics and resilient to sparse provider records. Official location-finder links remain a first-class fallback.

