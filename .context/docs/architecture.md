# Architecture

This document describes the high-level architecture of the **GarageInn** codebase: a monorepo containing a **Next.js web app**, an **Expo/React Native mobile app**, and a **Supabase backend** (Postgres + Auth + RLS + Edge Functions). It explains how the main layers fit together, where responsibilities live, and which conventions to follow when extending the system.

## System overview

At runtime, GarageInn consists of:

- **Web client (Next.js App Router)**: UI + server actions + a few API routes for report generation.
- **Mobile client (Expo / React Native)**: UI organized by feature modules with service layers for data access.
- **Backend (Supabase)**:
  - **Postgres** as the system of record
  - **Supabase Auth** for authentication
  - **Row Level Security (RLS)** as the enforcement boundary for data access
  - **Edge Functions** for privileged workflows (e.g., user invitation, impersonation)

### High-level request flow

1. User authenticates via **Supabase Auth** (web/mobile).
2. Client reads data using the Supabase client libraries.
3. Writes/mutations:
   - Web typically uses **Next.js server actions** for “trusted” operations.
   - Mobile uses **services** that call Supabase directly (still protected by RLS).
   - Some privileged flows are routed through **Supabase Edge Functions**.
4. **RLS policies** enforce what rows the user can read/write at the database level.

## Repository layout

Top-level directories (most relevant):

- `apps/`
  - `apps/web/` — Next.js application (App Router)
  - `apps/mobile/` — Expo/React Native application
- `supabase/`
  - `supabase/migrations/` — SQL migrations (schema, policies, etc.)
  - `supabase/functions/` — Edge functions (privileged backend tasks)
- `docs/` — Technical documentation (this file lives here)
- `specs/` — Feature specifications
- `codebase-map.json` — Dependency graph information (useful for impact analysis)

## Architectural layers

The codebase follows a “feature-first” organization with supporting shared layers. Conceptually:

- **UI / Screens** (feature folders)
- **Components** (shared UI primitives + feature components)
- **Services** (domain operations and data adapters)
- **Supabase access layer** (clients, generated types, and custom types)
- **Auth/RBAC** (permissions, role checks, impersonation)
- **Backend privileged operations** (Edge functions)
- **Database** (schema + RLS + constraints)

### Detected dependency direction (practical rule)

In general, keep dependencies flowing “downwards”:

**Screens/Routes → Components → Services → Supabase client/types**

Avoid:
- UI components importing route modules directly
- services importing UI
- ad-hoc Supabase queries sprinkled across UI when a service already exists

## Web application (Next.js)

### Where it lives

- Routes, layouts, and server-side logic: `apps/web/src/app/`
- Shared UI: `apps/web/src/components/`
- Shared libraries/utilities: `apps/web/src/lib/`
- Hooks: `apps/web/src/hooks/`
- E2E tests: `apps/web/e2e/`

### App Router structure and route groups

The web app uses Next.js **App Router** with route groups like:

- `apps/web/src/app/(auth)/...` — authentication pages (login, password recovery, etc.)
- `apps/web/src/app/(app)/...` — authenticated application pages (dashboard, chamados, checklists, etc.)

Common patterns you will see:

- `layout.tsx` at `apps/web/src/app/layout.tsx` and `apps/web/src/app/(app)/layout.tsx` as the main entry points and authenticated shell.
- Feature routes organized by domain:
  - `apps/web/src/app/(app)/chamados/...`
  - `apps/web/src/app/(app)/checklists/...`
  - `apps/web/src/app/(app)/usuarios/...`
  - `apps/web/src/app/(app)/unidades/...`
  - `apps/web/src/app/(app)/configuracoes/...`
  - `apps/web/src/app/(app)/relatorios/...`

### Server actions

Mutations are commonly implemented as **server actions** inside feature folders:

- `apps/web/src/app/**/actions.ts`

These server actions encapsulate privileged logic (running server-side) such as:
- writing to multiple tables in a transaction-like flow,
- validating permissions before mutation,
- producing consistent `ActionResult` responses.

Examples of where to look:
- `apps/web/src/app/(auth)/login/actions.ts`
- `apps/web/src/app/(app)/checklists/configurar/actions.ts`
- `apps/web/src/app/(app)/chamados/*/actions.ts`

**Convention:** prefer server actions for write operations triggered from the web UI, especially when they require stricter permission checks or should not expose internal logic to the client bundle.

### API routes (reports)

The web app also includes API endpoints for report exports (PDF/Excel):

- `apps/web/src/app/api/relatorios/chamados/pdf`
- `apps/web/src/app/api/relatorios/chamados/excel`
- `apps/web/src/app/api/relatorios/supervisao/pdf`
- `apps/web/src/app/api/relatorios/supervisao/excel`
- `apps/web/src/app/api/checklists/[executionId]/pdf`

Use API routes when the output is a file stream or needs server-only libraries/runtime constraints.

### Web auth, RBAC, and impersonation

Key areas:

- RBAC definitions: `apps/web/src/lib/auth/permissions.ts`
- RBAC utilities and role types: `apps/web/src/lib/auth/rbac.ts`
- Impersonation support: `apps/web/src/lib/auth/impersonation.ts`
- Permission/hooks consumption:
  - `apps/web/src/hooks/use-auth.ts`
  - `apps/web/src/hooks/use-permissions.ts`
  - `apps/web/src/hooks/use-impersonation.ts`

UI helpers:
- Access-denied component: `apps/web/src/components/auth/access-denied.tsx`

Additionally, there is validation tooling:
- `apps/web/scripts/validate-rbac.ts` (static checks/validation utilities)

## Mobile application (Expo / React Native)

### Where it lives

- App entry: `apps/mobile/App.tsx`
- Navigation: `apps/mobile/src/navigation/`
  - `RootNavigator.tsx`, `MainTabNavigator.tsx`, and stack definitions
- Feature modules: `apps/mobile/src/modules/`
  - `auth`, `user`, `tickets`, `checklists`, `settings`, `profile`, etc.
- Shared components:
  - `apps/mobile/src/components/ui/` — UI kit primitives (Button, Badge, etc.)
  - `apps/mobile/src/components/guards/` — permission/auth guards (e.g., `ProtectedView`)
- Observability:
  - `apps/mobile/src/lib/observability/` — logging + Sentry integration

### Feature-module pattern (mobile)

Most domain logic is organized as:

- `apps/mobile/src/modules/<feature>/screens/` — screen components
- `apps/mobile/src/modules/<feature>/components/` — feature-scoped components
- `apps/mobile/src/modules/<feature>/services/` — Supabase calls + domain operations
- `apps/mobile/src/modules/<feature>/types/` — feature types

Example domains:
- Tickets: `apps/mobile/src/modules/tickets/*`
- Checklists: `apps/mobile/src/modules/checklists/*`

### Guards and permission checks

Mobile uses guard components for access control at the UI level, e.g.:

- `apps/mobile/src/components/guards/ProtectedView.tsx`
  - exports `AccessDeniedMessage` and `AccessDeniedScreen`

Permissions are also represented in the mobile domain layer:
- `apps/mobile/src/modules/user/types/permissions.types.ts`

## Supabase backend

### Database as the source of truth

Supabase Postgres is the centralized data store. Access control is enforced primarily via:

- **RLS (Row Level Security)** policies
- role-aware queries and (where needed) Edge function workflows

Generated types and custom types are maintained in the web app:

- Generated DB types: `apps/web/src/lib/supabase/database.types.ts`
- Custom domain types: `apps/web/src/lib/supabase/custom-types.ts`

### Supabase client access layers

Common client wrappers live in:

- Web Supabase libs: `apps/web/src/lib/supabase/`
- Mobile Supabase libs: `apps/mobile/src/lib/supabase/`

Services typically depend on these wrappers rather than constructing clients ad hoc.

### Edge functions (privileged workflows)

Edge functions exist for operations that require elevated privileges or server-side secrets, such as:

- `supabase/functions/invite-user/`
- `supabase/functions/impersonate-user/`
- `supabase/functions/create-test-users/`

Use an Edge function when:
- the operation must bypass normal client restrictions safely,
- it needs a service role key,
- it orchestrates cross-user actions (e.g., invitations, impersonation),
- it must not be exposed in a client bundle.

### Migrations and policies

Schema and policy evolution happens via SQL migrations:

- `supabase/migrations/`

When adding new tables or modifying access patterns, treat RLS updates as part of the definition of done.

## Services and domain logic

### Web services

Web services are grouped under:

- `apps/web/src/lib/services/`

These typically encapsulate:
- query composition,
- domain-specific operations,
- interaction with auth/impersonation where necessary.

### Mobile services

Mobile services live per feature module:

- `apps/mobile/src/modules/*/services/`

Examples:
- `apps/mobile/src/modules/tickets/services/ticketsService.ts`
- `apps/mobile/src/modules/checklists/services/*`

**Rule of thumb:** if multiple screens need the same data operation, promote it into a service.

## Components and UI strategy

### Web components

- App shell/layout: `apps/web/src/components/layout/`
  - `app-shell.tsx`, `app-header.tsx`, `app-sidebar.tsx`
- UI kit: `apps/web/src/components/ui/`
- Auth-related components: `apps/web/src/components/auth/`

### Mobile components

- UI kit primitives: `apps/mobile/src/components/ui/`
- Guards: `apps/mobile/src/components/guards/`

The repository uses feature-specific components inside feature folders as well, especially in Next.js route segments (e.g., `apps/web/src/app/(app)/.../components`).

## Cross-cutting concerns

### Authentication

- Web: hook-based access patterns with server-side enforcement via actions where needed (`useAuth`, `useRequireAuth`)
- Mobile: Auth provider/context under `apps/mobile/src/modules/auth/context/`

### Authorization (RBAC)

- Web: centralized permission definitions in `apps/web/src/lib/auth/permissions.ts`, enforced in UI and server actions
- Mobile: permissions and role permission maps under `apps/mobile/src/modules/user/`

### Observability

- Mobile Sentry integration and logging:
  - `apps/mobile/src/lib/observability/sentry.ts` (e.g., `addBreadcrumb`)
  - `apps/mobile/src/lib/observability/logger.ts`

### Testing

- Web E2E tests:
  - `apps/web/e2e/*.spec.ts`
  - Shared auth helpers: `apps/web/e2e/fixtures/auth.ts`
- Mobile unit tests appear in feature/lib folders (e.g., `apps/mobile/src/lib/observability/__tests__`)

Use E2E tests as the best “living examples” of intended user flows (navigation helpers like `navigateToUsers`, `navigateToUnits`, etc.).

## Practical conventions (how to add things)

### Add a new web feature page

1. Create a new route under `apps/web/src/app/(app)/<feature>/...`.
2. Put UI components under a local `components/` folder if they are feature-specific.
3. Implement writes in `actions.ts` next to the route segment.
4. Reuse shared UI from `apps/web/src/components/ui/` and layouts from `apps/web/src/components/layout/`.
5. Enforce access:
   - in the UI (hide/disable actions),
   - and in the server action (authoritative check),
   - and via RLS (ultimate boundary).

### Add a new mobile feature module

1. Create a module folder under `apps/mobile/src/modules/<feature>/`.
2. Add:
   - `screens/` for screen components,
   - `services/` for Supabase operations,
   - `types/` for domain types.
3. Wire routes into `apps/mobile/src/navigation/` (stack/tab navigators).
4. Use guard components (`ProtectedView`) for permission-gated screens.

### Add a new privileged backend operation

Use a Supabase Edge Function when client/server-action logic is not sufficient:

1. Add function under `supabase/functions/<name>/index.ts`.
2. Define request/response interfaces (see `invite-user` and `impersonate-user` patterns).
3. Call it from web services/server actions or mobile services as appropriate.
4. Ensure the database has the correct RLS/policy model; Edge functions should not become a substitute for missing policies.

## Related documentation

- `docs/project-overview.md` — product/system overview
- `docs/data-flow.md` — end-to-end data flow details (client ↔ supabase ↔ policies)
- `codebase-map.json` — detailed dependency graphs and module relationships
