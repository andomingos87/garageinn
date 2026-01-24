/**
 * E2E Tests for Authentication - Password Recovery & Session
 *
 * Based on TestSprite Test Plan:
 * - TC003: Password recovery process
 * - TC004: Session persistence across browser reload
 *
 * Prerequisites:
 * - Test users created in the database
 * - Server running on localhost:3000
 */

import { test, expect } from "@playwright/test";
import { login, TEST_USERS } from "./fixtures/auth";

test.describe("Password Recovery", () => {
  test("should navigate to password recovery page from login", async ({
    page,
  }) => {
    await page.goto("/login");

    // Click "Forgot password" link
    await page.click('a[href="/recuperar-senha"]');

    // Verify navigation
    await expect(page).toHaveURL("/recuperar-senha");
    await expect(page.locator("h1, h2")).toContainText(/recuperar|senha/i);
  });

  test("should display password recovery form", async ({ page }) => {
    await page.goto("/recuperar-senha");

    // Verify form elements
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("should show success message after submitting recovery request", async ({
    page,
  }) => {
    await page.goto("/recuperar-senha");

    // Fill email
    await page.fill('input[name="email"]', TEST_USERS.admin.email);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for success message or confirmation
    await expect(
      page.locator(
        "text=/enviado|sucesso|email|verifique|instruções|redefinição/i"
      )
    ).toBeVisible({ timeout: 10000 });
  });

  test("should validate email format on recovery form", async ({ page }) => {
    await page.goto("/recuperar-senha");

    // Try invalid email
    await page.fill('input[name="email"]', "invalid-email");
    await page.click('button[type="submit"]');

    // Should show validation error or not submit
    const url = page.url();
    expect(url).toContain("/recuperar-senha");
  });
});

test.describe("Session Persistence", () => {
  test("should maintain session after page reload", async ({ page }) => {
    // Login first
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);

    // Verify logged in
    const dashboardUrl = page.url();
    expect(dashboardUrl).not.toContain("/login");

    // Reload page
    await page.reload();

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Should still be logged in (not redirected to login)
    const currentUrl = page.url();
    expect(currentUrl).not.toContain("/login");

    // Verify dashboard content is visible
    await expect(page.locator("text=/dashboard|início|chamados/i")).toBeVisible(
      { timeout: 5000 }
    );
  });

  test("should maintain session after navigating between pages", async ({
    page,
  }) => {
    // Login
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);

    // Navigate to different pages
    await page.goto("/chamados");
    await page.waitForLoadState("networkidle");
    expect(page.url()).not.toContain("/login");

    await page.goto("/usuarios");
    await page.waitForLoadState("networkidle");
    expect(page.url()).not.toContain("/login");

    await page.goto("/unidades");
    await page.waitForLoadState("networkidle");
    expect(page.url()).not.toContain("/login");

    // Go back to dashboard
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    expect(page.url()).not.toContain("/login");
  });

  test("should redirect to login when accessing protected route without session", async ({
    page,
  }) => {
    // Try to access protected route without logging in
    await page.goto("/dashboard");

    // Should redirect to login
    await page.waitForURL(/\/login/, { timeout: 5000 });
    expect(page.url()).toContain("/login");
  });
});

test.describe("Logout", () => {
  test("should logout successfully and redirect to login", async ({ page }) => {
    // Login first
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);

    // Find and click user menu/avatar
    const userMenu = page.locator(
      '[data-testid="user-menu"], button:has(img[alt*="avatar"]), [aria-label*="menu"]'
    );

    if ((await userMenu.count()) > 0) {
      await userMenu.first().click();

      // Click logout button
      await page.click("text=/sair|logout/i");

      // Should redirect to login
      await page.waitForURL(/\/login/, { timeout: 5000 });
      expect(page.url()).toContain("/login");
    }
  });

  test("should not access protected routes after logout", async ({ page }) => {
    // Login
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);

    // Navigate to dashboard
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Logout via user menu
    const userMenu = page.locator(
      '[data-testid="user-menu"], button:has(img[alt*="avatar"]), button:has-text("AS")'
    );

    if ((await userMenu.count()) > 0) {
      await userMenu.first().click();
      await page.click("text=/sair|logout/i");
      await page.waitForURL(/\/login/, { timeout: 5000 });
    }

    // Try to access protected route
    await page.goto("/dashboard");

    // Should redirect to login
    await page.waitForURL(/\/login/, { timeout: 5000 });
    expect(page.url()).toContain("/login");
  });
});
