import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("accessibility smoke tests", () => {
  test("landing page has no automated axe violations", async ({ page }) => {
    await page.route("**/api/v1/elections", (route) => route.fulfill({ json: { elections: [], retrievedAt: "now" } }));
    await page.goto("/");
    await page.getByRole("heading", { name: /Know where/ }).waitFor();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("keyboard users can reach the address workflow and theme control", async ({ page }) => {
    await page.route("**/api/v1/elections", (route) => route.fulfill({ json: { elections: [], retrievedAt: "now" } }));
    await page.goto("/");
    await page.getByRole("heading", { name: /Know where/ }).waitFor();
    const skipLink = page.locator(".skip-link");
    await skipLink.focus();
    await expect(skipLink).toBeFocused();
    await page.keyboard.press("Tab");
    const nextFocusedTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(["A", "SELECT"]).toContain(nextFocusedTag);
    await page.getByLabel("Your address").focus();
    await expect(page.getByLabel("Your address")).toBeFocused();
    await expect(page.getByRole("combobox", { name: "Color theme" })).toBeVisible();
  });
});
