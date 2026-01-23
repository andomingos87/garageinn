# Implementation Plan: RBAC Operacoes

**Branch**: `002-rbac-operacoes` | **Date**: 2026-01-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-rbac-operacoes/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Atualizar e aplicar a matriz RBAC do Departamento Operacoes (Manobrista, Encarregado, Supervisor, Gerente) para refletir acessos permitidos/negados em navegacao e protecao de acesso, usando a fonte central de permissoes e checagens client/server.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.x, Node 18.18  
**Primary Dependencies**: Next.js 16 (App Router), React 19, Supabase JS/SSR  
**Storage**: Supabase Postgres com RLS  
**Testing**: Playwright (E2E)  
**Target Platform**: Web (navegadores modernos)
**Project Type**: Web app em monorepo (`apps/web`)  
**Performance Goals**: Checagem de permissao sem impacto perceptivel na navegacao  
**Constraints**: Checagem de permissoes client e server; nomes de cargos/departamentos devem bater com o banco  
**Scale/Scope**: Departamento Operacoes com 4 cargos; outros departamentos fora do escopo

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- TypeScript obrigatorio para alteracoes de app (PASS)
- Supabase Auth + RBAC com checagem client e server (PASS)
- RLS ativo para tabelas afetadas (PASS - sem novas tabelas)
- Testes E2E para jornadas criticas de acesso (PASS - planejar cenarios)
- Documentacao em `docs/` atualizada (PASS - ajustar matriz de permissoes)

Re-check pos-Phase 1: PASS

## Project Structure

### Documentation (this feature)

```text
specs/002-rbac-operacoes/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
apps/
└── web/
    ├── e2e/
    ├── src/
    │   ├── app/(app)/
    │   ├── components/auth/
    │   ├── components/layout/
    │   ├── hooks/
    │   └── lib/auth/
    └── scripts/

supabase/
└── functions/
```

**Structure Decision**: Web app em monorepo com foco em `apps/web` e suporte de dados em `supabase/`.

## Complexity Tracking

Sem violacoes do constitution nesta fase.
