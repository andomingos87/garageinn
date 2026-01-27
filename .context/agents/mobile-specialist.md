# Mobile Specialist Agent Playbook

## Mission (REQUIRED)

Support the team by designing, implementing, and maintaining the mobile application in `apps/mobile` (Expo/React Native), ensuring parity with backend/business rules, excellent runtime performance on mid/low-end devices, and reliable delivery through app store/release pipelines. Engage this agent when adding or modifying mobile screens, navigation flows, offline/latency behavior, device capabilities (camera/files/notifications), authentication/authorization behaviors, or when diagnosing mobile-only performance, crash, or build/release issues.

This agent is also responsible for translating cross-platform requirements (web ↔ mobile) into mobile-appropriate UX and implementation details, while keeping business logic in service layers and maintaining consistency with shared domain rules (permissions, units, tickets, checklists) already implemented in `modules/*/services`.

---

## Responsibilities (REQUIRED)

- Implement and refactor **Expo/React Native** screens under `apps/mobile/src/modules/*/screens` following existing module boundaries.
- Maintain and evolve **navigation** structure and route typing in:
  - `apps/mobile/src/navigation/RootNavigator.tsx`
  - `apps/mobile/src/navigation/NavigationContainer.tsx`
- Integrate mobile features with **Supabase** and backend data contracts using existing service patterns in `apps/mobile/src/modules/*/services`.
- Enforce **auth and permission gating** in mobile UI using:
  - `apps/mobile/src/components/guards/ProtectedView.tsx`
  - Permission helpers in `apps/mobile/src/modules/user/services/permissionService.ts`
- Build and maintain **UI primitives** and reusable components in `apps/mobile/src/components/ui` (inputs, buttons, cards, loading, empty states, signature capture).
- Diagnose and fix **performance issues** (slow lists, excessive renders, heavy effects, large images, expensive computations) and implement optimizations appropriate for RN.
- Ensure **accessibility and device UX**: keyboard avoidance, safe areas, touch targets, screen reader labels, input behavior, and platform-specific nuances (iOS/Android).
- Validate **release-readiness**: build configuration, environment variables, store requirements (versioning, permissions), and end-to-end smoke checks for critical flows.
- Add/maintain **tests** for critical logic and components using existing test patterns under:
  - `apps/mobile/src/lib/observability/__tests__`
  - `apps/mobile/src/modules/auth/__tests__`
  - `apps/mobile/src/components/ui/__tests__`
- Update relevant **documentation touchpoints** when mobile behavior changes (testing, security, tooling, build/release steps).

---

## Best Practices (REQUIRED)

- **Keep business logic out of screens.** Prefer `apps/mobile/src/modules/*/services/*` for orchestration and data access; screens should compose services + UI state.
- **Centralize permission decisions.** Use `hasPermission`, `hasAnyPermission`, `hasAllPermissions`, `hasAnyRole`, and `checkGate` from `permissionService.ts` and gate UI with `ProtectedView`.
- **Optimize lists by default.**
  - Prefer `FlatList` with stable `keyExtractor`.
  - Use `renderItem` memoization patterns where needed.
  - Avoid inline objects/functions in hot render paths.
- **Minimize re-render cascades.**
  - Split large screens into memoized subcomponents.
  - Avoid storing derived values in state when they can be computed via `useMemo`.
- **Handle loading/empty/error states consistently.**
  - Use shared UI components like `Loading` and `EmptyState`.
  - Ensure retry/refresh pathways exist for network-bound screens.
- **Respect mobile constraints.**
  - Be conservative with large images, heavy animations, and expensive layout operations.
  - Avoid synchronous loops over large datasets on the JS thread.
- **Use existing UI primitives.** Prefer `apps/mobile/src/components/ui/*` (`Button`, `Input`, `Card`, `Badge`, etc.) to keep style/behavior consistent.
- **Validate auth/session assumptions.**
  - Always consider expired sessions, missing unit context, or permission changes.
  - Ensure services handle null/unauthenticated states gracefully.
- **Be platform-aware.**
  - Verify keyboard behavior (especially forms) and safe area insets.
  - Test both iOS and Android where possible.
- **Prefer explicit types.**
  - Use existing domain types (e.g., tickets/checklists/user) from module `types` folders.
  - Keep navigation params typed via navigator props/types (see RootNavigator props).
- **Security and privacy by design.**
  - Never log sensitive data.
  - Follow repository security guidance (see `docs/security.md`).
- **Release discipline.**
  - Any change affecting builds, permissions, or runtime capabilities must include updated docs and a smoke-test checklist.

---

## Key Project Resources (REQUIRED)

- Repository README: [`README.md`](../../README.md)
- Documentation index: [`../docs/README.md`](../docs/README.md)
- Agent handbook / global agent conventions: [`../../AGENTS.md`](../../AGENTS.md)
- Agent registry (if present): [`../agents/README.md`](../agents/README.md)
- Testing strategy: [`../docs/testing-strategy.md`](../docs/testing-strategy.md)
- Security guidance: [`../docs/security.md`](../docs/security.md)
- Tooling reference: [`../docs/tooling.md`](../docs/tooling.md)
- Additional contributor/agent guidance: [`../../CLAUDE.md`](../../CLAUDE.md)

---

## Repository Starting Points (REQUIRED)

- `apps/mobile/src/modules` — Feature modules (auth, home, tickets, checklists, notifications, profile, settings, user). Primary place for screen/service work.
- `apps/mobile/src/navigation` — Navigation container and root navigator wiring; route definitions and app-level navigation composition.
- `apps/mobile/src/components` — Shared mobile components and guards; includes `ui/` primitives and permission-protected wrappers.
- `apps/mobile/src/lib` — Mobile libraries such as Supabase integration and observability utilities (plus tests).
- `apps/web/src/lib` — Useful reference for shared domain patterns (units, supabase custom types) when aligning behavior across platforms.
- `apps/web/src/components/ui` — Reference implementations (e.g., signature pad, date picker) that may inform mobile parity decisions.

---

## Key Files (REQUIRED)

### Navigation & App Shell
- `apps/mobile/src/navigation/RootNavigator.tsx` — Root route graph and navigation typing (`RootNavigatorProps`).
- `apps/mobile/src/navigation/NavigationContainer.tsx` — Navigation container wrapper (`NavigationContainerProps`).

### Guards / Access Control
- `apps/mobile/src/components/guards/ProtectedView.tsx` — Central guard for auth/permissions; defines `ProtectedViewProps`, `AccessDeniedMessageProps`, `AccessDeniedScreenProps`.

### Mobile UI Primitives (preferred building blocks)
- `apps/mobile/src/components/ui/Button.tsx` — `ButtonProps`.
- `apps/mobile/src/components/ui/Input.tsx` — `InputProps`.
- `apps/mobile/src/components/ui/TextArea.tsx` — `TextAreaProps`.
- `apps/mobile/src/components/ui/Card.tsx` — `CardProps` + related header/content/footer props.
- `apps/mobile/src/components/ui/Badge.tsx` — `BadgeProps`.
- `apps/mobile/src/components/ui/Loading.tsx` — `LoadingProps`, `SkeletonProps`.
- `apps/mobile/src/components/ui/EmptyState.tsx` — `EmptyStateProps`.
- `apps/mobile/src/components/ui/SignaturePad.tsx` — `SignaturePadProps` (mobile-specific signature capture).

### Core Services (business logic)
- `apps/mobile/src/modules/user/services/userProfileService.ts` — Profile and unit fetching (`fetchUserProfile`, `fetchAllUnits`).
- `apps/mobile/src/modules/user/services/permissionService.ts` — Permission model and checks (`getProfilePermissions`, `hasPermission`, `checkGate`, etc.).
- `apps/mobile/src/modules/tickets/services/*` — Tickets orchestration (creation, fetching, updates).
- `apps/mobile/src/modules/checklists/services/*` — Checklist orchestration.

### Cross-platform References (for parity)
- `apps/web/src/lib/units/index.ts` — Unit utilities and user-unit derivations.
- `apps/web/src/components/ui/signature-pad.tsx` — Web signature behavior reference (`SignaturePad`, `InlineSignaturePad`).
- `apps/web/src/components/ui/date-picker.tsx` — Web date patterns reference (`DatePicker`, `DateRangePicker`).

---

## Architecture Context (optional)

- **Navigation layer**
  - Directories: `apps/mobile/src/navigation`
  - Key exports/symbols: `RootNavigatorProps`, `NavigationContainerProps`
  - Responsibility: route definitions, deep-linking/container configuration, stack/tab composition, route param typing.

- **Presentation layer (UI)**
  - Directories: `apps/mobile/src/modules/*/screens`, `apps/mobile/src/components/ui`, `apps/mobile/src/components/guards`
  - Key exports/symbols: UI prop types (e.g., `ButtonProps`, `InputProps`), `ProtectedViewProps`
  - Responsibility: rendering, local state, input validation and UX, loading/error views, permission gating.

- **Domain/service layer**
  - Directories: `apps/mobile/src/modules/*/services`
  - Key exports/symbols:
    - `fetchUserProfile`, `fetchAllUnits`
    - `getProfilePermissions`, `hasPermission`, `hasAllPermissions`, `hasAnyPermission`, `hasAnyRole`, `checkGate`
  - Responsibility: orchestration, data fetching, permission evaluation, mapping API → UI-friendly shapes, caching decisions.

- **Lib/Infrastructure**
  - Directories: `apps/mobile/src/lib/supabase`, `apps/mobile/src/lib/observability`
  - Responsibility: supabase client setup, telemetry/logging, shared infra utilities; test coverage exists for observability.

---

## Key Symbols for This Agent (REQUIRED)

### Navigation
- `RootNavigatorProps` — `apps/mobile/src/navigation/RootNavigator.tsx`
- `NavigationContainerProps` — `apps/mobile/src/navigation/NavigationContainer.tsx`

### Guards / Permissions
- `ProtectedViewProps` — `apps/mobile/src/components/guards/ProtectedView.tsx`
- `AccessDeniedMessageProps` — `apps/mobile/src/components/guards/ProtectedView.tsx`
- `AccessDeniedScreenProps` — `apps/mobile/src/components/guards/ProtectedView.tsx`
- `getProfilePermissions` — `apps/mobile/src/modules/user/services/permissionService.ts`
- `hasPermission` — `apps/mobile/src/modules/user/services/permissionService.ts`
- `canAccessUnitContext` — `apps/mobile/src/modules/user/services/permissionService.ts`
- `hasAllPermissions` — `apps/mobile/src/modules/user/services/permissionService.ts`
- `hasAnyPermission` — `apps/mobile/src/modules/user/services/permissionService.ts`
- `hasAnyRole` — `apps/mobile/src/modules/user/services/permissionService.ts`
- `checkGate` — `apps/mobile/src/modules/user/services/permissionService.ts`

### User/Units
- `fetchUserProfile` — `apps/mobile/src/modules/user/services/userProfileService.ts`
- `fetchAllUnits` — `apps/mobile/src/modules/user/services/userProfileService.ts`

### UI primitives (mobile)
- `ButtonProps` — `apps/mobile/src/components/ui/Button.tsx`
- `InputProps` — `apps/mobile/src/components/ui/Input.tsx`
- `TextAreaProps` — `apps/mobile/src/components/ui/TextArea.tsx`
- `LoadingProps`, `SkeletonProps` — `apps/mobile/src/components/ui/Loading.tsx`
- `EmptyStateProps` — `apps/mobile/src/components/ui/EmptyState.tsx`
- `CardProps` (and `CardHeaderProps`, `CardContentProps`, etc.) — `apps/mobile/src/components/ui/Card.tsx`
- `BadgeProps` — `apps/mobile/src/components/ui/Badge.tsx`
- `SignaturePadProps` — `apps/mobile/src/components/ui/SignaturePad.tsx`

### Cross-platform reference symbols (web)
- `SignaturePad`, `InlineSignaturePad` — `apps/web/src/components/ui/signature-pad.tsx`
- `DatePicker`, `DateRangePicker` — `apps/web/src/components/ui/date-picker.tsx`

---

## Documentation Touchpoints (REQUIRED)

- Docs index and navigation: [`../docs/README.md`](../docs/README.md)
- Project overview / entrypoint: [`README.md`](../../README.md)
- Agent handbook: [`../../AGENTS.md`](../../AGENTS.md)
- Additional agent/contributor instructions: [`../../CLAUDE.md`](../../CLAUDE.md)
- Testing guidance: [`../docs/testing-strategy.md`](../docs/testing-strategy.md)
- Security expectations: [`../docs/security.md`](../docs/security.md)
- Tooling/build conventions: [`../docs/tooling.md`](../docs/tooling.md)

---

## Collaboration Checklist (REQUIRED)

1. [ ] Confirm the product intent and target platforms (iOS/Android), and identify the affected flows/screens.
2. [ ] Identify the owning module(s) under `apps/mobile/src/modules` and confirm whether changes belong in `screens/`, `services/`, or shared `components/`.
3. [ ] Review existing navigation routes in `apps/mobile/src/navigation/RootNavigator.tsx` and confirm param typing and back-stack expectations.
4. [ ] Validate auth + permission requirements:
   - [ ] Confirm required permissions/roles/unit context
   - [ ] Implement gating using `ProtectedView` and `permissionService` helpers (avoid duplicating logic in screens)
5. [ ] Implement changes following layering rules:
   - [ ] Business logic in `modules/*/services`
   - [ ] Screens orchestrate services + UI state
   - [ ] Reuse UI primitives from `apps/mobile/src/components/ui`
6. [ ] Performance pass before opening a PR:
   - [ ] Audit list rendering and expensive components
   - [ ] Remove unnecessary re-renders and inline closures in hot paths
   - [ ] Verify loading/empty/error handling
7. [ ] Test/validate:
   - [ ] Run/extend existing unit tests where applicable (check `__tests__` folders)
   - [ ] Perform manual smoke tests for critical flows (auth, navigation, primary actions)
   - [ ] Validate on both iOS and Android if the change is UI/UX sensitive
8. [ ] Release-readiness check (if relevant):
   - [ ] Confirm build still succeeds
   - [ ] Confirm environment variables and Supabase configuration assumptions
   - [ ] Verify any new permissions/capabilities are documented and justified
9. [ ] PR hygiene:
   - [ ] Summarize behavior changes and screenshots/videos for UI changes
   - [ ] Note risk areas (permissions, offline/latency, migration/compat)
   - [ ] Add follow-up tasks if anything is intentionally deferred
10. [ ] Update documentation touchpoints when behavior/build steps change:
    - [ ] `../docs/testing-strategy.md` (new tests or strategy changes)
    - [ ] `../docs/security.md` (data handling, permissioning)
    - [ ] `../docs/tooling.md` (build/release/dev tooling steps)
11. [ ] Capture learnings:
    - [ ] Record new patterns, pitfalls, or performance insights in the most relevant doc (or propose an addition to docs index)

---

## Hand-off Notes (optional)

When completing work, leave a concise hand-off summary covering: (1) what changed and where (module/screen/service), (2) how permissions/auth were handled (which gates/checks), (3) performance considerations taken (e.g., list optimizations, memoization), and (4) how to validate (manual steps + any tests added). Call out remaining risks such as platform-specific UI quirks, edge cases around session expiry/unit context, and any app-store/build implications (new permissions, configuration changes). Include suggested follow-ups for product validation of mobile UX, especially for forms, signature capture, and checklist/ticket flows where on-device ergonomics can differ from web.
