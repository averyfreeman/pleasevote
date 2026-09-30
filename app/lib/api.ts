import type {
  ApiErrorResponse,
  Candidate,
  CivicAddress,
  DiscoveryResponse,
  ElectionsResponse,
  GeoPoint,
  LookupResponse,
  NormalizedAddress,
  SourceAttribution,
  VotingLocation,
} from "./types";

/** The stable browser-facing API prefix served by the Go service. */
export const API_PREFIX = "/api/v1";

/** A typed error raised when the browser-facing API rejects a request. */
export class ApiRequestError extends Error {
  /** Stable machine-readable API code. */
  readonly code: string;
  /** Optional request identifier safe to show support staff. */
  readonly requestId?: string;

  /** Create an error from a normalized API error body. */
  constructor(body: ApiErrorResponse) {
    super(body.error.message);
    this.name = "ApiRequestError";
    this.code = body.error.code;
    this.requestId = body.error.requestId;
  }
}

/** Convert a URLSearchParams record into a safe API query string. */
function queryString(parameters: Record<string, string | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(parameters)) {
    if (value !== undefined && value.trim() !== "") {
      query.set(key, value.trim());
    }
  }
  return query.toString();
}

/** Perform a same-origin request and decode the stable API envelope. */
async function requestJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(path, {
    headers: { Accept: "application/json" },
    signal,
  });
  const body: unknown = await response.json().catch(() => undefined);

  if (!response.ok) {
    if (isApiErrorResponse(body)) {
      throw new ApiRequestError(body);
    }
    throw new Error(`The voter-information service returned ${response.status}.`);
  }

  return body as T;
}

/** Return whether an unknown value is the documented API error envelope. */
function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as { ok?: unknown; error?: unknown };
  if (candidate.ok !== false || typeof candidate.error !== "object" || candidate.error === null) {
    return false;
  }
  return typeof (candidate.error as { code?: unknown }).code === "string" &&
    typeof (candidate.error as { message?: unknown }).message === "string";
}

type JsonRecord = Record<string, unknown>;

/** Treat an unknown JSON value as an object only when it is safe to inspect. */
function asRecord(value: unknown): JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value as JsonRecord : {};
}

/** Read a non-empty string from an unknown provider field. */
function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

/** Read a finite number from an unknown provider field. */
function numberValue(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

/** Normalize provider source records while preserving official status. */
function normalizeSources(value: unknown): SourceAttribution[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const source = asRecord(item);
    return { name: stringValue(source.name) ?? "Unspecified provider", official: source.official === true };
  });
}

/** Normalize one raw Civic location into the client-owned stable shape. */
function normalizeLocation(value: unknown, kind: VotingLocation["kind"], index: number): VotingLocation {
  const raw = asRecord(value);
  const rawAddress = asRecord(raw.address);
  const address: CivicAddress = {
    locationName: stringValue(rawAddress.locationName) ?? stringValue(raw.name),
    line1: stringValue(rawAddress.line1),
    line2: stringValue(rawAddress.line2),
    line3: stringValue(rawAddress.line3),
    city: stringValue(rawAddress.city),
    state: stringValue(rawAddress.state),
    zip: stringValue(rawAddress.zip),
    addressLine: Array.isArray(rawAddress.addressLine) ? rawAddress.addressLine.filter((item): item is string => typeof item === "string") : undefined,
  };
  const rawPoint = asRecord(raw.point);
  const latitude = numberValue(rawPoint.latitude) ?? numberValue(raw.latitude);
  const longitude = numberValue(rawPoint.longitude) ?? numberValue(raw.longitude);
  const point: GeoPoint | undefined = latitude !== undefined && longitude !== undefined ? { latitude, longitude } : undefined;
  const addressKey = address.line1 ?? address.locationName ?? "location";
  return {
    id: stringValue(raw.id) ?? `${kind}-${index}-${addressKey}`,
    kind,
    address,
    pollingHours: stringValue(raw.pollingHours),
    notes: stringValue(raw.notes),
    startDate: stringValue(raw.startDate),
    endDate: stringValue(raw.endDate),
    point,
    distanceMiles: numberValue(raw.distanceMiles),
    sources: normalizeSources(raw.sources),
  };
}

/** Normalize a provider candidate without inventing a political attribute. */
function normalizeCandidate(value: unknown): Candidate {
  const raw = asRecord(value);
  const channels = Array.isArray(raw.channels) ? raw.channels.map((item) => {
    const channel = asRecord(item);
    return { type: stringValue(channel.type) ?? "unknown", id: stringValue(channel.id) ?? "unknown" };
  }) : undefined;
  return {
    name: stringValue(raw.name) ?? "Unnamed candidate (provider did not supply a name)",
    party: stringValue(raw.party),
    candidateUrl: stringValue(raw.candidateUrl),
    phone: stringValue(raw.phone),
    photoUrl: stringValue(raw.photoUrl),
    email: stringValue(raw.email),
    orderOnBallot: numberValue(raw.orderOnBallot),
    channels,
  };
}

/** Normalize one raw contest and preserve candidate/referendum distinctions. */
function normalizeContest(value: unknown, index: number): LookupResponse["contests"][number] {
  const raw = asRecord(value);
  const candidates = Array.isArray(raw.candidates) ? raw.candidates.map(normalizeCandidate) : [];
  const type = stringValue(raw.type) ?? "Contest";
  const title = stringValue(raw.office) ?? stringValue(raw.referendumTitle) ?? type;
  return {
    id: stringValue(raw.id) ?? `contest-${index}-${title}`,
    type,
    office: stringValue(raw.office),
    level: Array.isArray(raw.level) ? raw.level.filter((item): item is string => typeof item === "string") : undefined,
    roles: Array.isArray(raw.roles) ? raw.roles.filter((item): item is string => typeof item === "string") : undefined,
    district: asRecord(raw.district).name || asRecord(raw.district).scope || asRecord(raw.district).id ? {
      name: stringValue(asRecord(raw.district).name),
      scope: stringValue(asRecord(raw.district).scope),
      id: stringValue(asRecord(raw.district).id),
    } : undefined,
    candidates,
    referendumTitle: stringValue(raw.referendumTitle),
    referendumSubtitle: stringValue(raw.referendumSubtitle) ?? stringValue(raw.referendumText),
    referendumUrl: stringValue(raw.referendumUrl),
    sources: normalizeSources(raw.sources),
  };
}

/** Flatten Civic state records into administration cards for the browser. */
function normalizeAdministration(value: unknown): LookupResponse["administration"][number] {
  const raw = asRecord(value);
  const nestedBody = asRecord(raw.electionAdministrationBody);
  const body = Object.keys(nestedBody).length ? nestedBody : raw;
  const local = asRecord(raw.local_jurisdiction);
  const bodyAddress = asRecord(body.correspondenceAddress);
  const correspondenceAddress: CivicAddress | undefined = Object.keys(bodyAddress).length ? bodyAddress as CivicAddress : undefined;
  return {
    name: stringValue(body.name) ?? stringValue(raw.name),
    electionInfoUrl: stringValue(body.electionInfoUrl),
    electionRegistrationUrl: stringValue(body.electionRegistrationUrl),
    electionRegistrationConfirmationUrl: stringValue(body.electionRegistrationConfirmationUrl),
    votingLocationFinderUrl: stringValue(body.votingLocationFinderUrl),
    ballotInfoUrl: stringValue(body.ballotInfoUrl),
    electionRulesUrl: stringValue(body.electionRulesUrl),
    correspondenceAddress,
    jurisdiction: stringValue(local.name),
    sources: [...normalizeSources(raw.sources), ...normalizeSources(local.sources)],
  };
}

/** Convert the Go service's lossless Civic projection into the UI contract. */
function normalizeLookupResponse(value: unknown, submittedAddress: string): LookupResponse {
  const raw = asRecord(value);
  const rawElection = asRecord(raw.election);
  const rawNormalized = asRecord(raw.normalizedAddress);
  const rawOrigin = asRecord(raw.origin);
  const election = {
    id: stringValue(rawElection.id) ?? "unknown",
    name: stringValue(rawElection.name) ?? "Election information",
    electionDay: stringValue(rawElection.electionDay) ?? "",
    ocdDivisionId: stringValue(rawElection.ocdDivisionId),
  };
  const latitude = numberValue(rawOrigin.latitude);
  const longitude = numberValue(rawOrigin.longitude);
  if (latitude === undefined || longitude === undefined) throw new Error("The voter-information service returned no valid origin coordinates.");
  const retrieval = asRecord(raw.retrieval);
  const mode = raw.mode === "test-fallback" ? "test-fallback" : "live";
  const normalizedAddress: NormalizedAddress = { ...rawNormalized as CivicAddress, formatted: stringValue(rawNormalized.formatted) };
  return {
    address: stringValue(raw.address) ?? submittedAddress,
    normalizedAddress,
    origin: { latitude, longitude },
    election,
    mode,
    warning: stringValue(raw.warning),
    pollingLocations: Array.isArray(raw.pollingLocations) ? raw.pollingLocations.map((item, index) => normalizeLocation(item, "polling", index)) : [],
    earlyVoteSites: Array.isArray(raw.earlyVoteSites) ? raw.earlyVoteSites.map((item, index) => normalizeLocation(item, "early-vote", index)) : [],
    dropOffLocations: Array.isArray(raw.dropOffLocations) ? raw.dropOffLocations.map((item, index) => normalizeLocation(item, "drop-off", index)) : [],
    contests: Array.isArray(raw.contests) ? raw.contests.map(normalizeContest) : [],
    administration: Array.isArray(raw.administration) ? raw.administration.map(normalizeAdministration) : [],
    otherElections: Array.isArray(raw.otherElections) ? raw.otherElections.map((item) => {
      const electionValue = asRecord(item);
      return { id: stringValue(electionValue.id) ?? "unknown", name: stringValue(electionValue.name) ?? "Election", electionDay: stringValue(electionValue.electionDay) ?? "", ocdDivisionId: stringValue(electionValue.ocdDivisionId) };
    }) : [],
    mailOnly: raw.mailOnly === true,
    sources: normalizeSources(raw.sources),
    retrieval: {
      civicEndpoint: "voterinfo",
      fallbackUsed: mode === "test-fallback",
      retrievedAt: stringValue(retrieval.retrievedAt) ?? new Date().toISOString(),
      apiVersion: stringValue(retrieval.apiVersion),
      requestId: stringValue(retrieval.requestId),
      provider: stringValue(retrieval.provider),
      electionId: stringValue(retrieval.electionId) ?? election.id,
    },
  };
}

/** Fetch all elections visible to the backend's Civic API key. */
export function fetchElections(signal?: AbortSignal): Promise<ElectionsResponse> {
  return requestJson<unknown>(`${API_PREFIX}/elections`, signal).then((value) => {
    const raw = asRecord(value);
    const retrieval = asRecord(raw.retrieval);
    const elections = Array.isArray(raw.elections) ? raw.elections.map((item) => {
      const election = asRecord(item);
      return {
        id: stringValue(election.id) ?? "unknown",
        name: stringValue(election.name) ?? "Election",
        electionDay: stringValue(election.electionDay) ?? "",
        ocdDivisionId: stringValue(election.ocdDivisionId),
      };
    }) : [];
    return {
      elections,
      retrievedAt: stringValue(raw.retrievedAt) ?? stringValue(retrieval.retrievedAt) ?? new Date().toISOString(),
    };
  });
}

/** Fetch the normalized voter-information plan for an address. */
export function fetchVoterInfo(
  address: string,
  electionId?: string,
  signal?: AbortSignal,
): Promise<LookupResponse> {
  const query = queryString({ address, electionId });
  return requestJson<unknown>(`${API_PREFIX}/lookup?${query}`, signal).then((body) => normalizeLookupResponse(body, address));
}

/** Fetch a separately evaluated alternate place for out-and-about discovery. */
export function fetchDiscovery(
  address: string,
  electionId?: string,
  signal?: AbortSignal,
): Promise<DiscoveryResponse> {
  const query = queryString({ address, electionId });
  return requestJson<unknown>(`${API_PREFIX}/discovery?${query}`, signal).then((body) => {
    const normalized = normalizeLookupResponse(body, address);
    const raw = asRecord(body);
    const comparison = raw.jurisdictionComparison === "same-broad-jurisdiction" || raw.jurisdictionComparison === "different-broad-jurisdiction" ? raw.jurisdictionComparison : "unknown";
    return {
      address: normalized.address,
      normalizedAddress: normalized.normalizedAddress,
      origin: normalized.origin,
      jurisdictionComparison: comparison,
      warning: stringValue(raw.warning) ?? "This discovery lookup does not establish voter eligibility at this place.",
      pollingLocations: normalized.pollingLocations,
      earlyVoteSites: normalized.earlyVoteSites,
      dropOffLocations: normalized.dropOffLocations,
      election: normalized.election,
      retrieval: normalized.retrieval,
    };
  });
}
