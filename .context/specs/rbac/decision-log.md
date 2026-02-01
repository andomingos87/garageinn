# RBAC Decision Log

This document records **historical decisions** about the RBAC system with rationale.

## Format

```markdown
## YYYY-MM-DD: [Decision Title]

**Decision:** What was decided
**Rationale:** Why it was decided
**Alternatives Considered:** What else was considered
**Files Changed:** Which files were modified
**Rollback:** How to undo if needed
```

---

## 2026-02-01: Operações Approval Applies Across Departments

**Decision:** Operações hierarchical approval (Encarregado → Supervisor → Gerente) applies to any ticket that requires approval, regardless of destination department.

**Rationale:** Approval behavior must be consistent across TI, Compras, Manutenção, and other ticket types, and aligned with role-based approval levels.

**Alternatives Considered:**
1. Limit approvals to Compras only → Rejected (inconsistent with operational workflow).
2. Allow any department manager to approve → Rejected (breaks Operações accountability).

**Files Changed:**
- `.context/specs/rbac/spec.md` (rule clarification)
- `.context/specs/tickets/approval-flow.md` (scope and fixed levels)
- `.context/specs/tickets/visibility-rules.md` (approver visibility during approval)

**Rollback:** Revert spec changes and re-scope approvals to Compras only.

---

## 2026-01-17: Initial Permission Matrix

**Decision:** Established the initial RBAC permission matrix with 8 departments and 22 permissions.

**Rationale:** Based on organizational structure and operational requirements documented in business requirements.

**Files Changed:**
- `apps/web/src/lib/auth/permissions.ts` (created)
- `apps/web/src/lib/auth/rbac.ts` (created)

**Rollback:** N/A (initial implementation)

---

## 2026-01-XX: Operações Gerente Approval Requirement

**Decision:** Only Gerente de Operações can give final approval for purchase tickets created by Operações department users.

**Rationale:** Business requirement that operational purchases need department head sign-off for budget control.

**Alternatives Considered:**
1. Any Gerente can approve → Rejected (lacks department accountability)
2. Director approval required → Rejected (creates bottleneck)

**Files Changed:**
- `apps/web/src/app/(app)/chamados/compras/actions.ts` (ensureOperacoesGerenteApproval)

**Rollback:** Remove `ensureOperacoesGerenteApproval()` call in `handleApproval()`

---

## 2026-01-XX: TI Gerente = Admin

**Decision:** TI Gerente has `admin:all` permissions.

**Rationale:** IT department head needs system-wide access for troubleshooting and configuration.

**Alternatives Considered:**
1. Separate IT-specific permissions → Rejected (too granular, slows development)
2. On-demand elevation → Rejected (operational overhead)

**Files Changed:**
- `apps/web/src/lib/auth/permissions.ts` (TI department section)

**Rollback:** Replace `admin:all` with specific permissions in TI Gerente definition.

---

## 2026-01-XX: Assistente Compras Cannot See Pending Gerente Approvals

**Decision:** Assistente in Compras department cannot see tickets with status `awaiting_approval_gerente`.

**Rationale:** Sensitive pricing/approval information should only be visible to decision-makers.

**Alternatives Considered:**
1. Full visibility with read-only → Rejected (information leak concern)
2. Separate "sensitive" flag on tickets → Rejected (complexity)

**Files Changed:**
- `apps/web/src/app/(app)/chamados/compras/actions.ts` (buildPurchaseVisibilityFilter)

**Rollback:** Remove status exclusion in `buildPurchaseVisibilityFilter()`

---

## 2026-01-XX: Unit-Based Visibility for Operações

**Decision:** Manobrista and Encarregado can only see tickets from their assigned unit.

**Rationale:** Operational staff should focus on their unit; cross-unit visibility creates noise and potential data exposure.

**Alternatives Considered:**
1. All tickets visible → Rejected (information overload, privacy)
2. Manager approval for cross-unit view → Rejected (operational friction)

**Files Changed:**
- `get_user_accessible_units` RPC
- `buildPurchaseVisibilityFilter()` in actions.ts

**Rollback:** Remove unit filtering in visibility functions.

---

## Template for New Decisions

Copy this template when adding new decisions:

```markdown
## YYYY-MM-DD: [Decision Title]

**Decision:** [What was decided]

**Rationale:** [Why it was decided]

**Alternatives Considered:**
1. [Alternative 1] → Rejected ([reason])
2. [Alternative 2] → Rejected ([reason])

**Files Changed:**
- [file1.ts] ([what changed])
- [file2.ts] ([what changed])

**Rollback:** [How to undo]
```

---

## Related Documents

- [RBAC Specification](./spec.md)
- [Roles Matrix](./roles-matrix.md)
- [Department Rules](./department-rules.md)
