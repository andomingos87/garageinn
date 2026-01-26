# RPC Contracts: Approval Status Functions

**Feature**: 007-fix-approval-status
**Date**: 2026-01-25

## Overview

This document defines the expected contracts for the Supabase RPC functions used in the approval status flow.

---

## 1. `get_initial_approval_status`

### Request

```typescript
interface GetInitialApprovalStatusRequest {
  p_created_by: string; // UUID of the user creating the ticket
}
```

### Response

```typescript
type ApprovalStatus =
  | "awaiting_approval_encarregado"
  | "awaiting_approval_supervisor"
  | "awaiting_approval_gerente"
  | "awaiting_triage";

// Supabase RPC returns:
interface SupabaseRpcResponse<T> {
  data: T | null;
  error: PostgrestError | null;
}

// For this function:
type Response = SupabaseRpcResponse<ApprovalStatus>;
```

### Behavior

| User Level | Return Value |
|------------|--------------|
| Manobrista (1) | `"awaiting_approval_encarregado"` |
| Encarregado (2) | `"awaiting_approval_supervisor"` |
| Supervisor (3) | `"awaiting_approval_gerente"` |
| Gerente (4) | `"awaiting_triage"` |
| Not in Operações (0) | `"awaiting_triage"` |

### Error Cases

| Condition | Error |
|-----------|-------|
| Invalid UUID | PostgrestError with code `22P02` |
| User not found | Returns `"awaiting_triage"` (null coalesced) |

---

## 2. `ticket_needs_approval`

### Request

```typescript
interface TicketNeedsApprovalRequest {
  p_created_by: string; // UUID of the user creating the ticket
  p_department_id: string; // UUID of the target department
}
```

### Response

```typescript
type Response = SupabaseRpcResponse<boolean>;
```

### Behavior

| User Level | Return Value |
|------------|--------------|
| Manobrista (1) | `true` |
| Encarregado (2) | `true` |
| Supervisor (3) | `true` |
| Gerente (4) | `false` |
| Not in Operações (0) | `false` |

---

## 3. `create_ticket_approvals`

### Request

```typescript
interface CreateTicketApprovalsRequest {
  p_ticket_id: string; // UUID of the newly created ticket
}
```

### Response

```typescript
type Response = SupabaseRpcResponse<void>;
```

### Side Effects

Creates records in `ticket_approvals` table:

| Creator Level | Approvals Created |
|---------------|-------------------|
| Manobrista (1) | Encarregado (level 1), Supervisor (level 2), Gerente (level 3) |
| Encarregado (2) | Supervisor (level 1), Gerente (level 2) |
| Supervisor (3) | Gerente (level 1) |
| Gerente (4) | None |

### Error Cases

| Condition | Error |
|-----------|-------|
| Ticket not found | `EXCEPTION: 'Chamado não encontrado'` |

---

## 4. `get_highest_operacoes_role`

### Request

```typescript
interface GetHighestOperacoesRoleRequest {
  p_user_id: string; // UUID of the user
}
```

### Response

```typescript
type Response = SupabaseRpcResponse<number>;
// Returns integer 0-4
```

### Behavior

| User Role in Operações | Return Value |
|------------------------|--------------|
| Not in Operações | `0` |
| Manobrista | `1` |
| Encarregado | `2` |
| Supervisor | `3` |
| Gerente | `4` |
| Multiple roles | Highest level |

---

## TypeScript Usage Example

```typescript
import { createClient } from "@/lib/supabase/server";

type ApprovalStatus =
  | "awaiting_approval_encarregado"
  | "awaiting_approval_supervisor"
  | "awaiting_approval_gerente"
  | "awaiting_triage";

async function getInitialStatus(userId: string): Promise<ApprovalStatus> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "get_initial_approval_status",
    { p_created_by: userId }
  );

  if (error) {
    console.error("RPC error:", error);
    // Safe fallback: require full approval chain
    return "awaiting_approval_encarregado";
  }

  return (data as ApprovalStatus) ?? "awaiting_approval_encarregado";
}
```

---

## Validation

To verify contracts in development:

```sql
-- Test get_initial_approval_status
SELECT get_initial_approval_status('user-uuid-here');

-- Test get_highest_operacoes_role
SELECT get_highest_operacoes_role('user-uuid-here');

-- Verify a user's roles
SELECT r.name, d.name as department
FROM user_roles ur
JOIN roles r ON r.id = ur.role_id
JOIN departments d ON d.id = r.department_id
WHERE ur.user_id = 'user-uuid-here';
```
