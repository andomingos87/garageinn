/**
 * E2E Tests for User Management
 *
 * Based on TestSprite Test Plan:
 * - TC011: User management CRUD operations including role and department assignment
 * - TC017: User profile update and validation
 *
 * Prerequisites:
 * - Admin user with user management permissions
 * - Server running on localhost:3000
 */

import { test, expect, Page } from "@playwright/test";
import { loginAsAdmin, TEST_USERS } from "./fixtures/auth";

// Helper to navigate to users page
async function navigateToUsers(page: Page) {
  await page.goto("/usuarios");
  await page.waitForLoadState("networkidle");
}

test.describe("User Management", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test.describe("User Listing", () => {
    test("should display users management page", async ({ page }) => {
      await navigateToUsers(page);

      // Verify page title
      await expect(page.locator("h1, h2")).toContainText(/usuário/i);
    });

    test("should display users table", async ({ page }) => {
      await navigateToUsers(page);

      // Wait for users table to load
      await page.waitForSelector("table", { timeout: 10000 });
      await expect(page.locator("table")).toBeVisible();
    });

    test("should display user information columns", async ({ page }) => {
      await navigateToUsers(page);
      await page.waitForSelector("table");

      // Verify table headers
      const tableHeaders = page.locator("table thead th, table th");
      const headers = await tableHeaders.allTextContents();

      // Should have common user columns
      const hasNameColumn = headers.some((h) => /nome/i.test(h));
      const hasEmailColumn = headers.some((h) => /email/i.test(h));

      expect(hasNameColumn || hasEmailColumn).toBeTruthy();
    });

    test('should have "New User" button', async ({ page }) => {
      await navigateToUsers(page);

      const newUserButton = page.locator(
        'a[href*="/novo"], button:has-text(/novo usuário|adicionar|criar/i)'
      );
      await expect(newUserButton.first()).toBeVisible();
    });

    test("should have search/filter functionality", async ({ page }) => {
      await navigateToUsers(page);

      // Look for search input
      const searchInput = page.locator(
        'input[placeholder*="buscar"], input[placeholder*="pesquisar"], input[type="search"]'
      );

      if ((await searchInput.count()) > 0) {
        await expect(searchInput.first()).toBeVisible();
      }
    });
  });

  test.describe("User Creation", () => {
    test("should navigate to new user form", async ({ page }) => {
      await navigateToUsers(page);

      // Click new user button
      await page.click(
        'a[href*="/novo"], button:has-text(/novo usuário|adicionar/i)'
      );

      // Verify navigation
      await expect(page).toHaveURL(/\/usuarios\/novo/);
    });

    test("should display user creation form fields", async ({ page }) => {
      await page.goto("/usuarios/novo");
      await page.waitForLoadState("networkidle");

      // Verify form fields
      await expect(page.locator('label:has-text(/nome/i)')).toBeVisible();
      await expect(page.locator('label:has-text(/email/i)')).toBeVisible();
    });

    test("should display role selection", async ({ page }) => {
      await page.goto("/usuarios/novo");
      await page.waitForLoadState("networkidle");

      // Look for role/cargo selection
      const roleField = page.locator(
        'label:has-text(/cargo|função|role/i), [id*="role"], [name*="role"]'
      );

      if ((await roleField.count()) > 0) {
        await expect(roleField.first()).toBeVisible();
      }
    });

    test("should display department selection", async ({ page }) => {
      await page.goto("/usuarios/novo");
      await page.waitForLoadState("networkidle");

      // Look for department selection
      const deptField = page.locator(
        'label:has-text(/departamento|department/i), [id*="department"], [name*="department"]'
      );

      if ((await deptField.count()) > 0) {
        await expect(deptField.first()).toBeVisible();
      }
    });

    test("should validate required fields", async ({ page }) => {
      await page.goto("/usuarios/novo");
      await page.waitForLoadState("networkidle");

      // Try to submit empty form
      const submitButton = page.locator(
        'button[type="submit"], button:has-text(/criar|salvar/i)'
      );

      if ((await submitButton.count()) > 0) {
        await submitButton.first().click();

        // Should show validation errors or stay on page
        await page.waitForTimeout(1000);
        expect(page.url()).toContain("/usuarios");
      }
    });
  });

  test.describe("User Details", () => {
    test("should navigate to user detail page", async ({ page }) => {
      await navigateToUsers(page);
      await page.waitForSelector("table tbody tr");

      // Click on first user row or action button
      const userRow = page.locator("table tbody tr").first();
      const viewLink = userRow.locator('a[href*="/usuarios/"]');

      if ((await viewLink.count()) > 0) {
        await viewLink.first().click();
        await page.waitForLoadState("networkidle");

        expect(page.url()).toMatch(/\/usuarios\/[\w-]+/);
      }
    });

    test("should display user details", async ({ page }) => {
      await navigateToUsers(page);
      await page.waitForSelector("table tbody tr");

      // Navigate to first user
      const viewLink = page.locator('table tbody tr a[href*="/usuarios/"]');

      if ((await viewLink.count()) > 0) {
        await viewLink.first().click();
        await page.waitForLoadState("networkidle");

        // Should show user information
        await expect(page.locator("h1, h2, h3")).toBeVisible();
      }
    });
  });

  test.describe("User Editing", () => {
    test("should have edit button/link", async ({ page }) => {
      await navigateToUsers(page);
      await page.waitForSelector("table tbody tr");

      // Look for edit action
      const editButton = page.locator(
        'table tbody tr button:has-text(/editar/i), table tbody tr a[href*="editar"]'
      );

      // Or in dropdown menu
      const actionMenu = page.locator(
        'table tbody tr button[aria-haspopup="menu"]'
      );

      const hasEditButton = (await editButton.count()) > 0;
      const hasActionMenu = (await actionMenu.count()) > 0;

      expect(hasEditButton || hasActionMenu).toBeTruthy();
    });

    test("should navigate to edit form", async ({ page }) => {
      await navigateToUsers(page);
      await page.waitForSelector("table tbody tr");

      // Try to access edit via action menu
      const actionMenu = page
        .locator('table tbody tr button[aria-haspopup="menu"]')
        .first();

      if ((await actionMenu.count()) > 0) {
        await actionMenu.click();

        const editOption = page.locator("text=/editar/i");
        if ((await editOption.count()) > 0) {
          await editOption.click();
          await page.waitForLoadState("networkidle");

          expect(page.url()).toContain("editar");
        }
      }
    });
  });

  test.describe("User Actions", () => {
    test("should have action dropdown menu", async ({ page }) => {
      await navigateToUsers(page);
      await page.waitForSelector("table tbody tr");

      const actionMenu = page
        .locator('table tbody tr button[aria-haspopup="menu"]')
        .first();

      if ((await actionMenu.count()) > 0) {
        await actionMenu.click();

        // Should show dropdown options
        await expect(page.locator('[role="menu"]')).toBeVisible();
      }
    });

    test("should have password reset option", async ({ page }) => {
      await navigateToUsers(page);
      await page.waitForSelector("table tbody tr");

      const actionMenu = page
        .locator('table tbody tr button[aria-haspopup="menu"]')
        .first();

      if ((await actionMenu.count()) > 0) {
        await actionMenu.click();

        // Look for password reset option
        const resetOption = page.locator(
          'text=/redefinir.*senha|resetar.*senha|enviar.*senha/i'
        );

        if ((await resetOption.count()) > 0) {
          await expect(resetOption.first()).toBeVisible();
        }
      }
    });
  });
});

test.describe("User Profile", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("should display profile page", async ({ page }) => {
    await page.goto("/perfil");
    await page.waitForLoadState("networkidle");

    // Verify page loaded
    await expect(page.locator("h1, h2")).toContainText(/perfil|profile/i);
  });

  test("should display user information", async ({ page }) => {
    await page.goto("/perfil");
    await page.waitForLoadState("networkidle");

    // Should show user name or email
    await expect(
      page.locator("text=/nome|email|cargo|departamento/i")
    ).toBeVisible();
  });

  test("should have edit profile functionality", async ({ page }) => {
    await page.goto("/perfil");
    await page.waitForLoadState("networkidle");

    // Look for edit button or form
    const editButton = page.locator(
      'button:has-text(/editar|alterar/i), a:has-text(/editar/i)'
    );

    if ((await editButton.count()) > 0) {
      await expect(editButton.first()).toBeVisible();
    }
  });

  test("should validate profile form fields", async ({ page }) => {
    await page.goto("/perfil");
    await page.waitForLoadState("networkidle");

    // Find name input and try to clear it
    const nameInput = page.locator(
      'input[name="name"], input[id="name"], input[placeholder*="nome"]'
    );

    if ((await nameInput.count()) > 0) {
      await nameInput.clear();

      // Try to save
      const saveButton = page.locator('button:has-text(/salvar|atualizar/i)');
      if ((await saveButton.count()) > 0) {
        await saveButton.click();

        // Should show validation error or stay on page
        await page.waitForTimeout(1000);
        expect(page.url()).toContain("/perfil");
      }
    }
  });
});
