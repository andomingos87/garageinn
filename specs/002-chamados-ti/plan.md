# Implementation Plan: Modulo de Chamados de TI - Fluxo Basico

**Branch**: `002-chamados-ti` | **Date**: 2026-01-24 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/002-chamados-ti/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implementar o fluxo basico do modulo de chamados de TI: abertura com categoria, aplicacao do fluxo de aprovacao padrao, status pronto para execucao quando aprovado (ou quando nao exigir aprovacao) e listagem de chamados prontos restrita a equipe de TI e perfis globais.

## Technical Context

**Language/Version**: TypeScript, Node.js 24.x  
**Primary Dependencies**: Next.js (App Router), React, Supabase (Auth + DB), Tailwind CSS  
**Storage**: Supabase Postgres + Supabase Storage (anexos opcionais)  
**Testing**: Playwright (E2E), TypeScript typecheck, ESLint/Prettier  
**Target Platform**: Web (navegadores modernos)  
**Project Type**: Monorepo com app web (`apps/web`)  
**Performance Goals**: Chamados aprovados aparecem como "pronto para execucao" em ate 1 minuto  
**Constraints**: RBAC + RLS obrigatorios, LGPD, sem vazamento de dados entre perfis  
**Scale/Scope**: uso interno com centenas a milhares de chamados ativos

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
specs/002-chamados-ti/
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
        │       ├── ti-ready-list.tsx
        │       └── ti-ticket-status.tsx
        └── components/layout/app-sidebar.tsx

docs/
└── database/
    ├── migrations/
    ├── seeds/
    └── functions.md
```

**Structure Decision**: Implementar o modulo no app web (`apps/web`), com contratos e modelos em `specs/002-chamados-ti` e ajustes de banco via `docs/database/`.

## Complexity Tracking

Nenhuma violacao identificada.
