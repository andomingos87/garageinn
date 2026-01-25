/**
 * Testes E2E - Chamados de TI (US1 - Criacao)
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

test.describe("Chamados de TI - US1", () => {
  test("deve criar chamado de TI", async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto("/chamados/ti/novo");

    await page.fill('input[id="title"]', "Chamado TI - US1");
    await page.fill('input[id="equipment_type"]', "Notebook");
    await page.fill(
      'textarea[id="description"]',
      "Descricao do chamado de TI criado via teste US1."
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
    await expect(page.locator("text=Chamado #")).toBeVisible();
  });
});
