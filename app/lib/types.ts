/**
 * Public application contracts for the PleaseVote API.
 *
 * The browser never talks to Google directly. The Go service normalizes the
 * provider response into these intentionally boring, stable shapes so that
 * presentation code cannot accidentally depend on an undocumented provider
 * detail or expose an API key.
 */

/** A source attached to a Civic record. */
export interface SourceAttribution {
  /** Human-readable name of the organization that supplied the record. */
  readonly name: string;
  /** Whether the provider marked the organization as an official source. */
  readonly official: boolean;
}

/** A Civic election identifier and date. */
export interface ElectionSummary {
  /** Civic election identifier. */
  readonly id: string;
  /** Provider-supplied display name. */
  readonly name: string;
  /** Election day in ISO `YYYY-MM-DD` format when supplied. */
  readonly electionDay: string;
  /** Open Civic Data division identifier, when supplied. */
  readonly ocdDivisionId?: string;
}

/** A postal address returned by a geocoder or the Civic provider. */
export interface CivicAddress {
  /** Optional location or building name. */
  readonly locationName?: string;
  /** First address line. */
  readonly line1?: string;
  /** Optional second address line. */
  readonly line2?: string;
  /** Optional third address line. */
  readonly line3?: string;
  /** City or locality. */
  readonly city?: string;
  /** State or territory abbreviation/name. */
  readonly state?: string;
  /** Postal code. */
  readonly zip?: string;
  /** Provider-preserved address lines, if available. */
  readonly addressLine?: readonly string[];
}

/** A latitude/longitude pair in decimal degrees. */
export interface GeoPoint {
  /** Latitude from -90 through 90. */
  readonly latitude: number;
  /** Longitude from -180 through 180. */
  readonly longitude: number;
}

/** A location at which the provider says voting-related activity is available. */
export interface VotingLocation {
  /** Stable client key assigned by the backend. */
  readonly id: string;
  /** The source collection that produced this record. */
  readonly kind: "polling" | "early-vote" | "drop-off";
  /** Address displayed to the visitor. */
  readonly address: CivicAddress;
  /** Human-readable provider hours text; preserve line breaks. */
  readonly pollingHours?: string;
  /** Provider description of services available at this location. */
  readonly voterServices?: string;
  /** Provider notes about eligibility, access, or the location. */
  readonly notes?: string;
  /** Optional beginning of the provider's availability window. */
  readonly startDate?: string;
  /** Optional end date of the provider's availability window. */
  readonly endDate?: string;
  /** Coordinates used for distance and directions when provided. */
  readonly point?: GeoPoint;
  /** Great-circle distance from the submitted address, calculated by the backend. */
  readonly distanceMiles?: number;
  /** Provider source attribution. */
  readonly sources: readonly SourceAttribution[];
}

/** A candidate attached to a contest. */
export interface Candidate {
  /** Candidate display name. */
  readonly name: string;
  /** Candidate party label, if provided. */
  readonly party?: string;
  /** Candidate's official or provider-supplied web page. */
  readonly candidateUrl?: string;
  /** Candidate contact telephone number, if supplied. */
  readonly phone?: string;
  /** Candidate photograph URL, if supplied. */
  readonly photoUrl?: string;
  /** Candidate email address, if supplied. */
  readonly email?: string;
  /** Candidate's ballot order, if supplied. */
  readonly orderOnBallot?: number;
  /** Provider communication channel identifiers. */
  readonly channels?: readonly { type: string; id: string }[];
}

/** A contest, office, referendum, or ballot question. */
export interface Contest {
  /** Stable client key derived from the provider record. */
  readonly id: string;
  /** Provider contest type. */
  readonly type: string;
  /** Office title for candidate contests. */
  readonly office?: string;
  /** Jurisdiction levels associated with the contest. */
  readonly level?: readonly string[];
  /** Role labels associated with the contest. */
  readonly roles?: readonly string[];
  /** District metadata, when provided. */
  readonly district?: {
    readonly name?: string;
    readonly scope?: string;
    readonly id?: string;
  };
  /** Candidates listed by the provider. */
  readonly candidates: readonly Candidate[];
  /** Referendum title, when the contest is a ballot question. */
  readonly referendumTitle?: string;
  /** Referendum subtitle or explanatory text. */
  readonly referendumSubtitle?: string;
  /** Referendum source URL, when supplied. */
  readonly referendumUrl?: string;
  /** Provider source attribution. */
  readonly sources: readonly SourceAttribution[];
}

/** Election-administration links and contact information. */
export interface AdministrationInfo {
  /** State or local administration body name. */
  readonly name?: string;
  /** Official information page. */
  readonly electionInfoUrl?: string;
  /** Official registration page. */
  readonly electionRegistrationUrl?: string;
  /** Official registration confirmation page. */
  readonly electionRegistrationConfirmationUrl?: string;
  /** Official location lookup page. */
  readonly votingLocationFinderUrl?: string;
  /** Official sample-ballot page. */
  readonly ballotInfoUrl?: string;
  /** Official rules/eligibility page. */
  readonly electionRulesUrl?: string;
  /** Provider notice text and URL, when available. */
  readonly electionNoticeText?: string;
  readonly electionNoticeUrl?: string;
  /** Absentee/early-voting guidance, when available. */
  readonly absenteeVotingInfoUrl?: string;
  /** Services and office hours supplied by the election administrator. */
  readonly voterServices?: readonly string[];
  readonly hoursOfOperation?: string;
  /** Correspondence address for the administration body. */
  readonly correspondenceAddress?: CivicAddress;
  readonly physicalAddress?: CivicAddress;
  readonly electionOfficials?: readonly {
    readonly name?: string;
    readonly title?: string;
    readonly officePhoneNumber?: string;
    readonly faxNumber?: string;
    readonly emailAddress?: string;
  }[];
  /** Jurisdiction label associated with the administration body. */
  readonly jurisdiction?: string;
  /** Provider source attribution. */
  readonly sources: readonly SourceAttribution[];
}

/** The address the geocoder/Civic API accepted for the lookup. */
export interface NormalizedAddress extends CivicAddress {
  /** The provider's full normalized address, when available. */
  readonly formatted?: string;
}

/** Which election source produced the result. */
export type LookupMode = "live" | "test-fixture";

/** Provenance and fixture information shown to visitors and operators. */
export interface RetrievalMetadata {
  /** Civic endpoint request used by the backend. */
  readonly civicEndpoint: string;
  /** Requested Civic election id, if one was supplied. */
  readonly requestedElectionId?: string;
  /** Whether the backend had to use the deterministic VIP test election. */
  readonly fallbackUsed: boolean;
  /** ISO timestamp at which the backend assembled the response. */
  readonly retrievedAt: string;
  /** Stable API version returned by the service. */
  readonly apiVersion?: string;
  /** Redacted correlation id for support. */
  readonly requestId?: string;
  /** Provider name, when returned by the service. */
  readonly provider?: string;
  /** Provider election id, when returned by the service. */
  readonly electionId?: string;
  /** Whether records came from the live provider or local fixture. */
  readonly dataSource?: "live" | "test-fixture";
  /** Civic status preserved even when useful fields accompany it. */
  readonly providerStatus?: string;
}

/** Complete normalized voter-information response for one submitted address. */
export interface LookupResponse {
  /** Original user-supplied query, retained only for the current response. */
  readonly address: string;
  /** Provider-normalized address. */
  readonly normalizedAddress: NormalizedAddress;
  /** Geocoded origin used for radius calculations. */
  readonly origin: GeoPoint;
  /** Election represented by the returned records. */
  readonly election: ElectionSummary;
  /** Live data or deterministic VIP fixture data. */
  readonly mode: LookupMode;
  /** Required visitor-facing warning for a test-election response. */
  readonly warning?: string;
  /** Locations where Civic says election-day voting is available. */
  readonly pollingLocations: readonly VotingLocation[];
  /** Early-vote locations and their hours. */
  readonly earlyVoteSites: readonly VotingLocation[];
  /** Ballot drop-off locations and their hours. */
  readonly dropOffLocations: readonly VotingLocation[];
  /** Every contest returned for the election, including referenda. */
  readonly contests: readonly Contest[];
  /** State and local election administration records. */
  readonly administration: readonly AdministrationInfo[];
  /** Other elections advertised by Civic for the address. */
  readonly otherElections: readonly ElectionSummary[];
  /** Whether the provider marked the precinct as mail-only. */
  readonly mailOnly?: boolean;
  /** Sources contributing records to this response. */
  readonly sources: readonly SourceAttribution[];
  /** Auditable provider/fixture metadata, never including secrets. */
  readonly retrieval: RetrievalMetadata;
}

/** A location lookup for a different place, clearly separate from voter eligibility. */
export interface DiscoveryResponse {
  /** Original place query. */
  readonly address: string;
  /** Geocoded place result. */
  readonly normalizedAddress: NormalizedAddress;
  /** Geocoded place coordinates. */
  readonly origin: GeoPoint;
  /** Broad jurisdiction comparison with the home lookup, when supplied. */
  readonly jurisdictionComparison: "same-broad-jurisdiction" | "different-broad-jurisdiction" | "unknown";
  /** Warning that discovery does not establish voter eligibility. */
  readonly warning: string;
  /** Live data or deterministic VIP fixture data used for this place. */
  readonly mode: LookupMode;
  /** Voting-related locations returned for the alternate place. */
  readonly pollingLocations: readonly VotingLocation[];
  /** Early-vote locations returned for the alternate place. */
  readonly earlyVoteSites: readonly VotingLocation[];
  /** Drop-off locations returned for the alternate place. */
  readonly dropOffLocations: readonly VotingLocation[];
  /** Election used for this discovery request. */
  readonly election: ElectionSummary;
  /** Provenance metadata. */
  readonly retrieval: RetrievalMetadata;
}

/** One API error returned by the Go service. */
export interface ApiErrorBody {
  /** Stable machine-readable error code. */
  readonly code: string;
  /** Safe visitor-facing explanation. */
  readonly message: string;
  /** Optional field that needs correction. */
  readonly field?: string;
  /** Request id for support/debugging without exposing an address. */
  readonly requestId?: string;
}

/** Error envelope returned for non-success API responses. */
export interface ApiErrorResponse {
  /** Always false for this envelope. */
  readonly ok: false;
  /** Safe error details. */
  readonly error: ApiErrorBody;
}

/** Election list response returned without an address. */
export interface ElectionsResponse {
  /** Elections available to the backend's Civic API key. */
  readonly elections: readonly ElectionSummary[];
  /** ISO timestamp at which the list was retrieved. */
  readonly retrievedAt: string;
}
