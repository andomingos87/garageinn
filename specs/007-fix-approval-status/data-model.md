# Data Model: Approval Status Flow

**Feature**: 007-fix-approval-status
**Date**: 2026-01-25

## Entity Relationships

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│     profiles    │      │   user_roles    │      │      roles      │
│─────────────────│      │─────────────────│      │─────────────────│
│ id (PK)         │←────→│ user_id (FK)    │      │ id (PK)         │
│ full_name       │      │ role_id (FK)    │─────→│ name            │
│ email           │      └─────────────────┘      │ department_id   │
└─────────────────┘                               └────────┬────────┘
         │                                                 │
         │                                                 ↓
         │                                       ┌─────────────────┐
         │                                       │   departments   │
         │                                       │─────────────────│
         │                                       │ id (PK)         │
         ↓                                       │ name            │
┌─────────────────┐                              └─────────────────┘
│     tickets     │
│─────────────────│
│ id (PK)         │
│ created_by (FK) │──────→ profiles.id
│ status          │ ←───── Determined by user's highest role level
│ department_id   │
└────────┬────────┘
         │
         │ 1:N
         ↓
┌─────────────────────────┐
│    ticket_approvals     │
│─────────────────────────│
│ id (PK)                 │
│ ticket_id (FK)          │
│ approval_level          │  ← Sequential order (1, 2, 3)
│ approval_role           │  ← 'Encarregado', 'Supervisor', 'Gerente'
│ status                  │  ← 'pending', 'approved', 'rejected'
│ approved_by (FK)        │
│ approved_at             │
└─────────────────────────┘
```

## Hierarchical Levels

| Level | Role Name    | Portuguese | Creates Approvals For |
|-------|--------------|------------|----------------------|
| 1     | Manobrista   | Manobrista | Encarregado, Supervisor, Gerente |
| 2     | Encarregado  | Encarregado | Supervisor, Gerente |
| 3     | Supervisor   | Supervisor | Gerente |
| 4     | Gerente      | Gerente    | None (auto-approved) |

## Status Values

### Ticket Status Flow

```
awaiting_approval_encarregado
         │ (Encarregado approves)
         ↓
awaiting_approval_supervisor
         │ (Supervisor approves)
         ↓
awaiting_approval_gerente
         │ (Gerente approves)
         ↓
awaiting_triage
         │ (Comprador starts)
         ↓
   [execution statuses...]
```

### Initial Status by Creator Level

| Creator Level | Initial Ticket Status | Pending Approvals |
|---------------|----------------------|-------------------|
| Manobrista (1) | `awaiting_approval_encarregado` | 3 (Enc, Sup, Ger) |
| Encarregado (2) | `awaiting_approval_supervisor` | 2 (Sup, Ger) |
| Supervisor (3) | `awaiting_approval_gerente` | 1 (Ger) |
| Gerente (4) | `awaiting_triage` | 0 |

## Key SQL Functions

### 1. `get_highest_operacoes_role(user_id: uuid) → integer`

Returns the highest hierarchical level for the user in the "Operações" department.

**Input**: User UUID
**Output**: Integer (0-4)
- 0 = Not in Operações
- 1-4 = Role level as per table above

### 2. `get_initial_approval_status(user_id: uuid) → text`

Returns the initial ticket status based on the user's highest level.

**Input**: User UUID
**Output**: Status string
- `'awaiting_approval_encarregado'` for level 1
- `'awaiting_approval_supervisor'` for level 2
- `'awaiting_approval_gerente'` for level 3
- `'awaiting_triage'` for level 0 or 4

### 3. `ticket_needs_approval(user_id: uuid, dept_id: uuid) → boolean`

Determines if a ticket requires approval workflow.

**Input**: User UUID, Department UUID
**Output**: Boolean
- `true` for levels 1-3
- `false` for levels 0 and 4

### 4. `create_ticket_approvals(ticket_id: uuid) → void`

Creates the appropriate approval records based on ticket creator's level.

**Input**: Ticket UUID
**Output**: None (creates records in `ticket_approvals`)

## Validation Rules

1. **Status-Approval Consistency**: The ticket status must always match the first pending approval's role
   - If `awaiting_approval_gerente`, only Gerente approval should be pending
   - If `awaiting_approval_supervisor`, Supervisor and Gerente approvals should be pending

2. **No Self-Approval**: A user cannot approve at their own level or below
   - Supervisor cannot have Supervisor or Encarregado approval pending for their own ticket

3. **Sequential Processing**: Approvals must be processed in order
   - Cannot approve Gerente level if Supervisor is still pending

## State Transitions

### Ticket Status Transitions (Approval Phase)

```typescript
const approvalStatusTransitions: Record<string, string[]> = {
  'awaiting_approval_encarregado': ['awaiting_approval_supervisor', 'denied'],
  'awaiting_approval_supervisor': ['awaiting_approval_gerente', 'denied'],
  'awaiting_approval_gerente': ['awaiting_triage', 'denied'],
};
```

### Approval Record Status Transitions

```typescript
const approvalRecordTransitions: Record<string, string[]> = {
  'pending': ['approved', 'rejected'],
  'approved': [],  // Terminal
  'rejected': [],  // Terminal
};
```
