# PleaseVote Schema

## Site Structure
- `/`: Home
- `/voterinfo`: Personalized information
- `/elections`: Election directory

## API Definitions (Google Civic API)
- `elections`: `https://www.googleapis.com/civicinfo/v2/elections`
- `voterinfo`: `https://www.googleapis.com/civicinfo/v2/voterinfo`

## State Schema
- `sessionStorage`:
  - `voterinfo_{address}_{electionId}`: Full JSON response from Civic API.
  - `elections_list`: Full list of elections.
