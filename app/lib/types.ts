export interface Election {
  id: string;
  name: string;
  electionDay: string;
  ocdDivisionId: string;
}

export interface ElectionsResponse {
  elections: Election[];
}

export interface Address {
  locationName?: string;
  line1: string;
  line2?: string;
  line3?: string;
  city: string;
  state: string;
  zip: string;
}

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
