# Tasks: Fluxo de aprovacao de chamados - Operacoes

**Input**: Design documents from `/specs/001-fluxo-aprovacao-operacoes/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/aprovacoes-operacoes.openapi.yaml  
**Tests**: Not requested

**Organization**: Tasks grouped by user story for independent delivery.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align on existing approval logic and entry points.

- [X] T001 Review approval rules in `docs/database/functions.md` and `docs/database/migrations/002_create_functions.sql`
- [X] T002 Review current ticket approval flow in `docs/database/migrations/006_update_ticket_needs_approval.sql`
- [X] T003 Review creation entrypoints in `apps/web/src/app/(app)/chamados/actions.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Centralize approval flow calculation for Operacoes.

- [X] T004 Create migration `docs/database/migrations/011_adjust_approval_flow_operacoes.sql` to add helper for highest Operacoes role
- [X] T005 Update approval creation function in `docs/database/migrations/011_adjust_approval_flow_operacoes.sql` to use role helper and dynamic levels
- [X] T006 Update shared creation helper in `apps/web/src/app/(app)/chamados/actions.ts` to map Operacoes roles to initial status
- [X] T007 [P] Wire compras creation to shared helper in `apps/web/src/app/(app)/chamados/compras/actions.ts`
- [X] T008 [P] Wire manutencao creation to shared helper in `apps/web/src/app/(app)/chamados/manutencao/actions.ts`
- [X] T009 [P] Wire RH creation to shared helper in `apps/web/src/app/(app)/chamados/rh/actions.ts`
- [X] T010 [P] Wire TI creation to shared helper in `apps/web/src/app/(app)/chamados/ti/actions.ts`
- [X] T011 [P] Wire financeiro creation to shared helper in `apps/web/src/app/(app)/chamados/financeiro/actions.ts`
- [X] T012 [P] Wire comercial creation to shared helper in `apps/web/src/app/(app)/chamados/comercial/actions.ts`
- [X] T013 [P] Wire sinistros creation to shared helper in `apps/web/src/app/(app)/chamados/sinistros/actions.ts`

**Checkpoint**: Foundational logic centralized and used by all creation entrypoints.

---

## Phase 3: User Story 1 - Encarregado nao aprova o proprio chamado (Priority: P1) 🎯 MVP

**Goal**: Chamados criados por Encarregado iniciam no Supervisor sem autoaprovacao.

**Independent Test**: Criar chamado como Encarregado e verificar status inicial + lista de aprovacoes pendentes.

### Implementation for User Story 1

- [X] T014 [US1] Adjust Encarregado approval chain in `docs/database/migrations/011_adjust_approval_flow_operacoes.sql`
- [X] T015 [US1] Map Encarregado initial status in `apps/web/src/app/(app)/chamados/actions.ts`
- [X] T016 [US1] Exclude own approvals from pending list in `apps/web/src/app/(app)/chamados/actions.ts`

**Checkpoint**: Encarregado nao ve aprovacao do proprio chamado e fluxo inicia no Supervisor.

---

## Phase 4: User Story 2 - Supervisor aprova antes do gerente (Priority: P1)

**Goal**: Chamados de Supervisor iniciam direto no Gerente de Operacoes.

**Independent Test**: Criar chamado como Supervisor e verificar pendencia apenas para Gerente.

### Implementation for User Story 2

- [X] T017 [US2] Adjust Supervisor approval chain in `docs/database/migrations/011_adjust_approval_flow_operacoes.sql`
- [X] T018 [US2] Map Supervisor initial status in `apps/web/src/app/(app)/chamados/actions.ts`
- [X] T019 [US2] Ensure pending approvals list includes Gerente only in `apps/web/src/app/(app)/chamados/actions.ts`

**Checkpoint**: Supervisor cria chamado com unica aprovacao pendente para Gerente.

---

## Phase 5: User Story 3 - Gerente de operacoes cria chamado ja aprovado (Priority: P2)

**Goal**: Chamados criados por Gerente de Operacoes iniciam em triagem sem aprovacao.

**Independent Test**: Criar chamado como Gerente e validar ausencia de aprovacoes pendentes.

### Implementation for User Story 3

- [X] T020 [US3] Adjust Gerente approval chain in `docs/database/migrations/011_adjust_approval_flow_operacoes.sql`
- [X] T021 [US3] Map Gerente initial status in `apps/web/src/app/(app)/chamados/actions.ts`
- [X] T022 [US3] Return zero pending approvals on creation in `apps/web/src/app/(app)/chamados/actions.ts`

**Checkpoint**: Gerente cria chamado sem aprovacao pendente e status de triagem.

---

## Phase 6: User Story 4 - Manobrista segue fluxo completo (Priority: P2)

**Goal**: Manter cadeia completa para Manobrista sem regressao.

**Independent Test**: Criar chamado como Manobrista e aprovar sequencialmente ate Gerente.

### Implementation for User Story 4

- [X] T023 [US4] Preserve Manobrista approval chain in `docs/database/migrations/011_adjust_approval_flow_operacoes.sql`
- [X] T024 [US4] Verify Manobrista initial status mapping in `apps/web/src/app/(app)/chamados/actions.ts`

**Checkpoint**: Manobrista segue tres niveis de aprovacao.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validacao final e alinhamento documental.

- [X] T025 [P] Validate flows using `specs/001-fluxo-aprovacao-operacoes/quickstart.md`
- [X] T026 [P] Update approval flow notes in `docs/chamados/fluxo_de_aprovacoes_operacoes/spec.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup completion
- **User Stories (Phase 3-6)**: Depend on Foundational completion
- **Polish (Phase 7)**: Depends on targeted stories being complete

### User Story Dependencies

- **US1 (P1)**: After Phase 2, no dependency on other stories
- **US2 (P1)**: After Phase 2, independent from US1
- **US3 (P2)**: After Phase 2, independent from US1/US2
- **US4 (P2)**: After Phase 2, independent from US1/US2/US3

### Parallel Opportunities

- Phase 2 wiring tasks (T007-T013) can run in parallel
- US1-US4 phases can run in parallel after Phase 2
- Documentation and validation tasks in Phase 7 can run in parallel

---

## Parallel Example: User Story 1

```bash
Task: "Adjust Encarregado approval chain in docs/database/migrations/011_adjust_approval_flow_operacoes.sql"
Task: "Map Encarregado initial status in apps/web/src/app/(app)/chamados/actions.ts"
Task: "Exclude own approvals from pending list in apps/web/src/app/(app)/chamados/actions.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate with quickstart steps for Encarregado

### Incremental Delivery

1. Setup + Foundational
2. US1 → Validate
3. US2 → Validate
4. US3 → Validate
5. US4 → Validate
6. Polish updates
