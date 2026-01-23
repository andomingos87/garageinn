# Implementation Plan: Acesso a Usuários e Configurações por Admin e Globais

**Branch**: `001-admin-global-access` | **Date**: 2026-01-23 | **Spec**: [spec](./spec.md)
**Input**: Feature specification from `/specs/001-admin-global-access/spec.md`

## Summary

Garantir que usuários admin e globais vejam e acessem os módulos "Usuários" e "Configurações" pela sidebar, enquanto perfis não elegíveis não veem os itens nem acessam por link direto. A abordagem segue o RBAC atual do web app (permissão `admin:all` e checagens client/server).

## Technical Context

**Language/Version**: TypeScript 5.x (web app)  
**Primary Dependencies**: Next.js 16, React 19, Supabase Auth (supabase-js/ssr)  
**Storage**: Supabase Postgres com RLS (existente)  
**Testing**: Playwright (E2E web), ESLint/Prettier  
**Target Platform**: Web (navegadores modernos)  
**Project Type**: Monorepo com app web em `apps/web`  
**Performance Goals**: Itens de sidebar e checagens de permissão sem atraso perceptível (<= 1s)  
**Constraints**: RBAC com Supabase; checagens client-side e server-side; LGPD; sem acesso para perfis não elegíveis  
**Scale/Scope**: Escopo no app web, módulos "Usuários" e "Configurações"; sem mudanças no app mobile

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Monorepo Structure**: OK — mudanças concentradas em `apps/web` e documentação em `docs/`.
- **Type Safety**: OK — uso de TypeScript com tipos explícitos e sem `any`.
- **Code Quality Standards**: OK — manter ESLint/Prettier e padrões existentes.
- **Security & RBAC**: OK — checar permissões no cliente (sidebar) e no servidor (rotas/actions).
- **Testing Discipline**: OK — adicionar/ajustar testes E2E Playwright para acessos permitidos e bloqueados.
- **Documentation**: OK — atualizar documentação de permissões/acesso em `docs/`.
- **Development Workflow**: OK — branch de feature e commits convencionais.

**Post-Design Check**: PASS — sem violações identificadas após o desenho.

## Project Structure

### Documentation (this feature)

```text
specs/001-admin-global-access/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/
│   └── access-control.yaml
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
apps/web/src/
├── app/(app)/
│   ├── layout.tsx
│   ├── usuarios/
│   │   ├── page.tsx
│   │   └── actions.ts
│   └── configuracoes/
│       ├── page.tsx
│       ├── sistema/page.tsx
│       └── permissoes/page.tsx
├── components/
│   ├── auth/require-permission.tsx
│   └── layout/app-sidebar.tsx
├── hooks/use-permissions.ts
└── lib/auth/
    ├── permissions.ts
    └── rbac.ts

apps/web/e2e/
└── acesso-usuarios-configuracoes.spec.ts

docs/
└── usuarios/PERMISSOES_COMPLETAS.md
```

**Structure Decision**: Usar a estrutura do app web em `apps/web` para ajustes de sidebar e proteção de rotas, com E2E em `apps/web/e2e` e documentação em `docs/`.

## Complexity Tracking

Sem violações de constituição que exijam justificativa adicional nesta fase.
