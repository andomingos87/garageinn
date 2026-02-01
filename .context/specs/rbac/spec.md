# RBAC System Specification

## Overview

GarageInn uses a **Role-Based Access Control (RBAC)** system where permissions are derived from a user's roles within departments.

## Core Concepts

### 1. Permission Types

Permissions follow the pattern `resource:action`:

| Resource | Actions | Description |
|----------|---------|-------------|
| `users` | read, create, update, delete, impersonate | User management |
| `units` | read, create, update | Parking unit management |
| `tickets` | read, create, triage, approve, execute | Ticket operations |
| `checklists` | read, execute, configure | Checklist operations |
| `supervision` | read | Supervisory data access |
| `settings` | read, update | System configuration |
| `reports` | read | Report access |
| `admin` | all | Superuser access (bypasses all checks) |

### 2. Role Categories

#### Global Roles (admin:all)

These roles have **full system access** regardless of department:

- **Desenvolvedor** - System developers
- **Diretor** - Company directors
- **Administrador** - System administrators

#### Department Roles

Permissions are scoped to department context:

| Department | Roles |
|------------|-------|
| Operações | Manobrista, Encarregado, Supervisor, Gerente |
| Compras e Manutenção | Assistente, Comprador, Gerente |
| Financeiro | Auxiliar, Assistente, Analista Júnior/Pleno/Sênior, Supervisor, Gerente |
| TI | Analista, Gerente |
| RH | Auxiliar, Assistente, Analista Júnior/Pleno/Sênior, Supervisor, Gerente |
| Comercial | Gerente |
| Auditoria | Auditor, Gerente |
| Sinistros | Supervisor, Gerente |

### 3. Permission Resolution

```
User → has many → UserRoles → has one → Role → belongs to → Department
                                        ↓
                               Permission[]
```

**Algorithm:**
1. Get all roles for user
2. For each role:
   - If global role → add `GLOBAL_ROLE_PERMISSIONS[role.name]`
   - If department role → add `DEPARTMENT_ROLE_PERMISSIONS[department.name][role.name]`
3. Return unique set of permissions

**Admin Bypass:**
- If user has `admin:all`, all permission checks return `true`

## Implementation

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/auth/permissions.ts` | Permission and role definitions |
| `src/lib/auth/rbac.ts` | Permission checking utilities |
| `src/lib/auth/ti-access.ts` | TI department-specific access |
| `src/hooks/use-permissions.ts` | Client-side permission hook |

### Permission Check Flow

```typescript
// Server-side (actions.ts)
const userPermissions = await getCurrentUserPermissions();
if (!hasPermission(userPermissions, "tickets:approve")) {
  return { error: "Unauthorized" };
}

// Client-side (components)
const { hasPermission } = usePermissions();
if (hasPermission("tickets:approve")) {
  // Show approve button
}
```

### Database Schema

```sql
-- Core tables
profiles (id, full_name, email, avatar_url)
departments (id, name)
roles (id, name, is_global, department_id)
user_roles (user_id, role_id)  -- Many-to-many
user_units (user_id, unit_id, is_coverage)  -- Unit assignments

-- RLS uses is_admin() and role checks
```

## Rules

### R1: Admin Bypass
Users with `admin:all` permission bypass ALL permission checks.

### R2: Role Accumulation
A user with multiple roles accumulates permissions from ALL roles.

### R3: Department Scope
Department roles only grant permissions within their department context.

### R4: Unit Restriction
Some roles (Manobrista, Encarregado) are restricted to their assigned unit(s).

### R5: Gerente Global View
Gerentes can see across all units, even without explicit unit assignment.

### R6: Operações Approval Scope
When a ticket requires Operações hierarchical approval, the approval chain
applies regardless of the ticket's destination department. Approvers must
match the required approval level (Encarregado → Supervisor → Gerente).

## Edge Cases

### E1: User with No Roles
- Returns empty permission array
- All permission checks fail
- User sees only public/unauthenticated content

### E2: Multiple Roles Same Department
- Permissions from all roles are combined
- Higher-level role permissions don't invalidate lower-level ones

### E3: Role in Multiple Departments
- User gets permissions from EACH department's role definition
- This is rare but valid (e.g., Gerente in Operações AND Financeiro)

## Testing

### Required Test Scenarios

1. Global admin can do everything
2. Department Gerente has all department permissions
3. Lower-level roles have restricted permissions
4. Unit-restricted roles only see their units
5. Multiple roles accumulate permissions
6. No roles = no access

### E2E Test Files

```
e2e/chamados-compras-approval-manobrista.spec.ts
e2e/chamados-compras-approval-encarregado.spec.ts
e2e/chamados-compras-approval-supervisor.spec.ts
e2e/chamados-compras-approval-gerente.spec.ts
e2e/chamados-compras-approval-visibility.spec.ts
```

## Related Specs

- [Roles Matrix](./roles-matrix.md) - Complete permission grid
- [Department Rules](./department-rules.md) - Department-specific behaviors
- [Decision Log](./decision-log.md) - Historical decisions
- [Ticket Approval Flow](../tickets/approval-flow.md) - How approval uses RBAC
