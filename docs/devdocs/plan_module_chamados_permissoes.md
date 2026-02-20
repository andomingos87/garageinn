# Plano: Módulo Chamados e Permissões

> **Status:** RASCUNHO — Aguardando revisão do owner  
> **Data:** 2026-02-10  
> **Objetivo:** Definir o escopo, regras de negócio e estrutura do módulo de documentação `.context/modules/chamados-permissoes/` antes de criá-lo.

---

## 1. Por que um módulo unificado?

Chamados e Permissões são **inseparáveis** neste projeto. O tipo de chamado, o departamento do usuário, o papel (role) hierárquico e a unidade determinam juntos:

- Quais chamados o usuário **vê**
- Quais ações pode **executar** (criar, triar, aprovar, executar)
- Quais **transições de status** estão disponíveis
- Qual **fluxo de aprovação** se aplica

Documentá-los separados geraria redundância e contexto fragmentado para agentes de IA. Um módulo unificado garante que qualquer agente trabalhando em chamados entenda automaticamente as regras de acesso.

---

## 2. Escopo do Módulo

### 2.1 Diretórios inclusos

| Caminho | Conteúdo |
|---------|----------|
| `apps/web/src/app/(app)/chamados/` | Todas as rotas, pages, actions e componentes de chamados |
| `apps/web/src/app/(app)/chamados/components/` | Componentes compartilhados (hub, status badge, dialogs) |
| `apps/web/src/app/(app)/chamados/{tipo}/` | Rotas por tipo: compras, manutencao, financeiro, rh, ti, sinistros, comercial |
| `apps/web/src/app/(app)/chamados/admin/` | Administração de chamados deletados |
| `apps/web/src/lib/auth/permissions.ts` | Definição de todas as permissões e roles |
| `apps/web/src/lib/auth/rbac.ts` | Engine de verificação de permissões |
| `apps/web/src/lib/auth/impersonation.ts` | Sistema de impersonação |
| `apps/web/src/lib/auth/ti-access.ts` | Regras especiais de acesso a TI |
| `apps/web/src/hooks/use-permissions.ts` | Hook client-side de permissões |
| `apps/web/src/hooks/use-impersonation.ts` | Hook de impersonação |
| `apps/web/src/app/(app)/usuarios/` | Gestão de usuários e atribuição de roles |
| `apps/web/src/app/api/relatorios/chamados/` | API de relatórios (PDF/Excel) |
| `apps/mobile/src/modules/tickets/` | Módulo mobile de chamados |
| `docs/database/migrations/001-003` | Schema, functions e RLS |
| `supabase/functions/impersonate-user/` | Edge Function de impersonação |

### 2.2 Fora do escopo

| Item | Motivo |
|------|--------|
| Checklists | Domínio separado, embora use permissões semelhantes |
| Unidades (CRUD) | Domínio de infraestrutura, apenas referenciado por chamados |
| Dashboard geral | Consome dados de chamados mas não é parte do domínio |
| Configurações globais | Módulo transversal |

---

## 3. Regras de Negócio Fundamentais

### 3.1 Hierarquia de Roles

```
┌─────────────────────────────────────────────┐
│              ROLES GLOBAIS                   │
│  (admin:all — acesso total ao sistema)       │
│  • Desenvolvedor                             │
│  • Diretor                                   │
│  • Administrador                             │
├─────────────────────────────────────────────┤
│           ROLES POR DEPARTAMENTO             │
│  (permissões específicas ao departamento)    │
│                                              │
│  Operações:                                  │
│    Manobrista < Encarregado < Supervisor     │
│    < Gerente                                 │
│                                              │
│  Compras e Manutenção:                       │
│    Assistente < Comprador < Gerente          │
│                                              │
│  Financeiro:                                 │
│    Auxiliar < Assistente < Analista Jr        │
│    < Analista Pl < Analista Sr < Supervisor  │
│    < Gerente                                 │
│                                              │
│  TI:                                         │
│    Analista < Gerente (admin:all)            │
│                                              │
│  RH:                                         │
│    Auxiliar < Assistente < Analista Jr        │
│    < Analista Pl < Analista Sr < Supervisor  │
│    < Gerente                                 │
│                                              │
│  Comercial:                                  │
│    Gerente (somente leitura + relatórios)    │
│                                              │
│  Auditoria:                                  │
│    Auditor < Gerente                         │
│                                              │
│  Sinistros:                                  │
│    Supervisor < Gerente                      │
└─────────────────────────────────────────────┘
```

### 3.2 Tipos de Permissão de Chamados

| Permissão | O que permite | Quem tem |
|-----------|---------------|----------|
| `tickets:read` | Visualizar chamados do departamento | Quase todos os roles |
| `tickets:create` | Criar novos chamados | Operações (todos), alguns outros |
| `tickets:triage` | Triar (definir prioridade, responsável) | Gerentes de departamento |
| `tickets:approve` | Aprovar ou negar chamados | Encarregado+, Gerentes, Auditoria |
| `tickets:execute` | Executar ações operacionais (cotações, execuções, mudança de status) | Comprador+, Analista+, Supervisor Sinistros+ |
| `admin:all` | Tudo — bypass total de permissões | Desenvolvedor, Diretor, Administrador, TI Gerente |

### 3.3 Fluxo de Aprovação Hierárquica (Operações)

Este é o fluxo mais complexo do sistema. Chamados criados por usuários de **Operações** passam por aprovação escalonada antes de chegar à triagem do departamento de destino.

```
Manobrista cria chamado
  → awaiting_approval_encarregado
    → Encarregado aprova → awaiting_approval_supervisor
      → Supervisor aprova → awaiting_approval_gerente
        → Gerente aprova → awaiting_triage (departamento de destino)

Encarregado cria chamado
  → awaiting_approval_supervisor (pula nível 1)
    → Supervisor aprova → awaiting_approval_gerente
      → Gerente aprova → awaiting_triage

Supervisor cria chamado
  → awaiting_approval_gerente (pula níveis 1 e 2)
    → Gerente aprova → awaiting_triage

Gerente cria chamado
  → awaiting_triage (sem aprovação necessária)
```

**Regras:**
- O criador **nunca aprova** seu próprio chamado
- A aprovação é feita pelo nível imediatamente superior
- Se qualquer nível **negar**, status vai para `denied` com motivo obrigatório
- Roles globais (admin) criam direto em `awaiting_triage`

### 3.4 Fluxos de Status por Tipo de Chamado

#### Compras
```
awaiting_triage → prioritized → quoting → awaiting_approval
  → approved → purchasing → in_delivery → delivered → evaluating → closed
  → denied (em qualquer etapa com aprovação)
```

#### Manutenção
```
awaiting_triage → prioritized → technical_analysis → executing
  ↔ waiting_parts (pode alternar com executing)
  → completed → evaluating → closed
```

#### Financeiro
```
awaiting_triage → prioritized → in_progress → resolved → closed
  → denied
```

#### TI
```
awaiting_triage → prioritized → in_progress → resolved → closed
  → denied
```

#### RH
```
awaiting_triage → prioritized → in_progress → resolved → closed
  → denied
```

#### Sinistros
```
awaiting_triage → in_analysis → in_investigation
  → awaiting_customer → awaiting_quotations → in_repair
  → awaiting_payment → resolved → closed
```

#### Comercial
```
awaiting_triage → prioritized → in_progress → resolved → closed
  → denied
```

**Regra universal:** Todo tipo pode ir para `cancelled` a partir de qualquer status.

### 3.5 Visibilidade de Chamados

| Role | Pode ver |
|------|----------|
| Manobrista/Encarregado | Chamados da **sua unidade** + seus próprios |
| Supervisor | Chamados das suas unidades + unidades de cobertura |
| Gerente (Operações) | Chamados de **todas as unidades** |
| Dept. destino (ex: Compras) | Chamados direcionados ao seu departamento |
| Assistente (Compras) | Não vê status `awaiting_approval_gerente` |
| Admin/Global | **Todos os chamados** |
| Criador | Sempre vê **seu próprio chamado** |
| Assigned_to | Sempre vê chamados **atribuídos a si** |

### 3.6 Regras Especiais de TI

- Membros do departamento de TI acessam **todos** os chamados de TI
- Criadores de fora do TI acessam **apenas seus próprios** chamados de TI
- Aprovadores de Operações acessam chamados de TI que estão **aguardando aprovação do seu nível**
- Verificação via `apps/web/src/lib/auth/ti-access.ts`

### 3.7 Impersonação

| Regra | Detalhe |
|-------|---------|
| Quem pode impersonar | Apenas Administrador e Desenvolvedor (roles globais) |
| Não pode impersonar | A si mesmo |
| Não pode impersonar | Outros admins (Administrador, Desenvolvedor) |
| Mecanismo | Magic link via Edge Function + localStorage |
| Auditoria | Todas as impersonações são logadas |
| UX | Banner visível durante impersonação |

---

## 4. Modelo de Dados (Resumo)

### 4.1 Tabelas Core

```
┌──────────────┐     ┌──────────────┐     ┌──────────┐
│   profiles   │────>│  user_roles  │<────│  roles   │
│              │     │ (user_id,    │     │ (name,   │
│ id, email,   │     │  role_id)    │     │ dept_id, │
│ full_name,   │     └──────────────┘     │ is_global│)
│ status       │                          └──────────┘
│              │     ┌──────────────┐          │
│              │────>│  user_units  │     ┌──────────────┐
│              │     │ (user_id,    │     │ departments  │
└──────────────┘     │  unit_id,    │     │ (id, name)   │
       │             │  is_coverage)│     └──────────────┘
       │             └──────────────┘
       │                    │
       │             ┌──────────┐
       │             │  units   │
       │             └──────────┘
       │
       ▼
┌──────────────────┐
│     tickets      │
│ id, ticket_number│     ┌───────────────────────┐
│ title, desc,     │────>│  ticket_type_details   │
│ status, priority │     │  (1:1 por tipo)        │
│ department_id    │     │  • purchase_details    │
│ unit_id          │     │  • maintenance_details │
│ created_by       │     │  • claim_details       │
│ assigned_to      │     │  • rh_details          │
│ category_id      │     │  • it_details          │
└──────────────────┘     └───────────────────────┘
       │
       ├──> ticket_comments
       ├──> ticket_attachments
       ├──> ticket_history
       ├──> ticket_approvals
       ├──> ticket_purchase_items (Compras)
       ├──> ticket_quotations (Compras)
       └──> ticket_maintenance_executions (Manutenção)
```

### 4.2 Tabelas específicas de Sinistros

```
ticket_claim_details
  ├──> claim_communications
  ├──> claim_purchases
  │      ├──> claim_purchase_items
  │      └──> claim_purchase_quotations
  └──> accredited_suppliers (referência)
```

---

## 5. Camadas de Segurança

O sistema aplica permissões em **4 camadas**:

| Camada | Mecanismo | Onde |
|--------|-----------|------|
| 1. UI (Client) | `usePermissions()` hook, `RequirePermission` component | Esconde botões/menus |
| 2. Server Actions | `getCurrentUserPermissions()` + `hasPermission()` | Valida antes de executar |
| 3. RLS (Database) | Policies em todas as tabelas | Filtra dados no Postgres |
| 4. Edge Functions | Validação de role antes de operações sensíveis | Impersonação, convites |

**Princípio:** A camada UI é apenas UX — toda segurança real está nas camadas 2, 3 e 4.

---

## 6. Padrão de Código por Tipo de Chamado

Cada tipo segue a mesma **estrutura de diretório**:

```
chamados/{tipo}/
├── page.tsx              ← Lista (Server Component)
├── novo/
│   └── page.tsx          ← Formulário de criação
├── [ticketId]/
│   └── page.tsx          ← Detalhe do chamado
├── actions.ts            ← Server Actions (CRUD, status, comentários)
├── constants.ts          ← statusTransitions, labels, cores
├── types.ts              ← Interfaces TypeScript (quando necessário)
└── components/
    ├── {tipo}-form.tsx
    ├── {tipo}-table.tsx
    ├── {tipo}-filters.tsx
    ├── {tipo}-stats-cards.tsx
    ├── {tipo}-actions.tsx    ← Botões de ação no detalhe
    ├── {tipo}-header.tsx
    ├── {tipo}-info.tsx
    ├── {tipo}-timeline.tsx
    ├── {tipo}-comments.tsx
    └── {tipo}-approvals.tsx
```

**Convenções:**
- Server Actions são co-localizadas com a rota (nunca centralizadas)
- Cada `actions.ts` implementa `getCurrentUserPermissions()` internamente
- Status transitions são definidos em `constants.ts` como `Record<string, string[]>`
- Componentes de tipo nunca importam de outro tipo (isolamento de domínio)

---

## 7. Seções Planejadas para o README do Módulo

Após aprovação deste plano, o `README.md` do módulo conterá:

| Seção | Conteúdo |
|-------|----------|
| **Overview** | Parágrafo descrevendo o domínio unificado |
| **Scope** | Tabela com todos os diretórios (Seção 2.1) |
| **Key Components** | Tabela dos arquivos-chave por responsabilidade |
| **Data Flow** | Diagramas ASCII dos fluxos principais (criação, aprovação, triagem, execução) |
| **Data Model** | Resumo das tabelas e relacionamentos (Seção 4) |
| **Integration Points** | Supabase Storage, Edge Functions, Mobile App |
| **Security** | As 4 camadas de segurança (Seção 5) |
| **RBAC Rules** | Hierarquia completa, permissões por role (Seção 3.1-3.2) |
| **Approval Flow** | Fluxo hierárquico de Operações (Seção 3.3) |
| **Status Workflows** | Máquinas de estado por tipo (Seção 3.4) |
| **Visibility Rules** | Quem vê o quê (Seção 3.5) |
| **Environment Variables** | Variáveis necessárias |
| **Error Handling** | Padrões de erro, validação, mensagens |
| **Testing** | Locais de teste e comandos |
| **Conventions** | Padrões de código específicos do módulo (Seção 6) |
| **Known Limitations** | Tech debt honesto |

---

## 8. Entregáveis

Após aprovação, serão criados:

1. **`.context/modules/README.md`** — Index de módulos (usando template existente)
2. **`.context/modules/chamados-permissoes/README.md`** — Documentação completa do módulo
3. Atualização do **`.context/README.md`** se necessário

---

## 9. Perguntas para Revisão

Antes de prosseguir, confirme ou ajuste:

1. **Escopo unificado OK?** Chamados + Permissões juntos, ou prefere módulos separados?
2. **Faltou algum tipo de chamado?** Listei 7: Compras, Manutenção, Financeiro, RH, TI, Sinistros, Comercial.
3. **Faltou alguma regra de negócio?** As seções 3.1-3.7 cobrem o que você espera?
4. **Fluxo de aprovação está correto?** Manobrista → Encarregado → Supervisor → Gerente → Triagem.
5. **Alguma regra de visibilidade faltando?** Especialmente para Sinistros e Comercial.
6. **Quer incluir o módulo mobile** (`apps/mobile/src/modules/tickets/`) no mesmo módulo ou documentar separado?
7. **Profundidade do Data Model:** O resumo da Seção 4 é suficiente, ou quer incluir todas as colunas de todas as tabelas?
8. **Alguma limitação/tech debt conhecida** que devo incluir na seção "Known Limitations"?

---

> **Próximo passo:** Após sua revisão e aprovação (com possíveis ajustes), crio a documentação definitiva em `.context/modules/chamados-permissoes/README.md`.
