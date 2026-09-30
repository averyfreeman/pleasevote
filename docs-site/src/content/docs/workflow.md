---
title: How the lookup works
description: How PleaseVote turns an address into useful election information.
---

1. Enter an address. The browser remembers only the last address after submission, with a clear remove button.
2. The Go service turns the address into coordinates with Google Maps, then asks Civic for election information.
3. The service prefers usable live election data. If it uses Civic’s deterministic `electionId=2000` fixture, the page clearly says “Test data — not a current election.”
4. The results page brings together election-day locations, early voting, ballot drop-off, hours, contests, candidates, questions, and official election-office links.
5. Choose a 5–50 mile display radius, with 25 miles as the default. Places without coordinates stay visible in their own group.
6. Open a place or contest for details, get directions, or print/save the page as a PDF.
7. Use the official links for registration, eligibility, and local rules.

The flow stays focused: address input, loading and error states, organized results, another-place lookup, and accessible print controls. Civic locations are not automatically treated as assigned polling places.
