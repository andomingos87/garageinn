# Implementation Plan: Persistência de Ações de Status (Compras + Manutenção)

**Branch**: `001-status-actions-persist` | **Date**: 2026-01-25 | **Spec**: `specs/001-status-actions-persist/spec.md`  
**Input**: Feature specification from `/specs/001-status-actions-persist/spec.md`

## Summary

Garantir que as ações de status em chamados de Compras/Manutenção persistam no banco, retornem feedback consistente ao usuário e reflitam imediatamente na UI. A abordagem combina ajustes de permissão (RLS/fluxo), validação de persistência e refresh confiável da interface.

## Technical Context

**Language/Version**: TypeScript 5  
**Primary Dependencies**: Next.js 16 (App Router), React 19, Supabase  
**Storage**: PostgreSQL (Supabase)  
**Testing**: Playwright (web), Jest (quando aplicável)  
**Target Platform**: Web (Next.js)  
**Project Type**: web  
**Performance Goals**: UI refletir status em até 2s após ação  
**Constraints**: RLS obrigatório, validação server-side, sem uso de chaves em client  
**Scale/Scope**: Módulo de chamados de Compras/Manutenção

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Type Safety (TS, sem `any`): PASS (mudanças previstas em TS)
- Security & RBAC (Supabase Auth + RLS): PASS (RLS será ajustado/validado)
- Testing Discipline (E2E Playwright para fluxo crítico): PASS (fluxo crítico)
- Documentation (docs/ atualizado): PASS (documentos e spec já criados)

## Project Structure

### Documentation (this feature)

```text
specs/001-status-actions-persist/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── status-actions.openapi.md
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
apps/web/src/app/(app)/chamados/compras/
├── [ticketId]/
│   ├── components/
│   │   └── ticket-actions.tsx
│   └── page.tsx
├── actions.ts
└── constants.ts

supabase/migrations/
docs/chamados/execucao_de_compras/
```

**Structure Decision**: Web app (Next.js) + Supabase, com ajustes em `apps/web` e políticas RLS em `supabase/migrations`.

## Phase 0: Outline & Research

**Output**: `research.md`  
Decisões cobrem permissões de atualização, tratamento de falhas silenciosas e garantia de refresh da UI.

## Phase 1: Design & Contracts

**Outputs**:
- `data-model.md` (entidades e regras)
- `contracts/status-actions.openapi.md` (contrato do update de status)
- `quickstart.md` (fluxos de validação)

## Phase 2: Planning (Implementation Outline)

1. Validar fluxo de status permitido e checagem de permissão no backend.
2. Garantir que update de status falho retorne erro explícito.
3. Atualizar UI para refletir status persistido imediatamente.
4. Atualizar testes E2E para cobrir transição e negação.

## Complexity Tracking

Sem violações de constituição identificadas.
