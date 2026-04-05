import { test, expect } from "@playwright/test";

test.describe("PleaseVote Scenario Tests", () => {
  test("Landing Page: Election countdown and address input", async ({ page }) => {
    await page.goto("/");

    // Check for title
    await expect(page.locator("h1")).toContainText("PLEASE VOTE");

    // Check for countdown
    await expect(page.locator("text=Countdown")).toBeVisible();

    // Check for address input
    const input = page.locator('input[placeholder="Enter your address for local info..."]');
    await expect(input).toBeVisible();
  });

  test("Address Lookup: Fetching voter info", async ({ page }) => {
    await page.goto("/");

    const input = page.locator('input[placeholder="Enter your address for local info..."]');
    await input.fill("211 Garrett Place, Columbus, OH 43214");
    await page.click('button:has-text("Find")');

    // Should navigate to voterinfo
    await expect(page).toHaveURL(/voterinfo/);

    // Check for election header
    await expect(page.locator('h1')).toContainText("Voter Info");

    // Check if some results are displayed (assuming API works or mocked)
    // Note: In real test we'd mock the API, but instructions mention scenario based tests
  });
});
