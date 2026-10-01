import type { GeoPoint, LookupResponse, VotingLocation } from "./types";

/** The smallest allowed visitor-selected radius, in miles. */
export const MIN_RADIUS_MILES = 5;

/** The default visitor-selected radius, in miles. */
export const DEFAULT_RADIUS_MILES = 25;

/** The largest allowed visitor-selected radius, in miles. */
export const MAX_RADIUS_MILES = 50;

/** Radius-filtered location collections used by the results view. */
export interface LocationResults {
  /** Records with valid coordinates inside the selected radius. */
  readonly inRadius: readonly VotingLocation[];
  /** Records with valid coordinates outside the selected radius. */
  readonly outsideRadius: readonly VotingLocation[];
  /** Records retained because the provider did not provide coordinates. */
  readonly missingCoordinates: readonly VotingLocation[];
}

/** The composed, user-oriented view model for a voter-information response. */
export interface VotingPlan {
  /** Election and fixture status. */
  readonly election: LookupResponse["election"];
  /** Visitor-facing fixture or partial-data warning, if any. */
  readonly warning?: string;
  /** Selected radius in miles. */
  readonly radiusMiles: number;
  /** Filtered election-day locations. */
  readonly pollingLocations: LocationResults;
  /** Filtered early-vote locations. */
  readonly earlyVoteSites: LocationResults;
  /** Filtered drop-off locations. */
  readonly dropOffLocations: LocationResults;
  /** Every contest, never silently truncated by a radius filter. */
  readonly contests: LookupResponse["contests"];
  /** Every administration record. */
  readonly administration: LookupResponse["administration"];
}

/** Return true only for valid finite geographic coordinates. */
export function isValidGeoPoint(point: GeoPoint | undefined): point is GeoPoint {
  return point !== undefined &&
    Number.isFinite(point.latitude) &&
    Number.isFinite(point.longitude) &&
    point.latitude >= -90 &&
    point.latitude <= 90 &&
    point.longitude >= -180 &&
    point.longitude <= 180;
}

/** Calculate great-circle distance between two coordinates in miles. */
export function calculateDistance(origin: GeoPoint, destination: GeoPoint): number {
  if (!isValidGeoPoint(origin) || !isValidGeoPoint(destination)) {
    throw new RangeError("Both coordinates must be finite latitude/longitude pairs.");
  }

  const earthRadiusMiles = 3958.8;
  const latitudeDelta = ((destination.latitude - origin.latitude) * Math.PI) / 180;
  const longitudeDelta = ((destination.longitude - origin.longitude) * Math.PI) / 180;
  const originLatitude = (origin.latitude * Math.PI) / 180;
  const destinationLatitude = (destination.latitude * Math.PI) / 180;
  const haversine = Math.min(1, Math.max(0, Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(originLatitude) * Math.cos(destinationLatitude) *
      Math.sin(longitudeDelta / 2) ** 2));
  const arc = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  return earthRadiusMiles * arc;
}

/** Clamp an arbitrary radius to the documented visitor range. */
export function normalizeRadius(radius: number | string | null | undefined): number {
  if (radius === null || radius === undefined || (typeof radius === "string" && radius.trim() === "")) {
    return DEFAULT_RADIUS_MILES;
  }
  const numericRadius = typeof radius === "number" ? radius : Number(radius);
  if (!Number.isFinite(numericRadius)) return DEFAULT_RADIUS_MILES;
  return Math.min(MAX_RADIUS_MILES, Math.max(MIN_RADIUS_MILES, Math.round(numericRadius)));
}

/** Add distances and partition a location collection without losing unknown-coordinate records. */
export function classifyLocations(
  locations: readonly VotingLocation[],
  origin: GeoPoint,
  radiusMiles: number,
): LocationResults {
  const radius = normalizeRadius(radiusMiles);
  const inRadius: VotingLocation[] = [];
  const outsideRadius: VotingLocation[] = [];
  const missingCoordinates: VotingLocation[] = [];

  for (const location of locations) {
    if (!isValidGeoPoint(location.point)) {
      missingCoordinates.push(location);
      continue;
    }

    const distanceMiles = calculateDistance(origin, location.point);
    const located = { ...location, distanceMiles };
    if (distanceMiles <= radius) {
      inRadius.push(located);
    } else {
      outsideRadius.push(located);
    }
  }

  const byDistance = (left: VotingLocation, right: VotingLocation): number => {
    const distanceDifference = (left.distanceMiles ?? Number.POSITIVE_INFINITY) -
      (right.distanceMiles ?? Number.POSITIVE_INFINITY);
    return distanceDifference || left.id.localeCompare(right.id);
  };
  inRadius.sort(byDistance);
  outsideRadius.sort(byDistance);

  return { inRadius, outsideRadius, missingCoordinates };
}

/** Compose one user-oriented plan while retaining every provider record. */
export function buildVotingPlan(
  response: LookupResponse,
  radiusMiles: number = DEFAULT_RADIUS_MILES,
): VotingPlan {
  const radius = normalizeRadius(radiusMiles);
  return {
    election: response.election,
    warning: response.warning,
    radiusMiles: radius,
    pollingLocations: classifyLocations(response.pollingLocations, response.origin, radius),
    earlyVoteSites: classifyLocations(response.earlyVoteSites, response.origin, radius),
    dropOffLocations: classifyLocations(response.dropOffLocations, response.origin, radius),
    contests: response.contests,
    administration: response.administration,
  };
}
