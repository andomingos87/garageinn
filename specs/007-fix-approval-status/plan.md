# Implementation Plan: Correção de Status de Aprovação para Supervisor/Operações

**Branch**: `007-fix-approval-status` | **Date**: 2026-01-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-fix-approval-status/spec.md`

## Summary

Fix the bug where a Supervisor in the Operações department creates a purchase ticket that incorrectly receives status `awaiting_approval_encarregado` instead of the expected `awaiting_approval_gerente`. The investigation confirmed that SQL functions return correct values when tested directly, indicating the bug is in the application layer (server action) that processes the RPC response.

## Technical Context

**Language/Version**: TypeScript 5.x, Next.js 16 (App Router), React 19
**Primary Dependencies**: Supabase Client, Next.js Server Actions
**Storage**: PostgreSQL via Supabase with RLS
**Testing**: Playwright E2E, manual verification
**Target Platform**: Web application (Next.js)
**Project Type**: Monorepo (apps/web)
**Performance Goals**: Ticket creation under 2 seconds, no visible delay
**Constraints**: Must maintain existing approval flow logic, RLS policies
**Scale/Scope**: Single server action fix, affects purchase ticket creation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Monorepo Structure | ✅ Pass | Change isolated to `apps/web` workspace |
| II. Type Safety | ✅ Pass | Will add explicit typing for RPC responses |
| III. Code Quality | ✅ Pass | Fix follows existing patterns |
| IV. Security & RBAC | ✅ Pass | Leverages existing RLS and RPC functions |
| V. Testing Discipline | ⚠️ Pending | Must add E2E test for approval flow |
| VI. Documentation | ✅ Pass | Bug report documented, spec created |

**Gate Result**: PASS - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/007-fix-approval-status/
├── plan.md              # This file
├── research.md          # Phase 0 output - Root cause analysis
├── data-model.md        # Phase 1 output - Entity relationships
├── quickstart.md        # Phase 1 output - Implementation guide
├── contracts/           # Phase 1 output - Not applicable (bug fix)
├── checklists/          # Validation checklists
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
apps/web/src/app/(app)/chamados/compras/
├── actions.ts           # Server action with createPurchaseTicket (MODIFY)
├── constants.ts         # Status labels and transitions (REFERENCE)
├── novo/
│   └── page.tsx         # Ticket creation form (REFERENCE)
└── [ticketId]/
    └── page.tsx         # Ticket detail page (REFERENCE)

docs/database/migrations/
└── 011_adjust_approval_flow_operacoes.sql  # SQL functions (REFERENCE)
```

**Structure Decision**: Bug fix localized to existing `apps/web/src/app/(app)/chamados/compras/actions.ts`. No new directories or files required except for potential E2E tests.

## Complexity Tracking

> No constitution violations - standard bug fix within existing architecture.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
