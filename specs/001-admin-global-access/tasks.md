# Tasks: Acesso a Usuários e Configurações por Admin e Globais

**Input**: Design documents from `/specs/001-admin-global-access/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/  
**Tests**: Não solicitados na specification (tarefas de teste omitidas)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar componentes compartilhados usados em mais de uma story

- [x] T001 Criar componente de acesso negado reutilizável em `apps/web/src/components/auth/access-denied.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Fundacoes de RBAC que sustentam todas as stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 [P] Validar/ajustar `GLOBAL_ROLE_PERMISSIONS` para perfis globais com `admin:all` em `apps/web/src/lib/auth/permissions.ts`
- [x] T003 [P] Validar que `admin:all` concede acesso total em `apps/web/src/lib/auth/rbac.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Acessar módulos pela sidebar (Priority: P1) 🎯 MVP

**Goal**: Admins e globais visualizam e acessam os módulos "Usuários" e "Configurações"

**Independent Test**: Entrar como admin/global e confirmar visibilidade na sidebar e acesso aos módulos

### Implementation for User Story 1

- [x] T004 [US1] Ajustar/confirmar permissões dos itens "Usuários" e "Configurações" em `apps/web/src/components/layout/app-sidebar.tsx`

**Checkpoint**: User Story 1 funcional e testável de forma independente

---

## Phase 4: User Story 2 - Bloqueio para perfis não elegíveis (Priority: P2)

**Goal**: Usuários sem perfil admin/global não veem itens e não acessam módulos por link direto

**Independent Test**: Entrar com usuário não elegível, confirmar ausência na sidebar e mensagem clara em acesso direto

### Implementation for User Story 2

- [x] T005 [P] [US2] Substituir `redirect` por `AccessDenied` quando `checkIsAdmin` falhar em `apps/web/src/app/(app)/usuarios/page.tsx`
- [x] T006 [P] [US2] Adicionar guarda server-side para `/configuracoes` e subrotas em `apps/web/src/app/(app)/configuracoes/layout.tsx` usando `checkIsAdmin` + `AccessDenied`

**Checkpoint**: User Story 2 funcional e testável de forma independente

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Ajustes de documentacao e validacao

- [x] T007 [P] Atualizar regras de acesso admin/global em `docs/usuarios/PERMISSOES_COMPLETAS.md`
- [x] T008 Validar passos do quickstart e ajustar `specs/001-admin-global-access/quickstart.md` se necessário

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: Depend on Foundational phase completion
  - User stories can proceed in parallel if staffed
- **Polish (Final Phase)**: Depends on completion of desired user stories

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational (Phase 2); no dependencies on other stories
- **User Story 2 (P2)**: Starts after Foundational (Phase 2); no dependencies on other stories

### Within Each User Story

- Fundacoes RBAC antes da implementação da story
- Implementacao antes de validacoes de fluxo

### Parallel Opportunities

- T002 e T003 podem rodar em paralelo (arquivos diferentes)
- T005 e T006 podem rodar em paralelo apos T001 (arquivos diferentes)
- T007 pode rodar em paralelo com outras tarefas (documentacao)

---

## Parallel Example: User Story 1

```bash
Task: "Ajustar/confirmar permissoes dos itens na sidebar em apps/web/src/components/layout/app-sidebar.tsx"
```

---

## Parallel Example: User Story 2

```bash
Task: "Substituir redirect por AccessDenied em apps/web/src/app/(app)/usuarios/page.tsx"
Task: "Adicionar guarda server-side em apps/web/src/app/(app)/configuracoes/layout.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validar acesso admin/global pela sidebar

### Incremental Delivery

1. Setup + Foundational
2. User Story 1 (MVP) → validar
3. User Story 2 → validar acesso negado
4. Polish & Documentacao
