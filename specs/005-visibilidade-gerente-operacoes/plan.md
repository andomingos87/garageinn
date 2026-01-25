# Implementation Plan: Visibilidade de chamados do Gerente de Operacoes

**Branch**: `005-visibilidade-gerente-operacoes` | **Date**: 2026-01-25 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/005-visibilidade-gerente-operacoes/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Ajustar a visibilidade de chamados com base no criador (departamento Operacoes + cargos de linha) e garantir que o gerente de operacoes seja a ultima aprovacao para esses chamados, mantendo RBAC/RLS e sem novos endpoints.

## Technical Context

**Language/Version**: TypeScript, Node.js 24.x, SQL (Postgres)  
**Primary Dependencies**: Next.js (App Router), React, Supabase (Auth + DB)  
**Storage**: Supabase Postgres (tickets, ticket_approvals, user_roles, profiles)  
**Testing**: Playwright (E2E), TypeScript typecheck, ESLint/Prettier  
**Target Platform**: Web (navegadores modernos)  
**Project Type**: Monorepo com app web em `apps/web` + Supabase  
**Performance Goals**: Visibilidade correta aplicada no carregamento inicial das listas  
**Constraints**: RBAC + RLS obrigatorios, LGPD, consistencia entre lista e detalhe  
**Scale/Scope**: uso interno com multiplas unidades e chamados ativos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Type safety com TypeScript, sem `any` nao justificado
- [x] RBAC com Supabase Auth aplicado no cliente (UX) e no servidor (seguranca)
- [x] RLS mantido para tabelas sensiveis (tickets e aprovacoes)
- [x] Testes E2E para jornadas criticas de listagem e detalhe
- [x] Documentacao atualizada em `docs/` e `specs/`
- [x] Mudancas via feature branch

**Re-check (apos Fase 1)**: OK

## Project Structure

### Documentation (this feature)

```text
specs/005-visibilidade-gerente-operacoes/
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
    │   ├── app/(app)/relatorios/chamados/
    │   ├── app/(app)/chamados/
    │   └── lib/supabase/
    └── e2e/

supabase/
```

**Structure Decision**: Mudancas concentradas no app web e na camada de dados do Supabase para garantir visibilidade e aprovacao corretas.

## Complexity Tracking

Nenhuma violacao identificada.
