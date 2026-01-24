# Implementation Plan: Modulo de Chamados de TI

**Branch**: `001-chamados-ti` | **Date**: 2026-01-24 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-chamados-ti/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Criar o modulo de chamados de TI com listagem, criacao e detalhe, usando o padrao do modulo de manutencao, com dados especificos (categoria e tipo de equipamento) e fluxo de aprovacao padrao quando aplicavel.

## Technical Context

**Language/Version**: TypeScript, Node.js >= 18  
**Primary Dependencies**: Next.js (App Router), React, Supabase (Auth + DB)  
**Storage**: Supabase Postgres (tabelas e views)  
**Testing**: Playwright (E2E), TypeScript typecheck, ESLint/Prettier  
**Target Platform**: Web (navegadores modernos)  
**Project Type**: Monorepo com app web (`apps/web`)  
**Performance Goals**: Listagem com filtros responde em ate 2s para volume padrao de chamados  
**Constraints**: RBAC + RLS obrigatorios, LGPD, sem vazamento de dados entre perfis  
**Scale/Scope**: Uso por unidades operacionais com centenas a milhares de chamados ativos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Type safety com TypeScript, sem `any` nao justificado
- [x] RBAC com Supabase Auth + RLS em todas as tabelas novas
- [x] Testes E2E para jornadas criticas do modulo de TI
- [x] Documentacao atualizada em `docs/` e `specs/`
- [x] Migrations reversiveis quando possivel

**Re-check (apos Fase 1)**: OK

## Project Structure

### Documentation (this feature)

```text
specs/001-chamados-ti/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
apps/
└── web/
    ├── e2e/
    └── src/
        ├── app/(app)/chamados/ti/
        │   ├── actions.ts
        │   ├── page.tsx
        │   ├── novo/page.tsx
        │   ├── [ticketId]/page.tsx
        │   └── components/
        │       ├── ti-ticket-form.tsx
        │       ├── ti-filters.tsx
        │       └── ti-stats-cards.tsx
        └── components/layout/app-sidebar.tsx

docs/
└── database/
    ├── migrations/
    ├── seeds/
    └── functions.md
```

**Structure Decision**: Feature implementada no app web (`apps/web`) com suporte de migracoes e seeds em `docs/database/`.

## Complexity Tracking

Nenhuma violacao identificada.
