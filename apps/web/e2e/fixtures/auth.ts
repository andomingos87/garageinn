/**
 * Auth fixtures for E2E tests
 * Provides helper functions for authentication in tests
 */

import { Page } from "@playwright/test";

// Credenciais de teste padrão
export const TEST_USERS = {
  supervisor: {
    email: "supervisor_operacoes_teste@garageinn.com",
    password: "Teste123!",
    name: "Teste Supervisor - Operações",
  },
  admin: {
    email: "admin@garageinn.com.br",
    password: "Teste123!",
    name: "Admin",
  },
  adminGlobal: {
    email: "administrador_global_teste@garageinn.com",
    password: "Teste123!",
    name: "Teste Administrador - Global",
  },
  encarregado: {
    email: "encarregado_operacoes_teste@garageinn.com",
    password: "Teste123!",
    name: "Teste Encarregado - Operações",
  },
  gerente: {
    email: "gerente_operacoes_teste@garageinn.com",
    password: "Teste123!",
    name: "Teste Gerente - Operações",
  },
  manobrista: {
    email: "manobrista_operacoes_teste@garageinn.com",
    password: "Teste123!",
    name: "Teste Manobrista - Operações",
  },
};

/**
 * Login helper function
 * @param page Playwright page object
 * @param email User email
 * @param password User password
 */
export async function login(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await page.goto("/login");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');

  // Wait for redirect after successful login
  await page.waitForURL(/\/(dashboard|checklists|usuarios|unidades)/, {
    timeout: 10000,
  });
}

/**
 * Login as supervisor
 */
export async function loginAsSupervisor(page: Page): Promise<void> {
  await login(
    page,
    TEST_USERS.supervisor.email,
    TEST_USERS.supervisor.password
  );
}

/**
 * Login as admin
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
}

/**
 * Login as gerente
 */
export async function loginAsGerente(page: Page): Promise<void> {
  await login(page, TEST_USERS.gerente.email, TEST_USERS.gerente.password);
}

/**
 * Login as encarregado
 */
export async function loginAsEncarregado(page: Page): Promise<void> {
  await login(
    page,
    TEST_USERS.encarregado.email,
    TEST_USERS.encarregado.password
  );
}

/**
 * Login as manobrista
 */
export async function loginAsManobrista(page: Page): Promise<void> {
  await login(
    page,
    TEST_USERS.manobrista.email,
    TEST_USERS.manobrista.password
  );
}

/**
 * Logout helper
 */
export async function logout(page: Page): Promise<void> {
  // Click user menu and logout button
  await page.locator('[data-testid="user-menu"]').click();
  await page.click("text=Sair");
  await page.waitForURL("/login");
}

/**
 * Check if user is logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  const url = page.url();
  return !url.includes("/login");
}
