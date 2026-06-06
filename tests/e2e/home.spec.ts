import { expect, test } from "@playwright/test";

test.describe("Home page", () => {
  test("loads without errors", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBeLessThan(400);
  });

  test("has a non-empty title", async ({ page }) => {
    await page.goto("/");
    const title = await page.title();
    expect(title).not.toBe("");
  });
});
