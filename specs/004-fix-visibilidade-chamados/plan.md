# Implementation Plan: Correcao da visibilidade de chamados por perfil

**Branch**: `004-fix-visibilidade-chamados` | **Date**: 2026-01-24 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/004-fix-visibilidade-chamados/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Ajustar a logica de listagem e acesso a detalhes dos chamados de Compras para respeitar perfil e status, garantindo que o gerente veja todos os chamados elegiveis (incluindo "Aguardando aprovacao (gerente)") e o assistente de compras nao visualize chamados ainda pendentes de aprovacao.

## Technical Context

**Language/Version**: TypeScript, Node.js 24.x  
**Primary Dependencies**: Next.js (App Router), React, Supabase (Auth + DB), Tailwind CSS  
**Storage**: Supabase Postgres (tickets, aprovacoes, roles, view tickets_with_details)  
**Testing**: Playwright (E2E), TypeScript typecheck, ESLint/Prettier  
**Target Platform**: Web (navegadores modernos)  
**Project Type**: Monorepo com app web em `apps/web`  
**Performance Goals**: Visibilidade correta aplicada no carregamento inicial das listas  
**Constraints**: RBAC + RLS obrigatorios, LGPD, consistencia entre lista e detalhe  
**Scale/Scope**: uso interno com multiplas unidades e centenas de chamados ativos

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
specs/004-fix-visibilidade-chamados/
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
    │   ├── app/(app)/chamados/
    │   │   ├── actions.ts
    │   │   ├── components/
    │   │   └── compras/
    │   │       ├── actions.ts
    │   │       ├── page.tsx
    │   │       ├── components/
    │   │       └── [ticketId]/page.tsx
    │   └── lib/supabase/server.ts
    └── e2e/
```

**Structure Decision**: Mudancas concentradas no app web (`apps/web`) em actions e paginas de chamados de compras, sem ajustes no app mobile.

## Complexity Tracking

Nenhuma violacao identificada.
