# Roles × Permissions Matrix

This document contains the **authoritative matrix** of which roles have which permissions.

> **Source of Truth:** `apps/web/src/lib/auth/permissions.ts`

## Global Roles

| Role | Permissions |
|------|-------------|
| Desenvolvedor | `admin:all` |
| Diretor | `admin:all` |
| Administrador | `admin:all` |

---

## Operações

| Permission | Manobrista | Encarregado | Supervisor | Gerente |
|------------|:----------:|:-----------:|:----------:|:-------:|
| tickets:read | ✓ | ✓ | ✓ | ✓ |
| tickets:create | ✓ | ✓ | ✓ | ✓ |
| tickets:triage | | | | ✓ |
| tickets:approve | | ✓ | ✓ | ✓ |
| checklists:read | ✓ | ✓ | ✓ | ✓ |
| checklists:execute | ✓ | ✓ | ✓ | ✓ |
| checklists:configure | | | | ✓ |
| supervision:read | | | ✓ | ✓ |
| units:read | | | ✓ | ✓ |
| units:update | | | | ✓ |
| reports:read | | | | ✓ |

### Operações Notes
- Manobrista/Encarregado: Unit-restricted (see only assigned unit)
- Supervisor: Can see multiple units (coverage units)
- Gerente: Can see all units

---

## Compras e Manutenção

| Permission | Assistente | Comprador | Gerente |
|------------|:----------:|:---------:|:-------:|
| tickets:read | ✓ | ✓ | ✓ |
| tickets:execute | | ✓ | ✓ |
| tickets:approve | | | ✓ |
| tickets:triage | | | ✓ |
| settings:read | | | ✓ |
| reports:read | | | ✓ |

### Compras Notes
- Assistente: Can only view tickets (not awaiting_approval_gerente)
- Comprador: Can execute (add quotations, etc.)
- Gerente: Full control of purchase tickets

---

## Financeiro

| Permission | Auxiliar | Assistente | Analista Jr | Analista Pl | Analista Sr | Supervisor | Gerente |
|------------|:--------:|:----------:|:-----------:|:-----------:|:-----------:|:----------:|:-------:|
| tickets:read | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| tickets:execute | | | ✓ | ✓ | ✓ | ✓ | ✓ |
| tickets:approve | | | | ✓ | ✓ | ✓ | ✓ |
| tickets:triage | | | | | | ✓ | ✓ |
| settings:read | | | | | | | ✓ |
| reports:read | | | | | | ✓ | ✓ |

---

## TI

| Permission | Analista | Gerente |
|------------|:--------:|:-------:|
| tickets:read | ✓ | ✓ |
| tickets:execute | ✓ | ✓ |
| settings:read | ✓ | ✓ |
| reports:read | ✓ | ✓ |
| admin:all | | ✓ |

### TI Notes
- Analista: Can execute TI tickets, view settings/reports
- Gerente TI: Has full admin access

---

## RH

| Permission | Auxiliar | Assistente | Analista Jr | Analista Pl | Analista Sr | Supervisor | Gerente |
|------------|:--------:|:----------:|:-----------:|:-----------:|:-----------:|:----------:|:-------:|
| users:read | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| users:create | | | ✓ | ✓ | ✓ | ✓ | ✓ |
| users:update | | | | ✓ | ✓ | ✓ | ✓ |
| users:delete | | | | | | ✓ | ✓ |
| settings:read | | | | | | | ✓ |
| reports:read | | | | | | | ✓ |

### RH Notes
- RH manages user lifecycle (create, update, delete)
- Only Supervisor+ can delete users

---

## Comercial

| Permission | Gerente |
|------------|:-------:|
| units:read | ✓ |
| tickets:read | ✓ |
| settings:read | ✓ |
| reports:read | ✓ |

### Comercial Notes
- Read-only access for commercial oversight
- No ticket creation or modification

---

## Auditoria

| Permission | Auditor | Gerente |
|------------|:-------:|:-------:|
| tickets:read | ✓ | ✓ |
| tickets:approve | | ✓ |
| checklists:read | ✓ | ✓ |
| checklists:configure | | ✓ |
| settings:read | | ✓ |
| reports:read | ✓ | ✓ |

### Auditoria Notes
- Read-focused for compliance auditing
- Gerente can approve (for audit sign-offs)

---

## Sinistros

| Permission | Supervisor | Gerente |
|------------|:----------:|:-------:|
| tickets:read | ✓ | ✓ |
| tickets:execute | ✓ | ✓ |
| tickets:approve | ✓ | ✓ |
| tickets:triage | | ✓ |
| settings:read | | ✓ |
| reports:read | | ✓ |

### Sinistros Notes
- Handles insurance claims
- Supervisor can approve claims
- Gerente has full control

---

## Permission Reference

| Permission | Description |
|------------|-------------|
| `admin:all` | Superuser - bypasses all checks |
| `users:read` | View user list and profiles |
| `users:create` | Create new users |
| `users:update` | Edit user profiles |
| `users:delete` | Deactivate/delete users |
| `users:impersonate` | Impersonate other users (admin only) |
| `units:read` | View unit list |
| `units:create` | Create new units |
| `units:update` | Edit unit details |
| `tickets:read` | View tickets |
| `tickets:create` | Create new tickets |
| `tickets:triage` | Assign priority and responsible |
| `tickets:approve` | Approve/reject tickets |
| `tickets:execute` | Execute ticket actions (quotations, etc.) |
| `checklists:read` | View checklists |
| `checklists:execute` | Fill out checklists |
| `checklists:configure` | Create/edit checklist templates |
| `supervision:read` | View supervisory dashboards |
| `settings:read` | View system settings |
| `settings:update` | Modify system settings |
| `reports:read` | Access reports |

---

## Updating This Matrix

When changing permissions:

1. Update `apps/web/src/lib/auth/permissions.ts`
2. Update this matrix to match
3. Add entry to [Decision Log](./decision-log.md)
4. Run E2E tests for affected roles
5. Update RLS policies if database access changes
