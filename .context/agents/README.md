# Feature Developer Agent Playbook (garageinn)

## Mission
Deliver new product features end-to-end (web and/or mobile) with minimal regression risk by:
- implementing UI + service orchestration consistently with existing patterns
- respecting authorization/permissions and unit-context access rules
- adding/adjusting API routes (web) when needed (PDF/Excel/export patterns exist)
- shipping with appropriate tests (where the repo already has coverage patterns)

---

## Where to Work (Primary Areas)

### Web app (Next.js App Router)
**Root:** `apps/web/src/app`

Focus areas:
- **Pages & routing (App Router):**
  - `apps/web/src/app/(app)/**` — authenticated application routes (dashboards, users, units, checklists, tickets/chamados, settings/configurações).
  - `apps/web/src/app/(auth)/**` — login/recovery/reset flows.
  - `apps/web/src/app/api/**` — route handlers for server-side endpoints (notably report exports and checklist PDF).
- **UI building blocks:**
  - `apps/web/src/components/ui/**` — shared UI components (e.g., `date-picker`, `signature-pad`).
  - `apps/web/src/components/layout/**` — shell/navigation structure (`AppShell`, `AppSidebar`, `AppHeader`, `UserNav`).
- **Auth & permission gating:**
  - `apps/web/src/components/auth/**` — permission gate components and auth helpers (`require-permission`, `access-denied`, `hash-handler`).
- **Services (client-side orchestration / API calls):**
  - `apps/web/src/lib/services/**` — e.g., impersonation (`impersonation-service.ts`).

### Mobile app (React Native)
**Root:** `apps/mobile/src`

Focus areas:
- **Modules (feature slices):**
  - `apps/mobile/src/modules/**` — feature modules (auth, home, notifications, profile, settings, tickets, checklists).
  - Each module typically has `screens/`, `components/`, `services/`.
- **Shared UI:**
  - `apps/mobile/src/components/ui/**` — reusable primitives (`Button`, `Input`, `TextArea`, `Loading`, `Card`, `EmptyState`, `Badge`, `SignaturePad`).
- **Guards / authorization:**
  - `apps/mobile/src/components/guards/ProtectedView.tsx` — permission and access gating.
- **Services:**
  - `apps/mobile/src/modules/*/services/**` — data fetching and domain helpers.
  - `apps/mobile/src/modules/user/services/permissionService.ts` — canonical permission helpers.

---

## Key Files & What They’re For (Start Here)

### Web
- `apps/web/src/components/layout/app-shell.tsx` — overall app layout wrapper.
- `apps/web/src/components/layout/app-sidebar.tsx` — nav structure; defines menu item types (`MenuItem`, `SubMenuItem`) and likely where new sections get added.
- `apps/web/src/components/layout/app-header.tsx` — header composition.
- `apps/web/src/components/layout/user-nav.tsx` — user menu; often where profile/logout/impersonation UI is integrated.
- `apps/web/src/components/auth/require-permission.tsx` — permission gating wrapper for UI/route-level content.
- `apps/web/src/components/auth/access-denied.tsx` — standard access denied UI.
- `apps/web/src/lib/services/impersonation-service.ts` — impersonation workflow (`impersonateUser`, error typing).

Notable UI primitives:
- `apps/web/src/components/ui/date-picker.tsx` — shared date selection patterns (`DatePicker`, `DateRangePicker`).
- `apps/web/src/components/ui/signature-pad.tsx` — signature capture components (`SignaturePad`, `InlineSignaturePad`).

API patterns (exports/reports):
- `apps/web/src/app/api/relatorios/**/route.ts` — PDF/Excel exports patterns.
- `apps/web/src/app/api/checklists/[executionId]/pdf/route.ts` — checklist execution PDF export.

### Mobile
- `apps/mobile/src/components/guards/ProtectedView.tsx` — permission checks, “access denied” rendering, and guarding patterns.
- `apps/mobile/src/modules/user/services/permissionService.ts` — permission and role evaluation helpers:
  - `hasPermission`, `hasAllPermissions`, `hasAnyPermission`, `hasAnyRole`
  - `canAccessUnitContext`, `checkGate`
- `apps/mobile/src/modules/user/services/userProfileService.ts` — profile fetching and units (`fetchUserProfile`, `fetchAllUnits`).
- `apps/mobile/src/modules/tickets/components/TicketTimeline.tsx` — example of a feature-specific complex component.

---

## Feature Delivery Workflow (Recommended)

### 1) Clarify the Feature Slice
Before coding, pin down:
- **Platform(s):** web, mobile, or both
- **Entry point:** which route/screen introduces it (e.g., a new `(app)` page on web or a module screen on mobile)
- **Permissions:** required permissions/roles, and whether it’s unit-scoped
- **Data needs:** what API/service calls are required and where they should live

**Output of this step (write in PR description):**
- A short bullet list: routes/screens touched, permissions enforced, services created/updated.

---

### 2) Implement UI in the Correct Layer

#### Web (Next.js)
- Prefer composing from `apps/web/src/components/ui/**` and `apps/web/src/components/layout/**`.
- If it’s domain-specific UI, place it under the relevant route’s `components/` directory, e.g.:
  - `apps/web/src/app/(app)/checklists/**/components`
  - `apps/web/src/app/(app)/chamados/**/components`
- If it’s truly reusable, promote it to:
  - `apps/web/src/components/ui/**` (generic UI)
  - `apps/web/src/components/layout/**` (layout/nav UI)

#### Mobile
- Put domain components under `apps/mobile/src/modules/<domain>/components`.
- Put new screens under `apps/mobile/src/modules/<domain>/screens`.
- Use shared UI primitives from `apps/mobile/src/components/ui` unless the styling/behavior is very feature-specific.

---

### 3) Add/Update Services for Data Access
Keep orchestration out of UI when possible.

#### Web
- Put cross-feature service calls in `apps/web/src/lib/services/**`.
- Follow existing service patterns (typed response objects; explicit error types exist in impersonation service).

#### Mobile
- Keep API/domain calls in `apps/mobile/src/modules/<domain>/services/**`.
- For permissions, reuse `permissionService.ts` helpers instead of duplicating logic.

---

### 4) Enforce Permissions & Access Control

#### Web gating pattern
- Wrap feature blocks (or entire pages) with `RequirePermission` from:
  - `apps/web/src/components/auth/require-permission.tsx`
- Standardize denied state with:
  - `apps/web/src/components/auth/access-denied.tsx`

**Rule:** Don’t rely on “hiding menu items” alone—guard the route/page content too.

#### Mobile gating pattern
- Use `ProtectedView`:
  - `apps/mobile/src/components/guards/ProtectedView.tsx`
- Evaluate access with `permissionService.ts` helpers:
  - `hasPermission`, `hasAnyPermission`, etc.
  - `canAccessUnitContext` for unit-scoped actions

**Rule:** If unit context matters, enforce it in guard logic (not only in the UI component).

---

### 5) Add/Adjust Navigation

#### Web
- Add new sections/routes to the sidebar via:
  - `apps/web/src/components/layout/app-sidebar.tsx`
- If user menu needs updates (profile actions, impersonation link), use:
  - `apps/web/src/components/layout/user-nav.tsx`

#### Mobile
- Add routes/screens following module conventions (module-level navigation not listed here; follow existing module patterns in `screens/`).

---

### 6) API Route Handlers (Web exports & server endpoints)
If the feature includes downloads/exports/SSR-style endpoints:
- Implement under `apps/web/src/app/api/**/route.ts`
- Use the existing patterns in:
  - `apps/web/src/app/api/relatorios/**`
  - `apps/web/src/app/api/checklists/[executionId]/pdf/route.ts`

**Conventions to follow:**
- Export `GET` function for GET routes (existing files do this).
- Keep route logic cohesive: parsing params, fetching data, returning file response.

---

## Common Feature Scenarios (Step-by-Step)

### A) Add a new “(app)” web page with guarded access
1. Create route folder under `apps/web/src/app/(app)/<feature>` (or nested under an existing domain).
2. Implement page + domain components under `<route>/components`.
3. Wrap page content with `RequirePermission`.
4. Add navigation entry in `AppSidebar` if it should appear in main nav.
5. Use shared UI (`DatePicker`, `SignaturePad`, etc.) when appropriate.
6. Add API routes under `apps/web/src/app/api` if the feature requires server endpoints.

---

### B) Add a new mobile screen in an existing module
1. Add screen to `apps/mobile/src/modules/<domain>/screens`.
2. Compose UI from `apps/mobile/src/components/ui` primitives.
3. Use module services under `apps/mobile/src/modules/<domain>/services`.
4. Wrap content in `ProtectedView` if permission-gated.
5. For permission logic, use `permissionService.ts` helpers.
6. Ensure loading/empty/error states use shared components (`Loading`, `EmptyState`).

---

### C) Add a reusable UI component
**Web:**
- Add to `apps/web/src/components/ui/…`
- Export with a clear prop type (existing components export `*Props` types).

**Mobile:**
- Add to `apps/mobile/src/components/ui/…`
- Follow the prop-typing pattern used by existing primitives (`ButtonProps`, `InputProps`, etc.).

**Rule:** If the component is only used by one route/module, keep it local to that feature.

---

## Best Practices Observed in This Repo (Adopt These)

### 1) Prefer typed, explicit interfaces
The codebase exports prop types and response/error types (e.g., `ImpersonateResponse`, `ImpersonateError`, `*Props` types). Continue this:
- export `Props` types for new components
- define explicit response shapes for service calls and API handlers

### 2) Centralize access control logic
- Web: standardize on `RequirePermission` + `AccessDenied`
- Mobile: standardize on `ProtectedView` + `permissionService`

### 3) Use shared UI primitives consistently
- Web: reuse `date-picker` and `signature-pad` where applicable
- Mobile: reuse `Button`, `Input`, `Loading`, `EmptyState`, `Card`, etc.

### 4) Keep features grouped by domain
The repo is strongly domain-oriented (`checklists`, `chamados/tickets`, `usuarios`, `unidades`).
- place code under the corresponding domain folder
- avoid creating “misc” folders for feature code

### 5) Don’t couple exports to UI
Export/report generation is implemented in API route handlers. Keep heavy file generation out of client components.

---

## Testing Guidance (Use Existing Patterns)
Known test presence:
- `apps/mobile/src/components/ui/__tests__` — UI tests exist for mobile components.
- `apps/mobile/src/modules/auth/__tests__` — module-level tests exist for auth.

Recommended approach:
- If you add/modify mobile shared UI: add/extend tests under `apps/mobile/src/components/ui/__tests__`.
- If you change auth flows or auth services: follow `apps/mobile/src/modules/auth/__tests__` patterns.
- For web: if no established test harness is obvious in this context, prioritize:
  - type safety
  - isolated logic in services that can be unit-tested later
  - small, composable components

(If the repository contains a web test setup, follow its existing conventions; otherwise, don’t introduce a new framework without explicit request.)

---

## Pull Request Checklist (Feature Developer)
- [ ] Feature implemented in the correct layer (route/module + components + services)
- [ ] Permissions enforced (web `RequirePermission`; mobile `ProtectedView` + `permissionService`)
- [ ] Navigation updated where needed (web sidebar/user nav)
- [ ] Reused existing shared UI components (date picker, signature pad, mobile primitives)
- [ ] API routes follow existing `GET` route handler patterns (if applicable)
- [ ] Loading/empty/error states handled with shared patterns (`Loading`, `EmptyState`, `AccessDenied`)
- [ ] Tests updated/added where existing suites already cover similar areas
- [ ] No duplicated permission logic (reused canonical helpers)

---

## Quick File Map (Cheat Sheet)
- Web layout/nav:  
  - `apps/web/src/components/layout/app-shell.tsx`  
  - `apps/web/src/components/layout/app-sidebar.tsx`  
  - `apps/web/src/components/layout/app-header.tsx`  
  - `apps/web/src/components/layout/user-nav.tsx`
- Web auth/permissions:  
  - `apps/web/src/components/auth/require-permission.tsx`  
  - `apps/web/src/components/auth/access-denied.tsx`
- Web exports/API:  
  - `apps/web/src/app/api/relatorios/**/route.ts`  
  - `apps/web/src/app/api/checklists/[executionId]/pdf/route.ts`
- Mobile guards/permissions:  
  - `apps/mobile/src/components/guards/ProtectedView.tsx`  
  - `apps/mobile/src/modules/user/services/permissionService.ts`
- Mobile shared UI:  
  - `apps/mobile/src/components/ui/{Button,Input,TextArea,Loading,EmptyState,Card,Badge,SignaturePad}.tsx`

---
