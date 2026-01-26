# Quickstart: Fixing Approval Status Bug

**Feature**: 007-fix-approval-status
**Date**: 2026-01-25
**Estimated Complexity**: Low (single file fix)

## Problem Statement

When a Supervisor in Operações creates a purchase ticket, the status is incorrectly set to `awaiting_approval_encarregado` instead of `awaiting_approval_gerente`.

## Root Cause

The SQL functions (`get_initial_approval_status`) work correctly, but the application layer in `createPurchaseTicket()` is either:
1. Not receiving the correct RPC response
2. Not handling errors properly
3. Has additional code overriding the status

## Quick Fix Steps

### Step 1: Locate the Code

Open `apps/web/src/app/(app)/chamados/compras/actions.ts` and find the `createPurchaseTicket` function (around line 490).

### Step 2: Add Error Handling

Find the RPC call around lines 567-572:

```typescript
// BEFORE (current code)
const { data: initialStatusData } = await supabase.rpc(
  "get_initial_approval_status",
  { p_created_by: user.id }
);
const initialStatus = initialStatusData || "awaiting_triage";
```

Change to:

```typescript
// AFTER (with error handling)
const { data: initialStatusData, error: statusError } = await supabase.rpc(
  "get_initial_approval_status",
  { p_created_by: user.id }
);

if (statusError) {
  console.error("Error getting initial approval status:", statusError);
  return { error: "Falha ao determinar status de aprovação" };
}

const initialStatus = initialStatusData || "awaiting_approval_encarregado";
```

### Step 3: Add Type Safety

Add explicit type for the status:

```typescript
type ApprovalStatus =
  | "awaiting_approval_encarregado"
  | "awaiting_approval_supervisor"
  | "awaiting_approval_gerente"
  | "awaiting_triage";

const initialStatus: ApprovalStatus =
  (initialStatusData as ApprovalStatus) || "awaiting_approval_encarregado";
```

### Step 4: Verify Database Migration

Ensure the SQL function is deployed:

```bash
# Check if migrations folder has the function
ls supabase/migrations/

# If missing, create migration file
# Copy content from docs/database/migrations/011_adjust_approval_flow_operacoes.sql
```

### Step 5: Test the Fix

Test with each user level:

| Test User | Department | Role | Expected Status |
|-----------|------------|------|-----------------|
| User A | Operações | Manobrista | `awaiting_approval_encarregado` |
| User B | Operações | Encarregado | `awaiting_approval_supervisor` |
| User C | Operações | Supervisor | `awaiting_approval_gerente` |
| User D | Operações | Gerente | `awaiting_triage` |

## Verification Checklist

- [ ] RPC error handling added
- [ ] Fallback uses safest default (`awaiting_approval_encarregado`)
- [ ] SQL migration applied to database
- [ ] Tested with Supervisor user - gets `awaiting_approval_gerente`
- [ ] Verified `ticket_approvals` only has Gerente record for Supervisor
- [ ] Tested other user levels still work correctly

## Files Changed

| File | Change |
|------|--------|
| `apps/web/src/app/(app)/chamados/compras/actions.ts` | Add error handling, type safety |
| `supabase/migrations/YYYYMMDD_approval_functions.sql` | Deploy SQL functions (if needed) |

## Rollback Plan

If the fix causes issues:

1. Revert the changes to `actions.ts`
2. The SQL functions are backwards compatible - no SQL rollback needed
3. Manually update any affected tickets:
   ```sql
   -- For tickets created during buggy period
   UPDATE tickets
   SET status = 'awaiting_approval_gerente'
   WHERE id IN (
     SELECT t.id
     FROM tickets t
     JOIN profiles p ON t.created_by = p.id
     WHERE get_highest_operacoes_role(t.created_by) = 3
     AND t.status = 'awaiting_approval_encarregado'
   );
   ```

## Need Help?

- SQL functions: `docs/database/migrations/011_adjust_approval_flow_operacoes.sql`
- Bug report: `docs/chamados/execucao_de_compras/bug_aprovacao_supervisor.md`
- Specification: `specs/007-fix-approval-status/spec.md`
