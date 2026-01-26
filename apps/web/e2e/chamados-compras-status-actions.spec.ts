/**
 * E2E Test: Compras status actions persist
 * Feature: 001-status-actions-persist
 */

import { test, expect } from "@playwright/test";
import { login } from "./fixtures/auth";

const TEST_USER = {
  email: "comprador_compras_e_manutencao_teste@garageinn.com",
  password: "Teste123!",
};

const DEFAULT_TICKET_ID = "cce5d845-0b55-4848-9df7-2dfe5aa1ecec";

test.describe("Compras - Status Actions", () => {
  test("US1/US2: status action persists and UI updates", async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);

    const ticketId =
      process.env.E2E_COMPRA_TICKET_ID || process.env.NEXT_PUBLIC_TICKET_ID ||
      DEFAULT_TICKET_ID;

    await page.goto(`/chamados/compras/${ticketId}`);
    await page.waitForLoadState("networkidle");

    const andamentoButton = page.getByRole("button", {
      name: "Iniciar Andamento",
    });
    const cotacaoButton = page.getByRole("button", {
      name: "Iniciar Cotação",
    });

    let targetStatus = "";

    if (await andamentoButton.isVisible()) {
      await andamentoButton.click();
      targetStatus = "Em Andamento";
    } else if (await cotacaoButton.isVisible()) {
      await cotacaoButton.click();
      targetStatus = "Em Cotação";
    } else {
      throw new Error("Nenhuma ação de status disponível para o chamado.");
    }

    await expect(page.getByText("Status alterado para:")).toBeVisible();

    await page.reload();
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(targetStatus)).toBeVisible();
  });
});
