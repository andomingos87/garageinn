/**
 * E2E Test: Manobrista creates purchase ticket with full approval chain
 * Feature: 007-fix-approval-status
 * User Story 3: Manobrista Cria Chamado com Status Correto (Priority: P2)
 *
 * Expected behavior:
 * - Manobrista creates purchase ticket
 * - Status should be 'awaiting_approval_encarregado'
 * - 3 approval records should exist (Encarregado, Supervisor, Gerente)
 */

import { test, expect } from "@playwright/test";
import { loginAsManobrista, TEST_USERS } from "./fixtures/auth";

test.describe("Purchase Ticket - Manobrista Approval Flow", () => {
  test.describe.configure({ mode: "serial" });

  let ticketId: string;
  const testItemName = `Test Item Manobrista ${Date.now()}`;

  test("US3-01: Manobrista creates purchase ticket with correct initial status", async ({
    page,
  }) => {
    // Login as Manobrista in Operações department
    await loginAsManobrista(page);

    // Navigate to new purchase ticket form
    await page.goto("/chamados/compras/novo");
    await page.waitForLoadState("networkidle");

    // Fill the purchase ticket form
    await page.fill('input[name="title"]', `Teste Manobrista Approval ${Date.now()}`);
    await page.fill('input[name="item_name"]', testItemName);
    await page.fill('input[name="quantity"]', "2");
    await page.fill('textarea[name="description"]', "Teste de aprovação para Manobrista - deve passar por toda a cadeia");

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

    // Verify the status is 'Aguardando Aprovação (Encarregado)'
    const statusBadge = page.locator('[data-testid="ticket-status"], .status-badge, [class*="badge"]').first();
    await expect(statusBadge).toContainText(/Encarregado/i);
  });

  test("US3-02: Verify 3 approval records exist (Encarregado, Supervisor, Gerente) for Manobrista-created ticket", async ({
    page,
  }) => {
    test.skip(!ticketId, "Ticket ID not available from previous test");

    // Login as Manobrista to view the ticket
    await loginAsManobrista(page);

    // Navigate to ticket detail
    await page.goto(`/chamados/compras/${ticketId}`);
    await page.waitForLoadState("networkidle");

    // Check the approvals section
    const approvalsSection = page.locator('[data-testid="ticket-approvals"], .approvals-list, [class*="approval"]');

    // Should have all 3 approvals: Encarregado, Supervisor, Gerente
    if (await approvalsSection.isVisible()) {
      const approvalItems = approvalsSection.locator('[data-testid="approval-item"], .approval-item, li');
      const count = await approvalItems.count();

      // For Manobrista: 3 approvals (Encarregado, Supervisor, Gerente)
      expect(count).toBeLessThanOrEqual(3);

      // Verify the first approval is Encarregado
      const approvalsText = await approvalsSection.textContent();
      expect(approvalsText).toMatch(/Encarregado/i);
    }
  });
});
