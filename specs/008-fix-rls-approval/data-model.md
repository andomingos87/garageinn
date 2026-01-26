# Data Model: Fix RLS Approval Policies

**Feature**: 008-fix-rls-approval
**Date**: 2026-01-25

## Overview

This document describes the data model relevant to the RLS approval fix. No schema changes are required - only RLS policies and helper functions need to be added.

---

## Existing Entities (No Changes)

### tickets

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| status | text | Current workflow status (e.g., `awaiting_approval_supervisor`) |
| created_by | uuid | User who created the ticket |
| assigned_to | uuid | User assigned to handle the ticket |
| department_id | uuid | Department (Operações for purchase tickets) |

**Status Values Relevant to Approvals:**
- `awaiting_approval_encarregado` - Needs Encarregado approval
- `awaiting_approval_supervisor` - Needs Supervisor approval
- `awaiting_approval_gerente` - Needs Gerente approval
- `awaiting_triage` - All approvals complete

### ticket_approvals

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| ticket_id | uuid | Foreign key to tickets |
| approval_level | integer | **Relative** position in approval chain (1, 2, or 3) |
| approval_role | text | **Absolute** role name ('Encarregado', 'Supervisor', 'Gerente') |
| status | text | 'pending', 'approved', 'rejected' |
| approved_by | uuid | User who approved (null if pending) |
| approved_at | timestamp | When approved (null if pending) |
| notes | text | Optional approval notes |

**Key Insight**: `approval_role` is the authoritative field for determining which role should approve.

### roles

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| name | text | Role name (e.g., 'Manobrista', 'Encarregado', 'Supervisor', 'Gerente') |

### user_roles

| Field | Type | Description |
|-------|------|-------------|
| user_id | uuid | Foreign key to profiles |
| role_id | uuid | Foreign key to roles |
| department_id | uuid | Department for this role assignment |

---

## New Database Functions

### get_user_operacoes_role_name(p_user_id uuid)

Returns the user's highest Operações department role as a text string.

**Input**: User UUID
**Output**: Role name string ('Gerente', 'Supervisor', 'Encarregado', 'Manobrista') or NULL

**Logic**:
```sql
SELECT r.name
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
JOIN departments d ON ur.department_id = d.id
WHERE ur.user_id = p_user_id
  AND d.name = 'Operações'
  AND r.name IN ('Gerente', 'Supervisor', 'Encarregado', 'Manobrista')
ORDER BY CASE r.name
  WHEN 'Gerente' THEN 4
  WHEN 'Supervisor' THEN 3
  WHEN 'Encarregado' THEN 2
  WHEN 'Manobrista' THEN 1
END DESC
LIMIT 1;
```

### can_approve_ticket(p_ticket_id uuid, p_user_id uuid)

Determines if a user can approve a specific ticket based on ticket status and user's role.

**Input**: Ticket UUID, User UUID
**Output**: Boolean

**Logic**:
```sql
-- 1. Get ticket status
SELECT status INTO v_ticket_status FROM tickets WHERE id = p_ticket_id;

-- 2. Map status to expected role
v_expected_role := CASE v_ticket_status
  WHEN 'awaiting_approval_encarregado' THEN 'Encarregado'
  WHEN 'awaiting_approval_supervisor' THEN 'Supervisor'
  WHEN 'awaiting_approval_gerente' THEN 'Gerente'
  ELSE NULL
END;

-- 3. Get user's role
v_user_role := get_user_operacoes_role_name(p_user_id);

-- 4. Check match
RETURN v_expected_role IS NOT NULL AND v_user_role = v_expected_role;
```

---

## New RLS Policies

### ticket_approvals_update_approver

**Table**: ticket_approvals
**Operation**: UPDATE
**Purpose**: Allow approvers to update approval records

**Policy Logic**:
```sql
CREATE POLICY "ticket_approvals_update_approver"
ON public.ticket_approvals
FOR UPDATE
TO authenticated
USING (
  -- Can only update if:
  -- 1. User can approve this ticket (role matches expected)
  -- 2. This approval record's role matches the expected approval role
  can_approve_ticket(ticket_id, auth.uid())
  AND approval_role = (
    SELECT CASE t.status
      WHEN 'awaiting_approval_encarregado' THEN 'Encarregado'
      WHEN 'awaiting_approval_supervisor' THEN 'Supervisor'
      WHEN 'awaiting_approval_gerente' THEN 'Gerente'
    END
    FROM tickets t WHERE t.id = ticket_id
  )
)
WITH CHECK (
  -- Same conditions for the new row state
  can_approve_ticket(ticket_id, auth.uid())
);
```

### tickets_update_approver

**Table**: tickets
**Operation**: UPDATE
**Purpose**: Allow approvers to update ticket status during approval

**Policy Logic**:
```sql
CREATE POLICY "tickets_update_approver"
ON public.tickets
FOR UPDATE
TO authenticated
USING (
  can_approve_ticket(id, auth.uid())
)
WITH CHECK (
  -- Only allow status transitions that are valid approval progressions
  status IN (
    'awaiting_approval_supervisor',
    'awaiting_approval_gerente',
    'awaiting_triage',
    'rejected'
  )
);
```

---

## State Transitions

### Approval Status Progression

```
Manobrista creates ticket:
  awaiting_approval_encarregado
    → (Encarregado approves) → awaiting_approval_supervisor
    → (Supervisor approves) → awaiting_approval_gerente
    → (Gerente approves) → awaiting_triage

Encarregado creates ticket:
  awaiting_approval_supervisor
    → (Supervisor approves) → awaiting_approval_gerente
    → (Gerente approves) → awaiting_triage

Supervisor creates ticket:
  awaiting_approval_gerente
    → (Gerente approves) → awaiting_triage

Gerente creates ticket:
  awaiting_triage (no approvals needed)
```

### Approval Record Status

```
pending → approved (when user clicks approve)
pending → rejected (when user clicks reject)
```

---

## Validation Rules

1. **Role Match**: User's Operações role must exactly match `approval_role` of the pending approval
2. **Status Match**: Ticket status must indicate this role's approval is pending
3. **Single Approval**: Each approval level can only be approved once (enforced by existing constraints)
4. **Order Enforcement**: Cannot approve out of order (enforced by status/role matching)

---

## Backward Compatibility

- Existing `approval_level` field preserved (used for display ordering)
- Existing `approval_role` field preserved (used for authorization)
- No data migration required
- Existing approved records remain valid
