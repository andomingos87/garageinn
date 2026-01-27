---
status: draft
generated: 2026-01-26
agents:
  - type: "code-reviewer"
    role: "Review changes for consistency across web/mobile/db"
  - type: "bug-fixer"
    role: "Validate root cause and regression risk"
  - type: "refactoring-specialist"
    role: "Consolidate status constants and remove drift"
  - type: "test-writer"
    role: "Cover approval flows and RLS behavior"
  - type: "documentation-writer"
    role: "Align docs and status references"
  - type: "database-specialist"
    role: "Update RLS policies and migrations safely"
docs:
  - "project-overview.md"
  - "architecture.md"
  - "development-workflow.md"
  - "testing-strategy.md"
  - "glossary.md"
  - "data-flow.md"
  - "security.md"
  - "tooling.md"
phases:
  - id: "phase-1"
    name: "Discovery & Alignment"
    prevc: "P"
  - id: "phase-2"
    name: "Implementation & Iteration"
    prevc: "E"
  - id: "phase-3"
    name: "Validation & Handoff"
    prevc: "V"
---

# Approval Denied RLS Plan

> C:\Users\asdom\OneDrive\Área de Trabalho\projects\garageinn\.context\plans\approval-denied-rls-plan.md

## Task Snapshot
- **Primary goal:** Standardize negative approval status to `denied` across RLS, DB constraints, and app logic so approvals can deny tickets without RLS failures.
- **Success signal:** A deny action updates both `ticket_approvals.status` and `tickets.status` without errors for all approval flows (TI, Compras, Manutencao, RH, Sinistros, Financeiro).
- **Key references:**
  - [Documentation Index](../docs/README.md)
  - [Agent Handbook](../agents/README.md)
  - [Plans Index](./README.md)
  - `docs/chamados/bug_aprovacao_status_denied.md`

## Codebase Context
- **Total files analyzed:** Targeted review (not measured)
- **Total symbols discovered:** Targeted review (not measured)
- **Architecture layers:** Web UI, Server Actions, Supabase RLS/Policies, DB constraints, Documentation
- **Entry points:** Server actions in `apps/web/src/app/(app)/chamados/*/actions.ts`

### Key Components
- **DB constraints:** `supabase/migrations/20260126170000_update_tickets_status_check.sql`
- **RLS policy:** `supabase/migrations/20260125203030_fix_rls_approval_policies.sql`
- **Approval actions:** `apps/web/src/app/(app)/chamados/*/actions.ts`
- **Approval UI:** `apps/web/src/app/(app)/chamados/*/components/*approvals*.tsx`
- **Domain status docs:** `docs/statuses.md`, `docs/database/schema.md`

## Agent Lineup
| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Code Reviewer | Ensure global consistency for status names. | [Code Reviewer](../agents/code-reviewer.md) | Review changes for quality and consistency |
| Bug Fixer | Validate root cause in RLS and constraints. | [Bug Fixer](../agents/bug-fixer.md) | Confirm failure points and edge cases |
| Refactoring Specialist | Reduce string drift, centralize status. | [Refactoring Specialist](../agents/refactoring-specialist.md) | Refactor status constants |
| Test Writer | Add tests for approval deny flows. | [Test Writer](../agents/test-writer.md) | Coverage for approve/deny transitions |
| Documentation Writer | Align docs with new canonical status. | [Documentation Writer](../agents/documentation-writer.md) | Update docs and references |
| Database Specialist | Update RLS and migrations safely. | [Database Specialist](../agents/database-specialist.md) | RLS/policy changes and data checks |

## Documentation Touchpoints
| Guide | File | Primary Inputs |
| --- | --- | --- |
| Project Overview | [project-overview.md](../docs/project-overview.md) | Roadmap, stakeholder notes |
| Architecture Notes | [architecture.md](../docs/architecture.md) | Layers, boundaries |
| Development Workflow | [development-workflow.md](../docs/development-workflow.md) | Migrations, branching |
| Testing Strategy | [testing-strategy.md](../docs/testing-strategy.md) | e2e and smoke tests |
| Glossary & Domain Concepts | [glossary.md](../docs/glossary.md) | Domain status naming |
| Data Flow & Integrations | [data-flow.md](../docs/data-flow.md) | Approval flow in data layer |
| Security & Compliance Notes | [security.md](../docs/security.md) | RLS and auth constraints |
| Tooling & Productivity Guide | [tooling.md](../docs/tooling.md) | Scripts and checks |

## Risk Assessment
### Identified Risks
| Risk | Probability | Impact | Mitigation Strategy | Owner |
| --- | --- | --- | --- | --- |
| RLS policy change blocks or opens updates unexpectedly | Medium | High | Review with DB specialist, test with roles | TBD |
| Status drift remains in some UI/constants | Medium | Medium | Centralize status constants, full search | TBD |
| Hidden data uses `rejected` in tickets | Low | High | Pre-migration data audit, backup | TBD |
| Documentation becomes inconsistent | Medium | Low | Update docs in same phase | TBD |

### Dependencies
- **Internal:** Approval workflow owners (Compras/Manutencao/TI/RH/Sinistros/Financeiro)
- **External:** Supabase migration approval/deploy pipeline
- **Technical:** Ability to run DB queries and apply migrations

### Assumptions
- `tickets.status` already uses `denied` in production constraints.
- `ticket_approvals.status` canonical values are `pending/approved/denied`.
- `rejected` is used only in non-ticket entities (sinistros/comercial/quotations).
- If assumptions fail: add data migration to fix legacy values and update plan scope.

## Resource Estimation
### Time Allocation
| Phase | Estimated Effort | Calendar Time | Team Size |
| --- | --- | --- | --- |
| Phase 1 - Discovery | 1-2 person-days | 2-3 days | 1-2 people |
| Phase 2 - Implementation | 3-5 person-days | 1 week | 2-3 people |
| Phase 3 - Validation | 2 person-days | 2-3 days | 1-2 people |
| **Total** | **6-9 person-days** | **~2 weeks** | **-** |

### Required Skills
- Supabase RLS and SQL migrations
- Next.js server actions and UI
- Domain knowledge for approval flows
- Test automation (Playwright)

### Resource Availability
- **Available:** TBD
- **Blocked:** TBD
- **Escalation:** TBD

## Working Phases
### Phase 1 — Discovery & Alignment
**Steps**
1. Audit current DB constraints and RLS policies for `tickets` and `ticket_approvals` **using the Supabase MCP**.
2. Scan codebase for `rejected` and `denied` usage, categorize by entity.
3. Validate that all approval actions write `denied` and not `rejected`.
4. Confirm stakeholder agreement on canonical term: `denied` for tickets and approvals.
5. Define acceptance criteria per module (TI, Compras, Manutencao, RH, Sinistros, Financeiro).

**Commit Checkpoint**
- Capture findings and update plan doc only (no code changes).

**Audit Query Checklist (run via Supabase MCP `execute_sql`)**
- Constraints for tickets and approvals:
  - `SELECT conname, pg_get_constraintdef(c.oid) AS definition FROM pg_constraint c JOIN pg_class t ON t.oid = c.conrelid JOIN pg_namespace n ON n.oid = t.relnamespace WHERE n.nspname = 'public' AND t.relname IN ('tickets','ticket_approvals') AND c.contype = 'c' ORDER BY t.relname, conname;`
- RLS policies for tickets and approvals:
  - `SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('tickets','ticket_approvals') ORDER BY tablename, policyname;`
- Any function definitions referencing `rejected`:
  - `SELECT n.nspname AS schema, p.proname AS function_name FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public' AND pg_get_functiondef(p.oid) ILIKE '%rejected%' ORDER BY 1, 2;`
- Data audit for unexpected ticket statuses:
  - `SELECT status, COUNT(*) FROM public.tickets GROUP BY status ORDER BY COUNT(*) DESC;`

### Phase 2 — Implementation & Iteration
**Steps**
1. Update RLS policy `tickets_update_approver` to allow `denied` and remove `rejected`.
2. Add a migration to align RLS with constraints, with rollback notes.
3. Centralize status constants for approvals and tickets (shared module or single source).
4. Replace any remaining `rejected` usage for ticket approvals with `denied`.
5. Update documentation references that mention `rejected` for tickets/approvals.

**Commit Checkpoint**
- Add migration + code updates + doc updates, split by area if needed.

### Phase 3 — Validation & Handoff
**Steps**
1. Run approval deny flows for each module with the manager role and admin role.
2. Run relevant tests (lint, typecheck, and any e2e smoke flows).
3. Verify DB updates: approvals and ticket status change in a single action.
4. Collect evidence (SQL query outputs, screenshots, test logs).
5. Update backlog or follow-ups for any remaining status drift.

**Commit Checkpoint**
- Record validation evidence and final documentation updates.

## Rollback Plan
### Rollback Triggers
- Deny action still fails after migration.
- Unexpected RLS side effects (unauthorized updates).
- Data integrity issues in `tickets.status`.

### Rollback Procedures
#### Phase 1 Rollback
- Action: Discard discovery branch, restore previous documentation state
- Data Impact: None
- Estimated Time: < 1 hour

#### Phase 2 Rollback
- Action: Revert RLS migration, restore previous policy definition
- Data Impact: No data loss expected; approvals may remain pending if deny failed
- Estimated Time: 1-2 hours

#### Phase 3 Rollback
- Action: Roll back deployment, restore prior DB policy revision
- Data Impact: None expected; re-test approval flows
- Estimated Time: 1-2 hours

### Post-Rollback Actions
1. Document root cause and failure window
2. Notify stakeholders of rollback and impact
3. Update plan with remediation steps before reattempt

## Evidence & Follow-up
- SQL outputs for constraints and policies
- List of files updated with `denied` canonical status
- Test results for approval deny flows
- Screenshots or logs from approval UI actions
