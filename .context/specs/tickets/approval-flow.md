# Ticket Approval Flow

## Overview

Tickets created by Operações users (any destination department) require hierarchical approval before reaching triage. This ensures accountability for operational requests.

## State Machine

```
┌─────────────────────────────────────────────────────────────────┐
│                        APPROVAL FLOW                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────┐                                       │
│  │ awaiting_approval_   │                                       │
│  │ encarregado          │──────── denied ────────┐              │
│  └──────────┬───────────┘                        │              │
│             │ approved                           │              │
│             ▼                                    │              │
│  ┌──────────────────────┐                        │              │
│  │ awaiting_approval_   │                        │              │
│  │ supervisor           │──────── denied ────────┤              │
│  └──────────┬───────────┘                        │              │
│             │ approved                           │              │
│             ▼                                    │              │
│  ┌──────────────────────┐                        │              │
│  │ awaiting_approval_   │                        ▼              │
│  │ gerente              │──────── denied ───► [denied]          │
│  └──────────┬───────────┘                     (final)           │
│             │ approved                                          │
│             ▼                                                   │
│  ┌──────────────────────┐                                       │
│  │ awaiting_triage      │ ◄───── Direct entry for Gerente+     │
│  └──────────┬───────────┘                                       │
│             │ triaged                                           │
│             ▼                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │        EXECUTION FLOW          │
              │  (see ticket spec for details) │
              └───────────────────────────────┘
```

## Approval Levels

| Level | Role | Approves Tickets From |
|-------|------|----------------------|
| 1 | Encarregado | Manobrista |
| 2 | Supervisor | Encarregado |
| 3 | Gerente | Supervisor |

**Note:** Approval levels are **fixed by role** (not sequential). `approval_level` must always match the role above.

## Entry Points by Role

| Creator Role | Initial Status | Skips Levels |
|--------------|----------------|--------------|
| Manobrista | `awaiting_approval_encarregado` | None |
| Encarregado | `awaiting_approval_supervisor` | Level 1 |
| Supervisor | `awaiting_approval_gerente` | Levels 1-2 |
| Gerente | `awaiting_triage` | All |
| Admin/Global | `awaiting_triage` | All |

**Implementation:** `get_initial_approval_status` SQL function

## Approval Record

```typescript
interface TicketApproval {
  id: string;
  ticket_id: string;
  approval_level: 1 | 2 | 3; // fixed by role
  approval_role: "Encarregado" | "Supervisor" | "Gerente";
  status: "pending" | "approved" | "denied";
  approved_by?: string;
  decision_at?: Date;
  notes?: string;
}
```

## Status Transitions

### On Approval

| Current Status | Next Status |
|----------------|-------------|
| `awaiting_approval_encarregado` | `awaiting_approval_supervisor` |
| `awaiting_approval_supervisor` | `awaiting_approval_gerente` |
| `awaiting_approval_gerente` | `awaiting_triage` |

### On Denial

Any approval status → `denied` (terminal)

Required: `denial_reason` must be provided.

## Special Rules

### R1: Operações Gerente Requirement

Tickets created by Operações users can **only** receive final (level 3) approval from the Gerente de Operações.

```typescript
// In handleApproval()
const opsCheck = await ensureOperacoesGerenteApproval(
  supabase,
  ticketId,
  approval.approval_level,
  approval.approval_role
);
if (opsCheck?.error) {
  return opsCheck;  // "Apenas o gerente de operacoes pode aprovar este chamado"
}
```

### R2: Approval Level Matching

User must have the exact role matching the approval level:
- Level 1 requires `Encarregado` role
- Level 2 requires `Supervisor` role
- Level 3 requires `Gerente` role

### R3: Unit Context

Approver should have visibility of the ticket's unit:
- Encarregado: Same unit as ticket
- Supervisor: Coverage includes ticket's unit
- Gerente: Any unit

## RLS Policies

### ticket_approvals SELECT

```sql
-- Users can see approvals for tickets they can see
EXISTS (
  SELECT 1 FROM tickets t
  WHERE t.id = ticket_approvals.ticket_id
  -- And ticket passes visibility rules
)
```

### ticket_approvals UPDATE

```sql
-- User can update if:
-- 1. They are admin, OR
-- 2. They have the matching role for this approval level
(
  is_admin()
  OR
  (
    approval_role = get_user_role_in_department('Operações')
    AND status = 'pending'
  )
)
```

## UI Flow

### Approval List View

```
[Pending Approvals]
├── Ticket #123 - Compra de material
│   └── Criado por: João (Manobrista)
│   └── [Aprovar] [Negar]
├── Ticket #124 - Equipamento de limpeza
│   └── Criado por: Maria (Encarregado)
│   └── [Aprovar] [Negar]
```

### Approval Action

1. User clicks Aprovar/Negar
2. If Negar: Modal requests reason (required)
3. Confirmation dialog
4. Server processes approval
5. Toast notification
6. List refreshes

## Testing Scenarios

### Happy Path

1. Manobrista creates ticket → status = `awaiting_approval_encarregado`
2. Encarregado approves → status = `awaiting_approval_supervisor`
3. Supervisor approves → status = `awaiting_approval_gerente`
4. Gerente Operações approves → status = `awaiting_triage`

### Denial Path

1. Manobrista creates ticket
2. Encarregado denies with reason
3. Ticket status = `denied`
4. denial_reason populated

### Skip Levels

1. Supervisor creates ticket → status = `awaiting_approval_gerente`
2. Gerente approves → status = `awaiting_triage`

### Invalid Approver

1. Ticket at level 2 (awaiting_approval_supervisor)
2. Encarregado tries to approve
3. Error: "Você não pode aprovar este chamado"

## Implementation Files

| File | Function |
|------|----------|
| `compras/actions.ts` | `handleApproval()` |
| `compras/actions.ts` | `ensureOperacoesGerenteApproval()` |
| `compras/actions.ts` | `getPendingApprovals()` |
| SQL | `get_initial_approval_status` |
| SQL | `create_ticket_approvals` |
| SQL | `is_operacoes_gerente` |

## Related Specs

- [Ticket Spec](./spec.md)
- [Visibility Rules](./visibility-rules.md)
- [RBAC Department Rules](../rbac/department-rules.md)
