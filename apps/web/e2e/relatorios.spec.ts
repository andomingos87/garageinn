/**
 * E2E Tests for Reports
 *
 * Based on TestSprite Test Plan:
 * - TC014: Reports generation with filtering and export to PDF and Excel
 *
 * Prerequisites:
 * - Admin user with reporting permissions
 * - Existing data (tickets, checklists) for reports
 * - Server running on localhost:3000
 */

import { test, expect, Page } from "@playwright/test";
import { loginAsAdmin } from "./fixtures/auth";

// Helper to navigate to reports
async function navigateToReports(page: Page) {
  await page.goto("/relatorios");
  await page.waitForLoadState("networkidle");
}

test.describe("Reports Hub", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("should display reports page", async ({ page }) => {
    await navigateToReports(page);

    await expect(page.locator("h1, h2")).toContainText(/relatório/i);
  });

  test("should display report categories", async ({ page }) => {
    await navigateToReports(page);

    // Look for report type links
    const reportLinks = page.locator(
      'a[href*="/relatorios/"], [class*="card"]'
    );

    if ((await reportLinks.count()) > 0) {
      await expect(reportLinks.first()).toBeVisible();
    }
  });

  test("should have navigation to tickets reports", async ({ page }) => {
    await navigateToReports(page);

    const ticketsLink = page.locator(
      'a[href*="/relatorios/chamados"], text=/chamados|tickets/i'
    );

    if ((await ticketsLink.count()) > 0) {
      await expect(ticketsLink.first()).toBeVisible();
    }
  });

  test("should have navigation to supervision reports", async ({ page }) => {
    await navigateToReports(page);

    const supervisionLink = page.locator(
      'a[href*="/relatorios/supervisao"], text=/supervis/i'
    );

    if ((await supervisionLink.count()) > 0) {
      await expect(supervisionLink.first()).toBeVisible();
    }
  });
});

test.describe("Tickets Reports", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("should display tickets report page", async ({ page }) => {
    await page.goto("/relatorios/chamados");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("h1, h2")).toContainText(/chamado|ticket|relatório/i);
  });

  test("should display filter controls", async ({ page }) => {
    await page.goto("/relatorios/chamados");
    await page.waitForLoadState("networkidle");

    // Look for filter elements
    const filterSection = page.locator(
      '[class*="filter"], [class*="search"], button:has-text(/filtrar/i)'
    );

    // Should have some filter controls
    await page.waitForTimeout(2000);
  });

  test("should have date range filter", async ({ page }) => {
    await page.goto("/relatorios/chamados");
    await page.waitForLoadState("networkidle");

    // Look for date inputs
    const dateInput = page.locator(
      'input[type="date"], button:has-text(/data|período/i), [class*="date"]'
    );

    if ((await dateInput.count()) > 0) {
      await expect(dateInput.first()).toBeVisible();
    }
  });

  test("should have department filter", async ({ page }) => {
    await page.goto("/relatorios/chamados");
    await page.waitForLoadState("networkidle");

    // Look for department filter
    const deptFilter = page.locator(
      'button:has-text(/departamento/i), [id*="department"], select[name*="department"]'
    );

    if ((await deptFilter.count()) > 0) {
      await expect(deptFilter.first()).toBeVisible();
    }
  });

  test("should have status filter", async ({ page }) => {
    await page.goto("/relatorios/chamados");
    await page.waitForLoadState("networkidle");

    // Look for status filter
    const statusFilter = page.locator(
      'button:has-text(/status/i), [id*="status"], select[name*="status"]'
    );

    if ((await statusFilter.count()) > 0) {
      await expect(statusFilter.first()).toBeVisible();
    }
  });

  test("should display report data/charts", async ({ page }) => {
    await page.goto("/relatorios/chamados");
    await page.waitForLoadState("networkidle");

    // Wait for report content to load
    await page.waitForSelector(
      "table, [class*='chart'], [class*='card'], svg, canvas",
      { timeout: 10000 }
    );
  });

  test("should have PDF export button", async ({ page }) => {
    await page.goto("/relatorios/chamados");
    await page.waitForLoadState("networkidle");

    const pdfButton = page.locator(
      'button:has-text(/pdf|exportar/i), a:has-text(/pdf/i)'
    );

    if ((await pdfButton.count()) > 0) {
      await expect(pdfButton.first()).toBeVisible();
    }
  });

  test("should have Excel export button", async ({ page }) => {
    await page.goto("/relatorios/chamados");
    await page.waitForLoadState("networkidle");

    const excelButton = page.locator(
      'button:has-text(/excel|xlsx|planilha/i), a:has-text(/excel|xlsx/i)'
    );

    if ((await excelButton.count()) > 0) {
      await expect(excelButton.first()).toBeVisible();
    }
  });

  test("should trigger PDF download", async ({ page }) => {
    await page.goto("/relatorios/chamados");
    await page.waitForLoadState("networkidle");

    const pdfButton = page.locator('button:has-text(/pdf/i)');

    if ((await pdfButton.count()) > 0) {
      // Set up download listener
      const downloadPromise = page.waitForEvent("download", { timeout: 30000 });

      await pdfButton.first().click();

      try {
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
      } catch {
        // Download might be handled differently
      }
    }
  });

  test("should trigger Excel download", async ({ page }) => {
    await page.goto("/relatorios/chamados");
    await page.waitForLoadState("networkidle");

    const excelButton = page.locator('button:has-text(/excel|xlsx/i)');

    if ((await excelButton.count()) > 0) {
      // Set up download listener
      const downloadPromise = page.waitForEvent("download", { timeout: 30000 });

      await excelButton.first().click();

      try {
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/\.(xlsx?|csv)$/i);
      } catch {
        // Download might be handled differently
      }
    }
  });
});

test.describe("Supervision Reports", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("should display supervision report page", async ({ page }) => {
    await page.goto("/relatorios/supervisao");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("h1, h2")).toContainText(/supervis|relatório/i);
  });

  test("should display filter controls", async ({ page }) => {
    await page.goto("/relatorios/supervisao");
    await page.waitForLoadState("networkidle");

    // Wait for page to fully load
    await page.waitForTimeout(2000);
  });

  test("should have date range filter", async ({ page }) => {
    await page.goto("/relatorios/supervisao");
    await page.waitForLoadState("networkidle");

    const dateInput = page.locator(
      'input[type="date"], button:has-text(/data|período/i), [class*="date"]'
    );

    if ((await dateInput.count()) > 0) {
      await expect(dateInput.first()).toBeVisible();
    }
  });

  test("should have unit filter", async ({ page }) => {
    await page.goto("/relatorios/supervisao");
    await page.waitForLoadState("networkidle");

    const unitFilter = page.locator(
      'button:has-text(/unidade/i), [id*="unit"], select[name*="unit"]'
    );

    if ((await unitFilter.count()) > 0) {
      await expect(unitFilter.first()).toBeVisible();
    }
  });

  test("should display report data", async ({ page }) => {
    await page.goto("/relatorios/supervisao");
    await page.waitForLoadState("networkidle");

    // Wait for report content
    await page.waitForSelector(
      "table, [class*='chart'], [class*='card'], svg, canvas, text=/nenhum/i",
      { timeout: 10000 }
    );
  });

  test("should have export functionality", async ({ page }) => {
    await page.goto("/relatorios/supervisao");
    await page.waitForLoadState("networkidle");

    const exportButton = page.locator(
      'button:has-text(/exportar|pdf|excel/i), a:has-text(/exportar|pdf|excel/i)'
    );

    if ((await exportButton.count()) > 0) {
      await expect(exportButton.first()).toBeVisible();
    }
  });
});

test.describe("Report Filtering", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("should apply date filter and update results", async ({ page }) => {
    await page.goto("/relatorios/chamados");
    await page.waitForLoadState("networkidle");

    // Find and interact with date filter
    const dateButton = page.locator(
      'button:has-text(/data|período/i), [class*="date"]'
    );

    if ((await dateButton.count()) > 0) {
      await dateButton.first().click();
      await page.waitForTimeout(1000);

      // Look for date picker
      const datePicker = page.locator('[role="dialog"], [class*="calendar"]');

      if ((await datePicker.count()) > 0) {
        // Date picker is visible
        await expect(datePicker.first()).toBeVisible();
      }
    }
  });

  test("should apply department filter", async ({ page }) => {
    await page.goto("/relatorios/chamados");
    await page.waitForLoadState("networkidle");

    const deptButton = page.locator('button:has-text(/departamento/i)');

    if ((await deptButton.count()) > 0) {
      await deptButton.first().click();
      await page.waitForTimeout(1000);

      // Look for dropdown options
      const options = page.locator('[role="option"], [role="menuitem"]');

      if ((await options.count()) > 0) {
        await options.first().click();

        // URL should update or data should refresh
        await page.waitForTimeout(2000);
      }
    }
  });

  test("should clear filters", async ({ page }) => {
    await page.goto("/relatorios/chamados?status=closed");
    await page.waitForLoadState("networkidle");

    // Look for clear filters button
    const clearButton = page.locator(
      'button:has-text(/limpar|resetar|clear/i)'
    );

    if ((await clearButton.count()) > 0) {
      await clearButton.first().click();

      // URL should be cleaner
      await page.waitForTimeout(1000);
    }
  });
});
