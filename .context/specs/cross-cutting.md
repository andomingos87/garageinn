# Cross-Cutting Concerns Impact Map

This document maps **which files are affected** when modifying global features.

## RBAC System

| Layer | Files | When to Modify |
|-------|-------|----------------|
| **Permission Definitions** | `apps/web/src/lib/auth/permissions.ts` | Adding/removing permissions, changing role assignments |
| **Permission Checking** | `apps/web/src/lib/auth/rbac.ts` | Changing how permissions are evaluated |
| **Department Access** | `apps/web/src/lib/auth/ti-access.ts` | Adding department-specific access rules |
| **Impersonation** | `apps/web/src/lib/auth/impersonation.ts` | Changing impersonation behavior |
| **RLS Policies** | `supabase/migrations/*_rls_*.sql` | Changing database-level access |
| **UI Hooks** | `apps/web/src/hooks/use-permissions.ts` | Changing client-side permission checks |
| **Auth Hook** | `apps/web/src/hooks/use-auth.ts` | Changing authentication state |

### RBAC Modification Checklist

- [ ] Update `permissions.ts` role/permission definitions
- [ ] Update RLS policies if database access changes
- [ ] Update `use-permissions.ts` if client-side checks change
- [ ] Add E2E tests for affected roles
- [ ] Update `.context/specs/rbac/decision-log.md`

---

## Ticket System

| Layer | Files | When to Modify |
|-------|-------|----------------|
| **Status Definitions** | `apps/web/src/lib/ticket-statuses.ts` | Adding/modifying statuses |
| **Compras Actions** | `apps/web/src/app/(app)/chamados/compras/actions.ts` | Compras ticket logic |
| **Compras Constants** | `apps/web/src/app/(app)/chamados/compras/constants.ts` | Compras status transitions |
| **Other Ticket Types** | `apps/web/src/app/(app)/chamados/[type]/actions.ts` | Type-specific logic |
| **RLS Policies** | `supabase/migrations/*_tickets_*.sql` | Database access rules |
| **Views** | `supabase/migrations/*_tickets_with_details*.sql` | Ticket query views |

### Ticket Modification Checklist

- [ ] Update status definitions in `ticket-statuses.ts`
- [ ] Update transitions in relevant `constants.ts`
- [ ] Update RLS policies for visibility rules
- [ ] Update views if query structure changes
- [ ] Add E2E tests for status transitions
- [ ] Update `.context/specs/tickets/decision-log.md`

---

## Approval Flow

| Layer | Files | When to Modify |
|-------|-------|----------------|
| **Approval Logic** | `apps/web/src/app/(app)/chamados/compras/actions.ts` (handleApproval) | Approval business logic |
| **Status Mapping** | `apps/web/src/lib/ticket-statuses.ts` | Approval status values |
| **RLS Policies** | `supabase/migrations/*_approvals_*.sql` | Who can approve |
| **SQL Functions** | `supabase/migrations/*_approval_functions_*.sql` | Approval RPCs |
| **UI Components** | `apps/web/src/app/(app)/chamados/compras/[ticketId]/components/` | Approval UI |

### Approval Modification Checklist

- [ ] Update approval logic in actions
- [ ] Update RLS policies for who can approve
- [ ] Update SQL functions if hierarchy changes
- [ ] Test all approval levels (Encarregado → Supervisor → Gerente)
- [ ] Update `.context/specs/tickets/approval-flow.md`

---

## Unit/Visibility Rules

| Layer | Files | When to Modify |
|-------|-------|----------------|
| **Unit Access RPC** | SQL: `get_user_accessible_units` | Unit visibility logic |
| **Visibility Filter** | `apps/web/src/app/(app)/chamados/compras/actions.ts` (buildPurchaseVisibilityFilter) | Ticket visibility |
| **RLS Policies** | `supabase/migrations/*_units_*.sql` | Unit-level access |

### Visibility Modification Checklist

- [ ] Update `get_user_accessible_units` RPC
- [ ] Update visibility filter functions
- [ ] Update RLS policies
- [ ] Test with different role/unit combinations

---

## Quick Reference: File Locations

```
apps/web/src/
├── lib/
│   ├── auth/
│   │   ├── permissions.ts      # RBAC definitions
│   │   ├── rbac.ts             # Permission utilities
│   │   ├── ti-access.ts        # TI department rules
│   │   └── impersonation.ts    # Impersonation logic
│   ├── supabase/
│   │   ├── client.ts           # Browser client
│   │   ├── server.ts           # Server client
│   │   └── middleware.ts       # Auth middleware
│   └── ticket-statuses.ts      # Status definitions
├── hooks/
│   ├── use-auth.ts             # Auth state
│   └── use-permissions.ts      # Permission checks
└── app/(app)/chamados/
    ├── actions.ts              # Shared ticket actions
    ├── compras/
    │   ├── actions.ts          # Compras-specific actions
    │   └── constants.ts        # Status transitions
    └── [other-types]/
        └── actions.ts          # Type-specific actions
```

## Database Objects

```
Tables:
- profiles, departments, roles, user_roles, user_units
- tickets, ticket_approvals, ticket_history, ticket_comments
- ticket_purchase_details, ticket_quotations

Views:
- tickets_with_details

Functions (RPCs):
- is_admin, is_operacoes_gerente, is_operacoes_creator
- get_user_accessible_units
- ticket_needs_approval, get_initial_approval_status
- create_ticket_approvals
```
