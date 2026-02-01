# Ticket System Specification

## Overview

The ticket system (Chamados) is the core of GarageInn operations. It handles requests for purchases, maintenance, HR, IT support, claims, commercial, and financial matters.

## Ticket Types

| Type | Department | Portuguese | Description |
|------|------------|------------|-------------|
| compras | Compras e Manutenção | Compras | Purchase requests |
| manutencao | Compras e Manutenção | Manutenção | Maintenance requests |
| rh | RH | RH | HR requests |
| ti | TI | TI | IT support requests |
| sinistros | Sinistros | Sinistros | Insurance claims |
| comercial | Comercial | Comercial | Commercial requests |
| financeiro | Financeiro | Financeiro | Financial requests |

## Core Entities

### Ticket

```typescript
interface Ticket {
  id: string;
  ticket_number: number;           // Auto-generated sequential
  title: string;
  description: string;
  department_id: string;
  category_id?: string;
  unit_id?: string;
  created_by: string;
  assigned_to?: string;
  status: TicketStatus;
  priority?: Priority;
  perceived_urgency?: string;      // Creator's urgency perception
  due_date?: Date;
  closed_at?: Date;
  denial_reason?: string;
  created_at: Date;
  updated_at: Date;
}
```

### Related Entities

- **ticket_purchase_details** - Purchase-specific data (item, quantity, price)
- **ticket_quotations** - Supplier quotes for purchases
- **ticket_approvals** - Approval chain records
- **ticket_comments** - Discussion thread
- **ticket_history** - Audit trail
- **ticket_attachments** - File uploads

## Status System

### Status Categories

| Category | Statuses | Description |
|----------|----------|-------------|
| Approval Flow | `awaiting_approval_*` | Pending hierarchical approval (Operações flow) |
| Triage | `awaiting_triage` | Needs assignment |
| Active | `in_progress`, `quoting`, `approved` | Being worked on |
| Final | `closed`, `cancelled`, `denied` | Terminal states |

### Status Values

```typescript
type TicketStatus =
  // Approval flow (Operações, any destination)
  | "awaiting_approval_encarregado"
  | "awaiting_approval_supervisor"
  | "awaiting_approval_gerente"
  // Triage
  | "awaiting_triage"
  // Active
  | "in_progress"
  | "quoting"
  | "approved"
  // Final
  | "closed"
  | "cancelled"
  | "denied";
```

See [Approval Flow](./approval-flow.md) for state machine details.

## Lifecycle

### 1. Creation

```
User fills form → System determines initial status → Ticket created
                          ↓
              Based on creator's role level
```

Initial status determination:
- Operações Manobrista → `awaiting_approval_encarregado`
- Operações Encarregado → `awaiting_approval_supervisor`
- Operações Supervisor → `awaiting_approval_gerente`
- Operações Gerente or Admin → `awaiting_triage`
- Other departments → `awaiting_triage`

### 2. Approval (if required)

```
awaiting_approval_encarregado
        ↓ approved
awaiting_approval_supervisor
        ↓ approved
awaiting_approval_gerente
        ↓ approved
  awaiting_triage
```

At any level, `denied` → terminal state.

Approval levels are fixed by role:
- Encarregado = level 1
- Supervisor = level 2
- Gerente = level 3

### 3. Triage

```
awaiting_triage
      ↓ triaged (priority + assigned_to set)
  in_progress
```

Required fields for triage:
- `priority` (low, medium, high, urgent)
- `assigned_to` (department member)
- `due_date` (optional)

### 4. Execution

Varies by ticket type. For Compras:

```
in_progress → quoting → approved → closed
```

### 5. Resolution

Terminal states:
- `closed` - Successfully completed
- `cancelled` - Cancelled by user/admin
- `denied` - Rejected during approval

## Permissions

| Action | Required Permission | Additional Rules |
|--------|---------------------|------------------|
| Create | `tickets:create` | Must have unit access |
| View | `tickets:read` | Subject to visibility rules |
| Triage | `tickets:triage` | Must be Supervisor/Gerente in dept |
| Approve | `tickets:approve` | Must be at correct approval level |
| Execute | `tickets:execute` | Must be assigned or dept member |
| Close | `tickets:approve` or admin | Must be final state transition |

See [Visibility Rules](./visibility-rules.md) for detailed access control.

## Data Flow

### Creation Flow

```
1. User submits form
2. Server validates input
3. System checks approval requirement (ticket_needs_approval RPC)
4. System determines initial status (get_initial_approval_status RPC)
5. Ticket inserted
6. Type-specific details inserted (e.g., ticket_purchase_details)
7. If approval needed: create_ticket_approvals RPC
8. Redirect to ticket detail page
```

### Approval Flow

```
1. User clicks approve/deny
2. Server validates user can approve at this level
3. Update ticket_approvals record
4. Calculate next status
5. Update ticket status
6. Log in ticket_history
```

## Implementation Files

| File | Purpose |
|------|---------|
| `src/lib/ticket-statuses.ts` | Status type definitions |
| `src/app/(app)/chamados/actions.ts` | Shared ticket actions |
| `src/app/(app)/chamados/[type]/actions.ts` | Type-specific actions |
| `src/app/(app)/chamados/[type]/constants.ts` | Type-specific constants |
| `src/app/(app)/chamados/[type]/page.tsx` | List page |
| `src/app/(app)/chamados/[type]/[ticketId]/page.tsx` | Detail page |

## Database Objects

### Tables

- `tickets` - Main ticket data
- `ticket_categories` - Category definitions per department
- `ticket_purchase_details` - Purchase-specific fields
- `ticket_quotations` - Supplier quotes
- `ticket_approvals` - Approval records
- `ticket_comments` - Comments
- `ticket_history` - Audit log
- `ticket_attachments` - Files

### Views

- `tickets_with_details` - Denormalized view with joins

### Functions (RPCs)

- `ticket_needs_approval(user_id, department_id)` - Check if approval required
- `get_initial_approval_status(user_id)` - Determine initial status
- `create_ticket_approvals(ticket_id)` - Create approval chain
- `is_operacoes_creator(user_id)` - Check if user is from Operações
- `is_operacoes_gerente()` - Check if current user is Operações Gerente

## Related Specs

- [Approval Flow](./approval-flow.md) - State machine details
- [Visibility Rules](./visibility-rules.md) - Who sees what
- [Assignment Rules](./assignment-rules.md) - Triage and assignment
- [RBAC Spec](../rbac/spec.md) - Permission system
