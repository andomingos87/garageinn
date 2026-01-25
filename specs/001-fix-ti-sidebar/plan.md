# Implementation Plan: Visibilidade de TI na sidebar

**Branch**: `001-fix-ti-sidebar` | **Date**: 2026-01-24 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-fix-ti-sidebar/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Restringir a visibilidade e o acesso da area de chamados de TI para apenas usuarios do setor de TI e perfis globais/admin, aplicando regra unica no menu e nas rotas, com protecao server-side para evitar acesso direto por URL e prevenir exposicao de dados.

## Technical Context

**Language/Version**: TypeScript, Node.js 24.x  
**Primary Dependencies**: Next.js (App Router), React, Supabase (Auth + DB), Tailwind CSS  
**Storage**: Supabase Postgres (tickets, RBAC)  
**Testing**: Playwright (E2E), TypeScript typecheck, ESLint/Prettier  
**Target Platform**: Web (navegadores modernos)  
**Project Type**: Monorepo com app web em `apps/web`  
**Performance Goals**: Visibilidade e bloqueio aplicados no carregamento inicial da pagina  
**Constraints**: RBAC + RLS obrigatorios, LGPD, sem vazamento entre departamentos  
**Scale/Scope**: uso interno com equipes multi-departamento e centenas de usuarios

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Type safety com TypeScript, sem uso de `any` nao justificado
- [x] RBAC com Supabase Auth aplicado no cliente (UX) e no servidor (seguranca)
- [x] RLS mantido para tabelas sensiveis (tickets e detalhes)
- [x] Testes E2E para jornadas criticas (menu/rota bloqueada)
- [x] Documentacao atualizada em `docs/` e `specs/`
- [x] Mudancas realizadas via feature branch

**Re-check (apos Fase 1)**: OK

## Project Structure

### Documentation (this feature)

```text
specs/001-fix-ti-sidebar/
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
    ├── src/
    │   ├── app/(app)/chamados/ti/
    │   │   ├── page.tsx
    │   │   ├── novo/page.tsx
    │   │   ├── [ticketId]/page.tsx
    │   │   └── actions.ts
    │   ├── components/layout/app-sidebar.tsx
    │   └── components/auth/access-denied.tsx
    └── e2e/

docs/
└── bugs/ti-sidebar-visibilidade.md
```

**Structure Decision**: Ajustes concentrados no app web (`apps/web`) com documentacao do bug em `docs/`, sem impacto direto no app mobile.

## Complexity Tracking

Nenhuma violacao identificada.
