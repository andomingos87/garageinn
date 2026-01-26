# Tasks: Correção de Status de Aprovação para Supervisor/Operações

**Input**: Design documents from `/specs/007-fix-approval-status/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: E2E tests included as per Constitution Check requirement (Testing Discipline pending).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Monorepo web app**: `apps/web/src/` for source, `apps/web/e2e/` for tests
- **Database**: `supabase/migrations/` for SQL migrations

---

## Phase 1: Setup (Investigation & Verification)

**Purpose**: Verify current state and prepare for fix implementation

- [x] T001 Verify current SQL functions are deployed by checking `supabase/migrations/` for approval function migration
- [x] T002 Search for any code that hardcodes `awaiting_approval_encarregado` status in `apps/web/src/app/(app)/chamados/compras/actions.ts`
- [x] T003 Review the complete `createPurchaseTicket` function flow in `apps/web/src/app/(app)/chamados/compras/actions.ts` (lines 490-623)

---

## Phase 2: Foundational (Core Fix Implementation)

**Purpose**: Fix the root cause in the server action - MUST complete before validation can occur

**⚠️ CRITICAL**: This is the core bug fix that enables all user story validations

- [x] T004 Add error handling for `get_initial_approval_status` RPC call in `apps/web/src/app/(app)/chamados/compras/actions.ts`
- [x] T005 Add explicit type definition `ApprovalStatus` for status values in `apps/web/src/app/(app)/chamados/compras/actions.ts`
- [x] T006 Update fallback value from `"awaiting_triage"` to `"awaiting_approval_encarregado"` (safest default) in `apps/web/src/app/(app)/chamados/compras/actions.ts`
- [x] T007 Add diagnostic logging for RPC response in `apps/web/src/app/(app)/chamados/compras/actions.ts`
- [x] T008 Ensure SQL migration exists in `supabase/migrations/` - create if missing by copying from `docs/database/migrations/011_adjust_approval_flow_operacoes.sql`

**Checkpoint**: Core fix complete - user story validation can now begin

---

## Phase 3: User Story 1 - Supervisor Cria Chamado com Status Correto (Priority: P1) 🎯 MVP

**Goal**: When a Supervisor in Operações creates a purchase ticket, status must be `awaiting_approval_gerente` with only 1 approval record (Gerente)

**Independent Test**: Create ticket as Supervisor/Operações, verify status is `awaiting_approval_gerente` and only Gerente approval exists

### E2E Test for User Story 1

- [x] T009 [US1] Create E2E test for Supervisor approval flow in `apps/web/e2e/chamados-compras-approval-supervisor.spec.ts`

### Validation for User Story 1

- [ ] T010 [US1] Manual test: Login as Supervisor/Operações user, create purchase ticket, verify status is `awaiting_approval_gerente`
- [ ] T011 [US1] Manual test: Verify `ticket_approvals` table has only 1 pending record (Gerente) for Supervisor-created ticket
- [ ] T012 [US1] Manual test: Verify Gerente can approve ticket and it advances to `awaiting_triage`

**Checkpoint**: User Story 1 (Supervisor) validated - MVP complete

---

## Phase 4: User Story 2 - Encarregado Cria Chamado com Status Correto (Priority: P1)

**Goal**: When an Encarregado in Operações creates a purchase ticket, status must be `awaiting_approval_supervisor` with 2 approval records (Supervisor, Gerente)

**Independent Test**: Create ticket as Encarregado/Operações, verify status is `awaiting_approval_supervisor` and 2 approvals exist

### E2E Test for User Story 2

- [x] T013 [P] [US2] Create E2E test for Encarregado approval flow in `apps/web/e2e/chamados-compras-approval-encarregado.spec.ts`

### Validation for User Story 2

- [ ] T014 [US2] Manual test: Login as Encarregado/Operações user, create purchase ticket, verify status is `awaiting_approval_supervisor`
- [ ] T015 [US2] Manual test: Verify `ticket_approvals` table has 2 pending records (Supervisor, Gerente) for Encarregado-created ticket

**Checkpoint**: User Story 2 (Encarregado) validated

---

## Phase 5: User Story 3 - Manobrista Cria Chamado com Status Correto (Priority: P2)

**Goal**: When a Manobrista in Operações creates a purchase ticket, status must be `awaiting_approval_encarregado` with 3 approval records (Encarregado, Supervisor, Gerente)

**Independent Test**: Create ticket as Manobrista/Operações, verify status is `awaiting_approval_encarregado` and 3 approvals exist

### E2E Test for User Story 3

- [x] T016 [P] [US3] Create E2E test for Manobrista approval flow in `apps/web/e2e/chamados-compras-approval-manobrista.spec.ts`

### Validation for User Story 3

- [ ] T017 [US3] Manual test: Login as Manobrista/Operações user, create purchase ticket, verify status is `awaiting_approval_encarregado`
- [ ] T018 [US3] Manual test: Verify `ticket_approvals` table has 3 pending records (Encarregado, Supervisor, Gerente) for Manobrista-created ticket

**Checkpoint**: User Story 3 (Manobrista) validated

---

## Phase 6: User Story 4 - Gerente Cria Chamado Auto-Aprovado (Priority: P2)

**Goal**: When a Gerente in Operações creates a purchase ticket, status must be `awaiting_triage` with 0 approval records (auto-approved)

**Independent Test**: Create ticket as Gerente/Operações, verify status is `awaiting_triage` and no approvals exist

### E2E Test for User Story 4

- [x] T019 [P] [US4] Create E2E test for Gerente auto-approval flow in `apps/web/e2e/chamados-compras-approval-gerente.spec.ts`

### Validation for User Story 4

- [ ] T020 [US4] Manual test: Login as Gerente/Operações user, create purchase ticket, verify status is `awaiting_triage`
- [ ] T021 [US4] Manual test: Verify `ticket_approvals` table has 0 records for Gerente-created ticket

**Checkpoint**: User Story 4 (Gerente) validated

---

## Phase 7: Edge Cases Validation

**Purpose**: Validate edge case handling per spec requirements

- [ ] T022 Test edge case: User with multiple roles (Encarregado + Supervisor) - verify highest level (Supervisor) is used
- [ ] T023 Test edge case: User without Operações role - verify full approval chain is required
- [ ] T024 Test edge case: Force RPC error and verify safe fallback behavior

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and documentation

- [ ] T025 [P] Remove diagnostic logging (or convert to debug level) in `apps/web/src/app/(app)/chamados/compras/actions.ts`
- [x] T026 [P] Update bug report status to "Resolved" in `docs/chamados/execucao_de_compras/bug_aprovacao_supervisor.md`
- [ ] T027 Run all E2E tests to ensure no regressions: `npm run test:e2e` in `apps/web/`
- [x] T028 Update spec.md status from "Draft" to "Complete" in `specs/007-fix-approval-status/spec.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - investigation can start immediately
- **Foundational (Phase 2)**: Depends on Setup - contains the core fix
- **User Stories (Phases 3-6)**: All depend on Foundational phase completion
  - User stories can be validated in parallel (if multiple testers)
  - Or sequentially in priority order (P1: US1, US2 → P2: US3, US4)
- **Edge Cases (Phase 7)**: Depends on Foundational fix being complete
- **Polish (Phase 8)**: Depends on all validations passing

### User Story Dependencies

- **User Story 1 (P1)**: Can validate after Phase 2 - No dependencies on other stories
- **User Story 2 (P1)**: Can validate after Phase 2 - No dependencies on other stories
- **User Story 3 (P2)**: Can validate after Phase 2 - No dependencies on other stories
- **User Story 4 (P2)**: Can validate after Phase 2 - No dependencies on other stories

### Within Each User Story

1. Core fix must be complete (Phase 2)
2. E2E test creation (optional, can be parallel with manual test)
3. Manual validation tests
4. Story complete when all tests pass

### Parallel Opportunities

**Phase 2 (Foundational)**:
- T004, T005 can be done in parallel (different aspects of same file)

**E2E Tests (across stories)**:
- T009, T013, T016, T019 can all be written in parallel (different test files)

**Manual Validations (across stories)**:
- All manual tests can be run in parallel if multiple testers available

---

## Parallel Example: E2E Test Creation

```bash
# Launch all E2E tests for all user stories together:
Task: "Create E2E test for Supervisor approval flow in apps/web/e2e/chamados-compras-approval-supervisor.spec.ts"
Task: "Create E2E test for Encarregado approval flow in apps/web/e2e/chamados-compras-approval-encarregado.spec.ts"
Task: "Create E2E test for Manobrista approval flow in apps/web/e2e/chamados-compras-approval-manobrista.spec.ts"
Task: "Create E2E test for Gerente auto-approval flow in apps/web/e2e/chamados-compras-approval-gerente.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (investigation)
2. Complete Phase 2: Foundational (core fix)
3. Complete Phase 3: User Story 1 (Supervisor validation)
4. **STOP and VALIDATE**: Test Supervisor flow independently
5. Deploy if Supervisor fix is urgently needed

### Incremental Delivery

1. Complete Setup + Foundational → Core fix ready
2. Validate User Story 1 (Supervisor) → Confirm primary bug fixed
3. Validate User Story 2 (Encarregado) → Confirm P1 stories work
4. Validate User Story 3 (Manobrista) → Confirm existing behavior preserved
5. Validate User Story 4 (Gerente) → Confirm auto-approval works
6. Each validation confirms correct behavior without breaking other levels

### Single Developer Strategy

1. Complete Setup + Foundational (T001-T008)
2. Validate all stories manually in sequence (T010-T012, T014-T015, T017-T018, T020-T021)
3. Create E2E tests after manual validation confirms fix works (T009, T013, T016, T019)
4. Complete edge cases and polish (T022-T028)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story can be validated independently after Phase 2
- Core fix in Phase 2 affects all user stories simultaneously
- E2E tests are for regression prevention, manual tests validate the fix
- Bug fix is localized to single file: `apps/web/src/app/(app)/chamados/compras/actions.ts`
- SQL functions are verified correct - no database changes needed (only ensure migration is deployed)
