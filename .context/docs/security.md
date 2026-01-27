# Security

This document describes the security model of **GarageInn** (web + mobile), how authentication/authorization is enforced, and the operational practices required to keep the system safe.

## Overview (Layered Security)

GarageInn uses multiple, complementary layers:

1. **Authentication (Supabase Auth)**  
   Establishes identity (who the user is) and issues session tokens.

2. **Authorization (RBAC in the apps)**  
   Controls which screens/actions a signed-in user can access based on roles/permissions.

3. **Data enforcement (Postgres RLS in Supabase)**  
   Enforces row-level data access rules server-side, regardless of client behavior.

4. **Privileged operations (Server Actions / Edge Functions)**  
   Any action requiring elevated privileges (e.g., service role key usage, impersonation, admin operations) must run **server-side only**.

This design assumes the client can be compromised and therefore relies on **RLS and server-side checks** as the final enforcement points.

---

## Authentication

### Supabase Auth
- Both **web** and **mobile** authenticate users through Supabase Auth.
- Clients use:
  - **Anon public key** + user session tokens (JWT) to access protected data under RLS policies.
- Sessions must be treated as sensitive and never logged.

### Where authentication is implemented
- Web auth hooks: `apps/web/src/hooks/use-auth.ts`
- Mobile auth context: `apps/mobile/src/modules/auth/context/AuthContext.tsx`

### Public vs protected routes (web)
Public route logic is handled in:

- `apps/web/src/proxy.ts` (`isPublicRoute` and `proxy`)

Ensure any route that exposes sensitive data is protected and not treated as public.

---

## Authorization

Authorization is enforced in two places:

### 1) RBAC (Role-Based Access Control) in application code
RBAC is used to:
- Gate UI elements (buttons, menus, screens)
- Prevent client-side actions from being triggered without permission
- Provide a clear developer contract (what roles can do what)

Key areas:
- Permissions definitions: `apps/web/src/lib/auth/permissions.ts`
- RBAC utilities: `apps/web/src/lib/auth/rbac.ts`
- Permission retrieval and checks (web): `apps/web/src/hooks/use-permissions.ts`

**Important:** RBAC is not a replacement for RLS. It improves UX and reduces accidental misuse, but **must not be the only enforcement mechanism**.

### 2) RLS (Row-Level Security) in the database
RLS is the primary mechanism that prevents:
- Cross-unit data exposure
- Unauthorized reads/writes
- Privilege escalation via direct API calls

Rules of thumb:
- **All tables containing tenant/business data must have RLS enabled.**
- Policies should be expressed in terms of:
  - authenticated user (`auth.uid()`)
  - user’s roles/units (as modeled in your schema)
  - explicit allow/deny logic for read/write operations

Whenever you change the schema (new tables, new columns used for scoping, new relationships), you must:
- revisit and update RLS policies
- validate that reads/writes still behave correctly for each role

Related typing/DB references:
- Supabase database types: `apps/web/src/lib/supabase/database.types.ts`
- Domain custom types: `apps/web/src/lib/supabase/custom-types.ts`

---

## Impersonation (Privileged Feature)

Impersonation is a sensitive capability that must be strictly controlled and audited.

### Implementation references
- Edge function: `supabase/functions/impersonate-user/index.ts`
- Web service wrapper: `apps/web/src/lib/services/impersonation-service.ts`
- Web impersonation state handling: `apps/web/src/lib/auth/impersonation.ts`
- Web hook: `apps/web/src/hooks/use-impersonation.ts`

### Security requirements
- Impersonation requests must be processed **server-side** (edge function / server action).
- Only specific admin roles should be able to impersonate.
- Impersonation must be:
  - time-bounded (where applicable)
  - traceable (audit logs, Sentry breadcrumbs, etc.)
- The UI must clearly indicate when impersonation is active.

If you add new privileged endpoints, apply the same controls used by the impersonation flow.

---

## Secrets & Environment Variables

### Golden rule
**Never expose server secrets to clients.**  
In particular, the **Supabase service role key** must never be shipped to the browser or mobile app.

### Env file locations & conventions
- Web: `apps/web/.env.local`
  - Client-exposed variables must be prefixed with `NEXT_PUBLIC_`
- Mobile: `apps/mobile/.env`
  - Client-exposed variables must be prefixed with `EXPO_PUBLIC_`

### What must remain server-only
- Supabase **service role key**
- Any admin API tokens
- Credentials for third-party services that allow write/admin access
- Private signing keys

### Operational checklist
- Ensure `.env*` files are not committed (use `.gitignore`).
- Rotate credentials if a secret is exposed.
- Prefer CI-managed secrets for deployments and testing.

---

## Handling Sensitive Data (PII, Tokens, Files)

### Logging
- Do not log:
  - access tokens / refresh tokens
  - full user profiles containing PII
  - request payloads that may include sensitive content (comments, attachments, claim data)
- If logs are necessary for debugging, redact:
  - emails, phone numbers, document IDs
  - tokens and authorization headers

Mobile observability utilities:
- `apps/mobile/src/lib/observability/logger.ts`
- `apps/mobile/src/lib/observability/sentry.ts`

### File uploads / attachments
If the system allows photos or attachments (e.g., checklists/tickets), ensure:
- storage buckets enforce access controls consistent with RLS (or equivalent)
- signed URLs are short-lived when used
- metadata does not leak sensitive context

---

## Secure Development Practices

### Server-side boundaries
Use elevated privileges only in:
- **Next.js server actions**
- **Supabase Edge Functions**
- **Backend scripts** (local/CI), never in client bundles

Any code path that requires a service role key must be:
- isolated from client imports
- reviewed for accidental exposure through shared modules

### Validate permissions at the execution point
For critical actions, enforce authorization:
- in the server action / edge function handler
- and through RLS for the underlying data writes

### Dependency & supply chain hygiene
- Pin important dependencies where possible.
- Review changes to auth, RLS policy files, and edge functions with extra scrutiny.

---

## Testing & Verification

### RBAC verification
There is a RBAC validation script:
- `apps/web/scripts/validate-rbac.ts`

Use it to:
- ensure role-to-permission mappings are consistent
- catch accidental permission regressions

### E2E coverage
E2E tests exist under:
- `apps/web/e2e/*`

When adding new secured features:
- add at least one test that confirms unauthorized roles cannot access the action/screen
- add a test that confirms authorized roles can complete the flow

---

## Incident Response

When a potential security issue is identified:

1. **Contain**
   - Disable/rotate affected credentials (immediately if a secret leaked).
   - Temporarily restrict endpoints/features if needed.

2. **Assess**
   - Identify impacted users/data.
   - Review relevant logs and recent deployments.
   - Check Supabase Auth logs and database audit trails (if enabled).

3. **Remediate**
   - Patch the vulnerability.
   - Add/adjust RLS policies and server-side permission checks.
   - Add regression tests.

4. **Review**
   - Document root cause, blast radius, and prevention actions.
   - Schedule follow-up improvements (policy hardening, monitoring, additional tests).

---

## Common Pitfalls (Avoid These)

- Using the **service role key** in any client-side code.
- Assuming RBAC checks in UI are enough (they are not).
- Adding new tables without enabling/updating **RLS**.
- Logging tokens, authorization headers, or PII.
- Creating “admin” endpoints without explicit server-side permission checks and auditing.

---

## Related Documentation & Files

- Architecture overview: `docs/architecture.md`
- Web auth and permissions:
  - `apps/web/src/hooks/use-auth.ts`
  - `apps/web/src/hooks/use-permissions.ts`
  - `apps/web/src/lib/auth/*`
- Supabase edge functions:
  - `supabase/functions/impersonate-user/index.ts`
  - `supabase/functions/invite-user/index.ts`
- Database typing reference:
  - `apps/web/src/lib/supabase/database.types.ts`
  - `apps/web/src/lib/supabase/custom-types.ts`

If you introduce new security-sensitive functionality, update this document and cross-link the relevant implementation files and policies.
