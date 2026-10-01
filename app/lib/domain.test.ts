import { describe, expect, it } from "vitest";
import {
  buildVotingPlan,
  calculateDistance,
  classifyLocations,
  DEFAULT_RADIUS_MILES,
  normalizeRadius,
} from "./domain";
import type { LookupResponse, VotingLocation } from "./types";

const source = [{ name: "Fixture source", official: true }];

function location(id: string, point?: { latitude: number; longitude: number }): VotingLocation {
  return { id, kind: "polling", address: { line1: id }, point, sources: source };
}

function response(overrides: Partial<LookupResponse> = {}): LookupResponse {
  return {
    address: "1 Main St",
    normalizedAddress: { line1: "1 Main St", city: "Testville", state: "TS", zip: "00000" },
    origin: { latitude: 0, longitude: 0 },
    election: { id: "2000", name: "VIP Test Election", electionDay: "2031-12-06" },
    mode: "test-fixture",
    warning: "Fixture only",
    pollingLocations: [],
    earlyVoteSites: [],
    dropOffLocations: [],
    contests: [],
    administration: [],
    otherElections: [],
    sources: source,
    retrieval: { civicEndpoint: "voterinfo", fallbackUsed: true, retrievedAt: "2031-01-01T00:00:00Z" },
    ...overrides,
  };
}

describe("normalizeRadius", () => {
  it.each([
    [undefined, DEFAULT_RADIUS_MILES],
    [null, DEFAULT_RADIUS_MILES],
    ["", DEFAULT_RADIUS_MILES],
    ["not-a-number", DEFAULT_RADIUS_MILES],
    [1, 5],
    [5, 5],
    [25.4, 25],
    [50, 50],
    [100, 50],
  ])("normalizes %s to %s", (input, expected) => {
    expect(normalizeRadius(input)).toBe(expected);
  });
});

describe("calculateDistance", () => {
  it("returns zero for identical coordinates", () => {
    expect(calculateDistance({ latitude: 40, longitude: -83 }, { latitude: 40, longitude: -83 })).toBe(0);
  });

  it("calculates a known one-degree longitude distance near the equator", () => {
    expect(calculateDistance({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 1 })).toBeCloseTo(69.09, 1);
  });

  it("keeps antipodal distances finite", () => {
    expect(calculateDistance({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 180 })).toBeCloseTo(12_436.8, 0);
  });

  it("rejects invalid coordinates", () => {
    expect(() => calculateDistance({ latitude: 91, longitude: 0 }, { latitude: 0, longitude: 0 })).toThrow(RangeError);
  });
});

describe("classifyLocations", () => {
  it("sorts nearby records, partitions distant records, and retains unknown coordinates", () => {
    const results = classifyLocations([
      location("near", { latitude: 0, longitude: 0.01 }),
      location("nearer", { latitude: 0, longitude: 0.005 }),
      location("far", { latitude: 0, longitude: 1 }),
      location("farther", { latitude: 0, longitude: 2 }),
      location("unknown"),
    ], { latitude: 0, longitude: 0 }, 5);

    expect(results.inRadius.map((item) => item.id)).toEqual(["nearer", "near"]);
    expect(results.outsideRadius.map((item) => item.id)).toEqual(["far", "farther"]);
    expect(results.missingCoordinates.map((item) => item.id)).toEqual(["unknown"]);
    expect(results.inRadius[0]?.distanceMiles).toBeCloseTo(0.35, 1);
  });

  it("does not treat zero coordinates as missing", () => {
    const results = classifyLocations([location("equator", { latitude: 0, longitude: 0 })], { latitude: 0, longitude: 0 }, 5);
    expect(results.inRadius).toHaveLength(1);
    expect(results.missingCoordinates).toHaveLength(0);
  });

  it("orders equal-distance records by stable id", () => {
    const results = classifyLocations([
      location("z", { latitude: 0, longitude: 0 }),
      location("a", { latitude: 0, longitude: 0 }),
    ], { latitude: 0, longitude: 0 }, 5);

    expect(results.inRadius.map((item) => item.id)).toEqual(["a", "z"]);
  });
});

describe("buildVotingPlan", () => {
  it("filters only locations and preserves contests and administration", () => {
    const plan = buildVotingPlan(response({
      pollingLocations: [location("near", { latitude: 0, longitude: 0.01 })],
      contests: [{ id: "contest", type: "General", candidates: [], sources: source }],
      administration: [{ name: "Election office", sources: source }],
    }));

    expect(plan.radiusMiles).toBe(DEFAULT_RADIUS_MILES);
    expect(plan.pollingLocations.inRadius).toHaveLength(1);
    expect(plan.contests).toHaveLength(1);
    expect(plan.administration).toHaveLength(1);
    expect(plan.warning).toBe("Fixture only");
  });
});
