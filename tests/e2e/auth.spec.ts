import { test, expect } from "@playwright/test";

test.describe("Auth flows", () => {
  test("login page loads and has required fields", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/mot de passe|password/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /se connecter|sign in/i })
    ).toBeVisible();
  });

  test("login form shows error with invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel(/email/i).fill("invalid@example.com");
    await page.getByLabel(/mot de passe|password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /se connecter|sign in/i }).click();

    // Should show an error message (not redirect)
    await expect(page).toHaveURL(/login/);
  });

  test("unauthenticated user is redirected to login from /dashboard", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/login/);
  });

  test("unauthenticated user is redirected to login from /admin", async ({
    page,
  }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/login/);
  });

  test("404 page displays for unknown route", async ({ page }) => {
    await page.goto("/route-qui-nexiste-pas");
    const status = page.locator("text=404");
    await expect(status).toBeVisible();
  });
});
