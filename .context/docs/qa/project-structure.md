# Project Structure

This repository is organized as a **multi-app monorepo**: a Web app, a Mobile app, shared documentation/specs, and backend (Supabase) resources.

At a high level:

```
apps/
docs/
specs/
supabase/
```

## Top-level directories

### `apps/` — Applications

Contains the runnable applications in this repo:

- **`apps/web/`**: Web application (Next.js App Router style structure).
- **`apps/mobile/`**: Mobile application (React Native + modular “modules/” organization).

You’ll typically spend most of your time here when implementing features.

---

### `docs/` — Documentation

Human-readable documentation, including QA notes and architecture docs.

Relevant file:
- `docs/qa/project-structure.md` (this document)

---

### `specs/` — Specifications

Product/feature specifications and supporting design/requirements documents. Use this as the source of truth for “what” should be built, while `apps/` contains “how” it is built.

---

### `supabase/` — Backend (Supabase)

Supabase resources such as Edge Functions.

Common patterns in this repo:
- `supabase/functions/*/index.ts` contains function entrypoints (e.g., `invite-user`, `impersonate-user`, `create-test-users`).

These functions are consumed by the apps (directly or via services).

---

## `apps/web/` (Web app) structure

The Web app follows a **Next.js App Router** layout. Key folders you will encounter:

### `apps/web/src/app/` — Routes, pages, and route-local components

- Uses App Router segments like:
  - `(auth)` for authentication routes (login, password recovery, reset)
  - `(app)` for authenticated application routes

Examples (based on existing folders):
- `apps/web/src/app/(auth)/login/`
- `apps/web/src/app/(app)/dashboard/`
- `apps/web/src/app/(app)/chamados/` (tickets)
- `apps/web/src/app/(app)/checklists/`
- `apps/web/src/app/(app)/configuracoes/` (settings)
- `apps/web/src/app/api/` for API routes (controllers), including report exports (PDF/Excel)

**Conventions**
- Route-level “server actions” are commonly placed in `actions.ts` under the route folder.
- Route-level UI pieces often live in `components/` inside the route folder for cohesion.

---

### `apps/web/src/components/` — Shared UI and layout components

Common shared component groups:
- `apps/web/src/components/layout/` (e.g., `AppShell`, `AppSidebar`, `AppHeader`)
- `apps/web/src/components/ui/` (reusable UI primitives)
- `apps/web/src/components/auth/` (auth/guard-related UI like `AccessDenied`)

Use this for components reused across multiple routes.

---

### `apps/web/src/lib/` — Utilities, services, integrations

This is the Web app’s “core” library area. Typical subareas:
- `apps/web/src/lib/utils.ts` (shared helpers like `cn`, `getURL`)
- `apps/web/src/lib/services/` (service-layer calls and orchestration)
- `apps/web/src/lib/auth/` (RBAC, impersonation, access rules)
- `apps/web/src/lib/supabase/` (typed Supabase client/types; repository-like access)

Related typed definitions:
- `apps/web/src/lib/supabase/database.types.ts`
- `apps/web/src/lib/supabase/custom-types.ts`

---

### `apps/web/e2e/` — End-to-end tests

Playwright-style E2E tests and fixtures live here.

Notable patterns:
- `apps/web/e2e/fixtures/auth.ts` provides helpers like `loginAsAdmin`, `loginAsSupervisor`, etc.
- Feature specs exist per domain (e.g., users, units, dashboards, tickets).

Use E2E tests as living documentation for critical flows.

---

### `apps/web/scripts/` — Maintenance and validation scripts

Repository scripts such as RBAC validation:
- `apps/web/scripts/validate-rbac.ts`

---

## `apps/mobile/` (Mobile app) structure

The Mobile app is organized primarily around **modules** (feature-driven structure).

### `apps/mobile/src/modules/` — Feature modules

Each module typically contains:
- `screens/` (navigation targets)
- `components/` (module-specific UI)
- `services/` (API/Supabase interaction + business logic)
- `types/` (TypeScript types and contracts)
- `constants/` (module constants where relevant)

Examples:
- `apps/mobile/src/modules/auth/`
- `apps/mobile/src/modules/tickets/`
- `apps/mobile/src/modules/checklists/`
- `apps/mobile/src/modules/profile/`
- `apps/mobile/src/modules/settings/`
- `apps/mobile/src/modules/notifications/`

---

### `apps/mobile/src/components/` — Shared components

Shared components used across modules:
- `apps/mobile/src/components/ui/` (design-system-like components: `Button`, `Badge`, etc.)
- `apps/mobile/src/components/guards/` (e.g., `ProtectedView` and “Access Denied” views)

---

### `apps/mobile/src/navigation/` — Navigation setup and types

React Navigation configuration:
- `apps/mobile/src/navigation/RootNavigator.tsx`
- `apps/mobile/src/navigation/MainTabNavigator.tsx`
- `apps/mobile/src/navigation/types.ts`

---

### `apps/mobile/src/lib/` — Shared libraries (mobile)

Includes cross-cutting concerns such as:
- `apps/mobile/src/lib/supabase/` (Supabase client/integration)
- `apps/mobile/src/lib/observability/` (logging and Sentry instrumentation)

---

### `apps/mobile/src/theme/` — Theme tokens and styling primitives

Design tokens/types:
- `apps/mobile/src/theme/colors.ts`
- `apps/mobile/src/theme/spacing.ts`
- `apps/mobile/src/theme/typography.ts`

---

## Cross-cutting architecture conventions

This repo broadly follows a layered approach:

- **Components**: UI building blocks (shared + domain-specific)
- **Config**: page/module configuration and route-level setup
- **Services**: business logic, data fetching, orchestration (often depends on utils/config)
- **Utils/Lib**: helpers, auth, supabase client & types
- **Controllers** (Web): Next.js API routes under `apps/web/src/app/api/*` for exports and server-side endpoints
- **Repositories** (Web): Supabase access patterns concentrated in `apps/web/src/lib/supabase`

In practice:
- UI components should avoid hard-coding data access.
- Data access and side effects live in `services/` (and Supabase helpers under `lib/supabase`).
- Domain routes/modules keep feature-specific components close to where they’re used.

---

## Where to add new code (quick guide)

### Add a new Web page/feature
- Create a new route under: `apps/web/src/app/(app)/<feature>/`
- Put feature-only UI into: `apps/web/src/app/(app)/<feature>/components/`
- Put server actions into: `apps/web/src/app/(app)/<feature>/actions.ts`
- Reusable UI goes into: `apps/web/src/components/`

### Add a new Mobile feature
- Create a new module under: `apps/mobile/src/modules/<feature>/`
- Add screens to: `apps/mobile/src/modules/<feature>/screens/`
- Add services to: `apps/mobile/src/modules/<feature>/services/`
- Register navigation in: `apps/mobile/src/navigation/`

### Add/modify backend functionality (Supabase)
- Add an Edge Function under: `supabase/functions/<function-name>/index.ts`
- Ensure apps call it through an appropriate service layer (web: `apps/web/src/lib/services`, mobile: module services)

---

## Related documentation / code pointers

- Web routing: `apps/web/src/app/`
- Web shared components: `apps/web/src/components/`
- Web services and auth: `apps/web/src/lib/services/`, `apps/web/src/lib/auth/`
- Mobile modules: `apps/mobile/src/modules/`
- Mobile navigation: `apps/mobile/src/navigation/`
- Supabase functions: `supabase/functions/`
