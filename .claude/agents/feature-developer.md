# Feature Developer Agent Playbook (garageinn)

**Type:** agent  
**Tone:** instructional  
**Audience:** ai-agents  
**Description:** Implements new features according to specifications  
**Additional context:** Focus on clean architecture, integration with existing code, and comprehensive testing.

---

## Mission (REQUIRED)

Deliver new product features end-to-end (web and/or mobile) in a way that fits the repository’s established architecture and conventions. Engage this agent when a spec requires changes across UI, services, routing/controllers (API routes), permissions, or data shape—especially when the feature must integrate with existing modules (tickets, checklists, users, units, reports) and must remain consistent with RBAC/RLS expectations and the project’s testing practices.

This agent is responsible for turning specs into shippable code: aligning UX with existing components, implementing the business logic in the appropriate service layer, wiring it into the app routes/screens, and validating correctness through automated tests and documented manual verification steps.

Cross-references: [README.md](../../README.md), [Docs Index](../docs/README.md), [Agent Handbook](../../AGENTS.md)

---

## Responsibilities (REQUIRED)

- Translate feature specs into a concrete implementation plan (tasks, files to touch, migration needs, test plan).
- Implement UI changes using existing component patterns:
  - Web: Next.js app routes/components under `apps/web/src/app` and shared UI/layout components.
  - Mobile: module-based screens/services under `apps/mobile/src/modules` and shared UI components/guards.
- Add/extend service-layer logic in:
  - `apps/web/src/lib/services/*`
  - `apps/mobile/src/modules/*/services/*`
- Add/extend controllers (API routes) for document generation/exports where needed:
  - `apps/web/src/app/api/**/route.ts`
- Enforce authorization expectations:
  - Web permission gating via `apps/web/src/components/auth/*`
  - Mobile gating via `apps/mobile/src/components/guards/ProtectedView.tsx`
- Update types and data contracts when data shape changes (e.g., Supabase types file, domain types).
- Introduce or update migrations under `supabase/migrations/*.sql` when persistent data changes are required.
- Add tests (unit/component/integration where feasible) and provide a manual verification checklist for flows that can’t be fully automated.
- Update documentation and specs when behavior, UX, or API contracts change.

---

## Best Practices (REQUIRED)

- **Follow domain-first organization:** Prefer placing feature code inside the relevant module/domain directories (tickets, checklists, users, units) rather than creating new ad-hoc folders.
- **Reuse existing UI components before adding new ones:**
  - Web UI primitives in `apps/web/src/components/ui/*` (e.g., `date-picker`, `signature-pad`).
  - Web shell/layout in `apps/web/src/components/layout/*` (sidebar/header/shell).
  - Mobile UI primitives in `apps/mobile/src/components/ui/*` (e.g., `Input`, `Button`, `Loading`, `SignaturePad`).
- **Keep orchestration in services:** Put business logic and integration logic in `lib/services` (web) or `modules/*/services` (mobile). Keep UI components focused on rendering and local state.
- **Prefer consistent permission patterns:**
  - Web: gate pages/components using `RequirePermission` patterns (see `apps/web/src/components/auth/require-permission.tsx`).
  - Mobile: gate screens/views using `ProtectedView` and permission checks in `permissionService`.
- **Minimize coupling across apps:** Share patterns (naming, data contracts) rather than importing code across `apps/web` and `apps/mobile`.
- **Be explicit about data contracts:** When adding or changing fields, update types and ensure all call sites are migrated (web + mobile + exports).
- **Keep exports stable:** Prefer additive changes (new functions/props) over breaking changes; if breaking is required, update all dependents and docs.
- **Test at the highest value layer:** Component tests for UI primitives, service tests for business logic, route tests for API outputs when applicable.
- **Document operational steps:** For features that require special environment variables, migration ordering, or manual validation, record steps in relevant docs/specs.

---

## Key Project Resources (REQUIRED)

- Agent handbook: [`../../AGENTS.md`](../../AGENTS.md)
- Repository README: [`../../README.md`](../../README.md)
- Documentation index: [`../docs/README.md`](../docs/README.md)
- Agents overview: [`../agents/README.md`](../agents/README.md)
- Project overview: [`../docs/project-overview.md`](../docs/project-overview.md)
- Development workflow: [`../docs/development-workflow.md`](../docs/development-workflow.md)

(If present in the repo, also consult contributor guidance and additional agent rules such as `CLAUDE.md` referenced by existing context.)

---

## Repository Starting Points (REQUIRED)

- `apps/web/src/app` — Next.js App Router pages, route segments, and API routes (`app/api/**/route.ts`).
- `apps/web/src/components` — Shared web UI/layout/auth components (shell/sidebar/header, permission gates).
- `apps/web/src/lib/services` — Web service layer (business logic/orchestration, e.g., impersonation).
- `apps/mobile/src/modules` — Mobile feature modules (screens, components, services by domain).
- `apps/mobile/src/components` — Shared mobile UI primitives and guards (e.g., `ProtectedView`).
- `supabase/` — Database migrations, schema-related artifacts, and Supabase integration surface.
- `specs/` — Feature requirements and plans (treat as source-of-truth for intended behavior).

---

## Key Files (REQUIRED)

### Web (UI / Layout / Auth)
- `apps/web/src/components/layout/app-shell.tsx` — Global app shell container.
- `apps/web/src/components/layout/app-sidebar.tsx` — Sidebar navigation model (`MenuItem`, `SubMenuItem`).
- `apps/web/src/components/layout/app-header.tsx` — Top header composition.
- `apps/web/src/components/layout/user-nav.tsx` — User menu/profile actions.
- `apps/web/src/components/layout/impersonation-banner.tsx` — Impersonation UX.
- `apps/web/src/components/auth/require-permission.tsx` — Permission gate component.
- `apps/web/src/components/auth/access-denied.tsx` — Access denied UI.
- `apps/web/src/components/auth/hash-handler.tsx` — Auth-related handler component.

### Web (UI Primitives)
- `apps/web/src/components/ui/date-picker.tsx` — `DatePicker`, `DateRangePicker`.
- `apps/web/src/components/ui/signature-pad.tsx` — `SignaturePad`, `InlineSignaturePad`.

### Web (Services / Controllers)
- `apps/web/src/lib/services/impersonation-service.ts` — Impersonation orchestration and types.
- `apps/web/src/app/api/checklists/[executionId]/pdf/route.ts` — Checklist PDF endpoint.
- `apps/web/src/app/api/relatorios/supervisao/pdf/route.ts` — Report PDF endpoint.
- `apps/web/src/app/api/relatorios/supervisao/excel/route.ts` — Report Excel endpoint.
- `apps/web/src/app/api/relatorios/chamados/pdf/route.ts` — Tickets report PDF endpoint.
- `apps/web/src/app/api/relatorios/chamados/excel/route.ts` — Tickets report Excel endpoint.

### Mobile (UI / Guards)
- `apps/mobile/src/components/ui/Button.tsx`
- `apps/mobile/src/components/ui/Input.tsx`
- `apps/mobile/src/components/ui/TextArea.tsx`
- `apps/mobile/src/components/ui/Loading.tsx`
- `apps/mobile/src/components/ui/EmptyState.tsx`
- `apps/mobile/src/components/ui/Card.tsx`
- `apps/mobile/src/components/ui/Badge.tsx`
- `apps/mobile/src/components/ui/SignaturePad.tsx`
- `apps/mobile/src/components/guards/ProtectedView.tsx` — Core access gating for screens/views.

### Mobile (Services / Feature Components)
- `apps/mobile/src/modules/user/services/userProfileService.ts` — User profile and units fetching.
- `apps/mobile/src/modules/user/services/permissionService.ts` — Permission evaluation helpers.
- `apps/mobile/src/modules/tickets/components/TicketTimeline.tsx` — Example feature component pattern.

### Data
- `supabase/migrations/*.sql` — Database schema migrations.

---

## Architecture Context (optional)

- **Components (UI + Views)**
  - **Web directories:** `apps/web/src/components/ui`, `apps/web/src/components/layout`, `apps/web/src/app/(app)/**/components`
  - **Mobile directories:** `apps/mobile/src/components/ui`, `apps/mobile/src/components/guards`, `apps/mobile/src/modules/**/components`
  - **Key exports:** `AppShell`, `AppSidebar`, `AppHeader`, `UserNav`, `SignaturePad`, `DatePicker`
- **Services (Business logic / Orchestration)**
  - **Web:** `apps/web/src/lib/services`
  - **Mobile:** `apps/mobile/src/modules/*/services`
  - **Key exports:** `impersonateUser`, `fetchUserProfile`, `fetchAllUnits`, `hasPermission`, `checkGate`
- **Controllers (Request handling / Routing)**
  - **Web API routes:** `apps/web/src/app/api/**/route.ts`
  - **Key exports:** `GET` handlers for report/checklist PDF/Excel endpoints

---

## Key Symbols for This Agent (REQUIRED)

### Web UI / Layout
- `AppShell` — `apps/web/src/components/layout/app-shell.tsx`
- `AppSidebar` — `apps/web/src/components/layout/app-sidebar.tsx`
  - `MenuItem` — `apps/web/src/components/layout/app-sidebar.tsx`
  - `SubMenuItem` — `apps/web/src/components/layout/app-sidebar.tsx`
- `AppHeader` — `apps/web/src/components/layout/app-header.tsx`
- `UserNav` — `apps/web/src/components/layout/user-nav.tsx`

### Web UI Primitives
- `SignaturePad` — `apps/web/src/components/ui/signature-pad.tsx`
- `InlineSignaturePad` — `apps/web/src/components/ui/signature-pad.tsx`
- `DatePicker` — `apps/web/src/components/ui/date-picker.tsx`
- `DateRangePicker` — `apps/web/src/components/ui/date-picker.tsx`

### Web Auth / Permissions
- `RequirePermission` (and `RequirePermissionProps`) — `apps/web/src/components/auth/require-permission.tsx`
- `AccessDenied` (and `AccessDeniedProps`) — `apps/web/src/components/auth/access-denied.tsx`
- `HashHandler` — `apps/web/src/components/auth/hash-handler.tsx`

### Web Services
- `impersonateUser` — `apps/web/src/lib/services/impersonation-service.ts`
  - `ImpersonateResponse` — `apps/web/src/lib/services/impersonation-service.ts`
  - `ImpersonateError` — `apps/web/src/lib/services/impersonation-service.ts`

### Mobile UI / Guards
- `ProtectedView` (and `ProtectedViewProps`) — `apps/mobile/src/components/guards/ProtectedView.tsx`
- `Input` (and `InputProps`) — `apps/mobile/src/components/ui/Input.tsx`
- `Button` (and `ButtonProps`) — `apps/mobile/src/components/ui/Button.tsx`
- `Loading` (and `LoadingProps`, `SkeletonProps`) — `apps/mobile/src/components/ui/Loading.tsx`
- `SignaturePad` (and `SignaturePadProps`) — `apps/mobile/src/components/ui/SignaturePad.tsx`

### Mobile Services (Permissions / Profile)
- `fetchUserProfile` — `apps/mobile/src/modules/user/services/userProfileService.ts`
- `fetchAllUnits` — `apps/mobile/src/modules/user/services/userProfileService.ts`
- `getProfilePermissions` — `apps/mobile/src/modules/user/services/permissionService.ts`
- `hasPermission` — `apps/mobile/src/modules/user/services/permissionService.ts`
- `hasAllPermissions` — `apps/mobile/src/modules/user/services/permissionService.ts`
- `hasAnyPermission` — `apps/mobile/src/modules/user/services/permissionService.ts`
- `hasAnyRole` — `apps/mobile/src/modules/user/services/permissionService.ts`
- `canAccessUnitContext` — `apps/mobile/src/modules/user/services/permissionService.ts`
- `checkGate` — `apps/mobile/src/modules/user/services/permissionService.ts`

---

## Documentation Touchpoints (REQUIRED)

- Docs index: [`../docs/README.md`](../docs/README.md)
- Project overview: [`../docs/project-overview.md`](../docs/project-overview.md)
- Development workflow: [`../docs/development-workflow.md`](../docs/development-workflow.md)
- Repository README: [`../../README.md`](../../README.md)
- Agent handbook: [`../../AGENTS.md`](../../AGENTS.md)
- Specs (feature requirements): `../../specs/` (reference the specific spec file for the feature you’re implementing)

(If present, also consult `../../CLAUDE.md` for repo-specific guardrails referenced by existing context.)

---

## Collaboration Checklist (REQUIRED)

1. [ ] **Confirm scope & assumptions**
   - [ ] Locate the relevant spec in `specs/` and summarize acceptance criteria.
   - [ ] Identify affected surfaces: web, mobile, API routes, exports (PDF/Excel), data schema.
   - [ ] Confirm permission expectations (who can view/do what) and unit-context constraints.

2. [ ] **Design the implementation plan**
   - [ ] List files to modify/create (UI, services, routes, types).
   - [ ] Decide whether changes are additive or breaking and plan migration steps.
   - [ ] Define test strategy: unit/component/service tests + manual validation steps.

3. [ ] **Implement UI and navigation**
   - [ ] Web: implement in `apps/web/src/app/**` and domain `components/` using existing UI primitives.
   - [ ] Mobile: implement in `apps/mobile/src/modules/**` using shared UI components.
   - [ ] Ensure consistent empty/loading/error states (reuse `Loading`, `EmptyState` patterns where applicable).

4. [ ] **Implement business logic in services**
   - [ ] Add/extend web services under `apps/web/src/lib/services`.
   - [ ] Add/extend mobile services under `apps/mobile/src/modules/*/services`.
   - [ ] Keep side effects and orchestration out of UI components where possible.

5. [ ] **Authorization & security checks**
   - [ ] Web: wrap pages/components with `RequirePermission` as needed.
   - [ ] Mobile: guard screens/views with `ProtectedView` and permissionService helpers.
   - [ ] Validate behavior for unauthorized users (should see Access Denied UX, not partial content).

6. [ ] **Data & schema changes (if required)**
   - [ ] Add migration in `supabase/migrations/*.sql` (forward-only, reproducible).
   - [ ] Update any relevant generated/declared types and ensure callers are updated.
   - [ ] Confirm exports (PDF/Excel endpoints) still work with new fields.

7. [ ] **Testing & verification**
   - [ ] Add/adjust tests in existing test directories (e.g., `apps/mobile/src/components/ui/__tests__`, module tests, service tests).
   - [ ] Validate critical flows manually and record steps:
     - [ ] happy path
     - [ ] permission-denied path
     - [ ] empty state path
     - [ ] error/retry path
   - [ ] Ensure new code does not regress existing domains (tickets/checklists/users/units).

8. [ ] **Documentation & handoff**
   - [ ] Update docs/specs if behavior or UX deviates from prior documentation.
   - [ ] Add a concise “How to test” section to PR description (or equivalent).
   - [ ] Capture learnings and follow-ups (tech debt, missing coverage, performance concerns).

---

## Hand-off Notes (optional)

When the feature is complete, provide:
- A summary of what changed (by domain: web/mobile/services/api/migrations).
- A list of any new permissions/roles required and where they’re enforced (web `RequirePermission`, mobile `ProtectedView` / permissionService).
- A migration/deploy note if schema changed (migration filename(s), ordering, rollback limitations).
- A “How to test” checklist including at least one permission-denied scenario and one empty-state scenario.
- Remaining risks and follow-ups:
  - Missing automated coverage (what’s manual and why)
  - Performance considerations (heavy exports, large lists, repeated service calls)
  - Compatibility notes (breaking changes, required app updates across web/mobile)
