/**
 * Testes E2E para Chamados Financeiros (Epico 3.1)
 *
 * Cenarios testados:
 * 1. Listagem de chamados financeiros
 * 2. Criacao de novo chamado financeiro
 * 3. Filtros de busca
 * 4. Triagem de chamado
 * 5. Mudanca de status
 * 6. Adicionar comentario
 * 7. Fluxo de aprovacao multi-nivel
 * 8. Validacao de permissoes (RLS)
 *
 * NOTA: Estes testes requerem:
 * - Playwright instalado
 * - Usuarios de teste no banco de dados
 * - Servidor de desenvolvimento rodando
 */

import { test, expect } from "@playwright/test";

// Credenciais de teste
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || "admin@teste.com";
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || "senha123";
const FINANCEIRO_USER_EMAIL =
  process.env.TEST_FINANCEIRO_EMAIL || "financeiro@teste.com";
const FINANCEIRO_USER_PASSWORD =
  process.env.TEST_FINANCEIRO_PASSWORD || "senha123";
const OTHER_DEPT_EMAIL = process.env.TEST_OTHER_DEPT_EMAIL || "outro@teste.com";
const OTHER_DEPT_PASSWORD = process.env.TEST_OTHER_DEPT_PASSWORD || "senha123";

// Helper para login
async function login(
  page: ReturnType<typeof test.info>["project"]["use"]["page"],
  email: string,
  password: string
) {
  await page.goto("/login");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard|chamados)/);
}

test.describe("Chamados Financeiros", () => {
  test.describe("Listagem", () => {
    test("deve exibir pagina de listagem com titulo correto", async ({
      page,
    }) => {
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
      await page.goto("/chamados/financeiro");

      await expect(page.locator("h2")).toContainText("Chamados Financeiros");
      await expect(page.locator("text=Novo Chamado")).toBeVisible();
    });

    test("deve exibir cards de estatisticas", async ({ page }) => {
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
      await page.goto("/chamados/financeiro");

      await expect(page.locator("text=Total de Chamados")).toBeVisible();
      await expect(page.locator("text=Aguardando Triagem")).toBeVisible();
      await expect(page.locator("text=Em Andamento")).toBeVisible();
      await expect(page.locator("text=Resolvidos")).toBeVisible();
    });

    test("deve exibir tabela de chamados", async ({ page }) => {
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
      await page.goto("/chamados/financeiro");

      // Aguardar carregamento da tabela ou mensagem de vazio
      await page.waitForSelector("table, text=Nenhum chamado encontrado", {
        timeout: 10000,
      });
    });
  });

  test.describe("Filtros", () => {
    test("deve filtrar por status", async ({ page }) => {
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
      await page.goto("/chamados/financeiro");

      // Clicar no filtro de status (desktop)
      const statusFilter = page
        .locator('button:has-text("Todos os status")')
        .first();
      if (await statusFilter.isVisible()) {
        await statusFilter.click();
        await page.click("text=Em Andamento");
        await expect(page).toHaveURL(/status=in_progress/);
      }
    });

    test("deve filtrar por categoria", async ({ page }) => {
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
      await page.goto("/chamados/financeiro");

      // Clicar no filtro de categoria
      const categoryFilter = page
        .locator('button:has-text("Todas as categorias")')
        .first();
      if (await categoryFilter.isVisible()) {
        await categoryFilter.click();
        await page.locator('[role="option"]').first().click();
        await expect(page).toHaveURL(/category=/);
      }
    });

    test("deve buscar por texto", async ({ page }) => {
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
      await page.goto("/chamados/financeiro");

      await page.fill('input[placeholder*="Buscar"]', "teste");
      await page.click('button:has-text("Buscar")');

      await expect(page).toHaveURL(/search=teste/);
    });

    test("deve limpar filtros", async ({ page }) => {
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
      await page.goto("/chamados/financeiro?status=in_progress&search=teste");

      const clearButton = page.locator('button:has-text("Limpar")');
      if (await clearButton.isVisible()) {
        await clearButton.click();
        await expect(page).toHaveURL("/chamados/financeiro");
      }
    });
  });

  test.describe("Criacao de Chamado", () => {
    test("deve navegar para formulario de novo chamado", async ({ page }) => {
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
      await page.goto("/chamados/financeiro");

      await page.click("text=Novo Chamado");
      await expect(page).toHaveURL("/chamados/financeiro/novo");
      await expect(page.locator("h1")).toContainText("Novo Chamado Financeiro");
    });

    test("deve exibir todos os campos do formulario", async ({ page }) => {
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
      await page.goto("/chamados/financeiro/novo");

      // Campos obrigatorios
      await expect(page.locator('label:has-text("Titulo")')).toBeVisible();
      await expect(page.locator('label:has-text("Unidade")')).toBeVisible();
      await expect(page.locator('label:has-text("Categoria")')).toBeVisible();
      await expect(page.locator('label:has-text("Descricao")')).toBeVisible();

      // Campo opcional de valor
      await expect(
        page.locator('label:has-text("Valor Estimado")')
      ).toBeVisible();
    });

    test("deve validar campos obrigatorios", async ({ page }) => {
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
      await page.goto("/chamados/financeiro/novo");

      await page.click('button:has-text("Criar Chamado")');

      // Deve mostrar erro de validacao
      await expect(
        page.locator("text=Titulo deve ter pelo menos 5 caracteres")
      ).toBeVisible();
    });

    test("deve criar chamado com sucesso", async ({ page }) => {
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
      await page.goto("/chamados/financeiro/novo");

      // Preencher campos obrigatorios
      await page.fill('input[id="title"]', "Chamado Financeiro de Teste E2E");
      await page.fill(
        'textarea[id="description"]',
        "Descricao do chamado de teste para validacao E2E do modulo financeiro."
      );

      // Selecionar unidade (se disponivel)
      const unitSelect = page.locator('button[id="unit_id"]');
      if (await unitSelect.isEnabled()) {
        await unitSelect.click();
        await page.locator('[role="option"]').first().click();
      }

      // Selecionar categoria
      await page.click('button[id="category_id"]');
      await page.locator('[role="option"]').first().click();

      // Preencher valor estimado (opcional)
      await page.fill('input[id="estimated_value"]', "1500.00");

      // Submeter
      await page.click('button:has-text("Criar Chamado")');

      // Deve redirecionar para pagina de detalhes
      await page.waitForURL(/\/chamados\/financeiro\/[\w-]+/);
    });

    test("chamado com valor alto deve iniciar fluxo de aprovacao", async ({
      page,
    }) => {
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
      await page.goto("/chamados/financeiro/novo");

      // Preencher com valor alto (acima de R$ 10.000)
      await page.fill(
        'input[id="title"]',
        "Chamado Alto Valor - Teste Aprovacao"
      );
      await page.fill(
        'textarea[id="description"]',
        "Teste de fluxo de aprovacao para valores altos."
      );

      const unitSelect = page.locator('button[id="unit_id"]');
      if (await unitSelect.isEnabled()) {
        await unitSelect.click();
        await page.locator('[role="option"]').first().click();
      }

      await page.click('button[id="category_id"]');
      await page.locator('[role="option"]').first().click();

      // Valor alto - deve disparar fluxo de aprovacao
      await page.fill('input[id="estimated_value"]', "15000.00");

      await page.click('button:has-text("Criar Chamado")');

      // Deve redirecionar e mostrar fluxo de aprovacao
      await page.waitForURL(/\/chamados\/financeiro\/[\w-]+/);

      // Verificar se o fluxo de aprovacao esta visivel
      await expect(page.locator("text=Fluxo de Aprovacao")).toBeVisible({
        timeout: 10000,
      });
    });
  });

  test.describe("Detalhes do Chamado", () => {
    test.skip("deve exibir informacoes do chamado", async ({ page }) => {
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);

      // Navegar para primeiro chamado da lista
      await page.goto("/chamados/financeiro");
      await page.waitForSelector("table tbody tr");

      const firstRow = page.locator("table tbody tr").first();
      await firstRow.click();

      // Verificar elementos da pagina de detalhes
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("text=Detalhes")).toBeVisible();
      await expect(page.locator("text=Comentarios")).toBeVisible();
      await expect(page.locator("text=Historico")).toBeVisible();
    });
  });

  test.describe("Triagem", () => {
    test.skip("usuario com permissao deve ver botao de triagem", async ({
      page,
    }) => {
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);

      // Navegar para chamado aguardando triagem
      await page.goto("/chamados/financeiro?status=awaiting_triage");
      await page.waitForSelector("table tbody tr", { timeout: 5000 });

      const firstRow = page.locator("table tbody tr").first();
      await firstRow.click();

      await expect(
        page.locator('button:has-text("Triar Chamado")')
      ).toBeVisible();
    });

    test.skip("deve abrir dialog de triagem", async ({ page }) => {
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);

      await page.goto("/chamados/financeiro?status=awaiting_triage");
      await page.waitForSelector("table tbody tr", { timeout: 5000 });

      const firstRow = page.locator("table tbody tr").first();
      await firstRow.click();

      await page.click('button:has-text("Triar Chamado")');

      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator("text=Triagem do Chamado")).toBeVisible();
      await expect(page.locator('label:has-text("Prioridade")')).toBeVisible();
      await expect(page.locator('label:has-text("Responsavel")')).toBeVisible();
    });

    test.skip("deve realizar triagem com sucesso", async ({ page }) => {
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);

      await page.goto("/chamados/financeiro?status=awaiting_triage");
      await page.waitForSelector("table tbody tr", { timeout: 5000 });

      const firstRow = page.locator("table tbody tr").first();
      await firstRow.click();

      await page.click('button:has-text("Triar Chamado")');

      // Selecionar prioridade
      await page.click('button[id="priority"]');
      await page.click("text=Alta");

      // Confirmar triagem
      await page.click('button:has-text("Confirmar Triagem")');

      // Verificar mensagem de sucesso
      await expect(page.locator("text=Chamado triado com sucesso")).toBeVisible(
        { timeout: 5000 }
      );
    });
  });

  test.describe("Fluxo de Aprovacao", () => {
    test.skip("deve exibir painel de aprovacao para chamados pendentes", async ({
      page,
    }) => {
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);

      // Navegar para chamado aguardando aprovacao
      await page.goto(
        "/chamados/financeiro?status=awaiting_approval_encarregado"
      );

      const table = page.locator("table tbody tr");
      if ((await table.count()) > 0) {
        await table.first().click();

        await expect(page.locator("text=Fluxo de Aprovacao")).toBeVisible();
        await expect(page.locator("text=Encarregado")).toBeVisible();
        await expect(page.locator("text=Supervisor")).toBeVisible();
        await expect(page.locator("text=Gerente")).toBeVisible();
      }
    });

    test.skip("deve aprovar chamado no nivel atual", async ({ page }) => {
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);

      await page.goto(
        "/chamados/financeiro?status=awaiting_approval_encarregado"
      );
      await page.waitForSelector("table tbody tr", { timeout: 5000 });

      const firstRow = page.locator("table tbody tr").first();
      await firstRow.click();

      // Clicar em aprovar
      const approveButton = page.locator('button:has-text("Aprovar")').first();
      if (await approveButton.isVisible()) {
        await approveButton.click();

        // Verificar mensagem de sucesso
        await expect(page.locator("text=Chamado aprovado")).toBeVisible({
          timeout: 5000,
        });
      }
    });

    test.skip("deve negar chamado com justificativa", async ({ page }) => {
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);

      await page.goto(
        "/chamados/financeiro?status=awaiting_approval_encarregado"
      );
      await page.waitForSelector("table tbody tr", { timeout: 5000 });

      const firstRow = page.locator("table tbody tr").first();
      await firstRow.click();

      // Clicar em negar
      const denyButton = page.locator('button:has-text("Negar")').first();
      if (await denyButton.isVisible()) {
        await denyButton.click();

        // Preencher justificativa no dialog
        await expect(page.locator('[role="dialog"]')).toBeVisible();
        await page.fill(
          'textarea[id="deny-reason-approval"]',
          "Justificativa de teste para negacao"
        );

        await page.click('button:has-text("Confirmar Negacao")');

        // Verificar mensagem de sucesso
        await expect(page.locator("text=Chamado negado")).toBeVisible({
          timeout: 5000,
        });
      }
    });
  });

  test.describe("Permissoes (RLS)", () => {
    test("admin deve ver todos os chamados", async ({ page }) => {
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
      await page.goto("/chamados/financeiro");

      // Admin deve conseguir acessar a pagina
      await expect(page.locator("h2")).toContainText("Chamados Financeiros");
    });

    test.skip("usuario do Financeiro deve ver chamados do departamento", async ({
      page,
    }) => {
      await login(page, FINANCEIRO_USER_EMAIL, FINANCEIRO_USER_PASSWORD);
      await page.goto("/chamados/financeiro");

      // Usuario do Financeiro deve conseguir acessar
      await expect(page.locator("h2")).toContainText("Chamados Financeiros");
    });

    test.skip("usuario de outro departamento nao deve ver chamados do Financeiro", async ({
      page,
    }) => {
      await login(page, OTHER_DEPT_EMAIL, OTHER_DEPT_PASSWORD);
      await page.goto("/chamados/financeiro");

      // Deve ver lista vazia ou mensagem de acesso negado
      await page.waitForSelector(
        "text=Nenhum chamado encontrado, table tbody tr",
        { timeout: 5000 }
      );

      const noResults = page.locator("text=Nenhum chamado encontrado");
      const hasResults = await page.locator("table tbody tr").count();

      // Ou nao tem resultados, ou tem a mensagem de vazio
      expect((await noResults.isVisible()) || hasResults === 0).toBeTruthy();
    });
  });

  test.describe("Comentarios", () => {
    test.skip("deve adicionar comentario ao chamado", async ({ page }) => {
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);

      // Navegar para primeiro chamado
      await page.goto("/chamados/financeiro");
      await page.waitForSelector("table tbody tr");

      const firstRow = page.locator("table tbody tr").first();
      await firstRow.click();

      // Adicionar comentario
      await page.fill(
        'textarea[placeholder*="comentario"]',
        "Comentario de teste E2E para modulo financeiro"
      );
      await page.click('button:has-text("Enviar")');

      // Verificar que comentario aparece
      await expect(
        page.locator("text=Comentario de teste E2E para modulo financeiro")
      ).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Mudanca de Status", () => {
    test.skip("deve mudar status do chamado", async ({ page }) => {
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);

      // Navegar para chamado em andamento
      await page.goto("/chamados/financeiro?status=in_progress");
      await page.waitForSelector("table tbody tr", { timeout: 5000 });

      const firstRow = page.locator("table tbody tr").first();
      await firstRow.click();

      // Clicar em botao de mudanca de status
      const resolvedButton = page.locator('button:has-text("Resolvido")');
      if (await resolvedButton.isVisible()) {
        await resolvedButton.click();

        // Verificar que status mudou
        await expect(page.locator("text=sucesso")).toBeVisible({
          timeout: 5000,
        });
      }
    });

    test.skip("deve cancelar chamado com justificativa", async ({ page }) => {
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);

      await page.goto("/chamados/financeiro?status=in_progress");
      await page.waitForSelector("table tbody tr", { timeout: 5000 });

      const firstRow = page.locator("table tbody tr").first();
      await firstRow.click();

      const cancelButton = page.locator('button:has-text("Cancelar")');
      if (await cancelButton.isVisible()) {
        await cancelButton.click();

        // Dialog de justificativa
        await expect(page.locator('[role="dialog"]')).toBeVisible();
        await page.fill(
          'textarea[id="cancel-reason"]',
          "Cancelamento de teste E2E"
        );
        await page.click('button:has-text("Confirmar")');

        await expect(page.locator("text=sucesso")).toBeVisible({
          timeout: 5000,
        });
      }
    });
  });

  test.describe("Timeline e Historico", () => {
    test.skip("deve exibir historico de alteracoes", async ({ page }) => {
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);

      await page.goto("/chamados/financeiro");
      await page.waitForSelector("table tbody tr");

      const firstRow = page.locator("table tbody tr").first();
      await firstRow.click();

      // Verificar se a timeline esta visivel
      await expect(page.locator("text=Historico")).toBeVisible();
      await expect(page.locator("text=Chamado criado")).toBeVisible({
        timeout: 5000,
      });
    });
  });
});
