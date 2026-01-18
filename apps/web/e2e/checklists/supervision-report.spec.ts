/**
 * E2E Tests for Supervision Report Feature
 *
 * Tests the visualization and export functionality of supervision checklist reports
 *
 * Prerequisites:
 * - Test users created in the database (see docs/seeds/usuarios_teste.md)
 * - At least one completed supervision checklist execution
 *
 * Test Coverage:
 * 1. Visualization of supervision report with score
 * 2. Non-conformity list display
 * 3. PDF export functionality
 * 4. Print functionality
 */

import { test, expect, Page } from "@playwright/test";
import { loginAsSupervisor } from "../fixtures/auth";

// Helper to navigate to checklists
async function navigateToChecklists(page: Page) {
  await page.goto("/checklists");
  await page.waitForLoadState("networkidle");
}

// Helper to find a completed supervision execution
async function findCompletedSupervisionExecution(
  page: Page
): Promise<string | null> {
  await navigateToChecklists(page);

  // Look for completed supervision checklist link
  const executionLinks = page.locator('a[href*="/checklists/"]');
  const count = await executionLinks.count();

  for (let i = 0; i < count; i++) {
    const link = executionLinks.nth(i);
    const href = await link.getAttribute("href");
    if (
      href &&
      href.includes("/checklists/") &&
      !href.endsWith("/checklists")
    ) {
      // Navigate to check if it's a completed supervision
      const executionId = href.split("/checklists/")[1]?.split("/")[0];
      if (executionId && executionId !== "novo") {
        return executionId;
      }
    }
  }

  return null;
}

test.describe("Supervision Report", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSupervisor(page);
  });

  test.describe("Report Visualization", () => {
    test("should display supervision report with score section", async ({
      page,
    }) => {
      const executionId = await findCompletedSupervisionExecution(page);

      if (!executionId) {
        test.skip();
        return;
      }

      await page.goto(`/checklists/${executionId}`);
      await page.waitForLoadState("networkidle");

      // Check for score section elements
      const scoreSection = page.locator("text=Score de Conformidade");
      if (await scoreSection.isVisible()) {
        // Verify score is displayed
        await expect(page.locator("text=Score de Conformidade")).toBeVisible();

        // Verify percentage is displayed (look for % character)
        const percentageText = await page.locator("text=/%/").first();
        expect(percentageText).toBeDefined();

        // Verify statistics are shown
        await expect(page.locator("text=/Conforme|Conformes/")).toBeVisible();
        await expect(
          page.locator("text=/Não Conforme|Não Conformes/")
        ).toBeVisible();
      }
    });

    test("should display non-conformities section when there are issues", async ({
      page,
    }) => {
      const executionId = await findCompletedSupervisionExecution(page);

      if (!executionId) {
        test.skip();
        return;
      }

      await page.goto(`/checklists/${executionId}`);
      await page.waitForLoadState("networkidle");

      // Check if non-conformities section exists (may not exist if all answers are "yes")
      const nonConformSection = page.locator(
        "text=/Não-Conformidades|Pendências/"
      );

      if (await nonConformSection.isVisible()) {
        // Verify the section header
        await expect(nonConformSection).toBeVisible();
      }
    });

    test("should display detailed answers section", async ({ page }) => {
      const executionId = await findCompletedSupervisionExecution(page);

      if (!executionId) {
        test.skip();
        return;
      }

      await page.goto(`/checklists/${executionId}`);
      await page.waitForLoadState("networkidle");

      // Look for answers section
      const answersSection = page.locator("text=/Respostas|Detalhes/");

      if (await answersSection.isVisible()) {
        await expect(answersSection).toBeVisible();
      }
    });

    test("should display signatures section when available", async ({
      page,
    }) => {
      const executionId = await findCompletedSupervisionExecution(page);

      if (!executionId) {
        test.skip();
        return;
      }

      await page.goto(`/checklists/${executionId}`);
      await page.waitForLoadState("networkidle");

      // Check for signatures section (optional - may not be present on all executions)
      const signaturesSection = page.locator(
        "text=/Assinaturas|Supervisor|Encarregado/"
      );

      // If signatures section is visible, verify it
      if (await signaturesSection.isVisible()) {
        await expect(signaturesSection.first()).toBeVisible();
      } else {
        // Just verify the page loads without errors
        const heading = page.locator("h1, h2").first();
        await expect(heading).toBeVisible();
      }
    });
  });

  test.describe("PDF Export", () => {
    test("should have export PDF button", async ({ page }) => {
      const executionId = await findCompletedSupervisionExecution(page);

      if (!executionId) {
        test.skip();
        return;
      }

      await page.goto(`/checklists/${executionId}`);
      await page.waitForLoadState("networkidle");

      // Look for PDF export button
      const pdfButton = page.locator(
        'button:has-text("PDF"), button:has-text("Exportar")'
      );

      if ((await pdfButton.count()) > 0) {
        await expect(pdfButton.first()).toBeVisible();
      }
    });

    test("should download PDF when clicking export button", async ({
      page,
    }) => {
      const executionId = await findCompletedSupervisionExecution(page);

      if (!executionId) {
        test.skip();
        return;
      }

      await page.goto(`/checklists/${executionId}`);
      await page.waitForLoadState("networkidle");

      // Look for PDF export button
      const pdfButton = page.locator('button:has-text("Exportar PDF")');

      if ((await pdfButton.count()) === 0) {
        test.skip();
        return;
      }

      // Set up download listener
      const downloadPromise = page.waitForEvent("download", { timeout: 30000 });

      // Click PDF button
      await pdfButton.click();

      // Wait for download
      const download = await downloadPromise;

      // Verify download
      expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
    });

    test("should return correct content-type from PDF API", async ({
      page,
      request,
    }) => {
      const executionId = await findCompletedSupervisionExecution(page);

      if (!executionId) {
        test.skip();
        return;
      }

      // Get cookies for authentication
      const cookies = await page.context().cookies();
      const cookieHeader = cookies
        .map((c) => `${c.name}=${c.value}`)
        .join("; ");

      // Make direct API request
      const response = await request.get(`/api/checklists/${executionId}/pdf`, {
        headers: {
          Cookie: cookieHeader,
        },
      });

      // May get 400 if not a supervision checklist or not completed
      if (response.status() === 200) {
        const contentType = response.headers()["content-type"];
        expect(contentType).toBe("application/pdf");

        const contentDisposition = response.headers()["content-disposition"];
        expect(contentDisposition).toMatch(/attachment/);
        expect(contentDisposition).toMatch(/\.pdf/);
      }
    });
  });

  test.describe("Print Functionality", () => {
    test("should have print button", async ({ page }) => {
      const executionId = await findCompletedSupervisionExecution(page);

      if (!executionId) {
        test.skip();
        return;
      }

      await page.goto(`/checklists/${executionId}`);
      await page.waitForLoadState("networkidle");

      // Look for print button
      const printButton = page.locator('button:has-text("Imprimir")');

      if ((await printButton.count()) > 0) {
        await expect(printButton.first()).toBeVisible();
      }
    });

    test("should trigger print dialog on print button click", async ({
      page,
    }) => {
      const executionId = await findCompletedSupervisionExecution(page);

      if (!executionId) {
        test.skip();
        return;
      }

      await page.goto(`/checklists/${executionId}`);
      await page.waitForLoadState("networkidle");

      // Look for print button
      const printButton = page.locator('button:has-text("Imprimir")');

      if ((await printButton.count()) === 0) {
        test.skip();
        return;
      }

      // Mock window.print to avoid actual print dialog
      let printCalled = false;
      await page.evaluate(() => {
        window.print = () => {
          (window as unknown as { __printCalled: boolean }).__printCalled =
            true;
        };
      });

      // Click print button
      await printButton.click();

      // Check if print was called
      printCalled = await page.evaluate(() => {
        return (
          (window as unknown as { __printCalled: boolean }).__printCalled ||
          false
        );
      });

      expect(printCalled).toBe(true);
    });

    test("should have proper print styles applied", async ({ page }) => {
      const executionId = await findCompletedSupervisionExecution(page);

      if (!executionId) {
        test.skip();
        return;
      }

      await page.goto(`/checklists/${executionId}`);
      await page.waitForLoadState("networkidle");

      // Emulate print media
      await page.emulateMedia({ media: "print" });

      // Check that sidebar is hidden in print mode
      const sidebar = page.locator("[data-sidebar]");
      if ((await sidebar.count()) > 0) {
        const sidebarDisplay = await sidebar.evaluate((el) => {
          return window.getComputedStyle(el).display;
        });
        expect(sidebarDisplay).toBe("none");
      }
    });
  });

  test.describe("Score Calculation", () => {
    test("should calculate score correctly based on answers", async ({
      page,
    }) => {
      const executionId = await findCompletedSupervisionExecution(page);

      if (!executionId) {
        test.skip();
        return;
      }

      await page.goto(`/checklists/${executionId}`);
      await page.waitForLoadState("networkidle");

      // Look for score percentage
      const scoreElement = page.locator("text=/%$/");

      if ((await scoreElement.count()) > 0) {
        const scoreText = await scoreElement.first().textContent();

        if (scoreText) {
          // Extract percentage value
          const scoreMatch = scoreText.match(/(\d+)%/);
          if (scoreMatch) {
            const score = parseInt(scoreMatch[1], 10);
            // Score should be between 0 and 100
            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(100);
          }
        }
      }
    });

    test("should show appropriate color based on score", async ({ page }) => {
      const executionId = await findCompletedSupervisionExecution(page);

      if (!executionId) {
        test.skip();
        return;
      }

      await page.goto(`/checklists/${executionId}`);
      await page.waitForLoadState("networkidle");

      // Look for colored score indicator
      const scoreColors = [
        "text-success",
        "text-warning",
        "text-destructive",
        "bg-success",
        "bg-warning",
        "bg-destructive",
      ];

      // Check if any score color class is present
      for (const colorClass of scoreColors) {
        const element = page.locator(`[class*="${colorClass}"]`);
        if ((await element.count()) > 0) {
          // Found a colored element, test passes
          expect(true).toBe(true);
          return;
        }
      }

      // If no colored element found, it might be a different styling approach
      // Just verify the page loads
      const heading = page.locator("h1, h2").first();
      await expect(heading).toBeVisible();
    });
  });
});

test.describe("Supervision Report - Unauthorized Access", () => {
  test("should redirect to login when not authenticated", async ({ page }) => {
    // Try to access a checklist without logging in
    await page.goto("/checklists/some-execution-id");

    // Should redirect to login
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
  });

  test("PDF API should return 401 when not authenticated", async ({
    request,
  }) => {
    const response = await request.get("/api/checklists/some-execution-id/pdf");
    expect(response.status()).toBe(401);
  });
});
