---
status: completed
generated: 2026-01-18
completed: 2026-01-18
epic: "2.2"
title: "Chamados de Comercial"
priority: high
agents:
  - type: "database-specialist"
    role: "Criar tabela ticket_comercial_details e RLS policies"
  - type: "backend-specialist"
    role: "Implementar Server Actions para CRUD de chamados comerciais"
  - type: "frontend-specialist"
    role: "Desenvolver componentes UI do módulo comercial"
  - type: "test-writer"
    role: "Criar testes E2E com Playwright"
  - type: "documentation-writer"
    role: "Atualizar BACKLOG.md, AGENTS.md e CLAUDE.md"
  - type: "security-auditor"
    role: "Validar RLS policies e segurança"
docs:
  - "project-overview.md"
  - "architecture.md"
  - "security.md"
  - "data-flow.md"
phases:
  - id: "phase-1"
    name: "Modelagem de Dados (Database)"
    prevc: "P"
    status: "completed"
  - id: "phase-2"
    name: "Backend (Server Actions)"
    prevc: "E"
    status: "completed"
  - id: "phase-3"
    name: "Frontend (Componentes e Páginas)"
    prevc: "E"
    status: "completed"
  - id: "phase-4"
    name: "Validação e Testes E2E"
    prevc: "V"
    status: "completed"
  - id: "phase-5"
    name: "Documentação e Commit"
    prevc: "C"
    status: "completed"
---

# Plano: Épico 2.2 — Chamados de Comercial

> Implementação completa do módulo de Chamados do departamento Comercial seguindo o padrão arquitetural dos módulos existentes (Compras, Manutenção, RH, Sinistros).

## Visão Geral

### Objetivo Principal
Criar o módulo `/chamados/comercial` com fluxo completo de abertura, listagem, triagem e execução de chamados do departamento Comercial.

### Critérios de Aceite Globais
- [ ] Rota `/chamados/comercial` funcional e acessível
- [ ] Formulário de abertura de chamados comerciais
- [ ] Listagem com filtros por status, prioridade, categoria e unidade
- [ ] Triagem e atribuição de responsável
- [ ] Fluxo de mudança de status completo
- [ ] RLS policies garantindo segurança de dados
- [ ] Testes E2E passando com Playwright
- [ ] Documentação atualizada (BACKLOG.md, AGENTS.md, CLAUDE.md)

### Contexto do Banco de Dados

**Departamento Comercial já existe:**
- ID: `60458004-2249-4aab-b7b5-d2558a6add2f`
- Nome: `Comercial`

**Categorias existentes:**
| ID | Nome |
|---|---|
| 14c4ff58-dd55-4ab4-96fe-dd252ece4495 | Cancelamento |
| 9962e6b4-469c-49f2-9412-82da79001f56 | Novo Contrato |
| dd2771e4-3e0c-475b-a5aa-3728d21f99a5 | Outros |
| e11f643e-c0aa-4402-8bdc-f4599d69fa4a | Proposta Comercial |
| d489f441-aa50-425c-b457-bfd05fcbc29c | Reclamação de Cliente |
| c09bb708-5e35-4c8b-8036-e2fbecc66971 | Renovação de Contrato |

### Referências de Implementação
- `/chamados/compras` — Épico 1.6 (estrutura completa com cotações)
- `/chamados/rh` — Épico 1.8 (fluxo simplificado)
- `/chamados/sinistros` — Épico 2.1 (detalhes específicos do cliente)

---

## Fase 1 — Modelagem de Dados (Database)

### Tarefa 1.1: Criar tabela `ticket_comercial_details`
**Responsável:** database-specialist
**Ferramenta:** Supabase MCP (`apply_migration`)

**Schema da tabela:**
```sql
CREATE TABLE ticket_comercial_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL UNIQUE REFERENCES tickets(id) ON DELETE CASCADE,
  comercial_type TEXT NOT NULL CHECK (comercial_type IN ('novo_contrato', 'renovacao', 'cancelamento', 'proposta', 'reclamacao', 'outros')),
  client_name TEXT,
  client_cnpj TEXT,
  client_phone TEXT,
  client_email TEXT,
  contract_value NUMERIC,
  contract_start_date DATE,
  contract_end_date DATE,
  proposal_deadline DATE,
  competitor_info TEXT,
  negotiation_notes TEXT,
  resolution_type TEXT CHECK (resolution_type IN ('approved', 'rejected', 'negotiating', 'pending')),
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índice para performance
CREATE INDEX idx_ticket_comercial_details_ticket_id ON ticket_comercial_details(ticket_id);

-- Comentário da tabela
COMMENT ON TABLE ticket_comercial_details IS 'Detalhes específicos de chamados do departamento Comercial';
```

**Critérios de Aceite:**
- [ ] Tabela criada com todos os campos
- [ ] Foreign key para `tickets.id` com ON DELETE CASCADE
- [ ] Índice em `ticket_id` criado
- [ ] Constraints CHECK para `comercial_type` e `resolution_type`

### Tarefa 1.2: Criar RLS Policies
**Responsável:** database-specialist
**Ferramenta:** Supabase MCP (`apply_migration`)

**Policies necessárias:**
```sql
-- Habilitar RLS
ALTER TABLE ticket_comercial_details ENABLE ROW LEVEL SECURITY;

-- SELECT: Usuários autenticados podem ver detalhes dos chamados que têm acesso via tickets
CREATE POLICY "Usuários podem ver detalhes de chamados comerciais que têm acesso"
ON ticket_comercial_details FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tickets t
    WHERE t.id = ticket_comercial_details.ticket_id
    AND (
      t.created_by = auth.uid()
      OR t.assigned_to = auth.uid()
      OR EXISTS (
        SELECT 1 FROM user_units uu
        WHERE uu.user_id = auth.uid()
        AND uu.unit_id = t.unit_id
      )
      OR EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.name IN ('Administrador', 'Desenvolvedor', 'Gerente Comercial', 'Coordenador Comercial')
      )
    )
  )
);

-- INSERT: Usuários autenticados podem criar detalhes
CREATE POLICY "Usuários autenticados podem criar detalhes comerciais"
ON ticket_comercial_details FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: Usuários do departamento Comercial ou admin podem atualizar
CREATE POLICY "Comercial e admin podem atualizar detalhes"
ON ticket_comercial_details FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    JOIN departments d ON r.department_id = d.id
    WHERE ur.user_id = auth.uid()
    AND (d.name = 'Comercial' OR r.name IN ('Administrador', 'Desenvolvedor'))
  )
);

-- DELETE: Apenas admin pode deletar
CREATE POLICY "Apenas admin pode deletar detalhes comerciais"
ON ticket_comercial_details FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('Administrador', 'Desenvolvedor')
  )
);
```

**Critérios de Aceite:**
- [ ] RLS habilitado na tabela
- [ ] Policy de SELECT criada e testada
- [ ] Policy de INSERT criada e testada
- [ ] Policy de UPDATE criada e testada
- [ ] Policy de DELETE criada e testada
- [ ] Verificado com `get_advisors` (security) — sem alertas

### Tarefa 1.3: Gerar TypeScript Types
**Responsável:** database-specialist
**Comando:** `npx supabase gen types typescript --project-id <id> > apps/web/src/lib/supabase/database.types.ts`

**Critérios de Aceite:**
- [ ] Tipos gerados incluem `ticket_comercial_details`
- [ ] Interface `TicketComercialDetails` disponível
- [ ] Arquivo `database.types.ts` atualizado e commitado

---

## Fase 2 — Backend (Server Actions)

### Tarefa 2.1: Criar arquivo de constantes
**Responsável:** backend-specialist
**Arquivo:** `apps/web/src/app/(app)/chamados/comercial/constants.ts`

```typescript
// Tipos de chamado comercial
export const COMERCIAL_TYPES = [
  { value: 'novo_contrato', label: 'Novo Contrato' },
  { value: 'renovacao', label: 'Renovação de Contrato' },
  { value: 'cancelamento', label: 'Cancelamento' },
  { value: 'proposta', label: 'Proposta Comercial' },
  { value: 'reclamacao', label: 'Reclamação de Cliente' },
  { value: 'outros', label: 'Outros' },
] as const

export const COMERCIAL_TYPE_LABELS: Record<string, string> = {
  novo_contrato: 'Novo Contrato',
  renovacao: 'Renovação de Contrato',
  cancelamento: 'Cancelamento',
  proposta: 'Proposta Comercial',
  reclamacao: 'Reclamação de Cliente',
  outros: 'Outros',
}

// Tipos de resolução
export const RESOLUTION_TYPES = [
  { value: 'approved', label: 'Aprovado' },
  { value: 'rejected', label: 'Rejeitado' },
  { value: 'negotiating', label: 'Em Negociação' },
  { value: 'pending', label: 'Pendente' },
] as const

// Transições de status permitidas
export const statusTransitions: Record<string, string[]> = {
  awaiting_triage: ['prioritized', 'in_progress', 'denied'],
  prioritized: ['in_progress', 'denied', 'cancelled'],
  in_progress: ['resolved', 'denied', 'cancelled'],
  resolved: ['closed'],
  denied: ['awaiting_triage'],
  closed: [],
  cancelled: [],
}

// Labels para status
export const statusLabels: Record<string, string> = {
  awaiting_triage: 'Aguardando Triagem',
  prioritized: 'Priorizado',
  in_progress: 'Em Andamento',
  resolved: 'Resolvido',
  closed: 'Fechado',
  denied: 'Negado',
  cancelled: 'Cancelado',
}

// Obtém transições permitidas para um status
export function getAllowedTransitions(currentStatus: string): string[] {
  return statusTransitions[currentStatus] || []
}
```

**Critérios de Aceite:**
- [ ] Arquivo criado com tipos, transições e labels
- [ ] Exportações TypeScript corretas
- [ ] Labels em português

### Tarefa 2.2: Criar Server Actions
**Responsável:** backend-specialist
**Arquivo:** `apps/web/src/app/(app)/chamados/comercial/actions.ts`

**Actions a implementar:**

| Action | Descrição | Parâmetros |
|--------|-----------|------------|
| `getComercialTickets` | Listar chamados com filtros | `filters`, `page`, `limit` |
| `getComercialTicket` | Obter detalhes de um chamado | `id` |
| `createComercialTicket` | Criar novo chamado | `data: FormData` |
| `updateComercialTicket` | Atualizar chamado | `id`, `data` |
| `triageComercialTicket` | Triagem do chamado | `id`, `priority`, `assignedTo`, `notes` |
| `updateComercialTicketStatus` | Mudar status | `id`, `status`, `notes` |
| `addComercialTicketComment` | Adicionar comentário | `ticketId`, `content`, `isInternal` |
| `getComercialTicketStats` | Estatísticas para cards | - |

**Padrão de implementação:**
```typescript
"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createComercialTicket(formData: FormData) {
  const supabase = await createClient()

  // Verificar autenticação
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autenticado")

  // Validar dados...
  // Inserir ticket...
  // Inserir detalhes comerciais...

  revalidatePath("/chamados/comercial")
  return { success: true, ticketId: ticket.id }
}
```

**Critérios de Aceite:**
- [ ] Todas as 8 actions implementadas
- [ ] Uso de `"use server"` no topo
- [ ] Validação de autenticação em todas as actions
- [ ] Verificação de permissões (RBAC)
- [ ] `revalidatePath` após mutações
- [ ] Tratamento de erros com try/catch
- [ ] Tipos TypeScript corretos (sem `any`)

### Tarefa 2.3: Schemas de validação Zod
**Responsável:** backend-specialist
**Local:** Dentro de `actions.ts` ou arquivo separado

```typescript
import { z } from "zod"

export const createComercialTicketSchema = z.object({
  title: z.string().min(5, "Título deve ter no mínimo 5 caracteres"),
  description: z.string().min(10, "Descrição deve ter no mínimo 10 caracteres"),
  categoryId: z.string().uuid("Categoria inválida"),
  unitId: z.string().uuid("Unidade inválida"),
  comercialType: z.enum(['novo_contrato', 'renovacao', 'cancelamento', 'proposta', 'reclamacao', 'outros']),
  perceivedUrgency: z.string().optional(),
  clientName: z.string().optional(),
  clientCnpj: z.string().optional(),
  clientPhone: z.string().optional(),
  clientEmail: z.string().email().optional().or(z.literal('')),
  contractValue: z.number().positive().optional(),
  contractStartDate: z.string().optional(),
  contractEndDate: z.string().optional(),
  proposalDeadline: z.string().optional(),
  competitorInfo: z.string().optional(),
})

export const triageComercialTicketSchema = z.object({
  ticketId: z.string().uuid(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  assignedTo: z.string().uuid().optional(),
  notes: z.string().optional(),
})
```

**Critérios de Aceite:**
- [ ] Schema de criação validando todos os campos
- [ ] Schema de triagem
- [ ] Mensagens de erro em português

---

## Fase 3 — Frontend (Componentes e Páginas)

### Tarefa 3.1: Criar estrutura de diretórios
**Responsável:** frontend-specialist

```
apps/web/src/app/(app)/chamados/comercial/
├── actions.ts                    # Server Actions
├── constants.ts                  # Constantes e tipos
├── loading.tsx                   # Loading state da página
├── page.tsx                      # Página de listagem
├── components/
│   ├── index.ts                  # Barrel export
│   ├── comercial-ticket-form.tsx # Formulário de criação
│   ├── comercial-tickets-filters.tsx # Filtros
│   ├── comercial-tickets-table.tsx   # Tabela
│   └── comercial-status-badge.tsx    # Badge de status
├── novo/
│   └── page.tsx                  # Página de novo chamado
└── [ticketId]/
    ├── page.tsx                  # Página de detalhes
    ├── loading.tsx               # Loading state
    ├── not-found.tsx             # 404
    └── components/
        ├── index.ts
        ├── comercial-ticket-actions.tsx  # Botões de ação
        ├── comercial-ticket-info.tsx     # Info do chamado
        ├── comercial-ticket-comments.tsx # Comentários
        ├── comercial-triage-dialog.tsx   # Dialog de triagem
        └── comercial-ticket-timeline.tsx # Timeline/histórico
```

**Critérios de Aceite:**
- [ ] Todas as pastas criadas
- [ ] Arquivos `index.ts` com barrel exports

### Tarefa 3.2: Página de listagem (`page.tsx`)
**Responsável:** frontend-specialist

**Estrutura:**
```tsx
export default async function ComercialTicketsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  // Buscar dados
  const { tickets, stats, total } = await getComercialTickets(searchParams)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1>Chamados Comerciais</h1>
        <Link href="/chamados/comercial/novo">
          <Button>Novo Chamado</Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <ComercialStatsCards stats={stats} />

      {/* Filters */}
      <ComercialTicketsFilters />

      {/* Table */}
      <ComercialTicketsTable tickets={tickets} />

      {/* Pagination */}
      <TicketsPagination total={total} />
    </div>
  )
}
```

**Critérios de Aceite:**
- [ ] Header com título e botão "Novo Chamado"
- [ ] Cards de estatísticas (total, abertos, em andamento, resolvidos)
- [ ] Filtros funcionais (status, prioridade, categoria, unidade, busca)
- [ ] Tabela com paginação
- [ ] Links para detalhes
- [ ] Responsivo (mobile/desktop)

### Tarefa 3.3: Formulário de criação (`comercial-ticket-form.tsx`)
**Responsável:** frontend-specialist

**Campos do formulário:**

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| Título | Input | Sim | Min 5 caracteres |
| Descrição | Textarea | Sim | Min 10 caracteres |
| Categoria | Select | Sim | Lista do banco |
| Unidade | Select | Sim | Lista do banco |
| Tipo Comercial | Select | Sim | COMERCIAL_TYPES |
| Urgência Percebida | Select | Não | baixa/média/alta |
| Nome do Cliente | Input | Não | - |
| CNPJ do Cliente | Input | Não | Máscara CNPJ |
| Telefone do Cliente | Input | Não | Máscara telefone |
| Email do Cliente | Input | Não | Formato email |
| Valor do Contrato | Input | Não | Número positivo |
| Data Início Contrato | DatePicker | Não | - |
| Data Fim Contrato | DatePicker | Não | - |
| Prazo Proposta | DatePicker | Não | - |
| Info Concorrente | Textarea | Não | - |
| Anexos | FileUpload | Não | Max 50MB |

**Critérios de Aceite:**
- [ ] Todos os campos implementados
- [ ] Validação com Zod + react-hook-form
- [ ] Máscaras para CNPJ e telefone
- [ ] DatePicker funcionando
- [ ] Upload de anexos
- [ ] Loading state durante submit
- [ ] Toast de sucesso/erro
- [ ] Redirect após criação

### Tarefa 3.4: Página de detalhes (`[ticketId]/page.tsx`)
**Responsável:** frontend-specialist

**Seções:**
1. **Header:** Número do chamado, título, status badge, botão voltar
2. **Info Geral:** Categoria, unidade, criador, data, prioridade
3. **Detalhes Comerciais:** Tipo, cliente, contrato, valores
4. **Timeline:** Histórico de mudanças
5. **Comentários:** Lista e formulário de novo comentário
6. **Ações:** Triagem, mudança de status (conforme permissão)

**Critérios de Aceite:**
- [ ] Carrega dados corretamente
- [ ] Exibe 404 se não encontrado
- [ ] Seções organizadas em cards/tabs
- [ ] Ações condicionais por permissão
- [ ] Loading states

### Tarefa 3.5: Dialog de triagem (`comercial-triage-dialog.tsx`)
**Responsável:** frontend-specialist

**Funcionalidades:**
- Modal com shadcn/ui Dialog
- Select de prioridade (baixa, média, alta, urgente)
- Select de responsável (usuários do departamento Comercial)
- Textarea para observações
- Botões Cancelar/Confirmar

**Critérios de Aceite:**
- [ ] Dialog abre/fecha corretamente
- [ ] Campos validados
- [ ] Loading durante submit
- [ ] Fecha e atualiza lista após sucesso

### Tarefa 3.6: Componentes de filtros e tabela
**Responsável:** frontend-specialist

**comercial-tickets-filters.tsx:**
- Filtros sincronizados com URL (useSearchParams)
- Debounce na busca por texto
- Clear all filters

**comercial-tickets-table.tsx:**
- Colunas: Número, Título, Tipo, Cliente, Prioridade, Status, Criado em, Ações
- Ordenação por coluna
- Ações rápidas (ver detalhes)

**comercial-status-badge.tsx:**
- Cores consistentes com design system
- Ícones por status

**Critérios de Aceite:**
- [ ] Filtros alteram URL
- [ ] Tabela responsiva (scroll horizontal em mobile)
- [ ] Cores de status corretas

---

## Fase 4 — Validação e Testes E2E

### Tarefa 4.1: Criar testes E2E com Playwright
**Responsável:** test-writer
**Ferramenta:** Playwright MCP
**Arquivo:** `e2e/chamados-comercial.spec.ts`

**Cenários de teste:**

```typescript
import { test, expect } from '@playwright/test'

test.describe('Chamados Comerciais', () => {
  test.beforeEach(async ({ page }) => {
    // Login como usuário do Comercial
    await page.goto('/login')
    await page.fill('[name="email"]', 'comercial@test.com')
    await page.fill('[name="password"]', 'password')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('deve listar chamados comerciais', async ({ page }) => {
    await page.goto('/chamados/comercial')
    await expect(page.locator('h1')).toContainText('Chamados Comerciais')
    await expect(page.locator('table')).toBeVisible()
  })

  test('deve criar novo chamado comercial', async ({ page }) => {
    await page.goto('/chamados/comercial/novo')
    await page.fill('[name="title"]', 'Teste de novo contrato')
    await page.fill('[name="description"]', 'Descrição do chamado de teste')
    // ... preencher outros campos
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/chamados\/comercial\/[\w-]+/)
  })

  test('deve filtrar chamados por status', async ({ page }) => {
    await page.goto('/chamados/comercial')
    await page.selectOption('[name="status"]', 'in_progress')
    await expect(page).toHaveURL(/status=in_progress/)
  })

  test('deve fazer triagem de chamado', async ({ page }) => {
    // ... implementar
  })

  test('deve adicionar comentário', async ({ page }) => {
    // ... implementar
  })
})
```

**Critérios de Aceite:**
- [ ] Teste de listagem passando
- [ ] Teste de criação passando
- [ ] Teste de filtros passando
- [ ] Teste de triagem passando
- [ ] Teste de comentários passando
- [ ] Todos os testes isolados e reproduzíveis

### Tarefa 4.2: Validar RLS com usuários diferentes
**Responsável:** test-writer
**Ferramenta:** Supabase MCP + Playwright MCP

**Cenários de segurança:**

| Usuário | Ação | Resultado Esperado |
|---------|------|-------------------|
| Admin | Ver todos chamados | Sucesso |
| Gerente Comercial | Ver chamados do Comercial | Sucesso |
| Operador Comercial | Ver próprios chamados | Sucesso |
| Usuário RH | Ver chamados Comercial | Negado (lista vazia) |

**Critérios de Aceite:**
- [ ] Admin vê todos os chamados
- [ ] Usuário Comercial vê apenas chamados do departamento
- [ ] Usuário de outro departamento não vê chamados do Comercial
- [ ] Sem vazamento de dados

### Tarefa 4.3: Executar verificações de segurança
**Responsável:** security-auditor
**Ferramenta:** Supabase MCP (`get_advisors`)

```typescript
// Executar via MCP
await mcp__supabase_gapp__get_advisors({ type: 'security' })
```

**Critérios de Aceite:**
- [ ] Sem alertas de segurança para `ticket_comercial_details`
- [ ] RLS policies válidas
- [ ] Sem vulnerabilidades OWASP (SQL injection, XSS)

---

## Fase 5 — Documentação e Commit

### Tarefa 5.1: Atualizar BACKLOG.md
**Responsável:** documentation-writer

**Atualizações:**
```markdown
### Épico 2.2 — Chamados de Comercial ✅
**Contexto**: fluxo padrao de abertura/triagem/execucao.
**Status**: COMPLETO (verificado em 2026-01-XX)

- [x] Tarefa 2.2.1: Abertura e listagem
  - [x] Subtarefa: Formulario padrao (comercial-ticket-form.tsx)
  - [x] Subtarefa: Filtros e busca (comercial-tickets-filters.tsx)
- [x] Tarefa 2.2.2: Triagem e execucao
  - [x] Subtarefa: Prioridade e responsavel (triageComercialTicket)
  - [x] Subtarefa: Mudanca de status (updateComercialTicketStatus)
```

**Critérios de Aceite:**
- [ ] Tarefa 2.2.1 marcada como completa
- [ ] Tarefa 2.2.2 marcada como completa
- [ ] Status do Épico 2.2 = COMPLETO
- [ ] Data de verificação adicionada

### Tarefa 5.2: Atualizar AGENTS.md
**Responsável:** documentation-writer

**Seções a atualizar:**
- Adicionar referência ao módulo comercial nos agentes:
  - `backend-specialist`
  - `frontend-specialist`
  - `database-specialist`

**Critérios de Aceite:**
- [ ] AGENTS.md atualizado com menções ao módulo comercial

### Tarefa 5.3: Atualizar CLAUDE.md
**Responsável:** documentation-writer

**Seções a atualizar:**

1. **Estrutura de diretórios:**
```markdown
├── app/
│   ├── (app)/
│   │   ├── chamados/
│   │   │   ├── comercial/         # Chamados do departamento Comercial (Épico 2.2)
```

2. **Glossário:**
```markdown
| **Comercial** | Chamados relacionados a contratos, propostas e clientes. |
```

**Critérios de Aceite:**
- [ ] Estrutura de diretórios atualizada
- [ ] Glossário com termo "Comercial"

### Tarefa 5.4: Commit das alterações
**Responsável:** devops-specialist

**Comandos:**
```bash
# Verificar status
git status

# Adicionar arquivos
git add .

# Commit com mensagem em português
git commit -m "$(cat <<'EOF'
feat(chamados): implementa módulo de chamados comerciais

- Cria tabela ticket_comercial_details com RLS policies
- Implementa Server Actions para CRUD de chamados
- Desenvolve componentes de listagem, criação e detalhes
- Adiciona dialog de triagem e timeline
- Cria testes E2E com Playwright
- Atualiza documentação (BACKLOG.md, AGENTS.md, CLAUDE.md)

Fecha Épico 2.2 do backlog

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

# Verificar commit
git log -1
```

**Critérios de Aceite:**
- [ ] Todos os arquivos staged
- [ ] Commit realizado com mensagem em português
- [ ] Seguindo Conventional Commits (feat, fix, docs, etc.)
- [ ] Co-authored-by incluído

---

## Checklist Final

### Pré-requisitos Verificados
- [x] Departamento Comercial existe no banco (ID: 60458004-2249-4aab-b7b5-d2558a6add2f)
- [x] Categorias do Comercial cadastradas (6 categorias)
- [x] Estrutura de referência analisada (compras, rh, sinistros)
- [x] Context7 consultado para boas práticas Next.js e Supabase

### Entregas por Fase
- [x] **Fase 1:** Tabela `ticket_comercial_details` criada com RLS
- [x] **Fase 2:** Server Actions implementadas (10 actions)
- [x] **Fase 3:** Páginas e componentes funcionais (27 arquivos)
- [x] **Fase 4:** Testes E2E criados
- [x] **Fase 5:** Documentação atualizada e commit realizado

### Ferramentas MCP a Utilizar
| Ferramenta | Uso |
|------------|-----|
| Supabase MCP | `apply_migration`, `execute_sql`, `get_advisors`, `list_tables`, `generate_typescript_types` |
| Playwright MCP | `browser_navigate`, `browser_click`, `browser_type`, `browser_snapshot`, `browser_fill_form` |
| Context7 MCP | Documentação Next.js App Router, Supabase RLS |

---

## Plano de Rollback

### Triggers de Rollback
- Bugs críticos afetando funcionalidade core
- Degradação de performance
- Problemas de integridade de dados
- Vulnerabilidades de segurança

### Procedimentos

**Rollback de Database:**
```sql
-- Remover RLS policies
DROP POLICY IF EXISTS "Usuários podem ver detalhes de chamados comerciais que têm acesso" ON ticket_comercial_details;
DROP POLICY IF EXISTS "Usuários autenticados podem criar detalhes comerciais" ON ticket_comercial_details;
DROP POLICY IF EXISTS "Comercial e admin podem atualizar detalhes" ON ticket_comercial_details;
DROP POLICY IF EXISTS "Apenas admin pode deletar detalhes comerciais" ON ticket_comercial_details;

-- Remover tabela
DROP TABLE IF EXISTS ticket_comercial_details;
```

**Rollback de Código:**
```bash
# Reverter commits
git revert HEAD

# Ou restaurar branch anterior
git checkout main -- apps/web/src/app/\(app\)/chamados/
```

**Pós-Rollback:**
1. Documentar razão do rollback
2. Notificar stakeholders
3. Agendar post-mortem
4. Atualizar plano com lições aprendidas

---

## Notas de Implementação

### Padrões a Seguir
1. **Server Actions:** `"use server"` no topo, validação com Zod
2. **Cache:** `revalidatePath("/chamados/comercial")` após mutações
3. **Componentes:** shadcn/ui, variantes do design system
4. **Tipos:** TypeScript strict, usar `database.types.ts`
5. **Testes:** Playwright, cenários isolados

### Ordem de Execução
```
Fase 1 → Fase 2 → Fase 3 → Fase 4 → Fase 5
(DB)     (Backend) (Frontend) (Testes) (Docs)
```

### Estimativa de Esforço
| Fase | Estimativa |
|------|-----------|
| Fase 1 - Database | 1-2 horas |
| Fase 2 - Backend | 3-4 horas |
| Fase 3 - Frontend | 4-6 horas |
| Fase 4 - Testes | 2-3 horas |
| Fase 5 - Docs | 1 hora |
| **Total** | **11-16 horas** |
