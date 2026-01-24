/**
 * Testes E2E - Chamados de TI (Criacao)
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

test.describe("Chamados de TI - Criacao", () => {
  test("deve navegar para formulario de novo chamado", async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto("/chamados/ti");

    await page.click("text=Novo Chamado");
    await expect(page).toHaveURL("/chamados/ti/novo");
    await expect(page.locator("h2")).toContainText("Novo Chamado de TI");
  });

  test("deve exibir campos obrigatorios", async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto("/chamados/ti/novo");

    await expect(page.locator('label:has-text("Titulo")')).toBeVisible();
    await expect(page.locator('label:has-text("Categoria")')).toBeVisible();
    await expect(page.locator('label:has-text("Tipo de Equipamento")')).toBeVisible();
    await expect(page.locator('label:has-text("Descricao")')).toBeVisible();
  });

  test("deve validar campos obrigatorios", async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto("/chamados/ti/novo");

    await page.click('button:has-text("Criar Chamado")');
    await expect(
      page.locator("text=Titulo deve ter pelo menos 5 caracteres")
    ).toBeVisible();
  });

  test("deve criar chamado com sucesso", async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto("/chamados/ti/novo");

    await page.fill('input[id="title"]', "Chamado de TI - Teste E2E");
    await page.fill(
      'input[id="equipment_type"]',
      "Notebook Dell"
    );
    await page.fill(
      'textarea[id="description"]',
      "Descricao do chamado de teste E2E para modulo de TI."
    );

    const unitSelect = page.locator('button[id="unit_id"]');
    if (await unitSelect.isEnabled()) {
      await unitSelect.click();
      await page.locator('[role="option"]').first().click();
    }

    await page.click('button[id="category_id"]');
    await page.locator('[role="option"]').first().click();

    await page.click('button:has-text("Criar Chamado")');
    await page.waitForURL(/\/chamados\/ti\/[\w-]+/);
  });
});
