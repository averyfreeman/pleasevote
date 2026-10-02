import { expect, test, type Page } from "@playwright/test";

const fixture = {
  elections: [{ id: "2000", name: "VIP Test Election", electionDay: "2031-12-06" }],
  retrievedAt: "2031-01-01T00:00:00Z",
};

const lookup = {
  address: "211 Garrett Place, Columbus, OH 43214",
  normalizedAddress: { formatted: "211 Garrett Place, Columbus, OH 43214", line1: "211 Garrett Place", city: "Columbus", state: "OH", zip: "43214" },
  origin: { latitude: 40.054, longitude: -83.022 },
  election: fixture.elections[0],
  mode: "test-fixture",
  warning: "Fixture data only.",
  pollingLocations: [{ id: "poll-1", kind: "polling", address: { locationName: "Community Center", line1: "1 Main St", city: "Columbus", state: "OH", zip: "43214" }, pollingHours: "Tue, Dec 6: 6:30 am - 7:30 pm", voterServices: "Accessible voting and same-day registration", point: { latitude: 40.055, longitude: -83.023 }, sources: [{ name: "Voting Information Project", official: true }] }],
  earlyVoteSites: [{ id: "early-1", kind: "early-vote", address: { locationName: "Early Vote Center", line1: "2 Main St", city: "Columbus", state: "OH", zip: "43214" }, pollingHours: "Weekdays: 8 am - 5 pm", voterServices: "In-person early voting", point: { latitude: 40.056, longitude: -83.024 }, sources: [{ name: "Voting Information Project", official: true }] }],
  dropOffLocations: [{ id: "drop-1", kind: "drop-off", address: { locationName: "Ballot Drop Box", line1: "3 Main St", city: "Columbus", state: "OH", zip: "43214" }, pollingHours: "Daily: 8 am - 5 pm", voterServices: "Completed ballots only", sources: [{ name: "Voting Information Project", official: true }] }],
  contests: [{ id: "contest-1", type: "General", office: "Mayor", candidates: [{ name: "Ada Lovelace", party: "Independent" }], sources: [{ name: "Voting Information Project", official: true }] }],
  administration: [{ name: "Secretary of State", electionInfoUrl: "https://example.test/elections", sources: [{ name: "Voting Information Project", official: true }] }],
  otherElections: [],
  sources: [{ name: "Voting Information Project", official: true }],
  mailOnly: true,
  retrieval: { civicEndpoint: "voterinfo", fallbackUsed: true, retrievedAt: "2031-01-01T00:00:00Z" },
};

async function mockCivicApi(page: Page): Promise<void> {
  await page.route("**/api/v1/elections", (route) => route.fulfill({ json: fixture }));
  await page.route("**/api/v1/lookup**", (route) => route.fulfill({ json: lookup }));
  await page.route("**/api/v1/discovery**", (route) => route.fulfill({ json: { ...lookup, warning: "Discovery does not establish eligibility.", jurisdictionComparison: "unknown" } }));
}

test.describe("PleaseVote scenario tests", () => {
  test("Landing: countdown renders and address input is interactive", async ({ page }) => {
    await mockCivicApi(page);
    await page.goto("/");

    await expect(page.locator("h1")).toContainText("Find the details");
    await expect(page.getByText(/countdown/i)).toBeVisible();
    await expect(page.getByText(/Election information may not be available yet/)).toBeVisible();
    const input = page.getByLabel("Your address");
    await expect(input).toBeVisible();
    await expect(input).toBeEditable();
  });

  test("Address lookup: the UI calls the local API and renders VIP data", async ({ page }) => {
    let lookupRequested = false;
    await page.route("**/api/v1/elections", (route) => route.fulfill({ json: fixture }));
    await page.route("**/api/v1/lookup**", async (route) => {
      lookupRequested = true;
      await route.fulfill({ json: lookup });
    });

    await page.goto("/");
    await page.getByLabel("Your address").fill("211 Garrett Place, Columbus, OH 43214");
    await page.getByRole("button", { name: "Find my information" }).click();

    await expect(page).toHaveURL(/voterinfo/);
    await expect(page.getByRole("heading", { name: "VIP Test Election", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Community Center", exact: true })).toBeVisible();
    await expect(page.getByText("Sample fixture — not a current election")).toBeVisible();
    await expect(page.getByText("Civic marks this election as mail-only.")).toBeVisible();
    await expect(page.getByText("Accessible voting and same-day registration")).toBeVisible();
    expect(lookupRequested).toBe(true);
  });

  test("No-data locations keep the persistent official link without repeating it", async ({ page }) => {
    await page.route("**/api/v1/elections", (route) => route.fulfill({ json: fixture }));
    await page.route("**/api/v1/lookup**", (route) => route.fulfill({ json: { ...lookup, pollingLocations: [], earlyVoteSites: [], dropOffLocations: [] } }));

    await page.goto("/voterinfo?address=211%20Garrett%20Place%2C%20Columbus%2C%20OH%2043214");

    await expect(page.getByText("No election-day locations are within this distance.")).toBeVisible();
    await expect(page.getByText("Not finding what you need?")).toHaveCount(0);
    await expect(page.locator('a[href="https://vote.gov"]')).toHaveCount(1);
  });

  test("Contest navigation: candidate details are disaggregated from the list", async ({ page }) => {
    await mockCivicApi(page);
    await page.goto("/voterinfo?address=211%20Garrett%20Place%2C%20Columbus%2C%20OH%2043214");
    await expect(page.getByRole("heading", { name: "Contests, candidates, and questions" })).toBeVisible();
    await page.getByText("Mayor", { exact: true }).click();
    await expect(page.getByText("Ada Lovelace")).toBeVisible();
  });

  test("Radius and discovery: distance is a convenience and eligibility stays explicit", async ({ page }) => {
    let lookupRequests = 0;
    await page.route("**/api/v1/elections", (route) => route.fulfill({ json: fixture }));
    await page.route("**/api/v1/lookup**", async (route) => {
      lookupRequests += 1;
      await route.fulfill({ json: lookup });
    });
    await page.route("**/api/v1/discovery**", (route) => route.fulfill({ json: { ...lookup, warning: "Discovery does not establish eligibility.", jurisdictionComparison: "unknown" } }));
    await page.goto("/voterinfo?address=211%20Garrett%20Place%2C%20Columbus%2C%20OH%2043214");

    await page.getByLabel("Distance").fill("5");
    await page.getByRole("button", { name: "Update" }).click();
    await expect(page.getByText("Showing places within 5 miles.")).toBeVisible();
    expect(lookupRequests).toBe(1);

    await page.getByLabel("Another place").fill("Columbus City Hall");
    await page.getByRole("button", { name: "Check this place" }).click();
    await expect(page.getByText("Discovery does not establish eligibility.")).toBeVisible();
    await expect(page.getByText("This is a distance convenience, not an eligibility decision.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Community Center", exact: true }).first()).toBeVisible();
  });
});
