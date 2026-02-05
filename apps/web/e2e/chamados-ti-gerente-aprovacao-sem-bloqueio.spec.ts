/**
 * E2E: Gerente de Operações aprova chamado TI e NÃO deve ver página de bloqueio
 *
 * Bug: Após o gerente de operações aprovar um chamado TI (último nível),
 * o status muda para awaiting_triage e a página de detalhe passava a exibir
 * "Acesso Negado" porque canAccessTiTicketDetail só permitia acesso nos
 * status awaiting_approval_*.
 *
 * Correção: Permitir que o Gerente de Operações continue vendo o chamado
 * quando o status é awaiting_triage (estado logo após sua aprovação).
 */

import { test, expect } from "@playwright/test";
import { loginAsGerente } from "./fixtures/auth";

// Ticket TI usado no teste (pode estar em awaiting_approval_gerente ou já awaiting_triage)
const TI_TICKET_ID = process.env.TI_TICKET_ID_APPROVAL ?? "65c2bfee-73bc-4d69-857a-7460f3673475";

test.describe("Chamados TI - Gerente Operações aprova sem página de bloqueio", () => {
  test("gerente de operações aprova chamado TI e continua vendo a página (sem Acesso Negado)", async ({
    page,
  }) => {
    await loginAsGerente(page);

    await page.goto(`/chamados/ti/${TI_TICKET_ID}`);
    await page.waitForLoadState("networkidle");

    // Se ainda houver botão Aprovar (pendente no nível Gerente), aprovar
    const aprovarBtn = page.getByRole("button", { name: "Aprovar" });
    if (await aprovarBtn.isVisible()) {
      await aprovarBtn.click();
      await page.getByRole("button", { name: "Confirmar Aprovação" }).click();
      await page.waitForLoadState("networkidle");
    }

    // Após aprovação (ou se já estava aprovado), NÃO deve aparecer "Acesso Negado"
    await expect(page.getByRole("heading", { name: "Acesso Negado" })).not.toBeVisible();

    // Deve continuar mostrando conteúdo do chamado (link Voltar e seção Descricao)
    await expect(page.getByRole("link", { name: "Voltar" })).toBeVisible();
    await expect(page.getByText("Descricao")).toBeVisible({ timeout: 5000 });
  });
});
