# Project Overview — GarageInn (GAPP)

GarageInn App (GAPP) is an operational management system for parking garages. It provides a unified workflow for teams to:

- Open, track, and manage **chamados** (tickets) across departments (TI, financeiro, comercial, compras, manutenção, RH, sinistros, admin).
- Execute and supervise **checklists** (templates, assignments, executions, PDF exports).
- Manage **units** (unidades) and **users** (usuários), including roles, permissions, and access constraints.
- Enforce **role-based access control (RBAC)** consistently across **web (Next.js)** and **mobile (Expo/React Native)** clients.
- Integrate **Supabase** for authentication, database access, and edge functions.

---

## Repository layout

High-level structure (most developer work happens in these folders):

- `apps/web/` — Next.js web application (App Router)
- `apps/mobile/` — Expo / React Native application
- `supabase/` — Supabase edge functions and SQL migrations
- `docs/` — Engineering documentation and notes
- `specs/` — Feature specs, plans, and product/engineering design notes

---

## Technology stack

### Web (`apps/web`)
- **Next.js** (App Router)
- TypeScript + React
- UI components and layouts under `apps/web/src/components/**`
- Server Actions and route handlers under `apps/web/src/app/**`

### Mobile (`apps/mobile`)
- **Expo** / React Native
- TypeScript + React
- Modular feature organization (`modules/auth`, `modules/tickets`, `modules/checklists`, etc.)
- Shared UI primitives under `apps/mobile/src/components/ui/**`

### Backend / Platform
- **Supabase** for:
  - Authentication (including callback flows)
  - Database access (typed definitions in `apps/web/src/lib/supabase/**`)
  - Edge functions (`supabase/functions/*/index.ts`)
  - SQL migrations (in `supabase/migrations`)

### Tooling and quality
- Type checking, linting, formatting via npm scripts (see `package.json`)
- **Playwright E2E** tests for the web app (`apps/web/e2e/**`)
- Observability helpers on mobile (`apps/mobile/src/lib/observability/**`)

---

## Entry points

These files are useful when you need to understand initialization and app bootstrapping.

### Web
- `apps/web/src/app/layout.tsx` — root application layout
- `apps/web/src/app/(app)/layout.tsx` — authenticated “app” section layout (navigation shell, guarded routes, etc.)

### Mobile
- `apps/mobile/App.tsx` — Expo app entry point
- `apps/mobile/src/navigation/RootNavigator.tsx` — navigation root, authentication gating and main flows
- `apps/mobile/src/navigation/MainTabNavigator.tsx` — main tabs and module navigation

### Edge functions
- `supabase/functions/*/index.ts` — Supabase edge functions (e.g., invite user, impersonation, test user creation)

---

## Core domains and features

### Chamados (Tickets)
Tickets are implemented on both web and mobile, with department-specific workflows on web.

- **Web routes**: `apps/web/src/app/(app)/chamados/**`
  - Department pages: `ti`, `financeiro`, `comercial`, `compras`, `manutencao`, `rh`, `sinistros`, `admin`
  - Detail pages: often nested by `[ticketId]`
  - Business logic: typically in `actions.ts` per module/route
- **Mobile module**: `apps/mobile/src/modules/tickets/**`
  - Screens: list, details, create/new ticket
  - Services: `apps/mobile/src/modules/tickets/services/ticketsService.ts`
  - Shared components: forms, cards, comment UI

### Checklists
Checklists are structured around templates and executions.

- **Web routes**: `apps/web/src/app/(app)/checklists/**`
  - Configure templates: `configurar`, `configurar/[templateId]`
  - Execute: `executar`, `executar/[executionId]`
  - Supervision: `supervisao`
- **Mobile module**: `apps/mobile/src/modules/checklists/**`
  - Screens for list, details, execution
  - Drafts and photo attachment flows supported by services (e.g., draft service)

### Units (Unidades) and Users (Usuários)
Administrative and operational management screens exist on the web:

- `apps/web/src/app/(app)/unidades/**`
- `apps/web/src/app/(app)/usuarios/**`
- Bulk import flows exist for units: `apps/web/src/app/(app)/unidades/importar/**`

### Reports (Relatórios)
Reporting is provided via web routes and API endpoints capable of exporting PDF/Excel:

- UI routes:
  - `apps/web/src/app/(app)/relatorios/supervisao/**`
  - `apps/web/src/app/(app)/relatorios/chamados/**`
- API endpoints:
  - `apps/web/src/app/api/relatorios/supervisao/pdf`
  - `apps/web/src/app/api/relatorios/supervisao/excel`
  - `apps/web/src/app/api/relatorios/chamados/pdf`
  - `apps/web/src/app/api/relatorios/chamados/excel`
  - Checklist execution PDF: `apps/web/src/app/api/checklists/[executionId]/pdf`

---

## Permissions and access control (RBAC)

Access control is a first-class concept across the system.

### Web RBAC and auth utilities
- `apps/web/src/lib/auth/rbac.ts` — role model and RBAC helpers
- `apps/web/src/lib/auth/permissions.ts` — permission definitions/types
- `apps/web/src/hooks/use-permissions.ts` — client-side permission loading/usage
- `apps/web/src/components/auth/access-denied.tsx` — shared “no access” UI
- `apps/web/src/hooks/use-auth.ts` and `useRequireAuth` — auth gating patterns

There is also a validation script that can be used to verify role/permission mappings:

- `apps/web/scripts/validate-rbac.ts`

### Mobile permissions and guards
- `apps/mobile/src/modules/user/hooks/usePermissions.ts`
- `apps/mobile/src/components/guards/ProtectedView.tsx` — shared guard UI (includes `AccessDeniedMessage` / `AccessDeniedScreen` exports)

---

## Data access and typed models

Supabase types are generated/maintained and used throughout the apps:

- `apps/web/src/lib/supabase/database.types.ts` — generated database types
- `apps/web/src/lib/supabase/custom-types.ts` — app-specific, richer types (e.g., `UserWithRoles`, `UnitWithStaffCount`, `AuditLog`)
- `apps/web/src/lib/services/**` — service-layer wrappers for cross-cutting backend operations (e.g., impersonation)

On mobile, modules expose their own typed models for local correctness and API/service calls, for example:

- `apps/mobile/src/modules/tickets/types/tickets.types.ts`
- `apps/mobile/src/modules/user/types/userProfile.types.ts`

---

## Testing

### Web E2E (Playwright)
End-to-end coverage for major flows lives in:

- `apps/web/e2e/**`
  - Authentication fixtures: `apps/web/e2e/fixtures/auth.ts`
  - Feature suites: `usuarios.spec.ts`, `unidades.spec.ts`, `dashboard.spec.ts`, `relatorios.spec.ts`, `configuracoes.spec.ts`
  - Department ticket suites: e.g. `chamados-ti-*.spec.ts`, `chamados-financeiro.spec.ts`, `chamados-comercial.spec.ts`

These tests are a practical reference for “how the app is supposed to behave” and are useful usage examples for flows and role-based access.

---

## Local development (typical workflow)

> Exact commands and conventions may evolve—prefer the repository’s workflow docs for the source of truth.

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   - `apps/web/.env.local`
   - `apps/mobile/.env`

3. Run the web app:
   ```bash
   npm run dev:web
   ```

4. Run the mobile app:
   ```bash
   npm run dev:mobile
   ```

For day-to-day conventions, branching, scripts, and release notes, see:
- `docs/development-workflow.md`
- `docs/tooling.md`
- `CLAUDE.md` and `AGENTS.md` (repository-specific instructions)

---

## Architectural map (where to look first)

If you’re new to the codebase, these are good starting points by intent:

- **UI shell (web)**: `apps/web/src/components/layout/app-shell.tsx`, `app-header.tsx`, `app-sidebar.tsx`
- **Auth + profile (web)**: `apps/web/src/hooks/use-auth.ts`, `apps/web/src/hooks/use-profile.ts`
- **Permissions (web)**: `apps/web/src/hooks/use-permissions.ts`, `apps/web/src/lib/auth/*`
- **Tickets (mobile)**: `apps/mobile/src/modules/tickets/screens/*`, `.../services/ticketsService.ts`
- **Checklists (mobile)**: `apps/mobile/src/modules/checklists/screens/*`, relevant services in `.../services/*`
- **Supabase function examples**: `supabase/functions/invite-user/index.ts`, `supabase/functions/impersonate-user/index.ts`

---

## Related documentation

- `docs/architecture.md` — system architecture and layering
- `docs/development-workflow.md` — everyday dev process
- `docs/tooling.md` — IDE, scripts, automation, and tooling expectations
- `docs/codebase-map.json` — generated deep reference (symbols, dependency graphs, exports)
