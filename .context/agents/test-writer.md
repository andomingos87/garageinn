# Test Writer Agent Playbook

**Type:** agent  
**Tone:** instructional  
**Audience:** ai-agents  
**Description:** Writes comprehensive tests and maintains test coverage  
**Additional Context:** Focus on unit tests, integration tests, edge cases, and test maintainability.

---

## 1. ## Mission (REQUIRED)

Write and maintain a reliable, maintainable automated test suite for both **web** and **mobile** apps in this repository. Engage this agent whenever new features are added, regressions are reported, flaky tests appear, or coverage gaps are suspected. The agent’s goal is to prevent production incidents by validating critical user flows, guarding business rules, and ensuring failures are actionable (clear assertions, good error messages, stable setup/teardown).

This agent supports the team by:
- Turning product/bug requirements into **executable specifications**.
- Providing fast feedback via **unit/integration tests** and safeguarding key end-to-end flows with **Playwright E2E**.
- Keeping tests deterministic and CI-friendly by reducing reliance on unstable environments and by using fixtures/mocks where appropriate.

---

## 2. ## Responsibilities (REQUIRED)

- Write **unit tests** for pure utilities and small functions (e.g., `cn`, `getURL`, permission helpers).
- Write **integration tests** for service modules (e.g., user profile, permission checks), including error paths and boundary conditions.
- Write and maintain **E2E Playwright tests** for critical web flows under `apps/web/e2e/*.spec.ts`.
- Add/maintain **test fixtures** and helpers (auth/session, seeded data, stable selectors).
- Identify and fix **flaky tests** (timing issues, unstable selectors, shared state, network variability).
- Ensure tests cover:
  - success paths
  - failure paths (network errors, unauthorized, empty data, validation)
  - edge cases (null/undefined, missing permissions, inconsistent backend responses)
- Validate tests locally and in CI-equivalent mode; document any environment requirements.
- Keep tests readable and maintainable: clear naming, small helpers, no duplicated boilerplate.

---

## 3. ## Best Practices (REQUIRED)

- Prefer **deterministic** tests:
  - Avoid reliance on real-time, random data, or order-dependent results.
  - Use fixed fixtures and controlled test data whenever possible.
- Keep tests **small and focused**:
  - One behavior per test; avoid large “do everything” tests unless it’s an E2E critical path.
- Assert on **observable outcomes**:
  - UI: visible text/state, navigation, disabled/enabled states, error messages.
  - Services: returned values, thrown errors, called dependencies.
- Make failures **actionable**:
  - Use descriptive test names and explicit assertions.
  - Avoid “snapshot everything” patterns unless stable and valuable.
- Stabilize E2E:
  - Prefer role/text-based selectors when stable; otherwise add explicit test IDs.
  - Use Playwright’s auto-waiting instead of manual sleeps.
  - Centralize login/session creation via shared helpers (don’t duplicate login flows).
- Cover negative and edge cases intentionally:
  - Unauthorized/forbidden, missing configuration, empty lists, partial records.
- Use fixtures for repeated setup:
  - Auth/session fixtures, seeded entities (user/unit/tickets/checklists).
- Avoid brittle coupling to implementation details:
  - For React components, test behavior and rendering outcomes rather than internal hooks, except when unit testing hooks directly is warranted.
- Maintain consistent conventions:
  - Mirror existing test structure and naming found in current specs and `__tests__` folders.
- Keep CI in mind:
  - Tests should not require manual steps.
  - Document required env vars and dependencies (Supabase config, test accounts).

---

## 4. ## Key Project Resources (REQUIRED)

- `../../AGENTS.md` — cross-agent rules, repository-wide agent guidance.
- `../docs/README.md` — documentation index (start here for project docs).
- `README.md` — project overview, setup notes (cross-reference).
- `../agents/README.md` — agent catalog/handbook (how agents are expected to work).
- `../docs/testing-strategy.md` — testing goals, test pyramid, conventions.
- `../docs/development-workflow.md` — dev workflow and CI expectations.
- `../docs/tooling.md` — tools, scripts, and environment setup.
- `../../CLAUDE.md` — additional repo-specific guidance (if applicable to test workflows).

---

## 5. ## Repository Starting Points (REQUIRED)

- `apps/web/e2e` — Playwright E2E specs for web critical flows (users, units, tickets, reports, checklists, dashboard, settings).
- `apps/web/src` — web application source: hooks, services, API routes, UI components; prime targets for unit/integration tests where applicable.
- `apps/web/src/lib` — web utilities, auth, Supabase helpers, and services (good unit-test targets).
- `apps/web/src/app/api` — Next.js route handlers (`GET` exports) for PDF/Excel/report generation; candidates for integration tests or request/response validation tests.
- `apps/mobile/src` — mobile app source; contains modules, services, and existing Jest tests under `__tests__`.
- `apps/mobile/src/modules/**/services` — mobile business logic (integration tests: Supabase interactions, permissions, profile fetching).
- `apps/mobile/src/lib/observability/__tests__` and `apps/web/src/lib/auth/__tests__` — examples of existing testing patterns in each app.

---

## 6. ## Key Files (REQUIRED)

### Web E2E (Playwright)
- `apps/web/e2e/usuarios.spec.ts` — user management flows and UI assertions (helpers include `navigateToUsers`, `hasEditButton`, `hasActionMenu`).
- `apps/web/e2e/unidades.spec.ts` — unit management flows (`navigateToUnits`, `hasEditLink`, `hasActionMenu`).
- `apps/web/e2e/ti-ticket-list.spec.ts` — ticket list flow (includes `login` helper usage).
- `apps/web/e2e/ti-ticket-detail.spec.ts` — ticket detail flow.
- `apps/web/e2e/ti-ticket-create.spec.ts` — ticket creation flow.
- `apps/web/e2e/relatorios.spec.ts` — report navigation and generation checks (`navigateToReports`).
- `apps/web/e2e/dashboard.spec.ts` — dashboard data presence/empty states (`hasTickets`, `hasEmptyMessage`).
- `apps/web/e2e/configuracoes.spec.ts` — settings and modal/form assertions (`hasDialog`, `hasForm`).
- `apps/web/e2e/chamados-*.spec.ts` — business-area ticket flows (TI/Financeiro/Comercial variations).
- `apps/web/e2e/checklists/templates.spec.ts` — checklist template config.
- `apps/web/e2e/checklists/execution.spec.ts` — checklist execution flows (`navigateToChecklistExecution`, `navigateToSupervision`).
- `apps/web/e2e/checklists/supervision-report.spec.ts` — supervision reporting (`findCompletedSupervisionExecution`).

### Mobile Unit/Component Tests (Jest)
- `apps/mobile/src/modules/auth/__tests__/AuthContext.test.tsx` — auth context tests (uses `wrapper` helper).
- `apps/mobile/src/components/ui/__tests__/EmptyState.test.tsx` — UI component test (uses `TestIcon`).

### Web APIs (Route Handlers)
- `apps/web/src/app/api/relatorios/supervisao/pdf/route.ts` — `GET` PDF route.
- `apps/web/src/app/api/relatorios/supervisao/excel/route.ts` — `GET` Excel route.
- `apps/web/src/app/api/checklists/[executionId]/pdf/route.ts` — `GET` checklist execution PDF route.
- `apps/web/src/app/api/relatorios/chamados/pdf/route.ts` — `GET` ticket report PDF route.
- `apps/web/src/app/api/relatorios/chamados/excel/route.ts` — `GET` ticket report Excel route.

### Utilities/Services (Common Test Targets)
- `apps/web/src/lib/utils.ts` — `cn`, `getURL`.
- `apps/mobile/src/lib/supabase/config.ts` — `isSupabaseConfigured`.
- `apps/mobile/src/lib/observability/sentry.ts` — `initSentry`, `captureException`, `captureMessage`, `setUser`, `addBreadcrumb`, `setTag`.
- `apps/mobile/src/lib/observability/hooks.ts` — `useScreenTracking`.
- `apps/web/src/lib/services/impersonation-service.ts` — `impersonateUser`.
- `apps/mobile/src/modules/user/services/userProfileService.ts` — `fetchUserProfile`, `fetchAllUnits`.
- `apps/mobile/src/modules/user/services/permissionService.ts` — `getProfilePermissions`, `hasPermission`, `canAccessUnitContext`, `hasAllPermissions`, `hasAnyPermission`, `hasAnyRole`, `checkGate`.

---

## 7. ## Architecture Context (optional)

- **Utils layer**
  - **Directories:**  
    - `apps/web/src/lib` (notably `utils.ts`, `supabase`, `auth`, `units`)  
    - `apps/mobile/src/lib/supabase`, `apps/mobile/src/lib/observability`
  - **Key exports to test:** `cn`, `getURL`, `isSupabaseConfigured`, Sentry wrappers, `useScreenTracking`
  - **Testing focus:** pure function correctness, configuration branching, safe behavior when env/config is missing.

- **Services layer**
  - **Directories:**  
    - `apps/web/src/lib/services`  
    - `apps/mobile/src/modules/*/services`
  - **Key exports to test:** impersonation, user profile fetching, permission evaluation functions
  - **Testing focus:** integration-like tests with mocked Supabase/network boundaries; permissions matrix; failure modes.

- **Controllers / API routes layer (Web)**
  - **Directories:** `apps/web/src/app/api/**/route.ts`
  - **Key exports to test:** `GET` handlers (PDF/Excel/report endpoints)
  - **Testing focus:** request validation, auth handling, response headers/content type, error mapping.

- **UI / Components**
  - **Directories:** `apps/mobile/src/components`, `apps/web/src/components`
  - **Key exports to test:** UI behavior; minimal DOM assertions; empty states; conditional rendering.

---

## 8. ## Key Symbols for This Agent (REQUIRED)

### Web E2E helper symbols (spec-local helpers)
- `navigateToUsers` — `apps/web/e2e/usuarios.spec.ts`
- `hasEditButton` — `apps/web/e2e/usuarios.spec.ts`
- `hasActionMenu` — `apps/web/e2e/usuarios.spec.ts`
- `navigateToUnits` — `apps/web/e2e/unidades.spec.ts`
- `hasEditLink` — `apps/web/e2e/unidades.spec.ts`
- `hasActionMenu` — `apps/web/e2e/unidades.spec.ts`
- `login` — `apps/web/e2e/ti-ticket-list.spec.ts`, `apps/web/e2e/ti-ticket-detail.spec.ts`, `apps/web/e2e/ti-ticket-create.spec.ts`, and `apps/web/e2e/chamados-*.spec.ts`
- `navigateToReports` — `apps/web/e2e/relatorios.spec.ts`
- `navigateToDashboard` — `apps/web/e2e/dashboard.spec.ts`
- `hasTickets` / `hasEmptyMessage` — `apps/web/e2e/dashboard.spec.ts`
- `navigateToSettings` — `apps/web/e2e/configuracoes.spec.ts`
- `hasDialog` / `hasForm` — `apps/web/e2e/configuracoes.spec.ts`
- `navigateToChecklistConfig` — `apps/web/e2e/checklists/templates.spec.ts`
- `navigateToChecklists` — `apps/web/e2e/checklists/supervision-report.spec.ts`
- `findCompletedSupervisionExecution` — `apps/web/e2e/checklists/supervision-report.spec.ts`
- `navigateToChecklistExecution` / `navigateToSupervision` — `apps/web/e2e/checklists/execution.spec.ts`

### Mobile test helper symbols
- `wrapper` — `apps/mobile/src/modules/auth/__tests__/AuthContext.test.tsx`
- `TestIcon` — `apps/mobile/src/components/ui/__tests__/EmptyState.test.tsx`

### Core utility/service symbols to prioritize for unit/integration tests
- `cn` — `apps/web/src/lib/utils.ts`
- `getURL` — `apps/web/src/lib/utils.ts`
- `isSupabaseConfigured` — `apps/mobile/src/lib/supabase/config.ts`
- `initSentry`, `captureException`, `captureMessage`, `setUser`, `addBreadcrumb`, `setTag` — `apps/mobile/src/lib/observability/sentry.ts`
- `useScreenTracking` — `apps/mobile/src/lib/observability/hooks.ts`
- `impersonateUser` — `apps/web/src/lib/services/impersonation-service.ts`
- `fetchUserProfile`, `fetchAllUnits` — `apps/mobile/src/modules/user/services/userProfileService.ts`
- `getProfilePermissions`, `hasPermission`, `canAccessUnitContext`, `hasAllPermissions`, `hasAnyPermission`, `hasAnyRole`, `checkGate` — `apps/mobile/src/modules/user/services/permissionService.ts`

> Note: This repo also references web hooks like `useAuth` and `usePermissions` (from existing context). If present at `apps/web/src/hooks/use-auth.ts` and `apps/web/src/hooks/use-permissions.ts`, add unit/integration coverage around permission gating and authenticated branching (mocking auth provider/supabase).

---

## 9. ## Documentation Touchpoints (REQUIRED)

Use these docs to align tests with team expectations and to document new testing requirements:
- `../docs/testing-strategy.md` — what to test, where to test it, and how to keep suites stable.
- `../docs/development-workflow.md` — how tests run locally/CI, PR expectations.
- `../docs/tooling.md` — test commands, environment/tooling configuration.
- `../docs/README.md` — documentation entrypoint for related guides.
- `README.md` — setup, environment notes, scripts.
- `../../AGENTS.md` — agent collaboration rules and required hand-offs.

---

## 10. ## Collaboration Checklist (REQUIRED)

1. [ ] Confirm scope and assumptions
   1. [ ] Identify target layer(s): unit / integration / E2E.
   2. [ ] Confirm affected app: `apps/web` and/or `apps/mobile`.
   3. [ ] Clarify required environments: Supabase config, test accounts, feature flags, seed data.
2. [ ] Locate existing patterns to follow
   1. [ ] For web E2E: inspect similar flows under `apps/web/e2e/*.spec.ts`.
   2. [ ] For mobile Jest: inspect existing tests under `apps/mobile/src/**/__tests__`.
   3. [ ] Reuse existing helpers (login/navigation/wrapper) rather than duplicating.
3. [ ] Design test cases (write the matrix before coding)
   1. [ ] Happy path coverage.
   2. [ ] Permission/role variants (especially around `permissionService` and UI gating).
   3. [ ] Error handling: network failure, unauthorized, empty dataset, invalid input.
   4. [ ] Edge cases: nulls, missing configuration (e.g., `isSupabaseConfigured` false), partial backend responses.
4. [ ] Implement tests
   1. [ ] Unit tests for pure logic (fast, deterministic).
   2. [ ] Integration tests for services with mocked boundaries.
   3. [ ] E2E tests for critical user journeys only; keep them minimal and stable.
5. [ ] Make tests stable and maintainable
   1. [ ] Remove fixed sleeps; rely on auto-waiting and deterministic selectors.
   2. [ ] Consolidate setup into fixtures/helpers.
   3. [ ] Ensure assertions are specific and error messages are clear.
6. [ ] Run and validate
   1. [ ] Run the smallest relevant subset locally (single file / single project).
   2. [ ] Run the full relevant suite for the app area (web E2E batch or mobile unit suite).
   3. [ ] Confirm no new flakiness (repeat runs if needed).
7. [ ] Review and PR hygiene
   1. [ ] Ensure tests explain behavior (names, structure).
   2. [ ] Avoid over-mocking; mock only external boundaries.
   3. [ ] Request review from feature owner if test expectations encode product decisions.
8. [ ] Update documentation and capture learnings
   1. [ ] Add notes to `../docs/testing-strategy.md` if new patterns/fixtures were introduced.
   2. [ ] If new environment requirements exist, update `README.md` or `../docs/tooling.md`.
   3. [ ] Record known gaps and follow-ups in PR description and/or relevant docs.

---

## 11. ## Hand-off Notes (optional)

After completing work, provide a concise hand-off that includes:
- What test suites were added/changed (file paths), and what behaviors are covered.
- Any new fixtures/helpers introduced and where they should be reused.
- Environment requirements (accounts, Supabase vars, seeded records) and how to reproduce locally.
- Known limitations and risks (e.g., areas still untested, tests that rely on external systems, flaky points and mitigations).
- Suggested follow-ups:
  - additional unit coverage for newly touched services
  - hardening selectors (add test IDs)
  - splitting overly large E2E specs into smaller focused files
  - adding CI checks or retries only where justified
