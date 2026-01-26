/**
 * E2E Test: Gerente creates purchase ticket with auto-approval
 * Feature: 007-fix-approval-status
 * User Story 4: Gerente Cria Chamado Auto-Aprovado (Priority: P2)
 *
 * Expected behavior:
 * - Gerente creates purchase ticket
 * - Status should be 'awaiting_triage' (auto-approved)
 * - 0 approval records should exist
 */

import { test, expect } from "@playwright/test";
import { loginAsGerente, TEST_USERS } from "./fixtures/auth";

test.describe("Purchase Ticket - Gerente Auto-Approval Flow", () => {
  test.describe.configure({ mode: "serial" });

  let ticketId: string;
  const testItemName = `Test Item Gerente ${Date.now()}`;

  test("US4-01: Gerente creates purchase ticket with awaiting_triage status (auto-approved)", async ({
    page,
  }) => {
    // Login as Gerente in Operações department
    await loginAsGerente(page);

    // Navigate to new purchase ticket form
    await page.goto("/chamados/compras/novo");
    await page.waitForLoadState("networkidle");

    // Fill the purchase ticket form
    await page.fill('input[name="title"]', `Teste Gerente Auto-Approval ${Date.now()}`);
    await page.fill('input[name="item_name"]', testItemName);
    await page.fill('input[name="quantity"]', "3");
    await page.fill('textarea[name="description"]', "Teste de auto-aprovação para Gerente - deve ir direto para triagem");

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for redirect to ticket detail page
    await page.waitForURL(/\/chamados\/compras\/[a-f0-9-]+/, {
      timeout: 10000,
    });

    // Extract ticket ID from URL
    const url = page.url();
    ticketId = url.split("/").pop() || "";
    expect(ticketId).toBeTruthy();

    // Verify the status is 'Aguardando Triagem' (NOT any approval status)
    const statusBadge = page.locator('[data-testid="ticket-status"], .status-badge, [class*="badge"]').first();
    await expect(statusBadge).toContainText(/Triagem/i);
    await expect(statusBadge).not.toContainText(/Aprovação/i);
  });

  test("US4-02: Verify no approval records exist for Gerente-created ticket", async ({
    page,
  }) => {
    test.skip(!ticketId, "Ticket ID not available from previous test");

    // Login as Gerente to view the ticket
    await loginAsGerente(page);

    // Navigate to ticket detail
    await page.goto(`/chamados/compras/${ticketId}`);
    await page.waitForLoadState("networkidle");

    // Check the approvals section - should not exist or be empty
    const approvalsSection = page.locator('[data-testid="ticket-approvals"], .approvals-list, [class*="approval"]');

    // For Gerente: 0 approvals (auto-approved)
    if (await approvalsSection.isVisible()) {
      const approvalItems = approvalsSection.locator('[data-testid="approval-item"], .approval-item, li');
      const count = await approvalItems.count();

      // Should have no pending approvals
      expect(count).toBe(0);
    }

    // The ticket should be ready for triage, not waiting for any approval
    const statusBadge = page.locator('[data-testid="ticket-status"], .status-badge, [class*="badge"]').first();
    await expect(statusBadge).not.toContainText(/Aprovação/i);
  });
});
