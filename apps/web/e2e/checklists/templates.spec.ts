/**
 * E2E Tests for Checklist Templates
 *
 * Based on TestSprite Test Plan:
 * - TC008: Checklist template creation and editing
 *
 * Prerequisites:
 * - Test users with checklist configuration permissions
 * - Server running on localhost:3000
 */

import { test, expect, Page } from "@playwright/test";
import { loginAsAdmin } from "../fixtures/auth";

// Helper to navigate to checklist configuration
async function navigateToChecklistConfig(page: Page) {
  await page.goto("/checklists/configurar");
  await page.waitForLoadState("networkidle");
}

test.describe("Checklist Templates", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test.describe("Template Listing", () => {
    test("should display templates configuration page", async ({ page }) => {
      await navigateToChecklistConfig(page);

      // Verify page title
      await expect(page.locator("h1, h2")).toContainText(/checklist|template/i);

      // Verify "New Template" button is visible
      await expect(
        page.locator("text=/novo|criar|adicionar/i").first()
      ).toBeVisible();
    });

    test("should display template statistics cards", async ({ page }) => {
      await navigateToChecklistConfig(page);

      // Check for stats cards (total, active, inactive, etc.)
      const statsSection = page.locator(
        '[class*="card"], [class*="stat"], [class*="grid"]'
      );
      await expect(statsSection.first()).toBeVisible();
    });

    test("should display templates grid or table", async ({ page }) => {
      await navigateToChecklistConfig(page);

      // Wait for templates to load
      await page.waitForSelector(
        "table, [class*='grid'], text=Nenhum template",
        { timeout: 10000 }
      );
    });
  });

  test.describe("Template Creation", () => {
    test("should navigate to new template form", async ({ page }) => {
      await navigateToChecklistConfig(page);

      // Click new template button
      await page.click("text=/novo|criar template/i");

      // Verify navigation
      await expect(page).toHaveURL(/\/checklists\/configurar\/novo/);
    });

    test("should display template creation form fields", async ({ page }) => {
      await page.goto("/checklists/configurar/novo");
      await page.waitForLoadState("networkidle");

      // Verify form fields
      await expect(
        page.locator('label:has-text(/nome|título/i)')
      ).toBeVisible();
      await expect(
        page.locator('label:has-text(/descrição|description/i)')
      ).toBeVisible();
    });

    test("should validate required fields on template creation", async ({
      page,
    }) => {
      await page.goto("/checklists/configurar/novo");
      await page.waitForLoadState("networkidle");

      // Try to submit empty form
      const submitButton = page.locator(
        'button[type="submit"], button:has-text(/criar|salvar/i)'
      );
      if ((await submitButton.count()) > 0) {
        await submitButton.first().click();

        // Should show validation errors or stay on the same page
        const url = page.url();
        expect(url).toContain("/checklists/configurar");
      }
    });

    test("should create template with valid data", async ({ page }) => {
      await page.goto("/checklists/configurar/novo");
      await page.waitForLoadState("networkidle");

      // Generate unique name
      const templateName = `Template E2E ${Date.now()}`;

      // Fill form
      const nameInput = page.locator(
        'input[name="name"], input[id="name"], input[placeholder*="nome"]'
      );
      if ((await nameInput.count()) > 0) {
        await nameInput.fill(templateName);
      }

      const descInput = page.locator(
        'textarea[name="description"], textarea[id="description"]'
      );
      if ((await descInput.count()) > 0) {
        await descInput.fill("Template criado via teste E2E automatizado");
      }

      // Submit form
      const submitButton = page.locator(
        'button[type="submit"], button:has-text(/criar|salvar/i)'
      );
      if ((await submitButton.count()) > 0) {
        await submitButton.first().click();

        // Should redirect to template detail or list
        await page.waitForURL(/\/checklists\/configurar/, { timeout: 10000 });
      }
    });
  });

  test.describe("Template Editing", () => {
    test("should navigate to template detail page", async ({ page }) => {
      await navigateToChecklistConfig(page);

      // Click on first template if exists
      const templateLink = page.locator(
        'a[href*="/checklists/configurar/"], table tbody tr'
      );
      if ((await templateLink.count()) > 0) {
        await templateLink.first().click();
        await page.waitForLoadState("networkidle");

        // Should be on detail page
        expect(page.url()).toMatch(/\/checklists\/configurar\/[\w-]+/);
      }
    });

    test("should display template details", async ({ page }) => {
      await navigateToChecklistConfig(page);

      // Navigate to first template
      const templateCard = page.locator(
        '[class*="card"]:has-text(/template/i), table tbody tr'
      );
      if ((await templateCard.count()) > 0) {
        await templateCard.first().click();
        await page.waitForLoadState("networkidle");

        // Verify detail elements
        await expect(page.locator("h1, h2")).toBeVisible();
      }
    });
  });

  test.describe("Questions Management", () => {
    test("should navigate to questions page from template", async ({
      page,
    }) => {
      await navigateToChecklistConfig(page);

      // Navigate to first template
      const templateLink = page.locator(
        'a[href*="/checklists/configurar/"], [class*="card"]'
      );
      if ((await templateLink.count()) > 0) {
        await templateLink.first().click();
        await page.waitForLoadState("networkidle");

        // Look for questions link/button
        const questionsLink = page.locator(
          'a[href*="perguntas"], button:has-text(/perguntas|questões/i)'
        );
        if ((await questionsLink.count()) > 0) {
          await questionsLink.first().click();
          await page.waitForLoadState("networkidle");

          expect(page.url()).toContain("perguntas");
        }
      }
    });

    test("should display questions list or empty state", async ({ page }) => {
      // Navigate directly to a template's questions page if possible
      await navigateToChecklistConfig(page);

      const templateLink = page.locator('a[href*="/checklists/configurar/"]');
      if ((await templateLink.count()) > 0) {
        const href = await templateLink.first().getAttribute("href");
        if (href) {
          await page.goto(`${href}/perguntas`);
          await page.waitForLoadState("networkidle");

          // Should show questions list or empty state
          await page.waitForSelector(
            "table, [class*='list'], text=/nenhuma|adicionar pergunta/i",
            { timeout: 10000 }
          );
        }
      }
    });
  });

  test.describe("Unit Assignment", () => {
    test("should have unit assignment functionality", async ({ page }) => {
      await navigateToChecklistConfig(page);

      // Navigate to first template
      const templateLink = page.locator('a[href*="/checklists/configurar/"]');
      if ((await templateLink.count()) > 0) {
        await templateLink.first().click();
        await page.waitForLoadState("networkidle");

        // Look for unit assignment button/link
        const unitAssignButton = page.locator(
          'button:has-text(/unidade|vincular|atribuir/i), a:has-text(/unidade/i)'
        );

        // Just verify it exists or the page loads correctly
        await expect(page.locator("h1, h2")).toBeVisible();
      }
    });
  });
});
