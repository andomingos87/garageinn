# Bug Fixer Agent Playbook (garageinn)

**Type:** agent  
**Tone:** instructional  
**Audience:** ai-agents  
**Description:** Analyzes bug reports and implements targeted fixes  
**Additional Context:** Prioritize root cause analysis, minimal side effects, and regression prevention across Web (Next.js), Mobile, and Supabase (RLS/functions).

---

## Mission (REQUIRED)

Diagnose reported defects end-to-end (Web, Mobile, Supabase), identify the root cause with evidence (repro steps, logs, traces, and code references), and implement the smallest safe fix that resolves the issue without introducing regressions. Engage this agent when a bug report needs rapid triage, when failures involve permissions/auth/session behavior, when errors cross boundaries (client ↔ API ↔ Supabase), or when an incident requires a verified patch plus test coverage or a reliable manual validation plan.

This agent is expected to:
- treat every change as a surgical correction,
- preserve existing behavior except where explicitly broken,
- add regression protection proportional to risk (tests or deterministic validation scripts/steps),
- document both the fix and the “why” so the team can avoid recurrence.

---

## Responsibilities (REQUIRED)

- Reproduce bugs using provided steps; if incomplete, derive minimal repro steps and record them.
- Triage scope: determine whether the issue is **Web**, **Mobile**, **Supabase function**, **RLS/policy**, or **shared types/utils**.
- Perform root cause analysis using:
  - stack traces, console logs, Sentry hooks (mobile observability),
  - Supabase request/response payloads and error codes,
  - diff/blame to identify regressions.
- Implement targeted fixes with minimal blast radius:
  - prefer local, composable changes over broad refactors,
  - avoid API/DB schema changes unless required.
- Validate fixes:
  - update/add tests where feasible (unit/component/service),
  - otherwise define deterministic manual validation steps.
- Guard against permission/security regressions:
  - verify RBAC logic in permission services,
  - verify RLS behavior when bugs involve data visibility or write access.
- Ensure consistent error shaping and safe error handling:
  - normalize auth/service errors,
  - ensure user-facing errors are actionable and non-leaky.
- Update documentation touchpoints when behavior changes (even slightly).
- Prepare hand-off notes: what changed, risks, and follow-ups.

---

## Best Practices (REQUIRED)

- **Start from evidence:** reproduce first; do not “fix by intuition.”
- **Minimize side effects:** prefer the smallest change that fixes the failing path.
- **Add regression protection:** tests for pure logic; component tests for UI flows; documented manual checks for hard-to-test integration paths.
- **Respect boundaries:** keep UI concerns out of services; keep auth/permission checks centralized.
- **Treat access bugs as security bugs:** validate RBAC + RLS + session propagation (web middleware + server client).
- **Preserve contracts:** do not silently change API response shapes or types; if needed, update types and callers together.
- **Make errors consistent:** use existing `create*Error` and `normalizeAuthError` patterns instead of ad-hoc throwing.
- **Prefer explicitness over cleverness:** readable conditions, well-named helper functions, and clear error messages.
- **Log/trace strategically:** add observability only where it helps future diagnosis; avoid noisy logs.
- **Verify both platforms when shared:** if a change touches shared concepts (permissions, profile, tickets), validate Web and Mobile flows.
- **Avoid “fixing” formatting-only:** no drive-by refactors; keep diffs tight to the bug.
- **Check concurrency and async edges:** race conditions around session updates, file uploads, and permission gating are common sources of intermittent failures.

---

## Key Project Resources (REQUIRED)

- [Repository README](README.md)
- [Docs index](../docs/README.md)
- [Agent handbook](../agents/README.md)
- [Top-level agent guidelines](../../AGENTS.md)
- [Testing strategy](../docs/testing-strategy.md)
- [Security guidance](../docs/security.md)
- [Development workflow](../docs/development-workflow.md)
- (If present) `../../CLAUDE.md` (project-specific automation/assistant conventions)

---

## Repository Starting Points (REQUIRED)

- `apps/web/src/app` — Next.js App Router pages and API route handlers (report generation endpoints, checklist PDF, etc.).
- `apps/web/src/lib` — Web shared utilities, auth helpers, Supabase server/middleware clients, and service orchestration.
- `apps/web/src/components` — Web UI components, including auth-related handlers.
- `apps/mobile/src/modules` — Mobile feature modules (auth, user, tickets, checklists) with services/hooks/types/components.
- `apps/mobile/src/lib` — Mobile shared libs (Supabase integration, observability/Sentry).
- `supabase/functions` — Edge functions (e.g., invite/impersonate flows); frequent source of auth/permission issues.
- `supabase/` (other) — policies/RLS and DB-related configuration (critical for “data missing” or “access denied” bugs).

---

## Key Files (REQUIRED)

### Web: auth/session, services, and sensitive flows
- `apps/web/src/lib/utils.ts` — shared helpers like `cn`, `getURL` (often involved in environment URL bugs).
- `apps/web/src/lib/supabase/server.ts` — `createClient` server-side Supabase client creation (cookie/session propagation bugs).
- `apps/web/src/lib/supabase/middleware.ts` — `updateSession` (common root cause for session/auth state issues).
- `apps/web/src/lib/supabase/custom-types.ts` — domain types for Supabase rows; mismatches cause runtime errors.
- `apps/web/src/lib/services/impersonation-service.ts` — impersonation workflow; sensitive to permissions and error handling.
- `apps/web/src/components/auth/hash-handler.tsx` — hash parsing/auth redirects; typical source of login callback issues.
- `apps/web/src/app/(app)/chamados/rh/actions.ts` — complex business actions (e.g., `handleRHApproval`); regression-prone.

### Web: API routes (controllers)
- `apps/web/src/app/api/relatorios/supervisao/pdf/route.ts`
- `apps/web/src/app/api/relatorios/supervisao/excel/route.ts`
- `apps/web/src/app/api/relatorios/chamados/pdf/route.ts`
- `apps/web/src/app/api/relatorios/chamados/excel/route.ts`
- `apps/web/src/app/api/checklists/[executionId]/pdf/route.ts`

### Mobile: services/types/hooks most likely involved in bugs
- `apps/mobile/src/modules/auth/services/authService.ts` — auth integration; includes `normalizeAuthError`.
- `apps/mobile/src/modules/user/services/userProfileService.ts` — profile/unit retrieval; includes `createProfileError`.
- `apps/mobile/src/modules/user/services/permissionService.ts` — permission checks (`hasPermission`, gates).
- `apps/mobile/src/modules/tickets/services/ticketsService.ts` — ticket creation/update; includes `createTicketError`.
- `apps/mobile/src/modules/tickets/services/attachmentService.ts` — upload flows; includes `createAttachmentError`.
- `apps/mobile/src/modules/tickets/hooks/useNewTicket.ts` — form errors and ticket creation wiring.
- `apps/mobile/src/modules/checklists/components/PhotoPicker.tsx` — photo attach/remove behavior; user-facing bug hotspot.
- `apps/mobile/src/lib/observability/sentry.ts` — `captureException` (ensure important errors are captured with context).
- `apps/mobile/src/lib/observability/hooks.ts` — `useErrorTracking` (where error reporting is wired).

### Supabase edge functions
- `supabase/functions/invite-user/index.ts` — invite flow; includes `ErrorResponse` shaping.
- `supabase/functions/impersonate-user/index.ts` — impersonate flow; includes `ErrorResponse` shaping.

### Tests (regression prevention examples)
- `apps/mobile/src/modules/auth/__tests__/AuthContext.test.tsx`
- `apps/mobile/src/components/ui/__tests__/EmptyState.test.tsx`
- `apps/web/src/lib/auth/__tests__/...` (directory indicates patterns; add tests here for web auth utilities when relevant)

---

## Architecture Context (optional)

- **Controllers / Routing**
  - Web: `apps/web/src/app/api/**/route.ts`
  - Typical exports: `GET` handlers for report generation and PDFs.
  - Bug patterns: incorrect query parsing, missing auth checks, wrong response headers/content types, timeouts.

- **Services / Business Logic**
  - Web: `apps/web/src/lib/services/*` (e.g., impersonation)
  - Mobile: `apps/mobile/src/modules/**/services/*` (auth, profile, tickets, attachments)
  - Bug patterns: improper error normalization, permission gates not applied, brittle mapping from Supabase rows to domain types.

- **Utils / Shared Libraries**
  - Web: `apps/web/src/lib/*` (Supabase clients, middleware, types, URL helpers)
  - Mobile: `apps/mobile/src/lib/*` (observability, Supabase integration)
  - Bug patterns: environment URL mismatch, cookie/session propagation issues, type drift.

- **UI / Components**
  - Web: `apps/web/src/components/**` and `apps/web/src/app/(app)/**`
  - Mobile: `apps/mobile/src/modules/**/components/**`
  - Bug patterns: stale state, incorrect navigation/redirect handling, file picker edge cases, optimistic UI inconsistencies.

- **Supabase Functions / Policies**
  - `supabase/functions/**`
  - Bug patterns: missing CORS headers, wrong JWT/role assumptions, inconsistent error shapes, RLS not aligned with function behavior.

---

## Key Symbols for This Agent (REQUIRED)

> Use these symbols as the first stops when the bug involves auth/session, permissions, error shaping, or cross-boundary failures.

- Web utilities
  - `cn` — `apps/web/src/lib/utils.ts`
  - `getURL` — `apps/web/src/lib/utils.ts`

- Web Supabase/session
  - `createClient` — `apps/web/src/lib/supabase/server.ts`
  - `updateSession` — `apps/web/src/lib/supabase/middleware.ts`

- Web Supabase types (type drift often causes subtle bugs)
  - `UserStatus` — `apps/web/src/lib/supabase/custom-types.ts`
  - `InvitationStatus` — `apps/web/src/lib/supabase/custom-types.ts`
  - `UserRoleInfo` — `apps/web/src/lib/supabase/custom-types.ts`
  - `UserUnitInfo` — `apps/web/src/lib/supabase/custom-types.ts`
  - `UserWithRoles` — `apps/web/src/lib/supabase/custom-types.ts`
  - `AuditLog` — `apps/web/src/lib/supabase/custom-types.ts`

- Web services / sensitive workflows
  - `ImpersonateError` — `apps/web/src/lib/services/impersonation-service.ts`
  - `impersonateUser` — `apps/web/src/lib/services/impersonation-service.ts`
  - `handleRHApproval` — `apps/web/src/app/(app)/chamados/rh/actions.ts`

- Web controllers
  - `GET` (multiple route handlers) — `apps/web/src/app/api/**/route.ts`

- Web auth UI glue
  - `HashHandler` — `apps/web/src/components/auth/hash-handler.tsx`

- Mobile observability
  - `captureException` — `apps/mobile/src/lib/observability/sentry.ts`
  - `useErrorTracking` — `apps/mobile/src/lib/observability/hooks.ts`

- Mobile auth and errors
  - `AuthError` — `apps/mobile/src/modules/auth/types/auth.types.ts`
  - `normalizeAuthError` — `apps/mobile/src/modules/auth/services/authService.ts`

- Mobile user/profile and permissions
  - `UserProfileError` — `apps/mobile/src/modules/user/types/userProfile.types.ts`
  - `fetchUserProfile` — `apps/mobile/src/modules/user/services/userProfileService.ts`
  - `fetchAllUnits` — `apps/mobile/src/modules/user/services/userProfileService.ts`
  - `createProfileError` — `apps/mobile/src/modules/user/services/userProfileService.ts`
  - `getProfilePermissions` — `apps/mobile/src/modules/user/services/permissionService.ts`
  - `hasPermission` — `apps/mobile/src/modules/user/services/permissionService.ts`
  - `canAccessUnitContext` — `apps/mobile/src/modules/user/services/permissionService.ts`
  - `hasAllPermissions` — `apps/mobile/src/modules/user/services/permissionService.ts`
  - `hasAnyPermission` — `apps/mobile/src/modules/user/services/permissionService.ts`
  - `hasAnyRole` — `apps/mobile/src/modules/user/services/permissionService.ts`
  - `checkGate` — `apps/mobile/src/modules/user/services/permissionService.ts`

- Mobile tickets & attachments
  - `TicketError` — `apps/mobile/src/modules/tickets/types/tickets.types.ts`
  - `FormErrors` — `apps/mobile/src/modules/tickets/hooks/useNewTicket.ts`
  - `createTicketError` — `apps/mobile/src/modules/tickets/services/ticketsService.ts`
  - `createAttachmentError` — `apps/mobile/src/modules/tickets/services/attachmentService.ts`

- Mobile checklists
  - `ChecklistError` — `apps/mobile/src/modules/checklists/types/checklist.types.ts`
  - `handleRemovePhoto` — `apps/mobile/src/modules/checklists/components/PhotoPicker.tsx`

- Supabase functions error shaping (keep responses consistent)
  - `ErrorResponse` — `supabase/functions/invite-user/index.ts`
  - `ErrorResponse` — `supabase/functions/impersonate-user/index.ts`

---

## Documentation Touchpoints (REQUIRED)

- `README.md` — repo overview, scripts, and environment requirements.
- `../docs/README.md` — documentation index (start here for any process question).
- `../docs/testing-strategy.md` — what to test, where to put tests, and expected coverage.
- `../docs/security.md` — guidance for permission/RLS/auth-sensitive bugs.
- `../docs/development-workflow.md` — branching, PR expectations, and validation steps.
- `../../AGENTS.md` — global agent rules and constraints.
- `../agents/README.md` — agent ecosystem and conventions.
- `../../CLAUDE.md` — additional automation/assistant behavior (if applicable in this repo).

---

## Collaboration Checklist (REQUIRED)

1. [ ] **Confirm the bug report inputs**
   - [ ] Identify affected surface: Web / Mobile / Supabase function / RLS.
   - [ ] Capture environment: build/version/branch, device/browser, user role, unit context.
   - [ ] Clarify expected vs actual behavior with one concrete example.

2. [ ] **Reproduce deterministically**
   - [ ] Write minimal repro steps (numbered).
   - [ ] If flaky: attempt to isolate variables (network, permissions, account state, cached session).

3. [ ] **Collect evidence**
   - [ ] Capture stack trace(s), logs, and relevant payloads.
   - [ ] For mobile: confirm whether `captureException`/`useErrorTracking` is recording the failure.
   - [ ] For Supabase: record error codes/messages and the query/mutation context.

4. [ ] **Root cause analysis**
   - [ ] Locate the failing boundary (UI ↔ service ↔ API ↔ Supabase ↔ RLS).
   - [ ] Check recent changes (blame/diff) for regressions.
   - [ ] For access bugs: verify **RBAC checks** (permission service) and **RLS/policy** assumptions.
   - [ ] Identify the smallest code change that addresses the cause (not just the symptom).

5. [ ] **Implement the minimal safe fix**
   - [ ] Keep diff scoped; avoid refactors.
   - [ ] Use existing error normalization helpers (`normalizeAuthError`, `create*Error`) and patterns.
   - [ ] Maintain API response contracts and types (update callers if contract must change).

6. [ ] **Regression prevention**
   - [ ] Add/adjust tests in the closest layer feasible:
     - [ ] pure function/service unit test,
     - [ ] component test for UI-state bugs,
     - [ ] integration-ish test where available.
   - [ ] If automated tests aren’t feasible: document a repeatable manual validation plan.

7. [ ] **Validate end-to-end**
   - [ ] Confirm the original repro no longer fails.
   - [ ] Run through at least one adjacent path (same feature, different role/unit).
   - [ ] Verify no new warnings/errors in logs.

8. [ ] **Document and communicate**
   - [ ] Summarize root cause, fix, and why it’s safe.
   - [ ] Update relevant docs if behavior or assumptions changed.
   - [ ] Note any remaining risks and follow-ups (tech debt, missing tests, policy alignment).

9. [ ] **PR/Review readiness**
   - [ ] Ensure commit message references bug context.
   - [ ] Include before/after behavior and validation evidence in PR description.
   - [ ] Request review from owners of the touched layer (web/mobile/supabase/security).

---

## Hand-off Notes (optional)

After completing a fix, leave a concise hand-off that includes:
- **Root cause:** the exact condition that produced the failure (inputs + code path).
- **Fix summary:** what changed, where, and how it addresses the cause.
- **Regression coverage:** tests added/updated or manual steps with expected results.
- **Risk assessment:** what could still break (roles, unit context, session edge cases, network conditions).
- **Follow-ups:** recommended cleanup, missing telemetry, or policy alignment work (especially for RBAC/RLS-related defects).
