# Implementation Plan: Correção de Bugs do Módulo de Compras

**Branch**: `006-fix-compras-bugs` | **Date**: 2026-01-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-fix-compras-bugs/spec.md`

## Summary

Correção de 8 bugs no módulo de execução de compras para o perfil comprador, incluindo:
- **P1**: Correção de RLS para permitir INSERT de cotações por compradores; atualização de UI após mudança de status
- **P2**: Filtro de chamados por status "Aprovado"; filtro de departamentos por role; liberação de criação de chamados TI
- **P3**: Máscaras de formatação (CNPJ, telefone, preço); atalho Ctrl+Enter; tradução de histórico

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Next.js 16, React 19.2, Supabase JS 2.89.0, shadcn/ui, Radix UI, Tailwind CSS 4
**Storage**: Supabase (PostgreSQL) com RLS policies
**Testing**: Playwright E2E
**Target Platform**: Web (Next.js App Router)
**Project Type**: Monorepo (apps/web, apps/mobile)
**Performance Goals**: Interface reflete mudanças em < 2 segundos (SC-002)
**Constraints**: LGPD compliance, RBAC enforcement both client and server side
**Scale/Scope**: Sistema interno de chamados para equipe de compras

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Monorepo Structure | ✅ PASS | Alterações em `apps/web/` e Supabase migrations |
| II. Type Safety | ✅ PASS | Todos arquivos TypeScript com tipos explícitos |
| III. Code Quality | ✅ PASS | ESLint/Prettier enforced |
| IV. Security & RBAC | ✅ PASS | RLS policies + server-side validation |
| V. Testing Discipline | ⚠️ PARTIAL | E2E tests para fluxos críticos (P1) |
| VI. Documentation | ✅ PASS | Spec completo, docs atualizados |

**Re-check após Phase 1**: PASS - Nenhuma violação de princípios

## Project Structure

### Documentation (this feature)

```text
specs/006-fix-compras-bugs/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── rls-policies.sql # RLS policy updates
└── checklists/
    └── requirements.md  # Validation checklist
```

### Source Code (repository root)

```text
apps/web/
├── src/
│   ├── app/(app)/chamados/
│   │   ├── page.tsx                    # Hub - filtro de status
│   │   ├── actions.ts                  # Hub - filtro de departamentos
│   │   ├── components/
│   │   │   └── hub-filters.tsx         # Dropdown departamento
│   │   ├── compras/
│   │   │   ├── actions.ts              # addQuotation, changeTicketStatus
│   │   │   └── [ticketId]/
│   │   │       ├── page.tsx            # Revalidation
│   │   │       └── components/
│   │   │           ├── ticket-quotations.tsx  # Máscaras, validação CNPJ
│   │   │           ├── ticket-actions.tsx     # UI refresh após status
│   │   │           ├── ticket-comments.tsx    # Ctrl+Enter
│   │   │           └── ticket-timeline.tsx    # Labels PT-BR
│   │   └── ti/
│   │       ├── novo/
│   │       │   └── page.tsx            # Remover gate de acesso
│   │       └── actions.ts              # Separar criação de execução
│   └── lib/
│       └── auth/
│           └── ti-access.ts            # canCreateTiTicket vs canAccessTiArea

supabase/
└── migrations/
    └── YYYYMMDD_fix_compras_rls.sql    # Nova migration RLS
```

**Structure Decision**: Alterações distribuídas em arquivos existentes do monorepo `apps/web/` com nova migration SQL no Supabase.

## Complexity Tracking

> Nenhuma violação de Constitution Check que necessite justificativa.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | - | - |
