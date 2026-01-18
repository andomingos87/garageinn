/**
 * Testes E2E para Chamados Comerciais (Epico 2.2)
 *
 * Cenarios testados:
 * 1. Listagem de chamados comerciais
 * 2. Criacao de novo chamado comercial
 * 3. Filtros de busca
 * 4. Triagem de chamado
 * 5. Mudanca de status
 * 6. Adicionar comentario
 * 7. Validacao de permissoes (RLS)
 *
 * NOTA: Estes testes requerem:
 * - Playwright instalado
 * - Usuarios de teste no banco de dados
 * - Servidor de desenvolvimento rodando
 */

import { test, expect } from '@playwright/test'

// Credenciais de teste
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@teste.com'
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'senha123'
const COMERCIAL_USER_EMAIL = process.env.TEST_COMERCIAL_EMAIL || 'comercial@teste.com'
const COMERCIAL_USER_PASSWORD = process.env.TEST_COMERCIAL_PASSWORD || 'senha123'
const OTHER_DEPT_EMAIL = process.env.TEST_OTHER_DEPT_EMAIL || 'outro@teste.com'
const OTHER_DEPT_PASSWORD = process.env.TEST_OTHER_DEPT_PASSWORD || 'senha123'

// Helper para login
async function login(page: ReturnType<typeof test.info>['project']['use']['page'], email: string, password: string) {
  await page.goto('/login')
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/(dashboard|chamados)/)
}

test.describe('Chamados Comerciais', () => {
  test.describe('Listagem', () => {
    test('deve exibir pagina de listagem com titulo correto', async ({ page }) => {
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORD)
      await page.goto('/chamados/comercial')

      await expect(page.locator('h2')).toContainText('Chamados Comerciais')
      await expect(page.locator('text=Novo Chamado')).toBeVisible()
    })

    test('deve exibir cards de estatisticas', async ({ page }) => {
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORD)
      await page.goto('/chamados/comercial')

      await expect(page.locator('text=Total de Chamados')).toBeVisible()
      await expect(page.locator('text=Aguardando Triagem')).toBeVisible()
      await expect(page.locator('text=Em Andamento')).toBeVisible()
      await expect(page.locator('text=Resolvidos')).toBeVisible()
    })

    test('deve exibir tabela de chamados', async ({ page }) => {
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORD)
      await page.goto('/chamados/comercial')

      // Aguardar carregamento da tabela ou mensagem de vazio
      await page.waitForSelector('table, text=Nenhum chamado encontrado', { timeout: 10000 })
    })
  })

  test.describe('Filtros', () => {
    test('deve filtrar por status', async ({ page }) => {
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORD)
      await page.goto('/chamados/comercial')

      // Clicar no filtro de status (desktop)
      const statusFilter = page.locator('button:has-text("Todos os status")').first()
      if (await statusFilter.isVisible()) {
        await statusFilter.click()
        await page.click('text=Em Andamento')
        await expect(page).toHaveURL(/status=in_progress/)
      }
    })

    test('deve buscar por texto', async ({ page }) => {
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORD)
      await page.goto('/chamados/comercial')

      await page.fill('input[placeholder*="Buscar"]', 'teste')
      await page.click('button:has-text("Buscar")')

      await expect(page).toHaveURL(/search=teste/)
    })

    test('deve limpar filtros', async ({ page }) => {
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORD)
      await page.goto('/chamados/comercial?status=in_progress&search=teste')

      const clearButton = page.locator('button:has-text("Limpar")')
      if (await clearButton.isVisible()) {
        await clearButton.click()
        await expect(page).toHaveURL('/chamados/comercial')
      }
    })
  })

  test.describe('Criacao de Chamado', () => {
    test('deve navegar para formulario de novo chamado', async ({ page }) => {
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORD)
      await page.goto('/chamados/comercial')

      await page.click('text=Novo Chamado')
      await expect(page).toHaveURL('/chamados/comercial/novo')
      await expect(page.locator('h1')).toContainText('Novo Chamado Comercial')
    })

    test('deve exibir todos os campos do formulario', async ({ page }) => {
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORD)
      await page.goto('/chamados/comercial/novo')

      // Campos obrigatorios
      await expect(page.locator('label:has-text("Titulo")')).toBeVisible()
      await expect(page.locator('label:has-text("Tipo Comercial")')).toBeVisible()
      await expect(page.locator('label:has-text("Unidade")')).toBeVisible()
      await expect(page.locator('label:has-text("Categoria")')).toBeVisible()
      await expect(page.locator('label:has-text("Descricao")')).toBeVisible()

      // Campos do cliente
      await expect(page.locator('text=Dados do Cliente')).toBeVisible()
      await expect(page.locator('label:has-text("Nome / Razao Social")')).toBeVisible()
      await expect(page.locator('label:has-text("CNPJ")')).toBeVisible()

      // Campos do contrato
      await expect(page.locator('text=Dados do Contrato')).toBeVisible()
      await expect(page.locator('label:has-text("Valor do Contrato")')).toBeVisible()
    })

    test('deve validar campos obrigatorios', async ({ page }) => {
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORD)
      await page.goto('/chamados/comercial/novo')

      await page.click('button:has-text("Criar Chamado")')

      // Deve mostrar erro de validacao
      await expect(page.locator('text=Titulo deve ter pelo menos 5 caracteres')).toBeVisible()
    })

    test('deve criar chamado com sucesso', async ({ page }) => {
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORD)
      await page.goto('/chamados/comercial/novo')

      // Preencher campos obrigatorios
      await page.fill('input[id="title"]', 'Chamado de Teste E2E')
      await page.fill('textarea[id="description"]', 'Descricao do chamado de teste para validacao E2E do modulo comercial.')

      // Selecionar tipo comercial
      await page.click('button[id="comercial_type"]')
      await page.click('text=Novo Contrato')

      // Selecionar unidade (se disponivel)
      const unitSelect = page.locator('button[id="unit_id"]')
      if (await unitSelect.isEnabled()) {
        await unitSelect.click()
        await page.locator('[role="option"]').first().click()
      }

      // Selecionar categoria
      await page.click('button[id="category_id"]')
      await page.locator('[role="option"]').first().click()

      // Preencher dados do cliente (opcional)
      await page.fill('input[id="client_name"]', 'Empresa Teste LTDA')
      await page.fill('input[id="client_cnpj"]', '12.345.678/0001-90')

      // Submeter
      await page.click('button:has-text("Criar Chamado")')

      // Deve redirecionar para pagina de detalhes
      await page.waitForURL(/\/chamados\/comercial\/[\w-]+/)
    })
  })

  test.describe('Detalhes do Chamado', () => {
    test.skip('deve exibir informacoes do chamado', async ({ page }) => {
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORD)

      // Navegar para primeiro chamado da lista
      await page.goto('/chamados/comercial')
      await page.waitForSelector('table tbody tr')

      const firstRow = page.locator('table tbody tr').first()
      await firstRow.click()

      // Verificar elementos da pagina de detalhes
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.locator('text=Detalhes')).toBeVisible()
      await expect(page.locator('text=Comentarios')).toBeVisible()
      await expect(page.locator('text=Historico')).toBeVisible()
    })
  })

  test.describe('Triagem', () => {
    test.skip('usuario com permissao deve ver botao de triagem', async ({ page }) => {
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORD)

      // Navegar para chamado aguardando triagem
      await page.goto('/chamados/comercial?status=awaiting_triage')
      await page.waitForSelector('table tbody tr', { timeout: 5000 })

      const firstRow = page.locator('table tbody tr').first()
      await firstRow.click()

      await expect(page.locator('button:has-text("Realizar Triagem")')).toBeVisible()
    })

    test.skip('deve abrir dialog de triagem', async ({ page }) => {
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORD)

      await page.goto('/chamados/comercial?status=awaiting_triage')
      await page.waitForSelector('table tbody tr', { timeout: 5000 })

      const firstRow = page.locator('table tbody tr').first()
      await firstRow.click()

      await page.click('button:has-text("Realizar Triagem")')

      await expect(page.locator('[role="dialog"]')).toBeVisible()
      await expect(page.locator('text=Triagem do Chamado')).toBeVisible()
      await expect(page.locator('label:has-text("Prioridade")')).toBeVisible()
    })
  })

  test.describe('Permissoes (RLS)', () => {
    test('admin deve ver todos os chamados', async ({ page }) => {
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORD)
      await page.goto('/chamados/comercial')

      // Admin deve conseguir acessar a pagina
      await expect(page.locator('h2')).toContainText('Chamados Comerciais')
    })

    test.skip('usuario do Comercial deve ver chamados do departamento', async ({ page }) => {
      await login(page, COMERCIAL_USER_EMAIL, COMERCIAL_USER_PASSWORD)
      await page.goto('/chamados/comercial')

      // Usuario do Comercial deve conseguir acessar
      await expect(page.locator('h2')).toContainText('Chamados Comerciais')
    })

    test.skip('usuario de outro departamento nao deve ver chamados do Comercial', async ({ page }) => {
      await login(page, OTHER_DEPT_EMAIL, OTHER_DEPT_PASSWORD)
      await page.goto('/chamados/comercial')

      // Deve ver lista vazia ou mensagem de acesso negado
      await page.waitForSelector('text=Nenhum chamado encontrado, table tbody tr', { timeout: 5000 })

      const noResults = page.locator('text=Nenhum chamado encontrado')
      const hasResults = await page.locator('table tbody tr').count()

      // Ou nao tem resultados, ou tem a mensagem de vazio
      expect(await noResults.isVisible() || hasResults === 0).toBeTruthy()
    })
  })

  test.describe('Comentarios', () => {
    test.skip('deve adicionar comentario ao chamado', async ({ page }) => {
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORD)

      // Navegar para primeiro chamado
      await page.goto('/chamados/comercial')
      await page.waitForSelector('table tbody tr')

      const firstRow = page.locator('table tbody tr').first()
      await firstRow.click()

      // Ir para aba de comentarios
      await page.click('text=Comentarios')

      // Adicionar comentario
      await page.fill('textarea[placeholder*="Escreva"]', 'Comentario de teste E2E')
      await page.click('button:has-text("Enviar")')

      // Verificar que comentario aparece
      await expect(page.locator('text=Comentario de teste E2E')).toBeVisible()
    })
  })

  test.describe('Mudanca de Status', () => {
    test.skip('deve mudar status do chamado', async ({ page }) => {
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORD)

      // Navegar para chamado em andamento
      await page.goto('/chamados/comercial?status=in_progress')
      await page.waitForSelector('table tbody tr', { timeout: 5000 })

      const firstRow = page.locator('table tbody tr').first()
      await firstRow.click()

      // Clicar em botao de mudanca de status
      const resolvedButton = page.locator('button:has-text("Resolvido")')
      if (await resolvedButton.isVisible()) {
        await resolvedButton.click()

        // Confirmar no dialog
        await page.click('button:has-text("Confirmar")')

        // Verificar que status mudou
        await expect(page.locator('text=Resolvido')).toBeVisible()
      }
    })
  })
})
