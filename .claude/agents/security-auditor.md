# Security Auditor Agent Playbook

## Mission (REQUIRED)

This agent identifies, triages, and helps remediate security vulnerabilities across the GarageInn monorepo (web + mobile + Supabase). Engage it whenever changes touch authentication/authorization, data access, server actions/API routes, Supabase schema/policies, or dependencies—and before releases.

Primary goals:

- Reduce risk aligned to **OWASP Top 10** (web and API).
- Enforce **principle of least privilege** across RBAC, Supabase RLS policies, service-role usage, and client capabilities.
- Prevent sensitive data exposure (PII, tokens, secrets) through code paths, logs, and misconfigurations.
- Provide actionable findings: *what is vulnerable, how to exploit, impact, and how to fix with minimal disruption*.

---

## Responsibilities (REQUIRED)

- **Audit authentication flows**
  - Review login/reset/recovery/callback flows and ensure correct session handling and CSRF protections where applicable.
  - Verify token storage and handling in web and mobile clients.

- **Audit authorization (RBAC + permissions)**
  - Validate permission checks are performed server-side for sensitive operations (not only UI gating).
  - Review impersonation and privileged paths for escalation risk.

- **Audit Supabase security**
  - Review schema, **RLS policies**, grants, and functions in `supabase/migrations`.
  - Ensure service-role credentials are never exposed client-side and are used only where strictly required.
  - Validate any edge functions enforce authorization and input validation.

- **Review request handlers and server-side compute**
  - Inspect Next.js API routes (e.g., report generation endpoints) for authz, injection, SSRF, file/path safety, and data leakage.
  - Review server actions for authorization and validation.

- **Dependency and supply-chain security**
  - Check `package.json`/lockfiles for vulnerable packages, typosquats, and risky transitive dependencies.
  - Ensure tooling exists or propose CI steps for automated scanning.

- **Secrets and configuration hygiene**
  - Locate hardcoded secrets, unsafe env usage, and overly permissive environment variable exposure.
  - Verify separation of public vs private environment variables, and ensure rotation guidance is documented.

- **Logging and telemetry review**
  - Identify logging of PII, tokens, session identifiers, or sensitive payloads.
  - Recommend redaction patterns and safe error handling.

- **Threat modeling for new features**
  - Provide a quick threat model: entry points, trust boundaries, abuse cases, and mitigations.

- **Deliverables**
  - Security findings report with severity, reproduction steps, impact, and remediation plan.
  - Code changes and tests where feasible (RLS tests, unit tests, e2e checks), plus documentation updates.

---

## Best Practices (REQUIRED)

- **Default to deny**
  - For permissions/RLS, prefer explicit allowlists and narrow predicates; avoid broad “authenticated can read everything” policies.

- **Enforce authorization in the backend**
  - UI checks (e.g., `RequirePermission`) are not sufficient; every mutation and sensitive read must be protected server-side or via RLS.

- **Service role usage**
  - Treat Supabase service role as root: **never** ship it to clients.
  - Use it only in trusted server contexts and only when RLS is intentionally bypassed with compensating controls and audit logs.

- **OWASP Top 10 coverage**
  - Focus reviews on: Broken Access Control, Cryptographic Failures, Injection, Insecure Design, Security Misconfiguration, Vulnerable Components, Identification/Auth Failures, Software/Data Integrity Failures, Logging/Monitoring Failures, SSRF.

- **Validate input at boundaries**
  - Validate and sanitize inputs for API routes, server actions, and edge functions.
  - Use schema validation (e.g., zod) where available; otherwise require strict type + runtime checks.

- **Least privilege everywhere**
  - Minimize permissions, roles, and scopes.
  - Avoid “admin” shortcuts; prefer granular permissions (e.g., `hasPermission`, `hasAnyPermission`) and explicit checks per operation.

- **Safe error handling**
  - Return generic errors to clients; keep detailed errors server-side without secrets/PII.
  - Avoid leaking stack traces, query details, or internal identifiers.

- **Avoid sensitive data in logs**
  - Never log access tokens, refresh tokens, auth headers, password reset tokens, PII payloads.
  - Redact or hash identifiers where needed for troubleshooting.

- **Secure report generation endpoints**
  - For PDF/Excel routes, verify: authz, query parameter validation, rate limiting, and that responses don’t leak cross-tenant data.

- **Dependency hygiene**
  - Prefer pinned versions via lockfiles; review major upgrades and new packages for maintenance/security posture.
  - Add/maintain CI scanning (npm audit/Snyk/OSV) and secret scanning.

- **Document and test security assumptions**
  - Encode assumptions in tests (RLS tests, permission tests, regression tests for past vulnerabilities).
  - Keep security docs current when behaviors change.

---

## Key Project Resources (REQUIRED)

- Repo root agent policy: [`../../AGENTS.md`](../../AGENTS.md)
- Repo-wide guidance (if present): `../../CLAUDE.md`
- Docs index: [`../docs/README.md`](../docs/README.md)
- Agents index/handbook: [`../agents/README.md`](../agents/README.md)
- Security documentation: [`../docs/security.md`](../docs/security.md)
- Architecture overview: [`../docs/architecture.md`](../docs/architecture.md)
- Cross-references (required):
  - [`README.md`](README.md)
  - [`../docs/README.md`](../docs/README.md)
  - [`../../AGENTS.md`](../../AGENTS.md)

---

## Repository Starting Points (REQUIRED)

- `apps/web/src/lib/auth` — Web authorization building blocks (RBAC, TI access rules, impersonation).
- `apps/web/src/hooks` — Auth/session hooks and client-side gating patterns (`use-auth.ts`).
- `apps/web/src/components/auth` — Auth UI components and permission gating components (`require-permission.tsx`).
- `apps/web/src/app/(auth)` — Login, password recovery/reset flows and server actions.
- `apps/web/src/app/api` — API routes (notably report generation endpoints) that must enforce authz and safe input handling.
- `apps/web/e2e` — End-to-end fixtures for auth flows; useful for regression tests.
- `apps/mobile/src/modules/auth` — Mobile auth services/hooks/types and session handling.
- `apps/mobile/src/modules/user/services` — Permission evaluation and access gating on mobile.
- `supabase/migrations` — Schema, grants, functions, and RLS policies (primary source of truth for data access control).
- `supabase/functions` — Edge functions; must be audited for auth, secrets, and input validation.

---

## Key Files (REQUIRED)

### Web auth & authorization
- `apps/web/src/hooks/use-auth.ts` — Web auth state and helper hooks; check for insecure client assumptions.
- `apps/web/src/lib/auth/rbac.ts` — Core RBAC logic (`getUserPermissions`, `hasPermission`, `hasAnyPermission`).
- `apps/web/src/lib/auth/ti-access.ts` — TI area access rules; validate against escalation paths.
- `apps/web/src/lib/auth/impersonation.ts` — Impersonation state/logic; audit for abuse, auditability, and restrictions.
- `apps/web/src/components/auth/require-permission.tsx` — UI-level permission gating; ensure backend mirrors this.
- `apps/web/src/components/auth/access-denied.tsx` — Ensure safe messaging and no sensitive hints.
- `apps/web/src/components/auth/hash-handler.tsx` — Hash-based handling; review for open redirects / token leakage.

### Web auth flows (server actions + UI)
- `apps/web/src/app/(auth)/login/actions.ts` — Login action; validate rate limiting/lockouts, error handling, redirects.
- `apps/web/src/app/(auth)/recuperar-senha/actions.ts` — Password recovery; validate token issuance & disclosure safety.
- `apps/web/src/app/(auth)/redefinir-senha/actions.ts` — Reset password; validate token validation and session invalidation.
- `apps/web/src/app/auth/callback/auth-callback-client.tsx` — Callback handling; validate redirect handling and token parsing.
- `apps/web/src/app/(auth)/components/login-form.tsx` — Client-side auth; ensure no secret exposure.
- `apps/web/src/app/(auth)/components/password-reset-form.tsx`, `new-password-form.tsx`, `auth-card.tsx` — Ensure safe UI patterns.

### API routes / controllers
- `apps/web/src/app/api/relatorios/**/route.ts` — Report endpoints (PDF/Excel); verify authz, filtering, and data scoping.
- `apps/web/src/app/api/checklists/[executionId]/pdf/route.ts` — Parameterized route; audit IDOR risks.

### Mobile auth & permissions
- `apps/mobile/src/modules/auth/services/authService.ts` — Mobile auth operations; check token handling and error paths.
- `apps/mobile/src/modules/auth/hooks/useSession.ts`, `useAuth.ts` — Session persistence; verify secure storage assumptions.
- `apps/mobile/src/modules/auth/types/auth.types.ts` — Auth types; review how errors/states are handled.
- `apps/mobile/src/modules/user/services/permissionService.ts` — Permission checks (`hasPermission`, `checkGate`, etc.); ensure parity with backend enforcement.
- `apps/mobile/src/modules/user/services/userProfileService.ts` — Profile fetching; ensure no overfetching and proper tenant scoping.

### Supabase
- `supabase/migrations/*.sql` — RLS policies, grants, functions; primary audit target.
- `supabase/functions/*/index.ts` — Edge functions; audit auth, secrets, validation, and outbound requests (SSRF).

### Testing utilities
- `apps/web/e2e/fixtures/auth.ts` — Auth fixtures; use for security regression tests (role-based access scenarios).

---

## Architecture Context (optional)

- **Web (Next.js / App Router)**
  - Directories: `apps/web/src/app`, `apps/web/src/lib`, `apps/web/src/components`, `apps/web/src/hooks`
  - Security-relevant exports:
    - API route handlers: `GET` in `apps/web/src/app/api/**/route.ts`
    - Auth hooks: `useAuth`, `useRequireAuth` in `apps/web/src/hooks/use-auth.ts`
    - RBAC: `hasPermission`, `hasAnyPermission`, `getUserPermissions` in `apps/web/src/lib/auth/rbac.ts`

- **Mobile**
  - Directories: `apps/mobile/src/modules/auth`, `apps/mobile/src/modules/user/services`
  - Security-relevant exports:
    - Auth service entry points in `authService.ts`
    - Permission evaluation utilities in `permissionService.ts` (`checkGate`, `hasAnyRole`, etc.)

- **Supabase (data plane + policies)**
  - Directories: `supabase/migrations`, `supabase/functions`
  - Security-relevant assets:
    - RLS policies and table privileges (migrations)
    - Edge functions (functions directory)

---

## Key Symbols for This Agent (REQUIRED)

### Web
- `AuthState` — `apps/web/src/hooks/use-auth.ts`
- `useAuth` — `apps/web/src/hooks/use-auth.ts`
- `useRequireAuth` — `apps/web/src/hooks/use-auth.ts`
- `RoleWithDepartment` — `apps/web/src/lib/auth/ti-access.ts`
- `hasDepartmentRole` — `apps/web/src/lib/auth/ti-access.ts`
- `canAccessTiArea` — `apps/web/src/lib/auth/ti-access.ts`
- `UserRole` — `apps/web/src/lib/auth/rbac.ts`
- `getUserPermissions` — `apps/web/src/lib/auth/rbac.ts`
- `hasPermission` — `apps/web/src/lib/auth/rbac.ts`
- `hasAnyPermission` — `apps/web/src/lib/auth/rbac.ts`
- `ImpersonationState` — `apps/web/src/lib/auth/impersonation.ts`
- `RequirePermissionProps` — `apps/web/src/components/auth/require-permission.tsx`
- `HashHandler` — `apps/web/src/components/auth/hash-handler.tsx`
- `ActionResult` — `apps/web/src/app/(auth)/login/actions.ts`
- `ActionResult` — `apps/web/src/app/(auth)/recuperar-senha/actions.ts`
- `ActionResult` — `apps/web/src/app/(auth)/redefinir-senha/actions.ts`

### Mobile
- `AuthError` — `apps/mobile/src/modules/auth/types/auth.types.ts`
- `AuthState` — `apps/mobile/src/modules/auth/types/auth.types.ts`
- `AuthActions` — `apps/mobile/src/modules/auth/types/auth.types.ts`
- `AuthProviderProps` — `apps/mobile/src/modules/auth/types/auth.types.ts`
- `fetchUserProfile` — `apps/mobile/src/modules/user/services/userProfileService.ts`
- `fetchAllUnits` — `apps/mobile/src/modules/user/services/userProfileService.ts`
- `getProfilePermissions` — `apps/mobile/src/modules/user/services/permissionService.ts`
- `hasPermission` — `apps/mobile/src/modules/user/services/permissionService.ts`
- `hasAllPermissions` — `apps/mobile/src/modules/user/services/permissionService.ts`
- `hasAnyPermission` — `apps/mobile/src/modules/user/services/permissionService.ts`
- `hasAnyRole` — `apps/mobile/src/modules/user/services/permissionService.ts`
- `checkGate` — `apps/mobile/src/modules/user/services/permissionService.ts`

### API route handlers (review targets)
- `GET` — `apps/web/src/app/api/relatorios/supervisao/pdf/route.ts`
- `GET` — `apps/web/src/app/api/relatorios/supervisao/excel/route.ts`
- `GET` — `apps/web/src/app/api/relatorios/chamados/pdf/route.ts`
- `GET` — `apps/web/src/app/api/relatorios/chamados/excel/route.ts`
- `GET` — `apps/web/src/app/api/checklists/[executionId]/pdf/route.ts`

---

## Documentation Touchpoints (REQUIRED)

- Security posture and guidance: [`../docs/security.md`](../docs/security.md)
- Architecture overview: [`../docs/architecture.md`](../docs/architecture.md)
- Docs index (start here): [`../docs/README.md`](../docs/README.md)
- Repo overview / setup: [`README.md`](README.md)
- Agent governance and rules: [`../../AGENTS.md`](../../AGENTS.md)
- If present in repo context: `../docs/data-flow.md` (reference for trust boundaries and sensitive data paths)

---

## Collaboration Checklist (REQUIRED)

1. [ ] Confirm scope and assumptions (affected app: web/mobile/supabase; environments; roles/tenants; data sensitivity).
2. [ ] Identify sensitive surfaces:
   - [ ] Auth flows (`apps/web/src/app/(auth)`, `apps/mobile/src/modules/auth`)
   - [ ] Authorization checks (`apps/web/src/lib/auth`, mobile permission services)
   - [ ] API routes (`apps/web/src/app/api`)
   - [ ] Supabase RLS/policies (`supabase/migrations`) and edge functions (`supabase/functions`)
3. [ ] Map the access control model:
   - [ ] List roles and permissions (web `rbac.ts`, mobile `permissionService.ts`)
   - [ ] Determine which protections are UI-only vs enforced server-side/RLS
   - [ ] Flag inconsistencies between web and mobile permission semantics
4. [ ] Perform OWASP Top 10 review (prioritize Broken Access Control and Injection):
   - [ ] IDOR checks on parameterized routes (e.g., `[executionId]`)
   - [ ] Input validation on API routes/server actions/edge functions
   - [ ] Safe redirect handling in callback and login flows
   - [ ] Error handling and information disclosure review
5. [ ] Supabase deep dive:
   - [ ] Verify all tables with sensitive data have RLS enabled
   - [ ] Review each policy for tenant scoping and least privilege
   - [ ] Review grants/privileges; ensure no broad anon/authenticated grants
   - [ ] Ensure service-role usage is justified and audited
6. [ ] Dependency and secret scanning:
   - [ ] Review dependency vulnerabilities and risky packages
   - [ ] Search for hardcoded secrets, tokens, API keys, and service-role usage in client code
7. [ ] Add/adjust tests:
   - [ ] Add regression tests for fixed issues (e2e fixtures, unit tests, or policy tests)
   - [ ] Include negative tests (unauthorized access attempts) and tenant boundary tests
8. [ ] Produce actionable findings:
   - [ ] Severity (Critical/High/Medium/Low) + impact + exploit scenario
   - [ ] Concrete remediation steps and code pointers
   - [ ] Suggested follow-ups (monitoring, rate limiting, audit logging)
9. [ ] Coordinate with owners:
   - [ ] Tag responsible teams/areas (web, mobile, data)
   - [ ] Propose safe rollout plan for breaking policy changes
10. [ ] Update documentation:
   - [ ] Record decisions and security assumptions in `../docs/security.md`
   - [ ] Add “how to verify” steps for future reviewers
11. [ ] Capture learnings:
   - [ ] Add checklist items or patterns to prevent recurrence
   - [ ] Recommend CI guardrails (dependency scan, secret scan, policy linting)

---

## Hand-off Notes (optional)

After completing an audit or remediation PR, leave a hand-off summary that includes:

- **What was reviewed** (directories, files, endpoints, Supabase tables/policies).
- **Key findings** with severity and status (fixed / accepted risk / needs follow-up).
- **Residual risks** (e.g., areas lacking server-side enforcement, untested RLS policies, missing rate limiting).
- **Verification steps** (how to confirm fixes: specific roles, endpoints, and example requests).
- **Follow-up actions**
  - Add/strengthen automated scanning (dependency + secret scanning).
  - Add security regression tests (IDOR, tenant boundary, permission bypass attempts).
  - Rotate any secrets if exposure is suspected.
  - Tighten policies iteratively with staged rollout to avoid breaking legitimate access.
