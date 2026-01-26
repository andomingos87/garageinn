# Tasks: Fix RLS Approval Policies for Hierarchical Approvals

**Input**: Design documents from `/specs/008-fix-rls-approval/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md

**Tests**: Existing E2E tests will validate the fix. No new test tasks - existing tests in `apps/web/e2e/chamados-compras-approval-*.spec.ts` cover all scenarios.

**Organization**: This is a bug fix with a shared root cause. Tasks are organized by implementation layer rather than individual user stories since US1, US2, US3 share the same database fix.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Monorepo**: `apps/web/` for Next.js app, `supabase/migrations/` for database
- Database migrations are atomic and should be in a single file

---

## Phase 1: Database Migration (Fixes US1, US2, US3)

**Purpose**: Create RLS policies and helper functions that enable hierarchical approvals using `approval_role` instead of `approval_level`

**Goal**: After this phase, all approval scenarios (Encarregado→Supervisor→Gerente) work at the database level

**Blocks**: US1, US2, US3 cannot be validated until this phase completes

- [x] T001 [US1][US2][US3] Create migration file `supabase/migrations/20260125203030_fix_rls_approval_policies.sql` with timestamp

- [x] T002 [US1][US2][US3] Implement `get_user_operacoes_role_name(p_user_id uuid)` function in migration file - returns user's highest Operações role as text ('Gerente', 'Supervisor', 'Encarregado', 'Manobrista')

- [x] T003 [US1][US2][US3] Implement `can_approve_ticket(p_ticket_id uuid, p_user_id uuid)` function in migration file - returns boolean based on ticket status matching user's role

- [x] T004 [US1][US2][US3] Create `ticket_approvals_update_approver` RLS policy in migration file - allows UPDATE on ticket_approvals when can_approve_ticket() returns true and approval_role matches expected role

- [x] T005 [US1][US2][US3] Create `tickets_update_approver` RLS policy in migration file - allows UPDATE on tickets when can_approve_ticket() returns true

- [x] T006 [US1][US2][US3] Add admin bypass to both RLS policies using existing `is_admin()` function

- [x] T007 Apply migration to Supabase project using Supabase MCP or dashboard

**Checkpoint**: Database accepts approval updates from authorized users. Manual testing via Supabase SQL editor can verify.

---

## Phase 2: Application Layer (US4 - Silent Failure Detection)

**Purpose**: Add defense-in-depth to detect when RLS silently blocks an approval

**Goal**: Application shows accurate feedback - error message when approval fails, success only when it actually persists

**Independent Test**: Can be tested by temporarily disabling RLS policies and verifying error message appears

- [x] T008 [US4] Read `apps/web/src/app/(app)/chamados/compras/actions.ts` and locate `handleApproval()` function (around line 1351)

- [x] T009 [US4] Modify first Supabase UPDATE in `handleApproval()` to use `.select()` chain and verify returned data length > 0 in `apps/web/src/app/(app)/chamados/compras/actions.ts`

- [x] T010 [US4] Modify second Supabase UPDATE (ticket status) in `handleApproval()` to use `.select()` chain and verify returned data length > 0 in `apps/web/src/app/(app)/chamados/compras/actions.ts`

- [x] T011 [US4] Return specific error "Não foi possível processar a aprovação. Verifique suas permissões." when either UPDATE affects 0 rows in `apps/web/src/app/(app)/chamados/compras/actions.ts`

**Checkpoint**: Application correctly reports approval failures. Test by temporarily commenting out RLS policy and attempting approval.

---

## Phase 3: Validation & Regression Testing (US5)

**Purpose**: Verify fix works for all scenarios and doesn't break existing functionality

**Goal**: All 7 approval scenarios pass, zero regressions

**Independent Test**: Run existing E2E tests

- [ ] T012 [US5] Run E2E test for Manobrista approval chain: `npx playwright test e2e/chamados-compras-approval-manobrista.spec.ts` (requires dev server)

- [ ] T013 [US1] Run E2E test for Encarregado approval chain: `npx playwright test e2e/chamados-compras-approval-encarregado.spec.ts` (requires dev server)

- [ ] T014 [US3] Run E2E test for Supervisor approval chain: `npx playwright test e2e/chamados-compras-approval-supervisor.spec.ts` (requires dev server)

- [ ] T015 [US2] Run E2E test for Gerente scenarios: `npx playwright test e2e/chamados-compras-approval-gerente.spec.ts` (requires dev server)

- [ ] T016 Run all approval E2E tests together: `npx playwright test e2e/chamados-compras-approval-*.spec.ts` (requires dev server)

**Checkpoint**: All E2E tests pass. Fix is complete.

---

## Phase 4: Polish & Documentation

**Purpose**: Clean up and document the fix

- [x] T017 [P] Update `docs/chamados/execucao_de_compras/bug_aprovacao_supervisor_rls.md` to mark bug as resolved with fix details

- [x] T018 Verify TypeScript types are still valid by running `npm run typecheck` from repository root

- [x] T019 Run linting `npm run lint` from repository root and fix any issues

- [ ] T020 Run quickstart.md validation - manually test approval flow per quickstart.md instructions (requires running app)

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Database) ──┬──► Phase 2 (Application)
                     │
                     └──► Phase 3 (Validation) ──► Phase 4 (Polish)
```

- **Phase 1**: No dependencies - start immediately
- **Phase 2**: Depends on Phase 1 completion (RLS policies must exist for app logic to work correctly)
- **Phase 3**: Depends on both Phase 1 and Phase 2
- **Phase 4**: Depends on Phase 3 passing

### Task Dependencies Within Phases

**Phase 1 (Sequential - single migration file)**:
```
T001 → T002 → T003 → T004 → T005 → T006 → T007
```

**Phase 2 (Sequential - same file)**:
```
T008 → T009 → T010 → T011
```

**Phase 3 (Can run in parallel)**:
```
T012, T013, T014, T015 can run in parallel
T016 runs after individual tests pass
```

**Phase 4 (Mostly parallel)**:
```
T017 [P], T018 [P], T019 [P] can run in parallel
T020 runs last
```

### User Story to Task Mapping

| User Story | Tasks | Notes |
|------------|-------|-------|
| US1 (Supervisor approves Encarregado's ticket) | T001-T007, T013 | Fixed by RLS policy, validated by E2E |
| US2 (Gerente approves Encarregado's ticket) | T001-T007, T015 | Fixed by RLS policy, validated by E2E |
| US3 (Gerente approves Supervisor's ticket) | T001-T007, T014 | Fixed by RLS policy, validated by E2E |
| US4 (Silent failure detection) | T008-T011 | Application-level defense |
| US5 (Manobrista regression) | T012 | Regression validation |

---

## Parallel Example: Phase 3 E2E Tests

```bash
# Launch all E2E tests in parallel (different test files):
npx playwright test apps/web/e2e/chamados-compras-approval-manobrista.spec.ts &
npx playwright test apps/web/e2e/chamados-compras-approval-encarregado.spec.ts &
npx playwright test apps/web/e2e/chamados-compras-approval-supervisor.spec.ts &
npx playwright test apps/web/e2e/chamados-compras-approval-gerente.spec.ts &
wait
```

---

## Implementation Strategy

### MVP First (Phase 1 Only)

1. Complete Phase 1: Database Migration
2. **STOP and VALIDATE**: Manually test approval via UI
3. If working, proceed to Phase 2-4
4. If not working, debug RLS policies before proceeding

### Full Implementation

1. Phase 1: Database Migration (T001-T007)
2. Phase 2: Application Layer (T008-T011)
3. Phase 3: E2E Validation (T012-T016)
4. Phase 4: Polish (T017-T020)

### Rollback Plan

If issues occur after deployment:

```sql
-- Rollback migration
DROP POLICY IF EXISTS "tickets_update_approver" ON tickets;
DROP POLICY IF EXISTS "ticket_approvals_update_approver" ON ticket_approvals;
DROP FUNCTION IF EXISTS can_approve_ticket(uuid, uuid);
DROP FUNCTION IF EXISTS get_user_operacoes_role_name(uuid);
```

---

## Notes

- This is a bug fix, not a new feature - minimal changes required
- All P1 user stories (US1, US2, US3) share the same database fix
- US4 (P2) is defense-in-depth and independent of the RLS fix
- US5 (P2) is regression validation using existing E2E tests
- No new test files needed - existing E2E tests cover all scenarios
- Single migration file for atomic deployment and easy rollback
