# PleaseVote Logic

## Data Flow
1. User enters address on Home page.
2. Address is saved to `localStorage` for persistence.
3. User is navigated to `/voterinfo?address=...`.
4. `voterinfo` loader fetches data from Google Civic API.
5. API responses are cached in `window.sessionStorage`.
6. UI renders contests and polling locations.
7. Polling locations are filtered based on a user-adjustable radius.

## Information Architecture
- **Elections**: Global list of election cycles.
- **Voter Info**: Normalized address, election details, polling locations, and contests.
- **Contests**: Office, district, and candidates.
- **Candidates**: Name, party, contact info, and social channels.
