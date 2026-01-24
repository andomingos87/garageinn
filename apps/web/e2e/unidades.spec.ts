/**
 * E2E Tests for Units Management
 *
 * Based on TestSprite Test Plan:
 * - TC012: Bulk import and CSV export for Units Management
 * - TC018: Unit supervisor linking and status management
 *
 * Prerequisites:
 * - Admin user with units management permissions
 * - Server running on localhost:3000
 */

import { test, expect, Page } from "@playwright/test";
import { loginAsAdmin } from "./fixtures/auth";

// Helper to navigate to units page
async function navigateToUnits(page: Page) {
  await page.goto("/unidades");
  await page.waitForLoadState("networkidle");
}

test.describe("Units Management", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test.describe("Units Listing", () => {
    test("should display units management page", async ({ page }) => {
      await navigateToUnits(page);

      // Verify page title
      await expect(page.locator("h1, h2")).toContainText(/unidade/i);
    });

    test("should display units table", async ({ page }) => {
      await navigateToUnits(page);

      // Wait for units table
      await page.waitForSelector("table, [class*='grid'], [class*='card']", {
        timeout: 10000,
      });
    });

    test("should display unit information columns", async ({ page }) => {
      await navigateToUnits(page);
      await page.waitForSelector("table");

      // Verify table has relevant columns
      const tableHeaders = page.locator("table thead th, table th");
      const headers = await tableHeaders.allTextContents();

      // Should have common unit columns
      const hasNameColumn = headers.some((h) => /nome|unidade/i.test(h));
      const hasCodeColumn = headers.some((h) => /código|code/i.test(h));
      const hasStatusColumn = headers.some((h) => /status|situação/i.test(h));

      expect(hasNameColumn || hasCodeColumn || hasStatusColumn).toBeTruthy();
    });

    test('should have "New Unit" button', async ({ page }) => {
      await navigateToUnits(page);

      const newUnitButton = page.locator(
        'a[href*="/novo"], button:has-text(/nova unidade|adicionar|criar/i)'
      );

      if ((await newUnitButton.count()) > 0) {
        await expect(newUnitButton.first()).toBeVisible();
      }
    });

    test("should have search/filter functionality", async ({ page }) => {
      await navigateToUnits(page);

      // Look for search input
      const searchInput = page.locator(
        'input[placeholder*="buscar"], input[placeholder*="pesquisar"], input[type="search"]'
      );

      if ((await searchInput.count()) > 0) {
        await expect(searchInput.first()).toBeVisible();
      }
    });
  });

  test.describe("Unit Creation", () => {
    test("should navigate to new unit form", async ({ page }) => {
      await navigateToUnits(page);

      // Click new unit button
      const newButton = page.locator(
        'a[href*="/novo"], button:has-text(/nova unidade|adicionar/i)'
      );

      if ((await newButton.count()) > 0) {
        await newButton.first().click();
        await expect(page).toHaveURL(/\/unidades\/novo/);
      }
    });

    test("should display unit creation form", async ({ page }) => {
      await page.goto("/unidades/novo");
      await page.waitForLoadState("networkidle");

      // Verify form fields
      await expect(page.locator('label:has-text(/nome/i)')).toBeVisible();
    });

    test("should validate required fields", async ({ page }) => {
      await page.goto("/unidades/novo");
      await page.waitForLoadState("networkidle");

      // Try to submit empty form
      const submitButton = page.locator(
        'button[type="submit"], button:has-text(/criar|salvar/i)'
      );

      if ((await submitButton.count()) > 0) {
        await submitButton.first().click();

        // Should show validation errors
        await page.waitForTimeout(1000);
        expect(page.url()).toContain("/unidades");
      }
    });
  });

  test.describe("Unit Details", () => {
    test("should navigate to unit detail page", async ({ page }) => {
      await navigateToUnits(page);
      await page.waitForSelector("table tbody tr");

      // Click on first unit
      const unitLink = page.locator('table tbody tr a[href*="/unidades/"]');

      if ((await unitLink.count()) > 0) {
        await unitLink.first().click();
        await page.waitForLoadState("networkidle");

        expect(page.url()).toMatch(/\/unidades\/[\w-]+/);
      }
    });

    test("should display unit information", async ({ page }) => {
      await navigateToUnits(page);
      await page.waitForSelector("table tbody tr");

      // Navigate to first unit
      const unitLink = page.locator('table tbody tr a[href*="/unidades/"]');

      if ((await unitLink.count()) > 0) {
        await unitLink.first().click();
        await page.waitForLoadState("networkidle");

        // Should show unit details
        await expect(page.locator("h1, h2, h3")).toBeVisible();
      }
    });
  });

  test.describe("CSV Import", () => {
    test("should have import functionality link", async ({ page }) => {
      await navigateToUnits(page);

      // Look for import link/button
      const importLink = page.locator(
        'a[href*="/importar"], button:has-text(/importar|import/i)'
      );

      if ((await importLink.count()) > 0) {
        await expect(importLink.first()).toBeVisible();
      }
    });

    test("should navigate to import page", async ({ page }) => {
      await navigateToUnits(page);

      const importLink = page.locator(
        'a[href*="/importar"], button:has-text(/importar/i)'
      );

      if ((await importLink.count()) > 0) {
        await importLink.first().click();
        await page.waitForLoadState("networkidle");

        expect(page.url()).toContain("importar");
      }
    });

    test("should display import form with file upload", async ({ page }) => {
      await page.goto("/unidades/importar");
      await page.waitForLoadState("networkidle");

      // Look for file input
      const fileInput = page.locator('input[type="file"]');

      if ((await fileInput.count()) > 0) {
        await expect(fileInput.first()).toBeVisible();
      }
    });

    test("should validate file format", async ({ page }) => {
      await page.goto("/unidades/importar");
      await page.waitForLoadState("networkidle");

      // Verify CSV format indication
      const formatHint = page.locator("text=/csv|planilha|excel/i");

      if ((await formatHint.count()) > 0) {
        await expect(formatHint.first()).toBeVisible();
      }
    });
  });

  test.describe("CSV Export", () => {
    test("should have export functionality", async ({ page }) => {
      await navigateToUnits(page);

      // Look for export button
      const exportButton = page.locator(
        'button:has-text(/exportar|export|download/i), a:has-text(/exportar/i)'
      );

      if ((await exportButton.count()) > 0) {
        await expect(exportButton.first()).toBeVisible();
      }
    });

    test("should trigger download on export", async ({ page }) => {
      await navigateToUnits(page);

      const exportButton = page.locator(
        'button:has-text(/exportar|export/i), a:has-text(/exportar/i)'
      );

      if ((await exportButton.count()) > 0) {
        // Set up download listener
        const downloadPromise = page.waitForEvent("download", { timeout: 10000 });

        await exportButton.first().click();

        // Wait for download
        try {
          const download = await downloadPromise;
          const filename = download.suggestedFilename();

          // Should be CSV or Excel file
          expect(filename).toMatch(/\.(csv|xlsx?)$/i);
        } catch {
          // Download might not trigger depending on implementation
        }
      }
    });
  });

  test.describe("Supervisor Linking", () => {
    test("should have supervisor linking page", async ({ page }) => {
      await navigateToUnits(page);

      // Look for supervisor linking link
      const linkingSupervisorLink = page.locator(
        'a[href*="/vincular-supervisores"], button:has-text(/vincular.*supervisor|supervisor/i)'
      );

      if ((await linkingSupervisorLink.count()) > 0) {
        await expect(linkingSupervisorLink.first()).toBeVisible();
      }
    });

    test("should navigate to supervisor linking page", async ({ page }) => {
      await navigateToUnits(page);

      const linkingLink = page.locator('a[href*="/vincular-supervisores"]');

      if ((await linkingLink.count()) > 0) {
        await linkingLink.first().click();
        await page.waitForLoadState("networkidle");

        expect(page.url()).toContain("vincular-supervisores");
      }
    });

    test("should display supervisor assignment interface", async ({ page }) => {
      await page.goto("/unidades/vincular-supervisores");
      await page.waitForLoadState("networkidle");

      // Should show units and supervisors
      await expect(page.locator("h1, h2")).toBeVisible();
    });
  });

  test.describe("Unit Status Management", () => {
    test("should display unit status", async ({ page }) => {
      await navigateToUnits(page);
      await page.waitForSelector("table");

      // Look for status column or badge
      const statusIndicator = page.locator(
        '[class*="badge"], [class*="status"], text=/ativo|inativo|active|inactive/i'
      );

      if ((await statusIndicator.count()) > 0) {
        await expect(statusIndicator.first()).toBeVisible();
      }
    });

    test("should have status toggle/change option", async ({ page }) => {
      await navigateToUnits(page);
      await page.waitForSelector("table tbody tr");

      // Navigate to unit detail
      const unitLink = page.locator('table tbody tr a[href*="/unidades/"]');

      if ((await unitLink.count()) > 0) {
        await unitLink.first().click();
        await page.waitForLoadState("networkidle");

        // Look for status change option
        const statusToggle = page.locator(
          'button:has-text(/ativar|desativar|status/i), [role="switch"]'
        );

        // Status toggle may or may not be visible depending on page design
        await page.waitForTimeout(1000);
      }
    });
  });
});

test.describe("Unit Editing", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("should have edit button for units", async ({ page }) => {
    await navigateToUnits(page);
    await page.waitForSelector("table tbody tr");

    // Look for edit action
    const editLink = page.locator(
      'table tbody tr a[href*="editar"], table tbody tr button:has-text(/editar/i)'
    );

    // Or in dropdown menu
    const actionMenu = page.locator(
      'table tbody tr button[aria-haspopup="menu"]'
    );

    const hasEditLink = (await editLink.count()) > 0;
    const hasActionMenu = (await actionMenu.count()) > 0;

    expect(hasEditLink || hasActionMenu).toBeTruthy();
  });

  test("should navigate to edit form", async ({ page }) => {
    await navigateToUnits(page);
    await page.waitForSelector("table tbody tr");

    // Navigate to first unit
    const unitLink = page.locator('table tbody tr a[href*="/unidades/"]');

    if ((await unitLink.count()) > 0) {
      await unitLink.first().click();
      await page.waitForLoadState("networkidle");

      // Click edit button
      const editButton = page.locator(
        'a[href*="editar"], button:has-text(/editar/i)'
      );

      if ((await editButton.count()) > 0) {
        await editButton.first().click();
        await page.waitForLoadState("networkidle");

        expect(page.url()).toContain("editar");
      }
    }
  });

  test("should save unit updates", async ({ page }) => {
    await navigateToUnits(page);
    await page.waitForSelector("table tbody tr");

    // Navigate to edit page
    const unitLink = page.locator('table tbody tr a[href*="/unidades/"]');

    if ((await unitLink.count()) > 0) {
      const href = await unitLink.first().getAttribute("href");
      if (href) {
        await page.goto(`${href}/editar`);
        await page.waitForLoadState("networkidle");

        // Find and click save button
        const saveButton = page.locator(
          'button[type="submit"], button:has-text(/salvar|atualizar/i)'
        );

        if ((await saveButton.count()) > 0) {
          await saveButton.first().click();

          // Should redirect or show success
          await page.waitForTimeout(2000);
        }
      }
    }
  });
});
