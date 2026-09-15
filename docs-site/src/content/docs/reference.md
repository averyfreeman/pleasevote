---
title: API and data model
description: Typed application boundaries for elections and voter information.
---

The application models the Civic Information response with explicit TypeScript interfaces:

- `Election` identifies the election name and election day.
- `PollingLocation` describes an available polling or drop-off location and hours.
- `Candidate` and `Contest` describe contest choices and referendum text.
- `VoterInfoResponse` combines election, contests, locations, and administration links.

The API helpers keep network access separate from route rendering and surface failed HTTP responses as useful errors.
