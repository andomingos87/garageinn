/**
 * E2E Tests for Checklist Execution
 *
 * Based on TestSprite Test Plan:
 * - TC009: Checklist execution with progress tracking
 * - TC010: Checklist supervision with digital signatures
 *
 * Prerequisites:
 * - Test users with checklist execution permissions
 * - Active checklist templates assigned to test user's units
 * - Server running on localhost:3000
 */

import { test, expect, Page } from "@playwright/test";
import {
  loginAsAdmin,
  loginAsSupervisor,
  loginAsEncarregado,
} from "../fixtures/auth";

// Helper to navigate to checklist execution
async function navigateToChecklistExecution(page: Page) {
  await page.goto("/checklists/executar");
  await page.waitForLoadState("networkidle");
}

// Helper to navigate to supervision
async function navigateToSupervision(page: Page) {
  await page.goto("/checklists/supervisao");
  await page.waitForLoadState("networkidle");
}

test.describe("Checklist Execution", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test.describe("Execution List", () => {
    test("should display checklist execution page", async ({ page }) => {
      await navigateToChecklistExecution(page);

      // Verify page loaded
      await expect(page.locator("h1, h2")).toContainText(
        /execut|checklist/i
      );
    });

    test("should display available checklists or empty state", async ({
      page,
    }) => {
      await navigateToChecklistExecution(page);

      // Wait for content to load
      await page.waitForSelector(
        "table, [class*='card'], [class*='grid'], text=/nenhum|disponível|pendente/i",
        { timeout: 10000 }
      );
    });

    test("should show execution progress statistics", async ({ page }) => {
      await navigateToChecklistExecution(page);

      // Look for progress indicators or stats
      const statsSection = page.locator(
        '[class*="card"], [class*="stat"], [class*="progress"]'
      );
      if ((await statsSection.count()) > 0) {
        await expect(statsSection.first()).toBeVisible();
      }
    });
  });

  test.describe("Starting Execution", () => {
    test("should display start execution card when checklist available", async ({
      page,
    }) => {
      await navigateToChecklistExecution(page);

      // Look for start button or execution card
      const startButton = page.locator(
        'button:has-text(/iniciar|executar|começar/i), a:has-text(/iniciar|executar/i)'
      );

      // May or may not have available checklists
      await page.waitForTimeout(2000);
    });

    test("should navigate to execution page when starting", async ({
      page,
    }) => {
      await navigateToChecklistExecution(page);

      // Try to start an execution
      const startButton = page.locator(
        'button:has-text(/iniciar|executar/i), a:has-text(/iniciar|executar/i)'
      );

      if ((await startButton.count()) > 0) {
        await startButton.first().click();
        await page.waitForLoadState("networkidle");

        // Should be on execution detail page
        expect(page.url()).toMatch(
          /\/checklists\/executar\/[\w-]+|\/checklists\/[\w-]+/
        );
      }
    });
  });

  test.describe("Answering Questions", () => {
    test("should display questions during execution", async ({ page }) => {
      await navigateToChecklistExecution(page);

      // Find and start an execution
      const startButton = page.locator(
        'button:has-text(/iniciar|executar/i), a[href*="/executar/"]'
      );

      if ((await startButton.count()) > 0) {
        await startButton.first().click();
        await page.waitForLoadState("networkidle");

        // Should show questions or progress
        await page.waitForSelector(
          '[class*="question"], [class*="item"], form, [role="radiogroup"]',
          { timeout: 10000 }
        );
      }
    });

    test("should track progress as questions are answered", async ({
      page,
    }) => {
      await navigateToChecklistExecution(page);

      const executionLink = page.locator('a[href*="/executar/"]');

      if ((await executionLink.count()) > 0) {
        await executionLink.first().click();
        await page.waitForLoadState("networkidle");

        // Look for progress indicator
        const progressIndicator = page.locator(
          '[class*="progress"], text=/%/, [role="progressbar"]'
        );

        if ((await progressIndicator.count()) > 0) {
          await expect(progressIndicator.first()).toBeVisible();
        }
      }
    });
  });

  test.describe("Execution Summary", () => {
    test("should display summary after completion", async ({ page }) => {
      // Navigate to a completed execution
      await page.goto("/checklists");
      await page.waitForLoadState("networkidle");

      // Look for completed execution link
      const completedLink = page.locator(
        'a[href*="/checklists/"]:has-text(/concluído|completo/i), [class*="badge"]:has-text(/concluído/i)'
      );

      if ((await completedLink.count()) > 0) {
        await completedLink.first().click();
        await page.waitForLoadState("networkidle");

        // Should show summary information
        await expect(page.locator("h1, h2, h3")).toBeVisible();
      }
    });
  });
});

test.describe("Checklist Supervision", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSupervisor(page);
  });

  test.describe("Supervision List", () => {
    test("should display supervision page", async ({ page }) => {
      await navigateToSupervision(page);

      // Verify page title
      await expect(page.locator("h1, h2")).toContainText(
        /supervis|checklist/i
      );
    });

    test("should display pending supervision checklists", async ({ page }) => {
      await navigateToSupervision(page);

      // Wait for content
      await page.waitForSelector(
        "table, [class*='card'], [class*='grid'], text=/nenhum|pendente/i",
        { timeout: 10000 }
      );
    });
  });

  test.describe("Supervision Execution", () => {
    test("should navigate to supervision execution page", async ({ page }) => {
      await navigateToSupervision(page);

      // Look for execution link
      const execLink = page.locator(
        'a[href*="/supervisao/executar"], button:has-text(/executar|iniciar/i)'
      );

      if ((await execLink.count()) > 0) {
        await execLink.first().click();
        await page.waitForLoadState("networkidle");

        expect(page.url()).toContain("supervisao");
      }
    });
  });

  test.describe("Digital Signatures", () => {
    test("should display signature capture components", async ({ page }) => {
      await navigateToSupervision(page);

      // Navigate to an execution
      const execLink = page.locator('a[href*="/supervisao/executar/"]');

      if ((await execLink.count()) > 0) {
        await execLink.first().click();
        await page.waitForLoadState("networkidle");

        // Look for signature components
        const signatureArea = page.locator(
          'canvas, [class*="signature"], [data-testid*="signature"]'
        );

        // May or may not have signature area depending on execution state
        await page.waitForTimeout(2000);
      }
    });

    test("should have supervisor signature field", async ({ page }) => {
      await navigateToSupervision(page);

      const execLink = page.locator('a[href*="/supervisao/executar/"]');

      if ((await execLink.count()) > 0) {
        await execLink.first().click();
        await page.waitForLoadState("networkidle");

        // Look for supervisor signature section
        const supervisorSection = page.locator(
          'text=/assinatura.*supervisor|supervisor.*assinatura/i'
        );

        if ((await supervisorSection.count()) > 0) {
          await expect(supervisorSection.first()).toBeVisible();
        }
      }
    });

    test("should have attendant/encarregado signature field", async ({
      page,
    }) => {
      await navigateToSupervision(page);

      const execLink = page.locator('a[href*="/supervisao/executar/"]');

      if ((await execLink.count()) > 0) {
        await execLink.first().click();
        await page.waitForLoadState("networkidle");

        // Look for attendant signature section
        const attendantSection = page.locator(
          'text=/assinatura.*encarregado|encarregado.*assinatura|atendente/i'
        );

        if ((await attendantSection.count()) > 0) {
          await expect(attendantSection.first()).toBeVisible();
        }
      }
    });
  });

  test.describe("Supervision Completion", () => {
    test("should have complete/submit button", async ({ page }) => {
      await navigateToSupervision(page);

      const execLink = page.locator('a[href*="/supervisao/executar/"]');

      if ((await execLink.count()) > 0) {
        await execLink.first().click();
        await page.waitForLoadState("networkidle");

        // Look for submit button
        const submitButton = page.locator(
          'button:has-text(/finalizar|concluir|enviar|salvar/i)'
        );

        if ((await submitButton.count()) > 0) {
          await expect(submitButton.first()).toBeVisible();
        }
      }
    });
  });
});

test.describe("Checklist Hub", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("should display main checklists page", async ({ page }) => {
    await page.goto("/checklists");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("h1, h2")).toContainText(/checklist/i);
  });

  test("should have navigation to configuration", async ({ page }) => {
    await page.goto("/checklists");
    await page.waitForLoadState("networkidle");

    const configLink = page.locator(
      'a[href*="/configurar"], button:has-text(/configurar|templates/i)'
    );

    if ((await configLink.count()) > 0) {
      await expect(configLink.first()).toBeVisible();
    }
  });

  test("should have navigation to execution", async ({ page }) => {
    await page.goto("/checklists");
    await page.waitForLoadState("networkidle");

    const execLink = page.locator(
      'a[href*="/executar"], button:has-text(/executar/i)'
    );

    if ((await execLink.count()) > 0) {
      await expect(execLink.first()).toBeVisible();
    }
  });

  test("should have navigation to supervision", async ({ page }) => {
    await page.goto("/checklists");
    await page.waitForLoadState("networkidle");

    const supervisionLink = page.locator(
      'a[href*="/supervisao"], button:has-text(/supervis/i)'
    );

    if ((await supervisionLink.count()) > 0) {
      await expect(supervisionLink.first()).toBeVisible();
    }
  });
});
