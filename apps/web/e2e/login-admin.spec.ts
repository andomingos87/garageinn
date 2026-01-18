/**
 * Teste E2E para login do administrador
 * 
 * Testa o login com as credenciais:
 * - Email: admin@garageinn.com.br
 * - Senha: Teste123!
 * 
 * Este teste verifica:
 * 1. Se o formulário de login está acessível
 * 2. Se o login funciona corretamente
 * 3. Se há erros durante o processo
 * 4. Se o redirecionamento após login funciona
 */

import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = "admin@garageinn.com.br";
const ADMIN_PASSWORD = "Teste123!";

test.describe("Login do Administrador", () => {
  test("Deve fazer login com sucesso", async ({ page }) => {
    // Navegar para a página de login
    await page.goto("/login");
    
    // Verificar se a página carregou
    await expect(page).toHaveTitle(/GarageInn|Login/i);
    
    // Verificar se os campos de formulário estão presentes
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    const submitButton = page.locator('button[type="submit"]');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
    
    // Preencher o formulário
    await emailInput.fill(ADMIN_EMAIL);
    await passwordInput.fill(ADMIN_PASSWORD);
    
    // Capturar console logs antes do submit
    const consoleMessages: string[] = [];
    page.on("console", (msg) => {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    });
    
    // Capturar requisições de rede
    const networkRequests: Array<{ url: string; method: string; status?: number }> = [];
    page.on("request", (request) => {
      if (request.url().includes("auth") || request.url().includes("login")) {
        networkRequests.push({
          url: request.url(),
          method: request.method(),
        });
      }
    });
    
    page.on("response", (response) => {
      const request = networkRequests.find((r) => r.url === response.url());
      if (request) {
        request.status = response.status();
      }
    });
    
    // Clicar no botão de submit
    await submitButton.click();
    
    // Aguardar por possíveis erros ou redirecionamento
    try {
      // Aguardar por mensagem de erro (se houver)
      const errorMessage = page.locator('[class*="destructive"], [role="alert"]');
      
      // Aguardar por redirecionamento ou erro (timeout de 10 segundos)
      await Promise.race([
        page.waitForURL(/\/(dashboard|checklists|usuarios|unidades|\/)/, { timeout: 10000 }),
        errorMessage.waitFor({ state: "visible", timeout: 5000 }).catch(() => null),
      ]);
      
      // Verificar se há mensagem de erro visível
      const isErrorVisible = await errorMessage.isVisible().catch(() => false);
      
      if (isErrorVisible) {
        const errorText = await errorMessage.textContent();
        console.log("❌ ERRO ENCONTRADO NO LOGIN:");
        console.log("Mensagem de erro:", errorText);
        console.log("\n📋 Console Logs:");
        consoleMessages.forEach((msg) => console.log(msg));
        console.log("\n🌐 Requisições de Rede:");
        networkRequests.forEach((req) => {
          console.log(`${req.method} ${req.url} - Status: ${req.status || "N/A"}`);
        });
        
        // Capturar screenshot do erro
        await page.screenshot({ path: "playwright-report/login-error.png", fullPage: true });
        
        // Falhar o teste com informações detalhadas
        throw new Error(
          `Login falhou com erro: ${errorText}\n` +
          `Console logs: ${JSON.stringify(consoleMessages, null, 2)}\n` +
          `Network requests: ${JSON.stringify(networkRequests, null, 2)}`
        );
      }
      
      // Verificar se foi redirecionado corretamente
      const currentUrl = page.url();
      expect(currentUrl).not.toContain("/login");
      
      console.log("✅ Login realizado com sucesso!");
      console.log("URL após login:", currentUrl);
      
    } catch (error) {
      // Capturar screenshot em caso de erro
      await page.screenshot({ path: "playwright-report/login-error.png", fullPage: true });
      
      // Capturar HTML da página para debug
      const html = await page.content();
      console.log("\n📄 HTML da página (primeiros 2000 caracteres):");
      console.log(html.substring(0, 2000));
      
      // Re-lançar o erro com mais contexto
      throw error;
    }
  });
  
  test("Deve exibir erro com credenciais inválidas", async ({ page }) => {
    await page.goto("/login");
    
    // Tentar login com credenciais inválidas
    await page.fill('input[name="email"]', "email-invalido@teste.com");
    await page.fill('input[name="password"]', "senha-errada");
    await page.click('button[type="submit"]');
    
    // Aguardar mensagem de erro
    const errorMessage = page.locator('[class*="destructive"], [role="alert"]');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    
    const errorText = await errorMessage.textContent();
    expect(errorText).toContain("incorretos");
  });
});
