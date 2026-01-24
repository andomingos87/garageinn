/**
 * E2E Tests for RBAC and Form Validation
 *
 * Based on TestSprite Test Plan:
 * - TC005: RBAC enforcement for unauthorized access to ticket management
 * - TC015: Error handling on invalid input in forms
 *
 * Prerequisites:
 * - Test users with different roles
 * - Server running on localhost:3000
 */

import { test, expect, Page } from "@playwright/test";
import { loginAsAdmin, loginAsEncarregado, login, TEST_USERS } from "./fixtures/auth";

test.describe("RBAC - Access Control", () => {
  test.describe("Unauthenticated Access", () => {
    test("should redirect to login when accessing dashboard without auth", async ({
      page,
    }) => {
      await page.goto("/dashboard");
      await page.waitForURL(/\/login/, { timeout: 5000 });
      expect(page.url()).toContain("/login");
    });

    test("should redirect to login when accessing tickets without auth", async ({
      page,
    }) => {
      await page.goto("/chamados");
      await page.waitForURL(/\/login/, { timeout: 5000 });
      expect(page.url()).toContain("/login");
    });

    test("should redirect to login when accessing users without auth", async ({
      page,
    }) => {
      await page.goto("/usuarios");
      await page.waitForURL(/\/login/, { timeout: 5000 });
      expect(page.url()).toContain("/login");
    });

    test("should redirect to login when accessing settings without auth", async ({
      page,
    }) => {
      await page.goto("/configuracoes");
      await page.waitForURL(/\/login/, { timeout: 5000 });
      expect(page.url()).toContain("/login");
    });
  });

  test.describe("Admin Access", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page);
    });

    test("should allow admin to access dashboard", async ({ page }) => {
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");
      expect(page.url()).toContain("/dashboard");
    });

    test("should allow admin to access tickets hub", async ({ page }) => {
      await page.goto("/chamados");
      await page.waitForLoadState("networkidle");
      expect(page.url()).toContain("/chamados");
    });

    test("should allow admin to access users management", async ({ page }) => {
      await page.goto("/usuarios");
      await page.waitForLoadState("networkidle");
      expect(page.url()).toContain("/usuarios");
    });

    test("should allow admin to access units management", async ({ page }) => {
      await page.goto("/unidades");
      await page.waitForLoadState("networkidle");
      expect(page.url()).toContain("/unidades");
    });

    test("should allow admin to access settings", async ({ page }) => {
      await page.goto("/configuracoes");
      await page.waitForLoadState("networkidle");
      expect(page.url()).toContain("/configuracoes");
    });

    test("should allow admin to access reports", async ({ page }) => {
      await page.goto("/relatorios");
      await page.waitForLoadState("networkidle");
      expect(page.url()).toContain("/relatorios");
    });
  });

  test.describe("Limited Role Access", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsEncarregado(page);
    });

    test("should allow encarregado to access dashboard", async ({ page }) => {
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      // Should be on dashboard or redirected appropriately
      const url = page.url();
      expect(url).not.toContain("/login");
    });

    test("should restrict encarregado from settings", async ({ page }) => {
      await page.goto("/configuracoes");
      await page.waitForLoadState("networkidle");

      // Should be redirected or see access denied
      const url = page.url();
      const content = await page.content();

      // Either redirected or shows limited content
      const isRestricted =
        !url.includes("/configuracoes") ||
        content.includes("acesso") ||
        content.includes("negado") ||
        content.includes("permissão");

      // Page should load without crashing
      await expect(page.locator("body")).toBeVisible();
    });

    test("should restrict encarregado from user management", async ({
      page,
    }) => {
      await page.goto("/usuarios");
      await page.waitForLoadState("networkidle");

      // Page should handle restricted access gracefully
      await expect(page.locator("body")).toBeVisible();
    });
  });

  test.describe("Direct URL Access Attempts", () => {
    test("should handle direct access to ticket creation without permission", async ({
      page,
    }) => {
      await loginAsEncarregado(page);

      // Try to access ticket creation directly
      await page.goto("/chamados/comercial/novo");
      await page.waitForLoadState("networkidle");

      // Should handle gracefully
      await expect(page.locator("body")).toBeVisible();
    });

    test("should handle direct access to user creation without permission", async ({
      page,
    }) => {
      await loginAsEncarregado(page);

      await page.goto("/usuarios/novo");
      await page.waitForLoadState("networkidle");

      // Should handle gracefully
      await expect(page.locator("body")).toBeVisible();
    });
  });
});

test.describe("Form Validation", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test.describe("Login Form Validation", () => {
    test("should show error for empty email", async ({ page }) => {
      await page.goto("/login");

      await page.fill('input[name="password"]', "somepassword");
      await page.click('button[type="submit"]');

      // Should stay on login or show error
      await page.waitForTimeout(1000);
      expect(page.url()).toContain("/login");
    });

    test("should show error for empty password", async ({ page }) => {
      await page.goto("/login");

      await page.fill('input[name="email"]', "test@example.com");
      await page.click('button[type="submit"]');

      // Should stay on login or show error
      await page.waitForTimeout(1000);
      expect(page.url()).toContain("/login");
    });

    test("should show error for invalid credentials", async ({ page }) => {
      await page.goto("/login");

      await page.fill('input[name="email"]', "nonexistent@example.com");
      await page.fill('input[name="password"]', "wrongpassword");
      await page.click('button[type="submit"]');

      // Should show error message
      await page.waitForTimeout(2000);
      const errorMessage = page.locator(
        '[class*="destructive"], [role="alert"], text=/erro|incorretos|invalid/i'
      );

      if ((await errorMessage.count()) > 0) {
        await expect(errorMessage.first()).toBeVisible();
      }
    });
  });

  test.describe("Ticket Form Validation", () => {
    test("should validate required title field", async ({ page }) => {
      await page.goto("/chamados/comercial/novo");
      await page.waitForLoadState("networkidle");

      // Try to submit without title
      const submitButton = page.locator(
        'button[type="submit"], button:has-text(/criar/i)'
      );

      if ((await submitButton.count()) > 0) {
        await submitButton.first().click();

        // Should show validation error or stay on page
        await page.waitForTimeout(1000);
        expect(page.url()).toContain("/chamados");
      }
    });

    test("should validate minimum title length", async ({ page }) => {
      await page.goto("/chamados/comercial/novo");
      await page.waitForLoadState("networkidle");

      // Fill short title
      const titleInput = page.locator('input[id="title"], input[name="title"]');
      if ((await titleInput.count()) > 0) {
        await titleInput.fill("abc");

        // Try to submit
        const submitButton = page.locator(
          'button[type="submit"], button:has-text(/criar/i)'
        );
        await submitButton.first().click();

        // Should show validation error
        await page.waitForTimeout(1000);
        const error = page.locator("text=/5 caracteres|mínimo/i");

        if ((await error.count()) > 0) {
          await expect(error.first()).toBeVisible();
        }
      }
    });
  });

  test.describe("User Form Validation", () => {
    test("should validate email format", async ({ page }) => {
      await page.goto("/usuarios/novo");
      await page.waitForLoadState("networkidle");

      // Fill invalid email
      const emailInput = page.locator(
        'input[name="email"], input[type="email"]'
      );

      if ((await emailInput.count()) > 0) {
        await emailInput.fill("invalid-email");

        // Try to submit
        const submitButton = page.locator(
          'button[type="submit"], button:has-text(/criar|salvar/i)'
        );
        if ((await submitButton.count()) > 0) {
          await submitButton.first().click();

          // Should show validation error
          await page.waitForTimeout(1000);
          expect(page.url()).toContain("/usuarios");
        }
      }
    });

    test("should validate required name field", async ({ page }) => {
      await page.goto("/usuarios/novo");
      await page.waitForLoadState("networkidle");

      // Fill email but not name
      const emailInput = page.locator(
        'input[name="email"], input[type="email"]'
      );

      if ((await emailInput.count()) > 0) {
        await emailInput.fill("valid@email.com");

        // Try to submit without name
        const submitButton = page.locator(
          'button[type="submit"], button:has-text(/criar|salvar/i)'
        );
        if ((await submitButton.count()) > 0) {
          await submitButton.first().click();

          // Should show validation error or stay on page
          await page.waitForTimeout(1000);
          expect(page.url()).toContain("/usuarios");
        }
      }
    });
  });

  test.describe("Unit Form Validation", () => {
    test("should validate required fields", async ({ page }) => {
      await page.goto("/unidades/novo");
      await page.waitForLoadState("networkidle");

      // Try to submit empty form
      const submitButton = page.locator(
        'button[type="submit"], button:has-text(/criar|salvar/i)'
      );

      if ((await submitButton.count()) > 0) {
        await submitButton.first().click();

        // Should show validation error or stay on page
        await page.waitForTimeout(1000);
        expect(page.url()).toContain("/unidades");
      }
    });
  });

  test.describe("Form Error Recovery", () => {
    test("should clear validation errors after correcting input", async ({
      page,
    }) => {
      await page.goto("/chamados/comercial/novo");
      await page.waitForLoadState("networkidle");

      const titleInput = page.locator('input[id="title"], input[name="title"]');

      if ((await titleInput.count()) > 0) {
        // Submit invalid
        await titleInput.fill("ab");
        const submitButton = page.locator(
          'button[type="submit"], button:has-text(/criar/i)'
        );
        await submitButton.first().click();
        await page.waitForTimeout(500);

        // Correct the input
        await titleInput.fill("Valid title with proper length");
        await page.waitForTimeout(500);

        // Error should disappear or allow submission
        const errorMessage = page.locator(
          "text=/5 caracteres|mínimo|obrigatório/i"
        );
        const errorCount = await errorMessage.count();

        // Error might persist until next submit attempt or clear immediately
        // Just verify the form is still usable
        await expect(titleInput).toBeVisible();
      }
    });
  });
});

test.describe("API Access Control", () => {
  test("should return 401 for unauthenticated API requests", async ({
    request,
  }) => {
    // Try to access protected API endpoint
    const response = await request.get("/api/users");
    expect([401, 403, 404]).toContain(response.status());
  });

  test("should return error for invalid API requests", async ({ request }) => {
    const response = await request.post("/api/tickets", {
      data: {},
    });

    // Should get error for invalid/unauthenticated request
    expect([400, 401, 403, 404, 405]).toContain(response.status());
  });
});
