# Quickstart: Fix RLS Approval Policies

**Feature**: 008-fix-rls-approval
**Date**: 2026-01-25

## TL;DR

Fix RLS policies so hierarchical approvals work for all ticket creators, not just Manobristas.

---

## What's Broken

When Encarregado or Supervisor creates a purchase ticket, approvers see the approve button but clicking it silently fails - database UPDATE is blocked by missing RLS policies.

**Working**: Manobrista creates ticket → Encarregado/Supervisor/Gerente can approve
**Broken**: Encarregado creates ticket → Supervisor/Gerente cannot approve
**Broken**: Supervisor creates ticket → Gerente cannot approve

---

## Root Cause

1. No RLS UPDATE policy for `ticket_approvals` table
2. No RLS UPDATE policy for `tickets` table (for approvers)
3. Application shows "success" even when UPDATE affects 0 rows

---

## The Fix

### Database (1 migration file)

```sql
-- 1. Helper function: get user's Operações role name
CREATE FUNCTION get_user_operacoes_role_name(user_id uuid) RETURNS text;

-- 2. Helper function: can user approve this ticket?
CREATE FUNCTION can_approve_ticket(ticket_id uuid, user_id uuid) RETURNS boolean;

-- 3. RLS policy: allow approvers to update ticket_approvals
CREATE POLICY "ticket_approvals_update_approver" ON ticket_approvals FOR UPDATE;

-- 4. RLS policy: allow approvers to update tickets
CREATE POLICY "tickets_update_approver" ON tickets FOR UPDATE;
```

### Application (1 file change)

```typescript
// In handleApproval() - verify rows affected
const { data, error, count } = await supabase
  .from("ticket_approvals")
  .update({ ... })
  .eq("id", approvalId)
  .select();

if (!data || data.length === 0) {
  return { error: "Could not process the approval. Check your permissions." };
}
```

---

## Files to Change

| File | Change |
|------|--------|
| `supabase/migrations/YYYYMMDDHHMMSS_fix_rls_approval_policies.sql` | New migration with functions and policies |
| `apps/web/src/app/(app)/chamados/compras/actions.ts` | Add row count verification in `handleApproval()` |

---

## How to Test

1. Create ticket as **Encarregado** user
2. Log in as **Supervisor** user
3. Click "Approve" on the ticket
4. **Before fix**: UI shows success but nothing changes
5. **After fix**: Ticket advances to `awaiting_approval_gerente`

---

## Key Insight

The `approval_role` field stores the absolute role name ('Supervisor'), while `approval_level` stores relative position (1, 2, 3). RLS must use `approval_role` because it's deterministic regardless of who created the ticket.

---

## Rollback

If issues occur:
```sql
DROP POLICY IF EXISTS "tickets_update_approver" ON tickets;
DROP POLICY IF EXISTS "ticket_approvals_update_approver" ON ticket_approvals;
DROP FUNCTION IF EXISTS can_approve_ticket;
DROP FUNCTION IF EXISTS get_user_operacoes_role_name;
```
