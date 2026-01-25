/**
 * Testes E2E - Chamados de TI (US2 - Aprovacao)
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

test.describe("Chamados de TI - US2", () => {
  test("deve abrir fluxo de aprovacao quando aplicavel", async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto("/chamados/ti");

    await page.waitForSelector("table, text=Nenhum chamado encontrado", {
      timeout: 10000,
    });

    const rows = page.locator("table tbody tr");
    if ((await rows.count()) === 0) {
      return;
    }

    await rows.first().locator("a").first().click();
    await page.waitForURL(/\/chamados\/ti\/[\w-]+/);

    const approvalsSection = page.locator("text=Aprovações");
    if (!(await approvalsSection.isVisible())) {
      return;
    }

    const approveButton = page.locator('button:has-text("Aprovar")').first();
    if (!(await approveButton.isVisible())) {
      return;
    }

    await approveButton.click();
    await expect(page.locator("text=Confirmar Aprovação")).toBeVisible();
  });
});
