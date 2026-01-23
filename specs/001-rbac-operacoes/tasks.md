# Tasks: RBAC Operacoes

**Input**: Design documents from `/specs/002-rbac-operacoes/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/  
**Tests**: Nao solicitados na specification (tarefas de teste omitidas)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Ajustes base para suportar a matriz RBAC de Operacoes

- [x] T001 [P] Definir permissao dedicada para Supervisao no tipo `Permission` e `ALL_PERMISSIONS` em `apps/web/src/lib/auth/permissions.ts`
- [x] T002 [P] Adicionar label/grupo da nova permissao em `apps/web/src/app/(app)/configuracoes/permissoes/constants.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Fundacoes de RBAC usadas por todas as stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 [P] Atualizar expectativas de RBAC para Operacoes em `apps/web/src/lib/auth/__tests__/rbac.test.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Acesso basico de Operacoes (Priority: P1) 🎯 MVP

**Goal**: Manobrista e Encarregado acessam apenas Chamados, Checklists e Meu perfil

**Independent Test**: Entrar como Manobrista/Encarregado e confirmar menus visiveis + bloqueios de acesso direto

### Implementation for User Story 1

- [x] T004 [US1] Ajustar permissoes de Manobrista/Encarregado em `apps/web/src/lib/auth/permissions.ts`
- [x] T005 [US1] Ajustar visibilidade da sidebar para Financeiro/Supervisao/Unidades/Relatorios/Usuarios/Configuracoes em `apps/web/src/components/layout/app-sidebar.tsx`
- [x] T006 [US1] Adicionar guarda de acesso a Financeiro em `apps/web/src/app/(app)/chamados/financeiro/page.tsx`
- [x] T007 [P] [US1] Adicionar guarda de acesso a Financeiro em `apps/web/src/app/(app)/chamados/financeiro/novo/page.tsx`
- [x] T008 [P] [US1] Adicionar guarda de acesso a Financeiro em `apps/web/src/app/(app)/chamados/financeiro/[ticketId]/page.tsx`
- [x] T009 [US1] Adicionar guarda de acesso a Supervisao em `apps/web/src/app/(app)/checklists/supervisao/page.tsx`
- [x] T010 [P] [US1] Adicionar guarda de acesso a Supervisao em `apps/web/src/app/(app)/checklists/supervisao/executar/page.tsx`
- [x] T011 [P] [US1] Adicionar guarda de acesso a Relatorios em `apps/web/src/app/(app)/relatorios/page.tsx`
- [x] T012 [P] [US1] Adicionar guarda de acesso a Relatorios em `apps/web/src/app/(app)/relatorios/chamados/page.tsx`
- [x] T013 [P] [US1] Adicionar guarda de acesso a Relatorios em `apps/web/src/app/(app)/relatorios/supervisao/page.tsx`

**Checkpoint**: User Story 1 funcional e testavel de forma independente

---

## Phase 4: User Story 2 - Acesso avancado de Operacoes (Priority: P2)

**Goal**: Supervisor e Gerente acessam Supervisao e Unidades, mantendo bloqueios de areas restritas

**Independent Test**: Entrar como Supervisor/Gerente e validar menus/guardas para Supervisao e Unidades

### Implementation for User Story 2

- [x] T014 [US2] Ajustar permissoes de Supervisor/Gerente para Supervisao e Unidades em `apps/web/src/lib/auth/permissions.ts`

**Checkpoint**: User Story 2 funcional e testavel de forma independente

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Ajustes de documentacao e validacao geral

- [x] T015 [P] Atualizar matriz RBAC de Operacoes em `docs/usuarios/PERMISSOES_COMPLETAS.md`
- [x] T016 Validar quickstart e ajustar `specs/002-rbac-operacoes/quickstart.md` se necessario

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: Depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on completion of desired user stories

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational (Phase 2); no dependencies on other stories
- **User Story 2 (P2)**: Starts after Foundational (Phase 2); no dependencies on other stories

### Within Each User Story

- Ajustes de permissoes antes dos guardas de pagina
- Guardas de pagina antes da validacao do fluxo

### Parallel Opportunities

- T001 e T002 podem rodar em paralelo
- T006, T007 e T008 podem rodar em paralelo (paginas distintas)
- T009 e T010 podem rodar em paralelo
- T011, T012 e T013 podem rodar em paralelo
- T015 pode rodar em paralelo com outras tarefas (documentacao)

---

## Parallel Example: User Story 1

```bash
Task: "Adicionar guarda de acesso a Financeiro em apps/web/src/app/(app)/chamados/financeiro/page.tsx"
Task: "Adicionar guarda de acesso a Supervisao em apps/web/src/app/(app)/checklists/supervisao/page.tsx"
Task: "Adicionar guarda de acesso a Relatorios em apps/web/src/app/(app)/relatorios/page.tsx"
```

---

## Parallel Example: User Story 2

```bash
Task: "Ajustar permissoes de Supervisor/Gerente para Supervisao e Unidades em apps/web/src/lib/auth/permissions.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validar menus e acessos diretos para Manobrista/Encarregado

### Incremental Delivery

1. Setup + Foundational
2. User Story 1 (MVP) → validar
3. User Story 2 → validar acessos de Supervisor/Gerente
4. Polish & Documentacao
