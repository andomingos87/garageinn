# Research: Fix RLS Approval Policies

**Feature**: 008-fix-rls-approval
**Date**: 2026-01-25

## Executive Summary

The hierarchical approval system for purchase tickets fails silently when tickets are created by users above the Manobrista level. Research identified the root cause as missing RLS UPDATE policies and incorrect field mapping (`approval_level` vs `approval_role`).

---

## Research Questions & Findings

### Q1: What RLS policies currently exist for ticket_approvals?

**Finding**: Only SELECT policy exists

**Location**: `docs/database/migrations/003_create_rls_policies.sql` (lines 329-342)

```sql
CREATE POLICY "ticket_approvals_select" ON public.ticket_approvals
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tickets t
      WHERE t.id = ticket_approvals.ticket_id
      AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid() OR is_admin())
    )
  );
```

**Impact**: No UPDATE policy means approvers cannot update approval records via RLS.

---

### Q2: What RLS policies exist for tickets table?

**Finding**: UPDATE policies exist only for creator, assigned user, and admins

**Location**: `docs/database/migrations/003_create_rls_policies.sql` (lines 202-218)

Existing UPDATE policies:
- `tickets_update_own` - creator can update
- `tickets_update_assigned` - assigned user can update
- `tickets_admin_all` - admins can update

**Impact**: Approvers cannot update ticket status to advance the workflow.

---

### Q3: Does can_approve_ticket() function exist?

**Finding**: No such function exists in the codebase

**Searched**:
- `supabase/migrations/` - not found
- `docs/database/migrations/` - not found
- grep for "can_approve_ticket" - 0 results

**Impact**: Need to create this helper function from scratch.

---

### Q4: How does approval_level vs approval_role work?

**Finding**: `approval_level` is relative, `approval_role` is absolute

**Location**: `supabase/migrations/20260125192945_approval_flow_functions.sql` (lines 112-193)

| Creator Role | approval_level=1 | approval_level=2 | approval_level=3 |
|--------------|------------------|------------------|------------------|
| Manobrista   | Encarregado      | Supervisor       | Gerente          |
| Encarregado  | Supervisor       | Gerente          | -                |
| Supervisor   | Gerente          | -                | -                |

The `approval_role` field always stores the actual role name ('Encarregado', 'Supervisor', 'Gerente').

**Decision**: Use `approval_role` for RLS matching because it's deterministic.

---

### Q5: How does the UI determine approval permissions?

**Finding**: UI already uses `approval_role` correctly

**Location**: `apps/web/src/app/(app)/chamados/compras/[ticketId]/components/ticket-approvals.tsx` (lines 93-113)

```typescript
const statusToExpectedRole: Record<string, string> = {
  awaiting_approval_encarregado: "Encarregado",
  awaiting_approval_supervisor: "Supervisor",
  awaiting_approval_gerente: "Gerente",
};

const expectedRole = statusToExpectedRole[ticketStatus];
if (approval.approval_role !== expectedRole) return false;
```

**Impact**: UI logic is correct; only database RLS needs fixing.

---

### Q6: How does handleApproval() work?

**Finding**: Uses approval_role for next status, but doesn't verify rows affected

**Location**: `apps/web/src/app/(app)/chamados/compras/actions.ts` (lines 1351-1449)

```typescript
// Determines next status correctly using approval_role
const nextStatusByRole: Record<string, string> = {
  Encarregado: "awaiting_approval_supervisor",
  Supervisor: "awaiting_approval_gerente",
  Gerente: "awaiting_triage",
};
```

**Issue**: No check for `count` after UPDATE:
```typescript
const { error } = await supabase
  .from("ticket_approvals")
  .update({ ... })
  .eq("id", approvalId);
// If RLS blocks, error is null but 0 rows affected
```

**Decision**: Add row count verification and return specific error.

---

### Q7: What existing helper functions can be reused?

**Finding**: `get_highest_operacoes_role()` exists and returns numeric level

**Location**: `supabase/migrations/20260125192945_approval_flow_functions.sql` (lines 16-46)

```sql
CREATE OR REPLACE FUNCTION get_highest_operacoes_role(p_user_id uuid)
RETURNS integer AS $$
  -- Returns: 4=Gerente, 3=Supervisor, 2=Encarregado, 1=Manobrista, 0=none
$$;
```

**Decision**: Create new helper that returns role name instead of level for clearer matching.

---

## Alternatives Considered

### Alternative 1: Fix approval_level to be absolute

**Rejected because**:
- Would require migration of existing data
- Would break `create_ticket_approvals()` logic
- `approval_role` already exists and is correct

### Alternative 2: Use service role bypass for approvals

**Rejected because**:
- Violates constitution principle IV (Security & RBAC)
- RLS should be the source of truth for authorization

### Alternative 3: Add approval_level to RLS with complex mapping

**Rejected because**:
- Would require RLS to know about creator role hierarchy
- More complex and error-prone than using approval_role directly

---

## Final Decisions

| Decision | Rationale | Alternatives Rejected |
|----------|-----------|----------------------|
| Use `approval_role` in RLS policies | Deterministic, already populated correctly | approval_level (relative), service role bypass |
| Create `can_approve_ticket()` function | Centralizes authorization logic, reusable | Inline policy logic (harder to test/maintain) |
| Add row count verification in app | Defense in depth, better UX on failure | Silent failures (current behavior) |
| Single migration file | Atomic deployment, easy rollback | Multiple migrations (unnecessary complexity) |

---

## Implementation Approach

### Database Layer (Migration)

1. Create `get_user_operacoes_role_name(user_id)` - returns role name string
2. Create `can_approve_ticket(ticket_id, user_id)` - checks if user can approve based on ticket status and their role
3. Create `ticket_approvals_update_approver` RLS policy
4. Create `tickets_update_approver` RLS policy

### Application Layer

1. Modify `handleApproval()` to use `.select()` after update to verify row count
2. Return specific error message when 0 rows affected

### Testing

1. Run existing E2E tests for all 7 approval scenarios
2. Verify fix for Encarregado-created tickets (currently failing)
3. Verify no regression for Manobrista-created tickets (currently working)
