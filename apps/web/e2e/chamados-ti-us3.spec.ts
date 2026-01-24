/**
 * Testes E2E - Chamados de TI (US3 - Lista Prontos)
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

test.describe("Chamados de TI - US3", () => {
  test("deve exibir lista de prontos para execucao para perfil autorizado", async ({
    page,
  }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto("/chamados/ti");

    await expect(page.locator("text=Prontos para Execução")).toBeVisible();
  });
});
