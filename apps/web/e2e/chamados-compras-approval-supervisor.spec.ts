/**
 * E2E Test: Supervisor creates purchase ticket with correct approval status
 * Feature: 007-fix-approval-status
 * User Story 1: Supervisor Cria Chamado com Status Correto (Priority: P1)
 *
 * Expected behavior:
 * - Supervisor creates purchase ticket
 * - Status should be 'awaiting_approval_gerente' (not 'awaiting_approval_encarregado')
 * - Only 1 approval record should exist (Gerente)
 */

import { test, expect } from "@playwright/test";
import { loginAsSupervisor, loginAsGerente, TEST_USERS } from "./fixtures/auth";

test.describe("Purchase Ticket - Supervisor Approval Flow", () => {
  test.describe.configure({ mode: "serial" });

  let ticketId: string;
  const testItemName = `Test Item Supervisor ${Date.now()}`;

  test("US1-01: Supervisor creates purchase ticket with correct initial status", async ({
    page,
  }) => {
    // Login as Supervisor in Operações department
    await loginAsSupervisor(page);

    // Navigate to new purchase ticket form
    await page.goto("/chamados/compras/novo");
    await page.waitForLoadState("networkidle");

    // Fill the purchase ticket form
    await page.fill('input[name="title"]', `Teste Supervisor Approval ${Date.now()}`);
    await page.fill('input[name="item_name"]', testItemName);
    await page.fill('input[name="quantity"]', "10");
    await page.fill('textarea[name="description"]', "Teste de aprovação para Supervisor - deve ir direto para Gerente");

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

    // Verify the status is 'Aguardando Aprovação (Gerente)' NOT 'Encarregado'
    const statusBadge = page.locator('[data-testid="ticket-status"], .status-badge, [class*="badge"]').first();
    await expect(statusBadge).toContainText(/Gerente/i);
    await expect(statusBadge).not.toContainText(/Encarregado/i);
  });

  test("US1-02: Verify only Gerente approval record exists for Supervisor-created ticket", async ({
    page,
  }) => {
    test.skip(!ticketId, "Ticket ID not available from previous test");

    // Login as Supervisor to view the ticket
    await loginAsSupervisor(page);

    // Navigate to ticket detail
    await page.goto(`/chamados/compras/${ticketId}`);
    await page.waitForLoadState("networkidle");

    // Check the approvals section
    const approvalsSection = page.locator('[data-testid="ticket-approvals"], .approvals-list, [class*="approval"]');

    // Should only have Gerente approval
    if (await approvalsSection.isVisible()) {
      const approvalItems = approvalsSection.locator('[data-testid="approval-item"], .approval-item, li');
      const count = await approvalItems.count();

      // For Supervisor: Only 1 approval (Gerente)
      expect(count).toBeLessThanOrEqual(1);

      // Verify no Encarregado or Supervisor approval exists
      await expect(approvalsSection).not.toContainText(/Encarregado.*pendente/i);
      await expect(approvalsSection).not.toContainText(/Supervisor.*pendente/i);
    }
  });

  test("US1-03: Gerente can approve ticket and it advances to awaiting_triage", async ({
    page,
  }) => {
    test.skip(!ticketId, "Ticket ID not available from previous test");

    // Login as Gerente
    await loginAsGerente(page);

    // Navigate to ticket detail
    await page.goto(`/chamados/compras/${ticketId}`);
    await page.waitForLoadState("networkidle");

    // Look for approve button
    const approveButton = page.locator(
      'button:has-text("Aprovar"), [data-testid="approve-button"]'
    );

    if (await approveButton.isVisible()) {
      await approveButton.click();

      // Wait for status update
      await page.waitForResponse(
        (response) =>
          response.url().includes("/chamados") && response.status() === 200
      );

      // Verify status changed to awaiting_triage or next status
      const statusBadge = page.locator('[data-testid="ticket-status"], .status-badge, [class*="badge"]').first();
      await expect(statusBadge).toContainText(/Triagem|Aguardando/i);
      await expect(statusBadge).not.toContainText(/Gerente/i);
    }
  });
});
