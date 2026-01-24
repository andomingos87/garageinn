/**
 * Testes E2E - Chamados de TI (Listagem e Filtros)
 */

import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || "admin@teste.com";
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || "senha123";

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

test.describe("Chamados de TI - Listagem", () => {
  test("deve exibir pagina de listagem com titulo correto", async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto("/chamados/ti");

    await expect(page.locator("h2")).toContainText("Chamados de TI");
    await expect(page.locator("text=Novo Chamado")).toBeVisible();
  });

  test("deve exibir cards de estatisticas", async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto("/chamados/ti");

    await expect(page.locator("text=Total de Chamados")).toBeVisible();
    await expect(page.locator("text=Aguardando Triagem")).toBeVisible();
    await expect(page.locator("text=Em Andamento")).toBeVisible();
    await expect(page.locator("text=Concluidos")).toBeVisible();
  });

  test("deve exibir tabela de chamados ou estado vazio", async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto("/chamados/ti");

    await page.waitForSelector("table, text=Nenhum chamado encontrado", {
      timeout: 10000,
    });
  });
});

test.describe("Chamados de TI - Filtros", () => {
  test("deve filtrar por status", async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto("/chamados/ti");

    const statusFilter = page
      .locator('button:has-text("Todos os status")')
      .first();
    if (await statusFilter.isVisible()) {
      await statusFilter.click();
      await page.click("text=Em Andamento");
      await expect(page).toHaveURL(/status=in_progress/);
    }
  });

  test("deve buscar por texto", async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto("/chamados/ti");

    await page.fill('input[placeholder*="Buscar"]', "teste");
    await page.click('button:has-text("Buscar")');

    await expect(page).toHaveURL(/search=teste/);
  });

  test("deve limpar filtros", async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto("/chamados/ti?status=in_progress&search=teste");

    const clearButton = page.locator('button:has-text("Limpar")');
    if (await clearButton.isVisible()) {
      await clearButton.click();
      await expect(page).toHaveURL("/chamados/ti");
    }
  });
});
