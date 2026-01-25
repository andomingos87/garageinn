# Tasks: Visibilidade de chamados do Gerente de Operacoes

**Input**: Design documents from `/specs/005-visibilidade-gerente-operacoes/`  
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/  
**Tests**: Nao solicitados explicitamente na spec.

**Organization**: Tasks agrupadas por user story para permitir entrega e validacao independentes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode executar em paralelo (arquivos diferentes, sem dependencia direta)
- **[Story]**: US1, US2

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar migracao para ajustes de RLS e aprovacoes

- [x] T001 Criar arquivo de migracao `docs/database/migrations/010_ops_manager_visibility.sql` com cabecalho e ordem de execucao

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Helpers de banco reutilizados por visibilidade e aprovacao

- [x] T002 Implementar funcoes SQL helpers em `docs/database/migrations/010_ops_manager_visibility.sql` (`is_operacoes_creator(p_user_id)` e `is_operacoes_gerente()`)
- [x] T003 [P] Atualizar documentacao de funcoes em `docs/database/functions.md` para refletir os helpers adicionados

---

## Phase 3: User Story 1 - Gerente visualiza chamados criados por Operacoes (Priority: P1) 🎯 MVP

**Goal**: Garantir visibilidade do gerente de operacoes na lista geral, independente do departamento do chamado.

**Independent Test**: Login como gerente de operacoes e validar que chamados criados por Operacoes aparecem em `/relatorios/chamados` sem ajustes manuais de filtro.

### Implementation for User Story 1

- [x] T004 [US1] Adicionar policy RLS de SELECT em `docs/database/migrations/010_ops_manager_visibility.sql` permitindo `Gerente` de Operacoes ver tickets cujo criador seja Operacoes (manobrista/encarregado/supervisor)
- [x] T005 [US1] Incluir permissao `reports:read` para `Operacoes > Gerente` em `apps/web/src/lib/auth/permissions.ts`

**Checkpoint**: User Story 1 funcional e validavel no relatorio de chamados

---

## Phase 4: User Story 2 - Gerente e ultimo aprovador dos chamados de Operacoes (Priority: P2)

**Goal**: Garantir que chamados criados por Operacoes entrem na cadeia de aprovacao e terminem no gerente de operacoes.

**Independent Test**: Criar chamado com manobrista/encarregado/supervisor e confirmar que a ultima aprovacao e do gerente de operacoes.

### Implementation for User Story 2

- [x] T006 [US2] Ajustar `ticket_needs_approval` em `docs/database/migrations/010_ops_manager_visibility.sql` para retornar true quando o criador for Operacoes (Manobrista/Encarregado/Supervisor), independentemente do departamento do chamado
- [x] T007 [US2] Validar regra de aprovacao de gerente de operacoes nas actions em `apps/web/src/app/(app)/chamados/compras/actions.ts`, `apps/web/src/app/(app)/chamados/ti/actions.ts`, `apps/web/src/app/(app)/chamados/manutencao/actions.ts`, `apps/web/src/app/(app)/chamados/sinistros/actions.ts`, `apps/web/src/app/(app)/chamados/rh/actions.ts`, `apps/web/src/app/(app)/chamados/financeiro/actions.ts`, `apps/web/src/app/(app)/chamados/comercial/actions.ts` (usar `is_operacoes_gerente()` quando necessario)

**Checkpoint**: User Story 2 funcional com aprovacao final do gerente de operacoes

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Validacao final e alinhamento de documentacao operacional

- [x] T008 [P] Validar o roteiro de verificacao em `specs/005-visibilidade-gerente-operacoes/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependencias
- **Foundational (Phase 2)**: Depende de Setup
- **User Story 1 (Phase 3)**: Depende de Foundational
- **User Story 2 (Phase 4)**: Depende de Foundational
- **Polish (Final Phase)**: Depende das historias alvo concluídas

### User Story Dependencies

- **US1 (P1)**: Pode iniciar apos Foundational
- **US2 (P2)**: Pode iniciar apos Foundational

### Parallel Opportunities

- T003 pode rodar em paralelo com T002
- T004 e T005 podem ser executadas em paralelo apos Foundational
- T006 e T007 podem ser executadas em paralelo apos Foundational

---

## Parallel Example: User Story 1

```bash
Task: "Adicionar policy RLS em docs/database/migrations/010_ops_manager_visibility.sql"
Task: "Atualizar permissoes em apps/web/src/lib/auth/permissions.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Concluir Setup + Foundational
2. Implementar US1 (visibilidade no relatorio)
3. Validar US1 no app

### Incremental Delivery

1. US1 pronto e validado
2. US2 pronto e validado
3. Rodar quickstart como regressao leve
