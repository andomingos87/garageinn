# Testing Strategy

This document describes how testing is approached in the **garageinn** monorepo, which contains:

- **Web app** (Next.js) in `apps/web`
- **Mobile app** (React Native) in `apps/mobile`
- **Supabase** (DB/functions) under `supabase/`

The goal is to keep feedback loops fast (unit tests + lint/typecheck) while still protecting critical user flows (web E2E).

---

## Goals and principles

### What we optimize for
- **Confidence on critical flows**: authentication, permissions/RBAC, tickets (“chamados”), checklists, reports, and configuration screens.
- **Fast developer feedback**: most changes should be validated quickly with linting, typechecks, and focused unit tests.
- **Stable CI**: avoid flaky tests; prefer deterministic assertions and stable selectors.

### Testing pyramid used here
1. **Static checks**: lint + TypeScript typecheck (always required)
2. **Unit tests**: core logic and pure functions (especially on mobile)
3. **Integration/service tests**: service-layer behavior (where present)
4. **E2E tests (web)**: protect end-to-end flows with Playwright

---

## Test types and where they live

### 1) Static checks (quality gates)
These are treated as baseline requirements before merging:

- **Lint**: `npm run lint`
- **Typecheck**: `npm run typecheck`

These checks catch a large class of issues (incorrect props/types, unreachable code, unsafe patterns) before runtime tests even run.

---

### 2) Unit tests (primarily mobile)
**Framework:** Jest  
**Location/convention:** `apps/mobile/**/__tests__` and `*.test.ts(x)` patterns.

Use unit tests for:
- permission checks and mapping logic
- formatting/parsing utilities
- small hooks/services with clear boundaries
- regressions that are hard to validate via UI tests

You can find unit tests in places such as:
- `apps/mobile/src/components/ui/__tests__`
- `apps/mobile/src/lib/observability/__tests__`
- `apps/web/src/lib/auth/__tests__` (web has some unit tests too)

**When to add a unit test**
- A bug fix in a deterministic piece of logic
- Complex branching logic (permissions, state transitions, mapping)
- Anything that can be tested without rendering a full app screen

---

### 3) Integration / service-layer tests
Where service boundaries exist (for example, “service” modules wrapping API/Supabase calls), prefer testing:
- request/response handling
- error mapping and fallbacks
- permission and access rules at the service boundary

This repo includes service modules in:
- `apps/web/src/lib/services`
- `apps/mobile/src/modules/**/services`

If a service test would require real Supabase access, prefer **mocking** at the boundary unless the test is explicitly an environment-backed E2E/system test.

---

### 4) Web E2E tests (Playwright)
**Framework:** Playwright  
**Location:** `apps/web/e2e`

E2E tests protect the highest-value flows in the web application. This repo contains many E2E specs organized around core features, for example:

- Users: `apps/web/e2e/usuarios.spec.ts`
- Units: `apps/web/e2e/unidades.spec.ts`
- Dashboard: `apps/web/e2e/dashboard.spec.ts`
- Reports: `apps/web/e2e/relatorios.spec.ts`
- Settings: `apps/web/e2e/configuracoes.spec.ts`
- Tickets (“chamados”): multiple specs under `apps/web/e2e/` (e.g. TI/Financeiro/Comercial)
- Checklists: `apps/web/e2e/checklists/*`

There are also reusable auth helpers/fixtures:
- `apps/web/e2e/fixtures/auth.ts` (e.g., `loginAsAdmin`, `loginAsSupervisor`, etc.)

**When to add an E2E test**
- Any change that affects a **critical web flow** (auth, permissions, ticket lifecycle, checklist execution, reporting exports)
- Changes in navigation/routing or page composition in `apps/web/src/app/(app)` and related components
- Any bug that only appears when multiple layers interact (UI → server actions → Supabase → UI)

---

## How to run tests

From the repository root:

### Run everything
```bash
npm run test
```

### Web E2E (Playwright)
```bash
npm run test:e2e
```

### Web E2E in UI mode (helpful for debugging/flakes)
```bash
npm run test:e2e:ui
```

### Mobile unit tests (Jest)
Run from `apps/mobile`:
```bash
npm test
```

### Lint and typecheck
```bash
npm run lint
npm run typecheck
```

> Tip: In practice, run **lint + typecheck** before pushing, and run E2E when you touch critical web flows.

---

## What must be tested (merge expectations)

### Always required
- `npm run lint`
- `npm run typecheck`

### Required when changing critical web flows
- Playwright E2E coverage for the affected flow(s), or updates to existing E2E specs.

### Extra caution areas (explicit verification expected)
- **Auth changes** (login/session/impersonation behavior)
- **RLS / permissions** (Supabase policies, role/permission mapping)
- **RBAC** changes (new roles, new permissions, scope changes)

If you change anything in these areas, validate via:
- existing E2E tests (and extend them if needed)
- manual verification in a safe environment (if the change affects production access rules)
- targeted unit tests for permission mapping logic where applicable

---

## Writing reliable tests (project conventions)

### Web E2E reliability
- Prefer stable selectors and user-facing roles where possible.
- Keep assertions focused on outcomes (what the user sees/can do).
- Reuse shared login/navigation utilities from `apps/web/e2e/fixtures/auth.ts` and any helper functions inside specs.
- Avoid hard-coded waits; rely on Playwright auto-waiting and explicit expectations.

### Mobile unit tests
- Test pure logic first (utilities, reducers, mapping).
- Keep UI tests focused and minimal; prefer testing components that encapsulate reusable behavior (e.g., UI primitives).

---

## Troubleshooting

### Flaky E2E tests
1. Re-run locally in UI mode:
   ```bash
   npm run test:e2e:ui
   ```
2. Inspect screenshots/traces recorded by Playwright.
3. Check the local artifacts directory used for Playwright runs:
   - `.playwright-mcp/` (screenshots and related artifacts)

Common causes:
- unstable selectors
- timing assumptions (asserting before UI state settles)
- environment-dependent data

---

## Related documentation

- [`development-workflow.md`](./development-workflow.md)
