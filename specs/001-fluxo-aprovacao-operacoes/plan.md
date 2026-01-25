# Implementation Plan: Fluxo de aprovacao de chamados - Operacoes

**Branch**: `001-fluxo-aprovacao-operacoes` | **Date**: 2026-01-25 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-fluxo-aprovacao-operacoes/spec.md`

## Summary

Atualizar o fluxo de aprovacao de chamados do departamento de Operacoes para respeitar a hierarquia (manobrista → encarregado → supervisor → gerente de operacoes), pulando niveis anteriores quando o criador ja ocupa cargo superior e evitando autoaprovacao. O ajuste deve criar apenas as aprovacoes necessarias, definir o status inicial correto e manter o fluxo atual para usuarios fora de Operacoes e chamados existentes.

## Technical Context

**Language/Version**: TypeScript (Node 24) e SQL (PostgreSQL/Supabase)  
**Primary Dependencies**: Next.js (App Router), Supabase  
**Storage**: Supabase Postgres  
**Testing**: Playwright (web E2E), Jest (mobile quando aplicavel)  
**Target Platform**: Web app (Next.js) com backend Supabase  
**Project Type**: web  
**Performance Goals**: atualizacao de status/aprovacoes refletida na UI em ate 2 segundos apos criacao  
**Constraints**: manter RBAC/RLS existentes e nao alterar chamados legados  
**Scale/Scope**: suporte a multiplos departamentos e cargos com volume atual de chamados

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Type Safety**: Pass. Ajustes previstos em TypeScript e SQL com tipagem explicita.
- **Code Quality Standards**: Pass. Mudancas pequenas e isoladas, seguem padroes do repo.
- **Security & RBAC**: Pass. Fluxo mantem Supabase Auth/RLS e valida autorizacao.
- **Testing Discipline**: Pass. Prever validacao E2E do fluxo critico.
- **Documentation**: Pass. Artefatos do spec/plan e docs atualizados.
- **Workflow**: Pass. Feature branch ja criada, sem necessidade de excecoes.
- **Post-Design Re-check**: Pass. Artefatos de pesquisa, dados e contratos alinhados ao escopo.

## Project Structure

### Documentation (this feature)

```text
specs/001-fluxo-aprovacao-operacoes/
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
├── web/
│   └── src/
│       └── app/
│           └── (app)/
│               └── chamados/
│                   ├── [tipo]/
│                   │   └── actions.ts
│                   └── components/
docs/
└── database/
    └── migrations/
supabase/
└── functions/
```

**Structure Decision**: O fluxo sera ajustado no app web (server actions de chamados) e nas funcoes SQL/migrations do Supabase, mantendo a arquitetura web + backend Supabase do monorepo.
