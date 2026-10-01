import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiRequestError, fetchDiscovery, fetchElections, fetchVoterInfo } from "./api";

describe("browser API client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("requests elections from the same-origin API", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ elections: [], retrievedAt: "now" }), { status: 200 }));
    await expect(fetchElections()).resolves.toEqual({ elections: [], retrievedAt: "now" });
    expect(fetchMock).toHaveBeenCalledWith("/api/v1/elections", { headers: { Accept: "application/json" }, signal: undefined });
  });

  it("encodes the address and optional election id", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ address: "x", origin: { latitude: 1, longitude: 2 }, election: { id: "2000", name: "Test", electionDay: "2031-12-06" } }), { status: 200 }));
    await fetchVoterInfo("123 Main St, Columbus, OH", "2000");
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/v1/lookup?address=123+Main+St%2C+Columbus%2C+OH&electionId=2000", expect.anything());
  });

  it("supports discovery requests", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ warning: "verify", origin: { latitude: 1, longitude: 2 }, election: { id: "2000", name: "Test", electionDay: "2031-12-06" } }), { status: 200 }));
    await fetchDiscovery("City Hall");
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/v1/discovery?address=City+Hall", expect.anything());
  });

  it("raises the stable API error envelope", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ ok: false, error: { code: "NO_DATA", message: "No information", requestId: "req-1" } }), { status: 404 }));
    const error = await fetchVoterInfo("unknown").catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(ApiRequestError);
    expect(error).toMatchObject({ code: "NO_DATA", requestId: "req-1", message: "No information" });
  });

  it("falls back to a generic error for an invalid error body", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("not json", { status: 502, statusText: "Bad Gateway" }));
    await expect(fetchElections()).rejects.toThrow("The voter-information service returned 502.");
  });

  it("normalizes a complete sparse Civic projection without dropping useful nodes", async () => {
    const payload = {
      address: "Submitted address",
      normalizedAddress: { formatted: "Normalized address", line1: "1 Main St", addressLine: ["1 Main St", 4], city: "Testville", state: "TS", zip: "00000" },
      origin: { latitude: 0, longitude: 0 },
      election: { id: "2000", name: "VIP Test Election", electionDay: "2031-12-06", ocdDivisionId: "ocd-1" },
      mode: "test-fixture",
      warning: "Test only",
      pollingLocations: [
        { id: "poll-1", address: { locationName: "Named", line1: "1 Main St", line2: "Suite 2", line3: "Floor 3", city: "Testville", state: "TS", zip: "00000", addressLine: ["1 Main St"] }, pollingHours: "8-8", voterServices: "Accessible voting", notes: "Accessible", startDate: "2031-12-06", endDate: "2031-12-06", latitude: 0, longitude: 0, distanceMiles: 1, sources: [{ name: "VIP", official: true }, { official: false }] },
        { name: "Legacy name", address: {}, point: { latitude: 1, longitude: 2 }, sources: [] },
      ],
      earlyVoteSites: [{ address: { line1: "Early" }, point: { latitude: 3, longitude: 4 }, sources: [{ name: "Office", official: false }] }],
      dropOffLocations: [{ address: { line1: "Drop off" }, latitude: 5, longitude: 6, sources: [] }],
      contests: [
        { id: "contest-1", type: "General", office: "Mayor", level: ["local", 4], roles: ["executive"], district: { name: "City", scope: "city", id: "1" }, candidates: [{ name: "Ada", party: "Independent", candidateUrl: "https://example.test/ada", phone: "555", photoUrl: "https://example.test/a.png", email: "a@example.test", orderOnBallot: 1, channels: [{ type: "web", id: "ada" }, {}] }], sources: [{ name: "VIP", official: true }] },
        { referendumTitle: "Question", referendumText: "Question text", referendumUrl: "https://example.test/q", sources: [] },
      ],
      administration: [
        { name: "State", electionAdministrationBody: { name: "Office", electionInfoUrl: "https://example.test/info", electionRegistrationUrl: "https://example.test/register", electionRegistrationConfirmationUrl: "https://example.test/confirm", votingLocationFinderUrl: "https://example.test/find", ballotInfoUrl: "https://example.test/ballot", electionRulesUrl: "https://example.test/rules", voterServices: ["registration"], hoursOfOperation: "Weekdays", physicalAddress: { line1: "Physical office" }, electionOfficials: [{ name: "Director", title: "Clerk" }], correspondenceAddress: { line1: "Office address" } }, local_jurisdiction: { name: "County", sources: [{ name: "County", official: true }] }, sources: [{ name: "State", official: true }] },
        { name: "Direct", electionInfoUrl: "https://example.test/direct", correspondenceAddress: {}, sources: [] },
      ],
      otherElections: [{ id: "3000", name: "Other", electionDay: "2032-01-01" }, {}],
      sources: [{ name: "VIP", official: true }],
      retrieval: { apiVersion: "v1", requestId: "req", retrievedAt: "2031-01-01T00:00:00Z", provider: "google", electionId: "2000", dataSource: "test-fixture", providerStatus: "partial" },
      mailOnly: true,
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(payload), { status: 200 }));

    const result = await fetchVoterInfo("Submitted address", "2000");
    expect(result).toMatchObject({ mode: "test-fixture", mailOnly: true, origin: { latitude: 0, longitude: 0 }, retrieval: { fallbackUsed: true, requestId: "req", dataSource: "test-fixture", providerStatus: "partial" } });
    expect(result.pollingLocations[0]).toMatchObject({ id: "poll-1", kind: "polling", voterServices: "Accessible voting", point: { latitude: 0, longitude: 0 }, distanceMiles: 1 });
    expect(result.pollingLocations[1].address.locationName).toBe("Legacy name");
    expect(result.earlyVoteSites[0].kind).toBe("early-vote");
    expect(result.dropOffLocations[0].kind).toBe("drop-off");
    expect(result.contests[0].candidates[0]?.candidateUrl).toContain("ada");
    expect(result.contests[1].referendumSubtitle).toBe("Question text");
    expect(result.administration[0].electionRegistrationUrl).toContain("register");
    expect(result.administration[0].voterServices).toEqual(["registration"]);
    expect(result.administration[0].electionOfficials?.[0]?.name).toBe("Director");
    expect(result.administration[1].name).toBe("Direct");
    expect(result.otherElections[1]?.name).toBe("Election");
  });

  it("normalizes election metadata from the server retrieval envelope", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ elections: [{ id: "2000", name: "Test", electionDay: "2031-12-06" }, {}], retrieval: { retrievedAt: "now" } }), { status: 200 }));
    await expect(fetchElections()).resolves.toEqual({ elections: [{ id: "2000", name: "Test", electionDay: "2031-12-06", ocdDivisionId: undefined }, { id: "unknown", name: "Election", electionDay: "", ocdDivisionId: undefined }], retrievedAt: "now" });
  });

  it("distinguishes discovery jurisdiction states and uses its safe warning", async () => {
    const response = { origin: { latitude: 1, longitude: 1 }, election: { id: "2000", name: "Test", electionDay: "2031-12-06" }, warning: "Verify eligibility.", jurisdictionComparison: "different-broad-jurisdiction", pollingLocations: [{ address: { line1: "Place" }, point: { latitude: 1, longitude: 1 }, sources: [] }] };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(response), { status: 200 }));
    const result = await fetchDiscovery("Other place", "2000");
    expect(result.jurisdictionComparison).toBe("different-broad-jurisdiction");
    expect(result.warning).toBe("Verify eligibility.");
    expect(result.mode).toBe("live");
  });

  it("rejects a successful response with an invalid geocoded origin", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ origin: { latitude: "not-a-number", longitude: 0 } }), { status: 200 }));
    await expect(fetchVoterInfo("bad")).rejects.toThrow("no valid origin coordinates");
  });

  it("does not mistake a non-error object for the API error envelope", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 503 }));
    await expect(fetchElections()).rejects.toThrow("returned 503");
  });
});
