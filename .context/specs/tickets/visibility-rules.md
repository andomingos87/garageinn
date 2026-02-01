# Ticket Visibility Rules

## Overview

Not all tickets are visible to all users. Visibility depends on:
1. User's role and department
2. User's assigned units
3. Ticket's current status
4. Ticket type

## Visibility Matrix

### By Role Category

| Role Category | Can See |
|---------------|---------|
| Admin (`admin:all`) | All tickets |
| Department Gerente | All tickets in their department |
| Department Member | Tickets in their department (with restrictions) |
| Other Department | None (unless explicitly shared) |

### By Unit Assignment

| Role | Unit Scope |
|------|------------|
| Manobrista | Only their assigned unit |
| Encarregado | Only their assigned unit |
| Supervisor | Their coverage units (multiple) |
| Gerente | All units |

### By Status (Compras specific)

| Role | Cannot See Status |
|------|-------------------|
| Assistente (Compras) | `awaiting_approval_gerente` |
| Comprador (Compras) | `awaiting_approval_gerente` |

## Implementation

### buildPurchaseVisibilityFilter()

```typescript
async function buildPurchaseVisibilityFilter(): Promise<PurchaseVisibilityFilter> {
  const roles = await getUserRoles();
  const isGlobal = roles.some((role) => role.isGlobal);

  // Status exclusions
  const isAssistenteCompras = roles.some(
    (role) =>
      role.departmentName === "Compras e Manutenção" &&
      role.name === "Assistente"
  );
  const hasGerenteRole = roles.some((role) => role.name === "Gerente");

  const excludedStatuses =
    !isGlobal && isAssistenteCompras && !hasGerenteRole
      ? ["awaiting_approval_gerente"]
      : [];

  // Unit restrictions
  const hasUnitRestrictedRole = roles.some(
    (role) =>
      role.departmentName === "Operações" &&
      ["Manobrista", "Encarregado", "Supervisor", "Gerente"].includes(role.name)
  );

  let allowedUnitIds: string[] | null = null;
  if (!isGlobal && hasUnitRestrictedRole) {
    const units = await getUserUnits();
    allowedUnitIds = units.map((unit) => unit.id);
  }

  return { excludedStatuses, allowedUnitIds };
}
```

### Query Application

```typescript
// Apply status filter
if (visibility.excludedStatuses.length > 0) {
  query = query.not("status", "in", formatInFilter(visibility.excludedStatuses));
}

// Apply unit filter
if (visibility.allowedUnitIds) {
  query = query.in("unit_id", visibility.allowedUnitIds);
}
```

## Rules by Ticket Type

### Compras (Purchase Tickets)

| User Type | Can See |
|-----------|---------|
| Operações (unit-restricted) | Tickets from their unit(s) |
| Compras Assistente | All except `awaiting_approval_gerente` |
| Compras Comprador | All except `awaiting_approval_gerente` |
| Compras Gerente | All |
| Admin | All |

### TI (IT Tickets)

| User Type | Can See |
|-----------|---------|
| TI department member | All TI tickets |
| Ticket creator | Their own ticket |
| Admin | All |
| Operações approver (Encarregado/Supervisor/Gerente) | Tickets in approval flow (`awaiting_approval_*`) |

**Note:** TI has more open access - any TI member can see any TI ticket.

### Other Types

Follow standard department rules:
- Department members see department tickets
- Unit restrictions apply to Operações roles
- Admin sees everything

## Detail Page Access

When accessing a specific ticket (`/chamados/compras/[ticketId]`):

```typescript
// In getTicketDetails()
const visibility = await buildPurchaseVisibilityFilter();

// Check unit access
if (
  visibility.allowedUnitIds &&
  ticket.unit_id &&
  !visibility.allowedUnitIds.includes(ticket.unit_id)
) {
  return { accessDenied: true };
}

// Check status access
if (visibility.excludedStatuses.includes(ticket.status)) {
  return { accessDenied: true };
}
```

## RLS Policies

### tickets SELECT

```sql
CREATE POLICY "tickets_select_policy" ON tickets
FOR SELECT USING (
  -- Admin can see all
  is_admin()
  OR
  -- Creator can see their own
  created_by = auth.uid()
  OR
  -- Department member can see department tickets
  (
    department_id IN (
      SELECT r.department_id
      FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
    )
    -- With unit restrictions
    AND (
      unit_id IS NULL
      OR unit_id IN (SELECT unit_id FROM get_user_accessible_units())
    )
  )
);
```

### tickets_with_details VIEW

The view inherits RLS from the base `tickets` table, plus joins denormalized data.

## Edge Cases

### E1: Ticket Without Unit

If `unit_id` is NULL, unit-based filtering doesn't apply. All department members can see it.

### E2: User Loses Role

If a user's role is removed:
- They lose visibility immediately (RLS enforced)
- Any assigned tickets remain assigned (requires manual reassignment)

### E3: Multi-Department User

A user with roles in multiple departments sees tickets from ALL their departments.

### E4: Transferred Ticket

If a ticket is transferred between departments:
- Previous department loses visibility
- New department gains visibility
- Creator retains visibility (if policy allows)

## Testing Checklist

- [ ] Manobrista sees only their unit's tickets
- [ ] Supervisor sees coverage units' tickets
- [ ] Gerente sees all units
- [ ] Assistente Compras cannot see `awaiting_approval_gerente`
- [ ] Admin sees everything
- [ ] Creator always sees their own ticket
- [ ] Detail page returns 403/redirect for unauthorized access

## Implementation Files

| File | Purpose |
|------|---------|
| `compras/actions.ts` | `buildPurchaseVisibilityFilter()` |
| `compras/actions.ts` | `getTicketDetails()` access check |
| SQL RLS | `tickets` table policies |
| SQL RPC | `get_user_accessible_units` |

## Related Specs

- [Ticket Spec](./spec.md)
- [RBAC Roles Matrix](../rbac/roles-matrix.md)
- [Department Rules](../rbac/department-rules.md)
