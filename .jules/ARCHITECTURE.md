# PleaseVote Architecture

## High-Level Features
- Election Countdown
- Address-based Voter Information Lookup
- Ballot Contests and Candidate details
- Polling Location Finder with Radius Filtering
- Election List (Upcoming)
- TypeDoc API Documentation

## Function Mapping
- `app/routes/home.tsx`: Landing page, countdown, address input.
- `app/routes/voterinfo.tsx`: Detailed voter information.
- `app/routes/elections.tsx`: List of available elections.
- `app/lib/api.ts`: Civic API service layer.
- `app/components/`: Reusable UI components.
