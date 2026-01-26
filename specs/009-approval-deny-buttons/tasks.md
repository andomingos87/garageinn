---

description: "Task list for approval/deny buttons by role"
---

# Tasks: Botões de Aprovar/Negar por Perfil

**Input**: Design documents from `/specs/009-approval-deny-buttons/`  
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md  
**Tests**: E2E Playwright para fluxo crítico (exigido pela constituição)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Validar contexto e alinhamento do escopo

- [ ] T001 Revisar requisitos em `specs/009-approval-deny-buttons/spec.md`
- [ ] T002 Revisar plano técnico em `specs/009-approval-deny-buttons/plan.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Definir regra de permissão por transição

- [ ] T003 Definir mapeamento de permissões por transição em `apps/web/src/app/(app)/chamados/compras/constants.ts`
- [ ] T004 Replicar mapeamento para Manutenção em `apps/web/src/app/(app)/chamados/manutencao/constants.ts`

**Checkpoint**: Mapeamento de permissões por transição definido

---

## Phase 3: User Story 1 - Aprovação restrita ao gerente (Priority: P1) 🎯 MVP

**Goal**: Comprador não vê ações de aprovação; gerente vê

**Independent Test**: Logar como comprador e gerente e comparar botões em “Em Cotação”

### Implementation for User Story 1

- [ ] T005 [US1] Filtrar transições exibidas por perfil em `apps/web/src/app/(app)/chamados/compras/[ticketId]/components/ticket-actions.tsx`
- [ ] T006 [US1] Passar permissões do usuário para o componente em `apps/web/src/app/(app)/chamados/compras/[ticketId]/page.tsx`

**Checkpoint**: Comprador não vê “Aprovar/Negar” em Compras

---

## Phase 4: User Story 2 - Consistência entre UI e permissões (Priority: P2)

**Goal**: Backend bloqueia aprovação indevida

**Independent Test**: Tentativa de aprovação com comprador deve falhar

### Implementation for User Story 2

- [ ] T007 [US2] Validar permissão de transição no backend em `apps/web/src/app/(app)/chamados/compras/actions.ts`
- [ ] T008 [US2] Aplicar validação equivalente em `apps/web/src/app/(app)/chamados/manutencao/actions.ts`

**Checkpoint**: Backend bloqueia transições não autorizadas

---

## Phase 5: User Story 3 - Coerência entre módulos (Priority: P3)

**Goal**: Regra consistente em módulos com aprovação

**Independent Test**: Validar comportamento equivalente em Manutenção

### Implementation for User Story 3

- [ ] T009 [US3] Filtrar transições por perfil em `apps/web/src/app/(app)/chamados/manutencao/[ticketId]/components/ticket-actions.tsx`
- [ ] T010 [US3] Passar permissões do usuário em `apps/web/src/app/(app)/chamados/manutencao/[ticketId]/page.tsx`

**Checkpoint**: Manutenção segue a mesma regra de visibilidade

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Testes, documentação e validação final

- [ ] T011 [P] Criar teste E2E de visibilidade por perfil em `apps/web/e2e/chamados-compras-approval-visibility.spec.ts`
- [ ] T012 [P] Atualizar documentação do bug em `docs/chamados/execucao_de_compras/bug_botoes_aprovar_negar_comprador.md`
- [ ] T013 Validar quickstart em `specs/009-approval-deny-buttons/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende de Setup
- **User Stories (Phase 3+)**: Dependem de Foundational
- **Polish (Phase 6)**: Depende das histórias implementadas

### User Story Dependencies

- **US1 (P1)**: Após Foundational
- **US2 (P2)**: Após US1 (depende do mesmo fluxo)
- **US3 (P3)**: Após US1 (replica regra em Manutenção)

### Parallel Opportunities

- T011 e T012 podem rodar em paralelo

---

## Parallel Example: User Story 1

```bash
Task: "Filtrar transições exibidas por perfil em apps/web/src/app/(app)/chamados/compras/[ticketId]/components/ticket-actions.tsx"
Task: "Passar permissões do usuário em apps/web/src/app/(app)/chamados/compras/[ticketId]/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Setup
2. Foundational (mapeamento de permissões)
3. US1 (visibilidade por perfil em Compras)
4. Validar com quickstart

### Incremental Delivery

1. US1 (UI Compras)
2. US2 (backend bloqueio)
3. US3 (Manutenção)
4. Polish (E2E + docs)
