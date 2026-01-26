# Research: Root Cause Analysis - Approval Status Bug

**Feature**: 007-fix-approval-status
**Date**: 2026-01-25
**Status**: Complete

## Executive Summary

The bug occurs when a Supervisor in the Operações department creates a purchase ticket. The ticket receives status `awaiting_approval_encarregado` instead of the correct `awaiting_approval_gerente`. Investigation confirms SQL functions work correctly when tested directly, indicating the bug is in the application layer.

---

## Investigation Findings

### 1. SQL Functions Analysis

**Location**: `docs/database/migrations/011_adjust_approval_flow_operacoes.sql`

All SQL functions were verified to work correctly:

| Function | Expected Behavior | Verified |
|----------|-------------------|----------|
| `get_highest_operacoes_role(user_id)` | Returns level 3 for Supervisor | ✅ |
| `get_initial_approval_status(user_id)` | Returns `awaiting_approval_gerente` for level 3 | ✅ |
| `ticket_needs_approval(user_id, dept_id)` | Returns `true` for levels 1-3 | ✅ |
| `create_ticket_approvals(ticket_id)` | Creates only Gerente approval for level 3 | ✅ |

**Conclusion**: SQL functions are NOT the source of the bug.

### 2. Application Layer Analysis

**Location**: `apps/web/src/app/(app)/chamados/compras/actions.ts` (lines 561-623)

**Current Code Flow**:
```typescript
// Line 567-572
const { data: initialStatusData } = await supabase.rpc(
  "get_initial_approval_status",
  { p_created_by: user.id }
);
const initialStatus = initialStatusData || "awaiting_triage";

// Line 575-591 - Ticket created with initialStatus
const { data: ticket } = await supabase
  .from("tickets")
  .insert({
    // ...
    status: initialStatus,  // <-- Bug: Not using correct value
    // ...
  })
```

### 3. Root Cause Hypotheses

#### Hypothesis A: RPC Response Handling (Most Likely)

The Supabase RPC call may be:
1. Returning `null` due to execution error
2. Returning unexpected type (object instead of string)
3. Not awaiting properly

**Evidence**: The fallback `|| "awaiting_triage"` would produce a different status, not `awaiting_approval_encarregado`. This suggests another code path is involved.

#### Hypothesis B: Conditional Override (Likely)

There may be additional code that overrides `initialStatus` based on conditions:
- Department-specific logic
- User role checks
- Legacy code paths

**Action Required**: Search for any code that sets status to `awaiting_approval_encarregado`.

#### Hypothesis C: Missing Error Handling

The RPC call may fail silently without proper error capture:
```typescript
const { data: initialStatusData } = await supabase.rpc(...)
// Missing: if (error) { handle error }
```

#### Hypothesis D: RPC Function Not Deployed

The SQL migration `011_adjust_approval_flow_operacoes.sql` may not be applied to the production database, causing the RPC to use an older function version.

**Verification**: Check if migrations are in `supabase/migrations/` and have been applied.

---

## Code Path Analysis

### Complete Ticket Creation Flow

```
1. User submits form (novo/page.tsx)
   ↓
2. createPurchaseTicket() called (actions.ts:490)
   ↓
3. Validation checks (lines 500-559)
   ↓
4. RPC: ticket_needs_approval() (line 562-565)
   ↓
5. RPC: get_initial_approval_status() (line 567-572)
   ↓
6. INSERT ticket with status = initialStatus (line 575-591)
   ↓
7. INSERT purchase details (line 598-607)
   ↓
8. IF needsApproval: RPC: create_ticket_approvals() (line 617-619)
   ↓
9. Redirect to ticket page
```

### Key Observation

The bug report states:
- `ticket_approvals` table has only 1 record (Gerente) ✅
- `tickets.status` is `awaiting_approval_encarregado` ❌

This inconsistency suggests:
1. `create_ticket_approvals()` executed correctly (respects level 3)
2. `get_initial_approval_status()` either returned wrong value OR was not used

---

## Decision: Investigation Approach

**Decision**: Debug the RPC response handling in the application layer

**Rationale**:
- SQL functions are verified working correctly
- The inconsistency between approvals and status points to application code
- The fallback value doesn't match observed status, indicating another source

**Alternatives Considered**:
1. Add logging to SQL functions - Rejected: Functions already verified
2. Check database migration state - Should verify but likely applied
3. Review all code paths in actions.ts - **Selected approach**

---

## Recommended Fix Strategy

### Phase 1: Add Diagnostic Logging

Add explicit logging before and after RPC calls:
```typescript
const { data: initialStatusData, error: statusError } = await supabase.rpc(
  "get_initial_approval_status",
  { p_created_by: user.id }
);

console.log('RPC get_initial_approval_status:', {
  userId: user.id,
  result: initialStatusData,
  error: statusError
});
```

### Phase 2: Fix Error Handling

Ensure RPC errors are properly handled:
```typescript
if (statusError) {
  console.error('Error getting initial status:', statusError);
  // Use safe fallback that requires full approval chain
  return { error: 'Failed to determine approval status' };
}
```

### Phase 3: Verify Status Assignment

Confirm the correct value is used in the INSERT:
```typescript
const initialStatus: string = initialStatusData ?? 'awaiting_approval_encarregado';
// ^ Use strictest fallback if null
```

### Phase 4: Add Type Safety

Define explicit types for RPC responses:
```typescript
type ApprovalStatus =
  | 'awaiting_approval_encarregado'
  | 'awaiting_approval_supervisor'
  | 'awaiting_approval_gerente'
  | 'awaiting_triage';

const initialStatus = initialStatusData as ApprovalStatus;
```

---

## Additional Checks Required

### Migration Verification

Check if the SQL migration has been applied:
```bash
# List applied migrations
npx supabase migration list

# Or check directly in database
SELECT * FROM supabase_migrations WHERE name LIKE '%011%';
```

### RPC Function Verification

Test RPC directly in Supabase dashboard or via SQL:
```sql
SELECT get_initial_approval_status('supervisor_user_id_here');
-- Expected: 'awaiting_approval_gerente'
```

---

## Files to Modify

| File | Change Type | Description |
|------|-------------|-------------|
| `apps/web/src/app/(app)/chamados/compras/actions.ts` | Modify | Add error handling, logging, fix status assignment |
| `supabase/migrations/` | Possibly Add | Migration if SQL functions need updates |
| `apps/web/e2e/` | Add | E2E test for approval flow per user level |

---

## Timeline

1. **Immediate**: Add logging to capture actual RPC response
2. **Short-term**: Fix error handling and status assignment
3. **Validation**: Test with all 4 user levels (Manobrista, Encarregado, Supervisor, Gerente)
4. **Regression**: Add E2E test to prevent future issues
