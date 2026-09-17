/** Shared Google Civic Information API response contracts. */

/** A named election and its Civic Information division. */
export interface Election {
  id: string;
  name: string;
  electionDay: string;
  ocdDivisionId: string;
}

/** The response returned by the elections endpoint. */
export interface ElectionsResponse {
  elections: Election[];
}

/** A postal or civic address used by the API. */
export interface Address {
  locationName?: string;
  line1: string;
  line2?: string;
  line3?: string;
  city: string;
  state: string;
  zip: string;
}

/** A polling, early-voting, or ballot drop-off location. */
export interface PollingLocation {
  address: Address;
  notes?: string;
  pollingHours?: string;
  startDate?: string;
  endDate?: string;
  latitude?: number;
  longitude?: number;
  sources?: { name: string; official: boolean }[];
}

/** A candidate listed in an election contest. */
export interface Candidate {
  name: string;
  party?: string;
  candidateUrl?: string;
  phone?: string;
  photoUrl?: string;
  email?: string;
  orderOnBallot?: number;
  channels?: { type: string; id: string }[];
}

/** A contest, office, or referendum on the returned ballot. */
export interface Contest {
  type: string;
  office?: string;
  level?: string[];
  roles?: string[];
  district?: { name: string; scope: string; id: string };
  candidates?: Candidate[];
  referendumTitle?: string;
  referendumSubtitle?: string;
  referendumUrl?: string;
  sources?: { name: string; official: boolean }[];
}

/** Complete voter-information response for one address and election. */
export interface VoterInfoResponse {
  election: Election;
  normalizedInput: Address;
  pollingLocations?: PollingLocation[];
  earlyVoteSites?: PollingLocation[];
  dropOffLocations?: PollingLocation[];
  contests?: Contest[];
  state?: {
    name: string;
    electionAdministrationBody?: {
      name?: string;
      electionInfoUrl?: string;
      electionRegistrationUrl?: string;
      electionRegistrationConfirmationUrl?: string;
      votingLocationFinderUrl?: string;
      ballotInfoUrl?: string;
      electionRulesUrl?: string;
      correspondenceAddress?: Address;
    };
    local_jurisdiction?: {
      name?: string;
      sources?: { name: string; official: boolean }[];
    };
    sources?: { name: string; official: boolean }[];
  }[];
  kind: string;
}
