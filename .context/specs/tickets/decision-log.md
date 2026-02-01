# Ticket System Decision Log

This document records **historical decisions** about the ticket system with rationale.

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

## 2026-02-01: Operações Approval Flow Globalization

**Decision:** Operações hierarchical approvals apply to tickets in any destination department, with fixed approval levels by role (Encarregado=1, Supervisor=2, Gerente=3).

**Rationale:** Approval behavior must be consistent across TI, Compras, Manutenção, and other ticket types, and match UI/permissions expectations.

**Alternatives Considered:**
1. Keep approval flow only for Compras → Rejected (inconsistent cross-department behavior).
2. Use sequential approval levels per ticket → Rejected (breaks fixed role mapping and UI logic).

**Files Changed:**
- `supabase/migrations/20260201100000_fix_ticket_approval_levels.sql` (normalize levels + update function)
- `.context/specs/tickets/approval-flow.md` (scope + fixed levels)
- `.context/specs/tickets/visibility-rules.md` (approver visibility during approval)
- `.context/specs/rbac/department-rules.md` (scope clarification)

**Rollback:** Revert migration and restore sequential approval_level assignment in `create_ticket_approvals`.

---

## 2026-01-XX: Hierarchical Approval for Compras

**Decision:** Purchase tickets from Operações require three-level approval chain (Encarregado → Supervisor → Gerente).

**Rationale:** Budget control and accountability. Higher-level purchases should have more oversight.

**Alternatives Considered:**
1. Single approval (any Gerente) → Rejected (insufficient oversight)
2. Threshold-based approval → Deferred to future version

**Files Changed:**
- `apps/web/src/app/(app)/chamados/compras/actions.ts`
- SQL functions: `get_initial_approval_status`, `create_ticket_approvals`

**Rollback:** Set all initial status to `awaiting_triage`

---

## 2026-01-XX: Status Normalization (denied vs rejected)

**Decision:** Use `denied` as the canonical status for rejected tickets, not `rejected`.

**Rationale:** Consistency across the codebase. Both app code and RLS policies must use the same value.

**Files Changed:**
- `apps/web/src/lib/ticket-statuses.ts`
- `apps/web/src/app/(app)/chamados/compras/actions.ts`
- RLS policies for ticket_approvals

**Rollback:** Update all references back to `rejected`

---

## 2026-01-XX: Gerente Can Close Any Non-Final Ticket

**Decision:** Gerente (any department) can close or cancel tickets that are not in final states.

**Rationale:** Operational flexibility. Gerentes need ability to clean up stuck tickets.

**Alternatives Considered:**
1. Only ticket owner can close → Rejected (creates orphaned tickets)
2. Only admin can close → Rejected (too restrictive)

**Files Changed:**
- `apps/web/src/app/(app)/chamados/compras/actions.ts` (changeTicketStatus)

**Rollback:** Remove Gerente check in `changeTicketStatus`

---

## 2026-01-XX: Assistente Cannot See Pending Gerente Approvals

**Decision:** Compras Assistente role cannot see tickets with status `awaiting_approval_gerente`.

**Rationale:** Sensitive pricing and approval information should only be visible to decision-makers.

**Files Changed:**
- `apps/web/src/app/(app)/chamados/compras/actions.ts` (buildPurchaseVisibilityFilter)

**Rollback:** Remove status exclusion from filter

---

## 2026-01-XX: TI Tickets Open Access

**Decision:** All TI department members can see all TI tickets regardless of creator.

**Rationale:** IT support is collaborative; any team member may need to assist with any ticket.

**Files Changed:**
- `apps/web/src/lib/auth/ti-access.ts`
- TI ticket actions

**Rollback:** Add creator-only visibility restriction

---

## Template for New Decisions

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

- [Ticket Specification](./spec.md)
- [Approval Flow](./approval-flow.md)
- [Visibility Rules](./visibility-rules.md)
- [Assignment Rules](./assignment-rules.md)
