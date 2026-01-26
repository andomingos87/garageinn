# Implementation Plan: Fix RLS Approval Policies for Hierarchical Approvals

**Branch**: `008-fix-rls-approval` | **Date**: 2026-01-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-fix-rls-approval/spec.md`

## Summary

Fix RLS policies that silently block hierarchical approvals when tickets are created by users above Manobrista level. The root cause is that RLS policies use `approval_level` (relative position in chain) instead of `approval_role` (absolute role name) to validate approvals. Additionally, missing RLS UPDATE policies for `ticket_approvals` and `tickets` tables prevent approvers from updating records.

## Technical Context

**Language/Version**: TypeScript 5, Next.js 16, React 19
**Primary Dependencies**: Supabase (PostgreSQL with RLS), shadcn/ui
**Storage**: PostgreSQL via Supabase with Row-Level Security
**Testing**: Playwright E2E tests
**Target Platform**: Web application (Vercel deployment)
**Project Type**: Monorepo with apps/web workspace
**Performance Goals**: Approval operations should complete within normal user expectations (<1s)
**Constraints**: Must maintain backward compatibility with existing approval records
**Scale/Scope**: Bug fix affecting ~4 RLS policies and 1 server action

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Monorepo Structure | ✅ PASS | Changes confined to apps/web and supabase/migrations |
| II. Type Safety | ✅ PASS | No new types needed; existing types preserved |
| III. Code Quality | ✅ PASS | Changes follow existing patterns |
| IV. Security & RBAC | ✅ PASS | Fix strengthens RLS security by using correct field for authorization |
| V. Testing Discipline | ✅ PASS | E2E tests already exist for approval flows; will verify fix |
| VI. Documentation | ✅ PASS | Bug documented in docs/chamados/execucao_de_compras/ |

**Gate Result**: PASS - No violations. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/008-fix-rls-approval/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
# Affected files in this bug fix:

supabase/migrations/
└── YYYYMMDDHHMMSS_fix_rls_approval_policies.sql  # New migration

apps/web/src/app/(app)/chamados/compras/
├── actions.ts                    # handleApproval() - add row verification
└── [ticketId]/
    └── components/
        └── ticket-approvals.tsx  # Already uses approval_role ✓ (no changes)

# Reference files (read-only context):
docs/database/migrations/
├── 003_create_rls_policies.sql   # Current RLS policies
└── 010_ops_manager_visibility.sql # Helper functions
```

**Structure Decision**: Single migration file for all RLS policy fixes + minor change to server action for row verification.

## Complexity Tracking

> No constitution violations - this section is not applicable.

## Phase 0: Research Findings

### Current State Analysis

**What's Already Correct:**
- `approval_role` field exists and is correctly populated in `ticket_approvals`
- UI component (`ticket-approvals.tsx`) correctly uses `approval_role` for permission checks
- Server action correctly uses `approval_role` to determine next status
- Initial ticket status correctly computed based on creator hierarchy

**Root Cause Identified:**
1. **Missing RLS UPDATE policy** for `ticket_approvals` table - no policy allows approvers to update approval records
2. **Missing RLS UPDATE policy** for `tickets` table for approvers - only creator, assigned user, and admins can update
3. **No `can_approve_ticket()` function** exists - or it uses `approval_level` incorrectly
4. **Application doesn't verify rows affected** - shows success even when UPDATE affects 0 rows

### Data Model Insight

The `approval_level` field is **relative** (position in creator-specific chain):
- Manobrista creates: Encarregado=1, Supervisor=2, Gerente=3
- Encarregado creates: Supervisor=1, Gerente=2
- Supervisor creates: Gerente=1

The `approval_role` field is **absolute** (role name):
- Always stores 'Encarregado', 'Supervisor', or 'Gerente'

**Solution**: RLS policies must use `approval_role` matching against ticket status, not `approval_level`.

## Phase 1: Design

### Database Changes

**New/Updated RLS Policies:**

1. **`can_approve_ticket(ticket_id, user_id)`** - Helper function to check if user can approve
   - Extracts expected role from ticket status
   - Compares user's highest Operações role against expected role
   - Returns true only if roles match

2. **`ticket_approvals_update_approver`** - RLS policy for UPDATE on ticket_approvals
   - Allows UPDATE when `can_approve_ticket()` returns true
   - Only allows updating own approval record (matching approval_role)

3. **`tickets_update_approver`** - RLS policy for UPDATE on tickets
   - Allows approvers to update ticket status during approval
   - Uses same `can_approve_ticket()` function

### Application Changes

**`handleApproval()` in actions.ts:**
- Add verification that UPDATE affected at least 1 row
- Return specific error if 0 rows affected (RLS blocked)
- Keep existing logic for status progression

### Contracts

No new API contracts needed - this is a bug fix to existing functionality.

## Post-Design Constitution Re-Check

| Principle | Status | Notes |
|-----------|--------|-------|
| IV. Security & RBAC | ✅ PASS | RLS policies enforce authorization correctly |
| V. Testing Discipline | ✅ PASS | Existing E2E tests will validate fix |

**Final Gate Result**: PASS - Ready for task generation.
