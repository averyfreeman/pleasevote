# Instructions for repository agents (Agent-Centric Rebuild)

## Core Mission
Rebuild "PleaseVote" as a modern information portal.
**Crucial Context:** This app does NOT facilitate voting. It provides voter info (polling locations, contests, candidates) based on the Voting Information Project (VIP) specification.

## Tech Stack (Agent-Optimized)
- **Frontend toolchain:** Node 24 LTS + pnpm 12
- **API runtime:** Native Go `net/http` service
- **Framework:** React Router v7 (Framework Mode) + Vite
- **UI:** Tailwind CSS + DaisyUI + Lucide Icons
- **Language:** Strict TypeScript (Explicit Interfaces Only)
- **Logic:** React Router v7 SPA `clientLoader` calls the same-origin Go API; provider keys never enter the browser.
- **Contract:** OpenAPI-first normalized response in `contracts/openapi.yaml`.

## Data Mapping (Google Civic Information API endpoint schema)
The backend will parse JSON payloads following Google Civic Information API.  Specification reference is: `https://developers.google.com/civic-information/docs/v2`
**TEST HINT:** Request parameter `electionId=2000` provides sample data populated from prior presidential cycle.  Useful for testing endpoints that require it as a parameter.
**The following site functions should be available to all users**
**Endpoint that does not require address:**
 - List all available elections: `https://www.googleapis.com/civicinfo/v2/elections`, request params: `{}`, sample response: ```json
 {
  "elections": [
    {
      "id": "2000",
      "name": "VIP Test Election",
      "electionDay": "2031-12-06",
      "ocdDivisionId": "ocd-division/country:us"
    }
  ]
}```
**Endpoints geo-bound by state:**
 - Query list of state divisions: `https://www.googleapis.com/civicinfo/v2/divisions`, required param: `{'address': 'string'}`, search by: `ocdId` or `name`, sample response: ```json
 {
  "results": [
        {
          "ocdId": "ocd-division/country:us/state:oh",
          "name": "Ohio"
        },
        {
          "ocdId": "ocd-division/country:us/state:oh/county:erie",
          "name": "Erie County"
        },
        {
          "ocdId": "ocd-division/country:us/state:oh/county:franklin/school_district:focus_learning_academy_of_southeastern_columbus",
          "name": "focus learning academy of southeastern columbus"
        }
    ]
    "kind": "civicinfo#divisionSearchResponse"
}```
 - `divisionsByAddress`, endpoint: `https://www.googleapis.com/civicinfo/v2/divisionsByAddress`, required param: address, structure: `{'address': 'string'}`, search by: `ocdId` or `name`, sample response: ```json
 {
  "results": [
        {
          "ocdId": "ocd-division/country:us/state:oh",
          "name": "Ohio"
        },
        {
          "ocdId": "ocd-division/country:us/state:oh/county:erie",
          "name": "Erie County"
        },
        {
          "ocdId": "ocd-division/country:us/state:oh/county:franklin/school_district:focus_learning_academy_of_southeastern_columbus",
          "name": "focus learning academy of southeastern columbus"
        }
    ]
    "kind": "civicinfo#divisionSearchResponse"
}```
**The most important endpoint:**
 - voterInfo`, endpoint: `https://www.googleapis.com/civicinfo/v2/voterinfo`, Required param: address (string), Optional param: election id (int).  Structure: `{'address': 'string', 'electionId', integer}`. Search params: many (evaluate sample). Sample response (without `electionId` or `official`): ```json
{
  "election": {
    "id": "9473",
    "name": "Ohio Primary Election",
    "electionDay": "2026-05-05",
    "ocdDivisionId": "ocd-division/country:us/state:oh"
  },
  "normalizedInput": {
    "line1": "211 Garrett Place",
    "city": "Columbus",
    "state": "OH",
    "zip": "43214"
  },
  "pollingLocations": [
    {
      "address": {
        "locationName": "FIRST UNITARIAN UNIVERSALIST CHURCH",
        "line1": "93 W Weisheimer Rd",
        "addressLine": [
          "93 W Weisheimer Rd"
        ],
        "city": "Columbus",
        "state": "OH",
        "zip": "43214"
      },
      "pollingHours": "Tue, May 5: 6:30 am - 7:30 pm",
      "latitude": 40.0545821,
      "longitude": -83.022588,
      "sources": [
        {
          "name": "Voting Information Project",
          "official": true
        }
      ]
    }
  ],
  "earlyVoteSites": [
    {
      "address": {
        "line1": "1700 Morse Rd",
        "addressLine": [
          "1700 Morse Rd"
        ],
        "city": "Columbus",
        "state": "OH",
        "zip": "43229"
      },
      "pollingHours": "Mon, Apr 7: 8 am - 5 pm\nTue, Apr 8: 8 am - 5 pm\nWed, Apr 9: 8 am - 5 pm\nThu, Apr 10: 8 am - 5 pm\nSun, Apr 13: 8 am - 5 pm\nMon, Apr 14: 8 am - 5 pm\nTue, Apr 15: 8 am - 5 pm\nWed, Apr 16: 8 am - 5 pm\nThu, Apr 17: 8 am - 5 pm\nSun, Apr 20: 8 am - 5 pm\nMon, Apr 21: 8 am - 5 pm\nTue, Apr 22: 8 am - 5 pm\nWed, Apr 23: 8 am - 5 pm\nThu, Apr 24: 8 am - 5 pm\nSun, Apr 27: 7:30 am - 7:30 pm\nMon, Apr 28: 7:30 am - 8:30 pm\nTue, Apr 29: 7:30 am - 7:30 pm\nWed, Apr 30: 7:30 am - 7:30 pm\nThu, May 1: 7:30 am - 7:30 pm\nFri, May 2: 8 am - 4 pm\nSat, May 3: 1 pm - 5 pm",
      "latitude": 40.061243,
      "longitude": -82.97353129999999,
      "sources": [
        {
          "name": "Voting Information Project",
          "official": true
        }
      ]
    }
  ],
  "state": [
    {
      "name": "Ohio",
      "electionAdministrationBody": {
        "name": "Secretary of State",
        "electionInfoUrl": "https://www.sos.state.oh.us/elections/",
        "electionRegistrationUrl": "https://olvr.ohiosos.gov/",
        "electionRegistrationConfirmationUrl": "https://voterlookup.ohiosos.gov/voterlookup.aspx",
        "votingLocationFinderUrl": "https://voterlookup.ohiosos.gov/voterlookup.aspx",
        "ballotInfoUrl": "https://www.ohiosos.gov/elections/voters/toolkit/sample-ballot/",
        "electionRulesUrl": "https://www.ohiosos.gov/elections/voters/absentee-voting/",
        "correspondenceAddress": {
          "line1": "180 Civic Center Dr.",
          "city": "Columbus",
          "state": "Ohio",
          "zip": "43215"
        }
      },
      "local_jurisdiction": {
        "name": "FRANKLIN",
        "sources": [
          {
            "name": "Voting Information Project",
            "official": true
          }
        ]
      },
      "sources": [
        {
          "name": "",
          "official": false
        }
      ]
    }
  ],
  "kind": "civicinfo#voterInfoResponse"
}```
**Produce search queries by filtering available nodes of `voterInfo` endpoint** JSON response data after retrieved.
- **Logic:** Implement a radius-based filter (default 25mi, user-adjustable from 5mi through 50mi) for normalized location results. The radius is a display convenience, not an eligibility decision. Retain records without coordinates in a visible review group.

## Testing Paradigm: Scenario-Based + Unit + Accessibility
A build is "Correct" only if the following deterministic and provider-boundary checks pass:
1. **Landing:** Election countdown renders and address input is interactive.
2. **Address Lookup:** Entering an address triggers a `GET` to the same-origin Go API, which calls Civic server-side, and populates the UI with local VIP data.
3. **Contest Navigation:** User can view specific candidate details extracted from the `Contest` node.
4. **Domain unit tests:** Haversine boundaries, zero coordinates, missing coordinates, sorting, fallback and error normalization.
5. **Accessibility:** Playwright keyboard smoke tests and axe checks pass.
6. **Go contract tests:** `httptest`, race detector, and vet checks cover provider failure, test-election fallback, redaction, and normalized output.

## Storage & Performance
- **Storage:** Use `localStorage` only for the last submitted address; do not persist Civic responses or raw addresses on the server.
- **Caching:** No server response cache is required until measured provider latency and freshness rules justify one.
- **Optimization:** Prefer bounded Go HTTP calls, explicit timeouts, and deterministic fixtures over speculative caching.

## Execution Rules
- **No PRs:** Commit directly to `main` after verification, using the repository's Git-BBQ habits.
- **Autonomy:** User intervention NOT required. Fix all lints/types internally.
- **Documentation:** Log any environment or `package.json` modifications in `ENV_CHANGES.md`.
