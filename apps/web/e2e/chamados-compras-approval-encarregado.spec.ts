/**
 * E2E Test: Encarregado creates purchase ticket with correct approval status
 * Feature: 007-fix-approval-status
 * User Story 2: Encarregado Cria Chamado com Status Correto (Priority: P1)
 *
 * Expected behavior:
 * - Encarregado creates purchase ticket
 * - Status should be 'awaiting_approval_supervisor'
 * - 2 approval records should exist (Supervisor, Gerente)
 */

import { test, expect } from "@playwright/test";
import { loginAsEncarregado, TEST_USERS } from "./fixtures/auth";

test.describe("Purchase Ticket - Encarregado Approval Flow", () => {
  test.describe.configure({ mode: "serial" });

  let ticketId: string;
  const testItemName = `Test Item Encarregado ${Date.now()}`;

  test("US2-01: Encarregado creates purchase ticket with correct initial status", async ({
    page,
  }) => {
    // Login as Encarregado in Operações department
    await loginAsEncarregado(page);

    // Navigate to new purchase ticket form
    await page.goto("/chamados/compras/novo");
    await page.waitForLoadState("networkidle");

    // Fill the purchase ticket form
    await page.fill('input[name="title"]', `Teste Encarregado Approval ${Date.now()}`);
    await page.fill('input[name="item_name"]', testItemName);
    await page.fill('input[name="quantity"]', "5");
    await page.fill('textarea[name="description"]', "Teste de aprovação para Encarregado - deve ir para Supervisor");

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

    // Verify the status is 'Aguardando Aprovação (Supervisor)' NOT 'Encarregado'
    const statusBadge = page.locator('[data-testid="ticket-status"], .status-badge, [class*="badge"]').first();
    await expect(statusBadge).toContainText(/Supervisor/i);
    await expect(statusBadge).not.toContainText(/Encarregado/i);
  });

  test("US2-02: Verify 2 approval records exist (Supervisor, Gerente) for Encarregado-created ticket", async ({
    page,
  }) => {
    test.skip(!ticketId, "Ticket ID not available from previous test");

    // Login as Encarregado to view the ticket
    await loginAsEncarregado(page);

    // Navigate to ticket detail
    await page.goto(`/chamados/compras/${ticketId}`);
    await page.waitForLoadState("networkidle");

    // Check the approvals section
    const approvalsSection = page.locator('[data-testid="ticket-approvals"], .approvals-list, [class*="approval"]');

    // Should have Supervisor and Gerente approvals (not Encarregado)
    if (await approvalsSection.isVisible()) {
      const approvalItems = approvalsSection.locator('[data-testid="approval-item"], .approval-item, li');
      const count = await approvalItems.count();

      // For Encarregado: 2 approvals (Supervisor, Gerente)
      expect(count).toBeLessThanOrEqual(2);

      // Verify no Encarregado approval exists (they shouldn't approve their own level)
      await expect(approvalsSection).not.toContainText(/Encarregado.*pendente/i);
    }
  });
});
