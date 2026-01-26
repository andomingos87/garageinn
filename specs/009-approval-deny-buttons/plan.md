# Implementation Plan: Botões de Aprovar/Negar por Perfil

**Branch**: `009-approval-deny-buttons` | **Date**: 2026-01-26 | **Spec**: `specs/009-approval-deny-buttons/spec.md`  
**Input**: Feature specification from `/specs/009-approval-deny-buttons/spec.md`

## Summary

Garantir que apenas perfis autorizados (gerente de compras) vejam e executem ações de aprovação/negação, com bloqueio consistente entre UI e backend e regra aplicada aos módulos com fluxo de aprovação.

## Technical Context

**Language/Version**: TypeScript 5  
**Primary Dependencies**: Next.js 16 (App Router), React 19, Supabase  
**Storage**: PostgreSQL (Supabase)  
**Testing**: Playwright (web), Jest (quando aplicável)  
**Target Platform**: Web (Next.js)  
**Project Type**: web  
**Performance Goals**: UI refletir permissões em até 2s  
**Constraints**: RBAC obrigatório, validação server-side, sem chaves no client  
**Scale/Scope**: Compras e Manutenção (verificar módulos similares)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Type Safety (TS, sem `any`): PASS
- Security & RBAC (Supabase Auth + RLS): PASS
- Testing Discipline (E2E Playwright para fluxo crítico): PASS
- Documentation (docs/ atualizado): PASS

## Project Structure

### Documentation (this feature)

```text
specs/009-approval-deny-buttons/
├── plan.md              # This file
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── status-approval-visibility.openapi.md
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
apps/web/src/app/(app)/chamados/
├── compras/
│   ├── [ticketId]/components/ticket-actions.tsx
│   └── actions.ts
├── manutencao/
│   ├── [ticketId]/components/ticket-actions.tsx
│   └── actions.ts
```

**Structure Decision**: Ajustes em componentes de ações e validação de permissões no backend.

## Phase 0: Outline & Research

**Output**: `research.md`  
Decisões sobre filtragem de transições e bloqueio backend.

## Phase 1: Design & Contracts

**Outputs**:
- `data-model.md`
- `contracts/status-approval-visibility.openapi.md`
- `quickstart.md`

## Phase 2: Planning (Implementation Outline)

1. Definir permissões por transição para aprovação/negação.
2. Filtrar transições por perfil na UI.
3. Validar permissão no backend antes de alterar status.
4. Verificar módulos adicionais (Manutenção e similares).

## Complexity Tracking

Sem violações de constituição identificadas.
