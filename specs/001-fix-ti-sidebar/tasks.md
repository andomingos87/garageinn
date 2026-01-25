# Tasks: Visibilidade de TI na sidebar

**Input**: Design documents from `/specs/001-fix-ti-sidebar/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Nao solicitados no spec. Nenhuma tarefa de testes incluida.

**Organization**: Tarefas agrupadas por user story para permitir implementacao e validacao independentes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode executar em paralelo (arquivos diferentes, sem dependencias diretas)
- **[Story]**: US1, US2, US3 conforme a especificacao
- Cada tarefa inclui caminhos de arquivo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparacao e alinhamento inicial

- [x] T001 Revisar escopo e criterios em `specs/001-fix-ti-sidebar/spec.md` e `specs/001-fix-ti-sidebar/plan.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Fundacao de regra unica de acesso

**⚠️ CRITICAL**: Este bloco deve estar pronto antes das tarefas por story

- [x] T002 Criar helper de elegibilidade de acesso a TI em `apps/web/src/lib/auth/ti-access.ts`

**Checkpoint**: Regra unica de acesso a TI disponivel para uso em menu e guard de rota

---

## Phase 3: User Story 1 - Bloquear acesso para nao-TI (Priority: P1) 🎯 MVP

**Goal**: Nao-TI nao ve o item "TI" e nao acessa rotas de TI

**Independent Test**: Usuario nao-TI nao ve menu e recebe acesso negado ao abrir `/chamados/ti`

### Implementation for User Story 1

- [x] T003 [US1] Aplicar helper de acesso no item "TI" da sidebar em `apps/web/src/components/layout/app-sidebar.tsx`
- [x] T004 [US1] Adicionar guard server-side na lista TI em `apps/web/src/app/(app)/chamados/ti/page.tsx`
- [x] T005 [US1] Adicionar guard server-side no novo chamado em `apps/web/src/app/(app)/chamados/ti/novo/page.tsx`
- [x] T006 [US1] Adicionar guard server-side no detalhe do chamado em `apps/web/src/app/(app)/chamados/ti/[ticketId]/page.tsx`
- [x] T007 [US1] Bloquear acesso a dados de TI nas actions para nao-TI em `apps/web/src/app/(app)/chamados/ti/actions.ts`

**Checkpoint**: Usuario nao-TI nao ve o menu de TI e nao acessa nenhuma rota/dado de TI

---

## Phase 4: User Story 2 - Permitir acesso para usuarios de TI (Priority: P2)

**Goal**: Usuarios de TI acessam menu e paginas normalmente

**Independent Test**: Usuario de TI ve a aba e navega por lista/novo/detalhe

### Implementation for User Story 2

- [ ] T008 [US2] Validar acesso de TI seguindo `specs/001-fix-ti-sidebar/quickstart.md` e ajustar `apps/web/src/lib/auth/ti-access.ts` se necessario

**Checkpoint**: Usuario de TI acessa a area sem bloqueios

---

## Phase 5: User Story 3 - Manter acesso para perfis globais/admin (Priority: P3)

**Goal**: Perfis globais/admin mantem acesso a area de TI

**Independent Test**: Usuario admin/global acessa menu e rotas de TI

### Implementation for User Story 3

- [ ] T009 [US3] Validar acesso admin/global seguindo `specs/001-fix-ti-sidebar/quickstart.md` e ajustar `apps/web/src/lib/auth/ti-access.ts` se necessario

**Checkpoint**: Admin/global acessa a area sem regressao

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Ajustes finais e documentacao

- [ ] T010 [P] Atualizar observacoes finais em `docs/bugs/ti-sidebar-visibilidade.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependencias
- **Foundational (Phase 2)**: Depende de Setup
- **User Stories (Phase 3+)**: Dependem de Foundational
- **Polish (Phase 6)**: Depende dos user stories desejados concluídos

### User Story Dependencies

- **US1 (P1)**: Sem dependencias de outras stories
- **US2 (P2)**: Sem dependencias de outras stories
- **US3 (P3)**: Sem dependencias de outras stories

### Parallel Opportunities

- T010 pode rodar em paralelo com validacoes finais

---

## Parallel Example: User Story 1

```bash
Task: "Aplicar helper de acesso no item TI em apps/web/src/components/layout/app-sidebar.tsx"
Task: "Adicionar guard server-side no novo chamado em apps/web/src/app/(app)/chamados/ti/novo/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Concluir Phase 1 e Phase 2
2. Implementar US1 (bloqueio e ocultacao)
3. Validar comportamento com usuario nao-TI

### Incremental Delivery

1. US1 → Validar
2. US2 → Validar
3. US3 → Validar

---

## Notes

- Tarefas [P] sao paralelizaveis quando em arquivos diferentes
- Cada story deve ser validada de forma independente conforme `quickstart.md`
