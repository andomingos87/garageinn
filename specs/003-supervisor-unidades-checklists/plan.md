# Implementation Plan: Visibilidade de unidades e checklists do supervisor

**Branch**: `003-supervisor-unidades-checklists` | **Date**: 2026-01-24 | **Spec**: [spec](./spec.md)
**Input**: Feature specification from `/specs/003-supervisor-unidades-checklists/spec.md`

## Summary

Restringir a listagem de `/unidades` para supervisores apenas às unidades vinculadas e reorganizar o menu de Checklists com subitens "Abertura" e "Supervisao", mantendo acesso de supervisao protegido por RBAC.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 24.x  
**Primary Dependencies**: Next.js 16 (App Router), React 19, Supabase JS/SSR  
**Storage**: Supabase Postgres (RLS/RPC)  
**Testing**: Playwright E2E, ESLint, TypeScript typecheck  
**Target Platform**: Web (navegadores modernos)  
**Project Type**: web (monorepo `apps/web`)  
**Performance Goals**: Sem metas novas; manter tempos de carregamento atuais das listas  
**Constraints**: Respeitar RBAC e RLS; bloqueio server-side para acessos por URL  
**Scale/Scope**: Usuarios internos; impacto restrito a `/unidades` e navegação de Checklists

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] TypeScript em todo o fluxo alterado
- [x] RBAC aplicado em UI (menu) e server-side (rotas/acoes)
- [x] RLS/RPC respeitados para escopo de unidades
- [x] Testes E2E planejados para fluxos criticos
- [x] Documentacao gerada em `specs/`

Re-check (apos Phase 1): PASS

## Project Structure

### Documentation (this feature)

```text
specs/003-supervisor-unidades-checklists/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
apps/web/
├── src/app/(app)/unidades/
│   ├── page.tsx
│   └── actions.ts
├── src/app/(app)/checklists/
│   ├── page.tsx
│   └── supervisao/page.tsx
├── src/app/(app)/checklists/executar/actions.ts
├── src/components/layout/app-sidebar.tsx
├── src/components/ui/sidebar.tsx
├── src/components/auth/require-permission.tsx
├── src/lib/units/index.ts
└── src/lib/auth/permissions.ts
```

**Structure Decision**: Web application dentro de `apps/web`, mantendo alteracoes no App Router e nos componentes da sidebar.

## Complexity Tracking

Nenhuma violacao da constituicao identificada.
