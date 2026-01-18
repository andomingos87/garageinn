---
status: completed
generated: 2026-01-18
completed: 2026-01-18
epic: "3.1"
title: "Chamados Financeiros"
priority: high
agents:
  - type: "backend-specialist"
    role: "Implementar Server Actions para CRUD de chamados financeiros"
  - type: "frontend-specialist"
    role: "Desenvolver componentes UI do modulo financeiro"
  - type: "test-writer"
    role: "Criar testes E2E com Playwright"
  - type: "documentation-writer"
    role: "Atualizar BACKLOG.md e documentacao"
  - type: "security-auditor"
    role: "Validar RLS policies e seguranca"
docs:
  - "project-overview.md"
  - "architecture.md"
  - "security.md"
  - "data-flow.md"
phases:
  - id: "phase-1"
    name: "Configuracao e Constantes"
    prevc: "P"
    status: "completed"
  - id: "phase-2"
    name: "Backend (Server Actions)"
    prevc: "E"
    status: "completed"
  - id: "phase-3"
    name: "Frontend (Componentes e Paginas)"
    prevc: "E"
    status: "completed"
  - id: "phase-4"
    name: "Validacao e Testes E2E"
    prevc: "V"
    status: "completed"
  - id: "phase-5"
    name: "Documentacao e Commit"
    prevc: "C"
    status: "completed"
---

# Plano: Epico 3.1 - Chamados Financeiros

> Implementacao completa do modulo de Chamados do departamento Financeiro seguindo o padrao arquitetural dos modulos existentes (Compras, Manutencao, RH, Sinistros, Comercial).

## Visao Geral

### Objetivo Principal

Criar o modulo `/chamados/financeiro` com fluxo completo de abertura, listagem, triagem e execucao de chamados do departamento Financeiro.

### Diferencial do Modulo Financeiro

O modulo Financeiro e mais simples que outros modulos (como Comercial ou Sinistros) porque:
- **NAO requer tabela de detalhes especifica** - usa apenas a tabela `tickets` base
- Segue fluxo padrao de triagem/execucao
- Campos especificos sao atendidos pelas categorias ja existentes

### Contexto do Banco de Dados

**Departamento Financeiro ja existe:**
- **ID:** `589a0e19-768e-4051-bbd2-87cdea103748`
- **Nome:** `Financeiro`

**Categorias existentes (ja configuradas no seed):**

| ID | Nome |
|---|---|
| b0cb3e76-c4df-4a40-878f-5cbc33cd285e | Pagamento a Fornecedor |
| d93ea562-0a09-41f3-9159-da088bb9f615 | Reembolso |
| 48a1cd73-69b8-49fa-87b0-9ef80fd30ddb | Nota Fiscal |
| e6c15035-7bf9-4675-9fa8-10a829be592e | Cobranca |
| b1d16912-560a-4a12-8af9-8b7c64df8e8f | Conciliacao |
| 6923cceb-bd1d-41f2-9347-c2429f33dbef | Relatorio Financeiro |
| 8957ccbe-5c4e-4599-adb1-9a14cdc3fc67 | Outros |

### Referencias de Implementacao

- `/chamados/comercial` - Modelo principal (estrutura mais recente)
- `/chamados/compras` - Epico 1.6 (fluxo completo com aprovacoes)
- `/chamados/rh` - Epico 1.8 (fluxo simplificado)

---

## Fase 1 - Configuracao e Constantes

### Tarefa 1.1: Criar arquivo de constantes

**Responsavel:** backend-specialist
**Arquivo:** `apps/web/src/app/(app)/chamados/financeiro/constants.ts`
**Dependencias:** Nenhuma

**Descricao:**
Criar arquivo com constantes do modulo financeiro incluindo ID do departamento, transicoes de status permitidas, labels e cores.

**Arquivos envolvidos:**
- `apps/web/src/app/(app)/chamados/financeiro/constants.ts` (criar)

**Conteudo esperado:**
```typescript
// ID do departamento Financeiro
export const FINANCEIRO_DEPARTMENT_ID = "589a0e19-768e-4051-bbd2-87cdea103748";

// Transicoes de status permitidas (extraido do backlog)
export const statusTransitions: Record<string, string[]> = {
  awaiting_approval_encarregado: ["awaiting_approval_supervisor", "denied"],
  awaiting_approval_supervisor: ["awaiting_approval_gerente", "denied"],
  awaiting_approval_gerente: ["awaiting_triage", "denied"],
  awaiting_triage: ["prioritized", "in_progress", "denied"],
  prioritized: ["in_progress", "denied", "cancelled"],
  in_progress: ["resolved", "denied", "cancelled"],
  resolved: ["closed"],
  denied: ["awaiting_triage"], // reenvio
  closed: [],
  cancelled: [],
};

// Labels para status
export const statusLabels: Record<string, string> = {
  awaiting_approval_encarregado: "Aguardando Aprovacao (Encarregado)",
  awaiting_approval_supervisor: "Aguardando Aprovacao (Supervisor)",
  awaiting_approval_gerente: "Aguardando Aprovacao (Gerente)",
  awaiting_triage: "Aguardando Triagem",
  prioritized: "Priorizado",
  in_progress: "Em Andamento",
  resolved: "Resolvido",
  closed: "Fechado",
  denied: "Negado",
  cancelled: "Cancelado",
};

// Cores para status
export const statusColors: Record<string, string> = {
  awaiting_approval_encarregado: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  awaiting_approval_supervisor: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  awaiting_approval_gerente: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  awaiting_triage: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  prioritized: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  in_progress: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  denied: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  cancelled: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

// Prioridades para triagem
export const PRIORITIES = [
  { value: "low", label: "Baixa" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
  { value: "urgent", label: "Urgente" },
] as const;

export const PRIORITY_LABELS: Record<string, string> = {
  low: "Baixa",
  medium: "Media",
  high: "Alta",
  urgent: "Urgente",
};

export const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

// Urgencia percebida
export const PERCEIVED_URGENCY = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
] as const;

// Funcao helper
export function getAllowedTransitions(currentStatus: string): string[] {
  return statusTransitions[currentStatus] || [];
}
```

**Criterios de Aceite (do backlog):**
- [ ] Arquivo criado com ID do departamento correto
- [ ] Transicoes de status seguem fluxo definido no PRD
- [ ] Labels em portugues
- [ ] Exportacoes TypeScript corretas

**Tipo de teste:** Unit test (opcional)

---

## Fase 2 - Backend (Server Actions)

### Tarefa 2.1: Criar Server Actions principais

**Responsavel:** backend-specialist
**Arquivo:** `apps/web/src/app/(app)/chamados/financeiro/actions.ts`
**Dependencias:** Tarefa 1.1

**Descricao:**
Implementar todas as server actions necessarias para o CRUD de chamados financeiros, seguindo o padrao do modulo Comercial.

**Arquivos envolvidos:**
- `apps/web/src/app/(app)/chamados/financeiro/actions.ts` (criar)
- `apps/web/src/lib/supabase/server.ts` (importar)
- `apps/web/src/lib/units.ts` (importar getUserUnits)

**Actions a implementar:**

| Action | Descricao | Parametros |
|--------|-----------|------------|
| `getFinanceiroCategories` | Listar categorias do Financeiro | - |
| `getFinanceiroTickets` | Listar chamados com filtros | `filters`, `page`, `limit` |
| `getFinanceiroTicket` | Obter detalhes de um chamado | `id` |
| `getFinanceiroStats` | Estatisticas para cards | - |
| `createFinanceiroTicket` | Criar novo chamado | `formData: FormData` |
| `updateFinanceiroTicketStatus` | Mudar status | `ticketId`, `newStatus`, `reason?` |
| `triageFinanceiroTicket` | Triagem do chamado | `ticketId`, `formData` |
| `addFinanceiroTicketComment` | Adicionar comentario | `ticketId`, `content`, `isInternal` |
| `canTriageFinanceiroTicket` | Verificar permissao de triagem | - |
| `getFinanceiroDepartmentMembers` | Listar membros do departamento | - |
| `checkNeedsApproval` | Verificar se precisa aprovacao | - |
| `getCurrentUser` | Obter usuario atual | - |
| `checkIsAdmin` | Verificar se e admin | - |

**Criterios de Aceite (extraidos do backlog - Tarefa 3.1.1 e 3.1.2):**

**Para abertura de chamado:**
- [ ] Chamado e criado com status `awaiting_triage` (ou fluxo de aprovacao se aplicavel)
- [ ] Numero do chamado e gerado automaticamente (formato: FIN-XXXX ou sequencial)
- [ ] Departamento destinatario e automaticamente "Financeiro"
- [ ] Autor do chamado e o usuario logado
- [ ] Anexos sao salvos no bucket `ticket-attachments` do Supabase Storage
- [ ] Historico inicial e registrado em `ticket_history`
- [ ] RLS aplica corretamente as politicas de visibilidade
- [ ] Se chamado for criado por Manobrista para Financeiro, segue fluxo de aprovacao

**Para listagem:**
- [ ] Lista mostra: numero, titulo, status, prioridade, unidade, responsavel, data de criacao
- [ ] Ordenacao padrao e por data de criacao (mais recente primeiro)
- [ ] Paginacao funciona corretamente (20 itens por pagina)
- [ ] Contador total de chamados e exibido

**Para triagem:**
- [ ] Apenas Gerentes e Supervisores do departamento Financeiro podem triar
- [ ] Verificacao server-side bloqueia tentativas nao autorizadas
- [ ] Ao triar, status muda de `awaiting_triage` para `prioritized` ou `in_progress`
- [ ] Prioridade oficial e definida
- [ ] Responsavel e atribuido ao chamado
- [ ] Historico registra acao de triagem em `ticket_history`

**Para mudanca de status:**
- [ ] Transicoes seguem o fluxo definido em constants.ts
- [ ] Validacao client e server-side das transicoes
- [ ] Toda mudanca de status e registrada em `ticket_history`
- [ ] Campo de observacao/justificativa e obrigatorio para negacao

**Tipo de teste:** Integration test

---

### Tarefa 2.2: Implementar schemas de validacao Zod

**Responsavel:** backend-specialist
**Arquivo:** `apps/web/src/app/(app)/chamados/financeiro/actions.ts` (dentro do arquivo)
**Dependencias:** Tarefa 2.1

**Descricao:**
Criar schemas Zod para validacao dos formularios de criacao e triagem.

**Schemas necessarios:**
```typescript
import { z } from "zod";

export const createFinanceiroTicketSchema = z.object({
  title: z.string().min(3, "Titulo deve ter no minimo 3 caracteres"),
  description: z.string().min(10, "Descricao deve ter no minimo 10 caracteres"),
  categoryId: z.string().uuid("Categoria invalida"),
  unitId: z.string().uuid("Unidade invalida").optional(),
  perceivedUrgency: z.enum(["baixa", "media", "alta"]).optional(),
});

export const triageFinanceiroTicketSchema = z.object({
  ticketId: z.string().uuid(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  assignedTo: z.string().uuid().optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});
```

**Criterios de Aceite (do backlog):**
- [ ] Titulo: minimo 3 caracteres, obrigatorio
- [ ] Categoria: obrigatorio, valida UUID
- [ ] Unidade(s): opcional, valida UUID
- [ ] Descricao/Justificativa: minimo 10 caracteres, obrigatorio
- [ ] Urgencia Percebida: opcional, valores Baixa/Media/Alta
- [ ] Mensagens de erro sao claras e especificas

**Tipo de teste:** Unit test

---

## Fase 3 - Frontend (Componentes e Paginas)

### Tarefa 3.1: Criar estrutura de diretorios

**Responsavel:** frontend-specialist
**Dependencias:** Fase 2 completa

**Descricao:**
Criar toda a estrutura de pastas e arquivos do modulo financeiro.

**Arquivos envolvidos:**
```
apps/web/src/app/(app)/chamados/financeiro/
├── actions.ts                    # Server Actions (ja criado na Fase 2)
├── constants.ts                  # Constantes (ja criado na Fase 1)
├── loading.tsx                   # Loading state da pagina
├── page.tsx                      # Pagina de listagem
├── components/
│   ├── index.ts                  # Barrel export
│   ├── financeiro-form.tsx       # Formulario de criacao
│   ├── financeiro-filters.tsx    # Filtros
│   ├── financeiro-table.tsx      # Tabela
│   ├── financeiro-stats-cards.tsx # Cards de estatisticas
│   ├── financeiro-pagination.tsx # Paginacao
│   └── financeiro-status-badge.tsx # Badge de status
├── novo/
│   └── page.tsx                  # Pagina de novo chamado
└── [ticketId]/
    ├── page.tsx                  # Pagina de detalhes
    ├── loading.tsx               # Loading state
    ├── not-found.tsx             # 404
    └── components/
        ├── index.ts
        ├── financeiro-header.tsx      # Cabecalho do chamado
        ├── financeiro-info.tsx        # Informacoes do chamado
        ├── financeiro-actions.tsx     # Botoes de acao/status
        ├── financeiro-comments.tsx    # Comentarios
        ├── financeiro-timeline.tsx    # Timeline/historico
        ├── financeiro-triage-dialog.tsx # Dialog de triagem
        └── financeiro-approvals.tsx   # Fluxo de aprovacao (se aplicavel)
```

**Criterios de Aceite:**
- [ ] Todas as pastas criadas
- [ ] Arquivos `index.ts` com barrel exports
- [ ] Estrutura segue padrao do modulo Comercial

**Tipo de teste:** N/A (estrutura)

---

### Tarefa 3.2: Pagina de listagem (page.tsx)

**Responsavel:** frontend-specialist
**Arquivo:** `apps/web/src/app/(app)/chamados/financeiro/page.tsx`
**Dependencias:** Tarefa 3.1, Tarefa 2.1

**Descricao:**
Criar pagina de listagem de chamados financeiros com stats, filtros e tabela.

**Criterios de Aceite (extraidos do backlog - Tarefa 3.1.1):**

**Rota e Navegacao:**
- [ ] Rota `/chamados/financeiro` acessivel
- [ ] Menu lateral exibe "Financeiro" quando usuario tem permissao `tickets:read` para departamento Financeiro
- [ ] Botao "Novo Chamado" redireciona para `/chamados/financeiro/novo`

**Listagem de Chamados:**
- [ ] Pagina exibe lista de chamados do departamento Financeiro
- [ ] Lista mostra: numero, titulo, status, prioridade, unidade, responsavel, data de criacao
- [ ] Ordenacao padrao por data de criacao (mais recente primeiro)
- [ ] Paginacao funciona corretamente (20 itens por pagina)
- [ ] Contador total de chamados exibido

**Estatisticas (Cards):**
- [ ] Total de chamados abertos
- [ ] Chamados aguardando triagem
- [ ] Chamados em andamento
- [ ] Chamados resolvidos (ultimos 30 dias)
- [ ] Estatisticas calculadas conforme visibilidade do usuario (RBAC)

**Tipo de teste:** E2E

---

### Tarefa 3.3: Componente de filtros (financeiro-filters.tsx)

**Responsavel:** frontend-specialist
**Arquivo:** `apps/web/src/app/(app)/chamados/financeiro/components/financeiro-filters.tsx`
**Dependencias:** Tarefa 3.1

**Descricao:**
Criar componente de filtros com sincronizacao via URL.

**Criterios de Aceite (extraidos do backlog):**

**Filtros Disponiveis:**
- [ ] Filtro por Status (dropdown): Todos, Aguardando Triagem, Priorizado, Em Andamento, Resolvido, Fechado, Negado, Cancelado
- [ ] Filtro por Prioridade (dropdown): Todas, Baixa, Media, Alta, Urgente
- [ ] Filtro por Categoria (dropdown): Todas + categorias ativas do Financeiro
- [ ] Filtro por Unidade (dropdown): Todas + unidades visiveis ao usuario (conforme RBAC)
- [ ] Filtro por Responsavel (dropdown): Todos + membros do departamento Financeiro
- [ ] Filtro por Periodo (date picker): Data inicial e data final
- [ ] Botao "Limpar Filtros" reseta todos os filtros

**Busca:**
- [ ] Campo de busca permite pesquisar por:
  - Numero do chamado (ex: "FIN-123" ou "123")
  - Titulo do chamado (busca parcial, case-insensitive)
- [ ] Busca funciona em conjunto com os filtros
- [ ] Resultados atualizados em tempo real ao aplicar filtros/busca
- [ ] Mensagem "Nenhum chamado encontrado" quando nao ha resultados

**Tipo de teste:** E2E

---

### Tarefa 3.4: Formulario de criacao (financeiro-form.tsx)

**Responsavel:** frontend-specialist
**Arquivo:** `apps/web/src/app/(app)/chamados/financeiro/components/financeiro-form.tsx`
**Dependencias:** Tarefa 3.1, Tarefa 2.2

**Descricao:**
Criar formulario de criacao de chamados financeiros.

**Campos do formulario (extraidos do backlog):**

| Campo | Tipo | Obrigatorio | Validacao |
|-------|------|-------------|-----------|
| Titulo | Input | Sim | Minimo 3 caracteres |
| Categoria | Select | Sim | Categorias do Financeiro |
| Unidade(s) | Multi-select | Nao | Unidades do usuario conforme RBAC |
| Descricao/Justificativa | Textarea | Sim | Minimo 10 caracteres |
| Urgencia Percebida | Select | Nao | Baixa/Media/Alta |
| Anexos | FileUpload | Nao | Maximo 50MB por arquivo |

**Categorias disponiveis (conforme seed):**
- Pagamento a Fornecedor
- Reembolso
- Nota Fiscal
- Cobranca
- Conciliacao
- Relatorio Financeiro
- Outros

**Criterios de Aceite (extraidos do backlog):**
- [ ] Formulario exibe todos os campos obrigatorios
- [ ] Validacao client-side e server-side funcionam corretamente
- [ ] Mensagens de erro sao claras e especificas
- [ ] Apos submissao bem-sucedida, redireciona para `/chamados/financeiro/[ticketId]`
- [ ] Loading state durante submit
- [ ] Toast de sucesso/erro

**Tipo de teste:** E2E

---

### Tarefa 3.5: Pagina de detalhes ([ticketId]/page.tsx)

**Responsavel:** frontend-specialist
**Arquivo:** `apps/web/src/app/(app)/chamados/financeiro/[ticketId]/page.tsx`
**Dependencias:** Tarefa 3.1, Tarefa 2.1

**Descricao:**
Criar pagina de detalhes do chamado com todas as secoes necessarias.

**Criterios de Aceite (extraidos do backlog - Tarefa 3.1.2):**

**Detalhes do Chamado:**
- [ ] Pagina `/chamados/financeiro/[ticketId]` exibe:
  - Informacoes completas do chamado
  - Status atual com badge colorido
  - Prioridade oficial
  - Responsavel atribuido
  - Historico de mudancas
  - Comentarios
  - Anexos
  - Acoes disponiveis (triagem, mudanca de status, comentarios)
- [ ] Layout e responsivo e segue design system
- [ ] Exibe 404 se chamado nao encontrado

**Comentarios:**
- [ ] Usuarios podem adicionar comentarios em qualquer momento
- [ ] Comentarios exibidos em thread cronologica
- [ ] Comentarios suportam anexos (opcional)

**Tipo de teste:** E2E

---

### Tarefa 3.6: Dialog de triagem (financeiro-triage-dialog.tsx)

**Responsavel:** frontend-specialist
**Arquivo:** `apps/web/src/app/(app)/chamados/financeiro/[ticketId]/components/financeiro-triage-dialog.tsx`
**Dependencias:** Tarefa 3.1, Tarefa 2.1

**Descricao:**
Criar dialog de triagem de chamados.

**Criterios de Aceite (extraidos do backlog - Tarefa 3.1.2):**

**Permissoes de Triagem:**
- [ ] Apenas Gerentes e Supervisores do departamento Financeiro podem triar chamados
- [ ] Usuarios sem permissao nao veem botao/opcao de triagem

**Dialog/Modal de Triagem:**
- [ ] Dialog de triagem e exibido ao clicar em "Triar Chamado"
- [ ] Dialog mostra informacoes do chamado: numero, titulo, urgencia percebida, descricao
- [ ] Campos do formulario de triagem:
  - Prioridade (select obrigatorio): Baixa, Media, Alta, Urgente
  - Responsavel (select obrigatorio): lista membros do departamento Financeiro
  - Previsao de Conclusao (date picker, opcional)
- [ ] Validacao impede submissao sem prioridade e responsavel

**Processo de Triagem:**
- [ ] Apos triagem, chamado sai da lista "Aguardando Triagem"

**Negacao na Triagem:**
- [ ] Opcao de negar chamado durante triagem
- [ ] Justificativa e obrigatoria ao negar
- [ ] Status muda para `denied`
- [ ] Autor do chamado pode fechar ou editar e reenviar chamado negado

**Tipo de teste:** E2E

---

### Tarefa 3.7: Componente de acoes de status (financeiro-actions.tsx)

**Responsavel:** frontend-specialist
**Arquivo:** `apps/web/src/app/(app)/chamados/financeiro/[ticketId]/components/financeiro-actions.tsx`
**Dependencias:** Tarefa 3.1

**Descricao:**
Criar componente para mudanca de status do chamado.

**Criterios de Aceite (extraidos do backlog):**

**Transicoes de Status Permitidas:**
- [ ] Transicoes seguem o fluxo padrao definido no PRD:
  - `awaiting_triage` -> `prioritized`, `in_progress`, `denied`
  - `prioritized` -> `in_progress`, `denied`, `cancelled`
  - `in_progress` -> `resolved`, `denied`, `cancelled`
  - `resolved` -> `closed`
  - `denied` -> `awaiting_triage` (reenvio)
  - `closed` -> (sem transicoes)
  - `cancelled` -> (sem transicoes)
- [ ] Apenas transicoes validas sao permitidas (validacao client e server-side)

**Permissoes para Mudanca de Status:**
- [ ] Responsavel pelo chamado pode alterar status
- [ ] Gerentes do Financeiro podem alterar status de qualquer chamado do departamento
- [ ] Autor pode cancelar chamado (se nao estiver fechado)
- [ ] Autor pode fechar chamado apos resolucao

**Interface de Mudanca de Status:**
- [ ] Botoes/dropdown de acoes de status exibidos conforme estado atual
- [ ] Apenas transicoes permitidas sao mostradas
- [ ] Confirmacao solicitada para acoes criticas (negar, cancelar, fechar)
- [ ] Campo de observacao/justificativa e obrigatorio para negacao

**Validacoes e Regras de Negocio:**
- [ ] Chamado nao pode ser fechado sem estar resolvido
- [ ] Chamado negado pode ser reenviado (volta para `awaiting_triage`)
- [ ] Chamado cancelado nao pode ser reaberto (exceto por admin)
- [ ] Chamado fechado pode ser reaberto pelo autor (ate 7 dias apos fechamento)

**Tipo de teste:** E2E

---

### Tarefa 3.8: Adicionar rota ao menu lateral

**Responsavel:** frontend-specialist
**Arquivo:** `apps/web/src/components/layout/app-sidebar.tsx` (ou similar)
**Dependencias:** Nenhuma

**Descricao:**
Adicionar link "Financeiro" no menu lateral de chamados.

**Criterios de Aceite:**
- [ ] Link "Financeiro" aparece no menu lateral sob "Chamados"
- [ ] Link visivel apenas para usuarios com permissao no departamento Financeiro
- [ ] Icone apropriado (ex: DollarSign, Wallet, ou similar do Lucide)

**Tipo de teste:** E2E

---

## Fase 4 - Validacao e Testes E2E

### Tarefa 4.1: Criar testes E2E com Playwright

**Responsavel:** test-writer
**Ferramenta:** Playwright MCP
**Arquivo:** `e2e/chamados-financeiro.spec.ts`
**Dependencias:** Fase 3 completa

**Descricao:**
Criar suite de testes E2E cobrindo todos os fluxos do modulo.

**Cenarios de teste:**

```typescript
import { test, expect } from '@playwright/test'

test.describe('Chamados Financeiros', () => {
  test.beforeEach(async ({ page }) => {
    // Login como usuario do Financeiro
  })

  test('deve acessar pagina de listagem', async ({ page }) => {
    await page.goto('/chamados/financeiro')
    await expect(page.locator('h2')).toContainText('Chamados Financeiros')
    await expect(page.locator('table')).toBeVisible()
  })

  test('deve criar novo chamado financeiro', async ({ page }) => {
    await page.goto('/chamados/financeiro/novo')
    await page.fill('[name="title"]', 'Solicitacao de reembolso')
    await page.fill('[name="description"]', 'Descricao detalhada do reembolso solicitado')
    await page.selectOption('[name="category_id"]', { label: 'Reembolso' })
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/chamados\/financeiro\/[\w-]+/)
  })

  test('deve filtrar chamados por status', async ({ page }) => {
    await page.goto('/chamados/financeiro')
    await page.selectOption('[name="status"]', 'in_progress')
    await expect(page).toHaveURL(/status=in_progress/)
  })

  test('deve fazer triagem de chamado (supervisor)', async ({ page }) => {
    // Login como supervisor do financeiro
    // Navegar para chamado aguardando triagem
    // Abrir dialog de triagem
    // Preencher prioridade e responsavel
    // Confirmar triagem
    // Verificar mudanca de status
  })

  test('deve adicionar comentario', async ({ page }) => {
    // Navegar para detalhes de um chamado
    // Preencher campo de comentario
    // Submeter
    // Verificar comentario na lista
  })

  test('deve mudar status do chamado', async ({ page }) => {
    // Navegar para detalhes de um chamado
    // Clicar em acao de mudanca de status
    // Confirmar
    // Verificar novo status
  })

  test('usuario sem permissao nao ve chamados do Financeiro', async ({ page }) => {
    // Login como usuario de outro departamento (ex: RH)
    // Tentar acessar /chamados/financeiro
    // Verificar que lista esta vazia ou acesso negado
  })
})
```

**Criterios de Aceite:**
- [ ] Teste de acesso a listagem passando
- [ ] Teste de criacao de chamado passando
- [ ] Teste de filtros passando
- [ ] Teste de triagem passando
- [ ] Teste de comentarios passando
- [ ] Teste de mudanca de status passando
- [ ] Teste de permissoes/seguranca passando
- [ ] Todos os testes isolados e reproduziveis

**Tipo de teste:** E2E

---

### Tarefa 4.2: Validar RLS e permissoes

**Responsavel:** security-auditor
**Ferramenta:** Supabase MCP (`get_advisors`, `execute_sql`)
**Dependencias:** Tarefa 4.1

**Descricao:**
Validar que as policies RLS existentes na tabela `tickets` funcionam corretamente para o departamento Financeiro.

**Cenarios de seguranca:**

| Usuario | Acao | Resultado Esperado |
|---------|------|-------------------|
| Admin | Ver todos chamados Financeiro | Sucesso |
| Gerente Financeiro | Ver chamados do Financeiro | Sucesso |
| Analista Financeiro | Ver proprios chamados | Sucesso |
| Usuario RH | Ver chamados Financeiro | Lista vazia |
| Manobrista | Criar chamado para Financeiro | Sucesso (com aprovacao) |

**Criterios de Aceite:**
- [ ] Executar `get_advisors({ type: 'security' })` - sem alertas para tabelas envolvidas
- [ ] Admin ve todos os chamados
- [ ] Usuario Financeiro ve apenas chamados do departamento
- [ ] Usuario de outro departamento nao ve chamados do Financeiro
- [ ] Sem vazamento de dados entre departamentos

**Tipo de teste:** Security audit

---

## Fase 5 - Documentacao e Commit

### Tarefa 5.1: Atualizar BACKLOG.md

**Responsavel:** documentation-writer
**Arquivo:** `docs/BACKLOG.md`
**Dependencias:** Fase 4 completa

**Descricao:**
Marcar Epico 3.1 como completo no backlog.

**Atualizacoes:**
```markdown
### Epico 3.1 - Chamados Financeiros ✅
**Contexto**: fluxo padrao com prioridade e triagem.
**Status**: COMPLETO (verificado em 2026-01-XX)

- [x] Tarefa 3.1.1: Abertura e listagem
  - [x] Subtarefa: Formulario com categoria financeira ✅ (financeiro-form.tsx)
  - [x] Subtarefa: Filtros e busca ✅ (financeiro-filters.tsx)
- [x] Tarefa 3.1.2: Triagem e execucao
  - [x] Subtarefa: Definir prioridade e responsavel ✅ (triageFinanceiroTicket)
  - [x] Subtarefa: Mudanca de status ✅ (updateFinanceiroTicketStatus)
```

**Criterios de Aceite:**
- [ ] Tarefa 3.1.1 marcada como completa
- [ ] Tarefa 3.1.2 marcada como completa
- [ ] Status do Epico 3.1 = COMPLETO
- [ ] Data de verificacao adicionada

**Tipo de teste:** N/A

---

### Tarefa 5.2: Commit das alteracoes

**Responsavel:** devops-specialist
**Dependencias:** Tarefa 5.1

**Descricao:**
Realizar commit de todas as alteracoes seguindo Conventional Commits.

**Comandos:**
```bash
# Verificar status
git status

# Adicionar arquivos
git add .

# Commit
git commit -m "$(cat <<'EOF'
feat(chamados): implementa modulo de chamados financeiros

- Cria estrutura completa do modulo /chamados/financeiro
- Implementa Server Actions para CRUD de chamados
- Desenvolve componentes de listagem, criacao e detalhes
- Adiciona dialog de triagem e timeline
- Cria testes E2E com Playwright
- Atualiza documentacao (BACKLOG.md)

Fecha Epico 3.1 do backlog (Fase 3)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"

# Verificar commit
git log -1
```

**Criterios de Aceite:**
- [ ] Todos os arquivos staged
- [ ] Commit realizado com mensagem descritiva
- [ ] Seguindo Conventional Commits (feat)
- [ ] Co-authored-by incluido
- [ ] Sem arquivos sensíveis (.env, credentials)

**Tipo de teste:** N/A

---

## Checklist Final

### Pre-requisitos Verificados
- [x] Departamento Financeiro existe no banco (ID: 589a0e19-768e-4051-bbd2-87cdea103748)
- [x] Categorias do Financeiro cadastradas (7 categorias)
- [x] Estrutura de referencia analisada (comercial, compras, rh)
- [x] Tabela `tickets` ja possui RLS configurado
- [x] NAO e necessario criar tabela de detalhes especifica

### Entregas por Fase
- [ ] **Fase 1:** Arquivo constants.ts criado
- [ ] **Fase 2:** Server Actions implementadas (13 actions)
- [ ] **Fase 3:** Paginas e componentes funcionais (~18 arquivos)
- [ ] **Fase 4:** Testes E2E criados e passando
- [ ] **Fase 5:** Documentacao atualizada e commit realizado

### Ferramentas MCP a Utilizar

| Ferramenta | Uso |
|------------|-----|
| Supabase MCP | `execute_sql` (queries), `get_advisors` (seguranca), `get_logs` (debug) |
| Playwright MCP | `browser_navigate`, `browser_click`, `browser_type`, `browser_snapshot`, `browser_fill_form` |
| Context7 MCP | Documentacao Next.js App Router, Supabase RLS |

---

## Plano de Rollback

### Triggers de Rollback
- Bugs criticos afetando funcionalidade core
- Problemas de integridade de dados
- Vulnerabilidades de seguranca
- Degradacao de performance

### Procedimentos

**Rollback de Codigo:**
```bash
# Reverter commits
git revert HEAD

# Ou restaurar branch anterior
git checkout main -- apps/web/src/app/\(app\)/chamados/financeiro/
```

**Pos-Rollback:**
1. Documentar razao do rollback
2. Notificar stakeholders
3. Agendar post-mortem
4. Atualizar plano com licoes aprendidas

---

## Notas de Implementacao

### Padroes a Seguir
1. **Server Actions:** `"use server"` no topo, validacao com Zod
2. **Cache:** `revalidatePath("/chamados/financeiro")` apos mutacoes
3. **Componentes:** shadcn/ui, variantes do design system
4. **Tipos:** TypeScript strict, usar `database.types.ts`
5. **Testes:** Playwright, cenarios isolados

### Ordem de Execucao
```
Fase 1 -> Fase 2 -> Fase 3 -> Fase 4 -> Fase 5
(Config)  (Backend) (Frontend) (Testes) (Docs)
```

### Diferencas do Modulo Comercial
- NAO tem tabela `ticket_financeiro_details` (usa apenas `tickets`)
- NAO tem campos de cliente/contrato (apenas titulo, descricao, categoria)
- Fluxo mais simples, similar ao RH

### Arquivos de Referencia
- `/chamados/comercial/actions.ts` - Modelo para actions
- `/chamados/comercial/constants.ts` - Modelo para constantes
- `/chamados/comercial/page.tsx` - Modelo para listagem
- `/chamados/comercial/components/` - Modelo para componentes
