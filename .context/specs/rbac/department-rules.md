# Department-Specific Rules

This document describes **special behaviors** that apply to specific departments.

## Operações

### Unit Restrictions

| Role | Unit Access |
|------|-------------|
| Manobrista | Single assigned unit only |
| Encarregado | Single assigned unit only |
| Supervisor | Multiple coverage units |
| Gerente | All units |

**Implementation:** `get_user_accessible_units` RPC and `buildPurchaseVisibilityFilter()`

### Approval Hierarchy

When an Operações user creates a ticket (any destination department), approval flows through:

```
Manobrista → Encarregado → Supervisor → Gerente → Triagem
     ↓            ↓            ↓           ↓
 Level 1      Level 2      Level 3    Triagem
```

**Special Rule:** Only the Gerente de Operações can give final approval for tickets created by Operações users.

**Implementation:** `ensureOperacoesGerenteApproval()` in `compras/actions.ts`

### Ticket Creation Entry Points

| Role | Initial Status |
|------|----------------|
| Manobrista | `awaiting_approval_encarregado` |
| Encarregado | `awaiting_approval_supervisor` |
| Supervisor | `awaiting_approval_gerente` |
| Gerente | `awaiting_triage` |

**Implementation:** `get_initial_approval_status` RPC

---

## Compras e Manutenção

### Visibility Rules

| Role | Can See Status `awaiting_approval_gerente` |
|------|:------------------------------------------:|
| Assistente | No |
| Comprador | No |
| Gerente | Yes |

**Rationale:** Assistente should not see tickets pending senior approval.

**Implementation:** `buildPurchaseVisibilityFilter()` excludes status for Assistente without Gerente role.

### Execution Permissions

- **Comprador:** Can add quotations, execute approved purchases
- **Gerente:** Can triage, approve, and override

---

## TI

### Open Access Rule

TI tickets are accessible to anyone in the TI department, regardless of creator.

**Implementation:** `ti-access.ts` - `canAccessTiArea()`

### Gerente TI = Admin

The TI Gerente has `admin:all` permissions, equivalent to global admin roles.

---

## RH

### User Management Scope

| Role | Can Manage |
|------|------------|
| Analista Júnior | Create users |
| Analista Pleno/Sênior | Create + update users |
| Supervisor/Gerente | Create + update + delete users |

### Self-Edit Restriction

Users cannot modify their own role assignments (prevents privilege escalation).

---

## Financeiro

### Approval Thresholds (Future)

Currently all approvals are binary. Future enhancement may include:

| Role | Approval Limit |
|------|----------------|
| Analista Pleno | Up to R$ 5,000 |
| Analista Sênior | Up to R$ 20,000 |
| Supervisor | Up to R$ 50,000 |
| Gerente | Unlimited |

---

## Auditoria

### Read-Only by Default

Auditoria roles are primarily read-only to maintain audit independence.

| Capability | Auditor | Gerente |
|------------|:-------:|:-------:|
| View all tickets | ✓ | ✓ |
| View all checklists | ✓ | ✓ |
| Modify tickets | | |
| Approve audit items | | ✓ |
| Configure checklists | | ✓ |

---

## Sinistros

### Claim Processing Flow

```
Ticket Created → Supervisor Analysis → Gerente Approval → Resolution
```

Both Supervisor and Gerente can approve claims, but Gerente has final authority.

---

## Cross-Department Rules

### R1: Gerente Cross-Visibility

All Gerentes can view tickets from any department (read-only).

### R2: Admin Impersonation

Only `admin:all` users can impersonate other users for debugging.

### R3: Multi-Department Users

A user can have roles in multiple departments. Permissions accumulate.

---

## Implementation References

| Rule | Implementation |
|------|----------------|
| Unit restrictions | `get_user_accessible_units` RPC |
| Approval hierarchy | `get_initial_approval_status` RPC |
| Visibility filters | `buildPurchaseVisibilityFilter()` |
| Operações Gerente check | `ensureOperacoesGerenteApproval()` |
| TI access | `canAccessTiArea()` |

---

## Updating Department Rules

When adding department-specific behavior:

1. Document the rule in this file
2. Implement with clear function name (e.g., `ensureXxxRule()`)
3. Add unit/E2E tests for the rule
4. Add entry to [Decision Log](./decision-log.md)
