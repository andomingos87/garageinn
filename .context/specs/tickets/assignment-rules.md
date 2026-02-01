# Ticket Assignment Rules

## Overview

Assignment (triage) is the process of setting priority and responsible person for a ticket that has passed approval.

## Triage Process

### Prerequisites

1. Ticket status must be `awaiting_triage`
2. User must have `tickets:triage` permission
3. User must be in the target department (or admin)

### Required Fields

| Field | Type | Validation |
|-------|------|------------|
| `priority` | enum | `low`, `medium`, `high`, `urgent` |
| `assigned_to` | UUID | Must be valid department member |
| `due_date` | date | Optional, must be future |

### Status Transition

```
awaiting_triage → in_progress
```

## Who Can Triage

### Compras Tickets

| Role | Can Triage |
|------|:----------:|
| Desenvolvedor | ✓ |
| Administrador | ✓ |
| Diretor | ✓ |
| Gerente (any) | ✓ |
| Supervisor (Compras) | ✓ |
| Coordenador (Compras) | ✓ |
| Other | ✗ |

**Implementation:** `canTriageTicket()` in `compras/actions.ts`

### Other Ticket Types

Generally follows the pattern:
- Gerente of the department
- Supervisor of the department
- Admin roles

## Assignment Targets

### Who Can Be Assigned

For Compras tickets:
- Any member of "Compras e Manutenção" department
- Fetched via `getComprasDepartmentMembers()`

### Assignment Validation

```typescript
// The assigned_to must be a valid department member
const members = await getComprasDepartmentMembers();
const validAssignee = members.some(m => m.id === assigned_to);
if (!validAssignee) {
  return { error: "Responsável inválido" };
}
```

## Auto-Assignment Rules

Currently, there is no auto-assignment. All tickets require manual triage.

### Future Consideration

Potential auto-assignment rules:
1. Round-robin within department
2. Workload-based (least assigned)
3. Category-based (specific person for specific categories)

## Reassignment

### When Allowed

- Ticket is not in a final state (`closed`, `cancelled`, `denied`)
- User has `tickets:triage` permission

### Process

1. Update `assigned_to` field
2. Log reassignment in `ticket_history`
3. Notify new assignee (future: notifications)

## Priority Guidelines

| Priority | SLA (suggested) | Use Case |
|----------|-----------------|----------|
| `low` | 5 business days | Non-urgent, can wait |
| `medium` | 3 business days | Standard requests |
| `high` | 1 business day | Important, time-sensitive |
| `urgent` | Same day | Critical, blocking operations |

**Note:** SLAs are guidelines, not enforced by system.

## History Tracking

Triage actions are logged:

```typescript
await supabase.from("ticket_history").insert({
  ticket_id: ticketId,
  user_id: user.id,
  action: "triaged",
  old_value: "awaiting_triage",
  new_value: "in_progress",
  metadata: {
    priority,
    assigned_to,
    due_date,
    triaged_by: user.id,
  },
});
```

## Self-Assignment

Allowed if:
1. User is in the target department
2. User has `tickets:execute` permission
3. Ticket is triaged (has assignee) or user can triage

To self-assign during triage:
- Triage user sets `assigned_to` to their own ID

## Workload Visibility

Currently not implemented. Future feature:

```
[Assign To]
├── João Silva (3 active tickets)
├── Maria Santos (5 active tickets)
├── Pedro Costa (1 active ticket) ← Recommended
```

## Implementation

### triageTicket()

```typescript
export async function triageTicket(ticketId: string, formData: FormData) {
  // 1. Verify authentication
  // 2. Check canTriageTicket()
  // 3. Verify ticket is awaiting_triage
  // 4. Validate priority enum
  // 5. Validate assigned_to is department member
  // 6. Update ticket
  // 7. Log history
  // 8. Revalidate paths
}
```

### canTriageTicket()

```typescript
export async function canTriageTicket(): Promise<boolean> {
  // 1. Check if admin → return true
  // 2. Get user roles
  // 3. Check if user has triage role in relevant department
  // 4. Return result
}
```

## Edge Cases

### E1: Assignee Leaves Department

If assigned user's role is removed:
- Ticket remains assigned to them
- They may lose access to view the ticket
- Requires manual reassignment by Gerente

### E2: Department Merge

If departments are restructured:
- Update department_id in tickets
- Verify RLS policies still work
- May need migration script

### E3: Urgent Escalation

Currently no automatic escalation. Gerente must manually:
1. Change priority to `urgent`
2. Reassign if needed
3. Add comment explaining urgency

## Testing Checklist

- [ ] Only authorized roles can triage
- [ ] Invalid priority is rejected
- [ ] Invalid assignee is rejected
- [ ] History is correctly logged
- [ ] Status changes to `in_progress`
- [ ] Revalidation refreshes list and detail views

## Related Specs

- [Ticket Spec](./spec.md)
- [Approval Flow](./approval-flow.md) (triage happens after approval)
- [RBAC Roles Matrix](../rbac/roles-matrix.md)
