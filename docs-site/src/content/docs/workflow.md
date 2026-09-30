---
title: Voter information flow
description: How PLEASE VOTE™ turns an address into useful election information.
---

1. Enter an address in the voter-information form. The browser remembers only the last address when you submit, and provides a remove control.
2. The Go service geocodes the address with Google Maps and requests election and voter data from the server-side Civic adapter.
3. The service prefers a usable live election. If it must use Civic's deterministic `electionId=2000` fixture, the results show a prominent “VIP Test Election — not a current election” warning.
4. The results page composes election-day locations, early-vote sites, ballot drop-off, hours, contests, candidates, referenda, and official administration links.
5. Choose a 5–50 mile display radius (25 miles by default). Records without coordinates remain visible in their own review group.
6. Open a location or contest to inspect its details, use directions, or print/save the plan as a PDF.
7. Use the official links in the response for registration, eligibility, and jurisdiction-specific rules.

The interface keeps the lookup focused: address input, a loading state, a clear error state, a structured results view, an independent alternate-place discovery option, and accessible print controls. Civic locations are not automatically treated as an assigned polling place.
