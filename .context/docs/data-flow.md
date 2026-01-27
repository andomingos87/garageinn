# Data Flow (Web + Mobile) — Garageinn

This document explains how data moves through the Garageinn system—from user interaction in the **Web (Next.js)** and **Mobile (Expo/React Native)** apps to **Supabase** (Auth, Postgres with RLS, Storage, Edge Functions), and back to the UI. It also clarifies where **privileged** operations happen and how **reports (PDF/Excel)** are generated.

Related: [`docs/architecture.md`](architecture.md)

---

## Big picture

At a high level, both clients authenticate with **Supabase Auth** and read/write data via **Supabase PostgREST** into **Postgres**, protected by **RLS policies**. The Web app additionally uses **Server Actions** and **API routes** for privileged/structured work (especially report generation). Server-only workflows (invites, impersonation) are implemented via **Supabase Edge Functions**.

```mermaid
flowchart LR
  U[User] --> W[Web App (Next.js)] --> SA[Server Actions / API Routes]
  U --> M[Mobile App (Expo)]
  SA --> S[Supabase Client]
  M --> S
  S --> DB[(Postgres + RLS)]
  S --> AUTH[Supabase Auth]
  SA --> FN[Supabase Edge Functions]
  FN --> DB
```

---

## Core building blocks

### 1) Clients (Web + Mobile)

**Web**
- Runs on Next.js (app router).
- Uses **Server Actions** (mutations + privileged read flows) and **API routes** (especially for binary outputs like PDF/Excel).
- UI components live under `apps/web/src/components` and feature pages under `apps/web/src/app`.

**Mobile**
- Runs with Expo/React Native.
- Uses a dedicated service layer per module (`apps/mobile/src/modules/*/services`).
- Uses guards for access control and user context (`apps/mobile/src/components/guards`).

### 2) Service layer

Service code is responsible for:
- Calling Supabase queries and RPCs
- Mapping raw API data to domain-friendly formats
- Centralizing error handling patterns
- Keeping UI components “thin”

Locations:
- Web: `apps/web/src/lib/services/*`
- Mobile: `apps/mobile/src/modules/*/services/*`

### 3) Supabase client wrappers

There are wrappers around Supabase SDK usage to standardize configuration and typing.

Locations:
- Web: `apps/web/src/lib/supabase/*`
- Mobile: `apps/mobile/src/lib/supabase/*`

Types:
- Database types: `apps/web/src/lib/supabase/database.types.ts`
- Custom/domain types: `apps/web/src/lib/supabase/custom-types.ts`

### 4) Postgres + RLS (the security boundary)

**Row Level Security (RLS)** is the main enforcement mechanism:
- Even if a client attempts to query “too much”, RLS prevents rows from being returned/modified.
- This is the default line of defense for multi-tenant and role-based access.

Practical implication:
- Most business rules should assume “database denies by default” and only allow access through correctly scoped policies.

### 5) Edge Functions (server-only workflows)

Edge Functions are used for flows that require:
- **Service role** keys / admin privileges
- Cross-user operations (e.g., invites/impersonation)
- Server-side validations that must not run in the client

Locations:
- `supabase/functions/invite-user`
- `supabase/functions/impersonate-user`
- `supabase/functions/create-test-users`

---

## Common data flows

### A) Authentication flow

**Goal:** Obtain a Supabase session and use it for subsequent API access.

1. User logs in (Web or Mobile).
2. Client authenticates via **Supabase Auth**.
3. Supabase returns a session (JWT access token + refresh token).
4. Subsequent queries include the JWT and are filtered by **RLS**.

Code touchpoints:
- Web auth hooks: `apps/web/src/hooks/use-auth.ts`
- Mobile auth context: `apps/mobile/src/modules/auth/context/AuthContext.tsx`

**Developer notes**
- Avoid storing sensitive server-only capabilities in clients.
- Prefer querying “current user context” from DB (profile, roles, unit scope) instead of trusting client-local state.

---

### B) Standard read flow (list/detail screens)

**Typical pattern:**
- Screen/component triggers a fetch
- Service layer calls Supabase
- DB returns only allowed rows due to RLS
- UI renders the typed data

**Mobile example shape (conceptual):**
```ts
// Screen -> service -> supabase -> db (RLS) -> data -> UI
const tickets = await ticketsService.listTickets({ status: "open" });
```

**Web example shape (conceptual):**
- For most reads, web pages may call Supabase directly (client or server-side depending on route/component).
- For sensitive reads or aggregated data, use server actions/services.

Key directories involved:
- Mobile screens: `apps/mobile/src/modules/*/screens/*`
- Mobile services: `apps/mobile/src/modules/*/services/*`
- Web pages: `apps/web/src/app/(app)/**`
- Web services: `apps/web/src/lib/services/*`

---

### C) Standard write flow (create/update actions)

**Goal:** Create/update a record (tickets, checklists, comments, etc.) while guaranteeing permission checks.

Typical sequence:
1. UI gathers input (forms).
2. Mutation is executed:
   - Mobile: service calls Supabase directly.
   - Web: often via Server Action (recommended when additional validations or server-side work is needed).
3. Postgres applies constraints + triggers (if any) and enforces RLS.
4. UI updates state (refetch, optimistic update, or cache invalidation).

**Where to put logic**
- Validation that depends on secrets/admin privileges: server actions or edge functions.
- Validation that depends on per-row access: RLS policies + optional server-side prechecks for better UX.

---

## Reports flow (PDF/Excel)

Reports are generated server-side on the Web app because:
- Output is binary (PDF/Excel)
- Formatting and aggregation are server responsibilities
- Some queries may require privileged joins/transformations (still should respect access rules)

API routes (Web):
- `apps/web/src/app/api/relatorios/supervisao/pdf`
- `apps/web/src/app/api/relatorios/supervisao/excel`
- `apps/web/src/app/api/relatorios/chamados/pdf`
- `apps/web/src/app/api/relatorios/chamados/excel`
- `apps/web/src/app/api/checklists/[executionId]/pdf`

**Typical report flow**
1. UI triggers report download (e.g., “Export PDF”).
2. Browser requests a Next.js API route.
3. API route loads data (via Supabase client/server context).
4. API transforms into PDF/Excel and returns the file response.
5. Client downloads/displays the file.

**Developer notes**
- Keep report endpoints idempotent and read-only.
- Make sure they use the proper auth context (user session) unless there is a strong reason to elevate privileges.
- If you must use service role, restrict usage to server-only and enforce additional authorization checks.

---

## Privileged flows

### A) Invitations

Implemented via Edge Function:
- `supabase/functions/invite-user`

**Why Edge Function?**
- Creating users/inviting typically requires admin privileges (service role).
- Must not expose admin keys to clients.

**Typical flow**
1. Admin triggers “invite user” in Web UI.
2. Web server action/API route calls the Edge Function.
3. Edge Function uses admin API to invite/create user.
4. DB is updated and invitation status is tracked.

### B) Impersonation

Implemented via Edge Function:
- `supabase/functions/impersonate-user`

Web-side helper/service:
- `apps/web/src/lib/services/impersonation-service.ts`
- Impersonation state helpers: `apps/web/src/lib/auth/impersonation.ts`
- Hook: `apps/web/src/hooks/use-impersonation.ts`

**Why Edge Function?**
- Issuing tokens / impersonating a user is inherently privileged.
- Must be audited and tightly controlled.

**Security expectations**
- Only a small set of roles should be able to impersonate.
- Track impersonation actions (audit logs) and show clear UI indicators.

---

## Permissions and access checks

Garageinn uses a layered approach:

1. **UI/Guard layer** (prevent showing unauthorized features)
   - Mobile protected views/guards: `apps/mobile/src/components/guards/ProtectedView.tsx`

2. **App-level permission helpers**
   - Web permissions hook: `apps/web/src/hooks/use-permissions.ts`
   - RBAC utilities: `apps/web/src/lib/auth/*` (e.g., `rbac.ts`, `permissions.ts`)

3. **Database enforcement (source of truth)**
   - Postgres RLS policies

**Rule of thumb:** UI checks improve UX, but **RLS is the final authority**.

---

## Observability and failure modes

### Mobile error monitoring
- Sentry integration: `apps/mobile/src/lib/observability/sentry.ts`
- Logger utilities: `apps/mobile/src/lib/observability/logger.ts`

### Common failure modes
- **RLS denials**: queries return empty sets or permission errors.
  - Fix by adjusting policies or ensuring the correct JWT/session is used.
- **Expired sessions**: refresh token flow fails; user must log in again.
- **Report generation errors**: PDF/Excel route throws due to data shape/formatting.
- **Edge function auth errors**: missing/invalid authorization headers, role not allowed.

**Recommended practices**
- Return user-friendly messages at the UI boundary.
- Log structured error context (request id, user id, unit scope) server-side when possible.
- For mobile, attach breadcrumbs for navigation and key actions.

---

## Practical guidance for adding new features

### When to call Supabase directly from the client
Use direct client calls when:
- The operation is fully covered by RLS
- No secrets/admin privileges are required
- Payloads and transformations are minimal

Typical: list/detail CRUD within the user’s allowed scope.

### When to use Web Server Actions / API routes
Use server-side web flows when:
- You need additional validation or aggregation
- You are generating files (PDF/Excel)
- You want to centralize business logic for the web app

### When to use Edge Functions
Use Edge Functions when:
- The flow requires Supabase admin/service-role capabilities (invites, impersonation)
- You need server-only execution accessible by both web and mobile
- You want a strict separation from the Next.js runtime

---

## Cross-references (key paths)

- Web app (pages/features): `apps/web/src/app/(app)/**`
- Web server endpoints (reports): `apps/web/src/app/api/**`
- Web services: `apps/web/src/lib/services/**`
- Web Supabase setup & types: `apps/web/src/lib/supabase/**`
- Web auth/permissions hooks: `apps/web/src/hooks/**`

- Mobile screens: `apps/mobile/src/modules/**/screens/**`
- Mobile services: `apps/mobile/src/modules/**/services/**`
- Mobile Supabase setup: `apps/mobile/src/lib/supabase/**`
- Mobile guards: `apps/mobile/src/components/guards/**`
- Mobile observability: `apps/mobile/src/lib/observability/**`

- Supabase Edge Functions: `supabase/functions/**`

---

## Appendix: mental model checklist

Before shipping a change that touches data access:

- Does the UI rely on a permission check that is also enforced by **RLS**?
- If elevated privileges are needed, is it implemented in a **server-only** environment (Server Action/API route/Edge Function)?
- Are inputs validated at the boundary (server) where necessary?
- Are errors observable (logs/Sentry) and user-friendly?
- For reports: is the endpoint authenticated and scoped correctly?
