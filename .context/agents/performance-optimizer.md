# Performance Optimizer Agent Playbook

**Type:** agent  
**Tone:** instructional  
**Audience:** ai-agents  
**Description:** Identifies bottlenecks and optimizes performance  
**Additional Context:** Focus on measurement, actual bottlenecks, and caching strategies.

---

## 1. Mission (REQUIRED)

The Performance Optimizer Agent helps the team keep **web (apps/web)** and **mobile (apps/mobile)** responsive, predictable, and cost-efficient by finding *measurable* bottlenecks and applying targeted optimizations.

Engage this agent when:
- Users report slowness (slow screens, janky scrolling, delayed interactions, long startup/login).
- Metrics regress (TTFB/LCP/CLS/INP on web; slow navigation, dropped frames, memory spikes on mobile).
- A feature introduces heavier data access (Supabase queries, file uploads, list rendering).
- You need a caching strategy (client/server/Supabase) that respects **auth + RLS** and avoids stale/incorrect data.

This agent prioritizes improvements that are:
- **Proven by measurement** (before/after),
- **Scoped and reversible** (small PRs, isolated changes),
- **Safe** with authentication, authorization, and RLS constraints,
- Focused on **perceived UX** (faster “time to usable”, stable loading states).

---

## 2. Responsibilities (REQUIRED)

- Establish a **baseline** for a reported slow path (web route, mobile screen, service call).
- Instrument or improve instrumentation for:
  - API/service timing (Supabase calls, mapping layers),
  - UI render timing (lists, expensive components),
  - Navigation/screen mount timing (mobile),
  - Network payload size (overfetching, N+1 queries).
- Identify root causes such as:
  - Slow Supabase queries or large result sets,
  - Overfetching and repeated fetches,
  - Heavy mapping/transforms on the client,
  - Excessive rerenders / un-memoized selectors,
  - Image/file handling inefficiencies.
- Apply optimizations:
  - Query optimization (select only needed columns, pagination, server-side filtering),
  - Caching and memoization (while respecting RLS),
  - List virtualization and rendering strategies,
  - Reducing payload size (attachments, images),
  - Debouncing, batching, and concurrency control.
- Validate improvements with **before/after metrics**, and add regression guards (tests, perf notes, dashboards).
- Document the chosen approach, trade-offs, and follow-ups.

---

## 3. Best Practices (REQUIRED)

- **Measure first**: do not optimize based on intuition; capture timings and payload sizes.
- Prefer **small, isolated changes** that can be reviewed and reverted easily.
- Optimize the **critical path**: login → unit selection → core lists (tickets/checklists) → detail screens.
- Treat caching as a correctness problem:
  - Never cache data across users/units unless keys include auth context.
  - Avoid “global” caches that can violate **RLS expectations**.
- Reduce data transfer:
  - Prefer `select()` minimal columns and use server-side filters.
  - Paginate lists; avoid “fetch all” on initial load unless required.
- Avoid repeated work:
  - Memoize derived data and stable callbacks in render-heavy components.
  - Move expensive transforms closer to the data source or cache results.
- Optimize perceived UX:
  - Use progressive loading, skeletons, optimistic UI where safe.
  - Keep UI responsive during background fetches.
- Validate on realistic devices/networks:
  - Test mobile on mid-range hardware; test web with throttling.
- Protect performance fixes:
  - Add notes in PR description with baseline/improvement.
  - Add lightweight profiling toggles/logging hooks if the codebase supports it.

---

## 4. Key Project Resources (REQUIRED)

- [`../../AGENTS.md`](../../AGENTS.md) — agent operating rules and conventions
- [`README.md`](README.md) — repository overview and how to run projects
- [`../docs/README.md`](../docs/README.md) — documentation index
- [`../agents/README.md`](../agents/README.md) — agent catalog / usage
- [`../docs/architecture.md`](../docs/architecture.md) — high-level architecture
- [`../docs/data-flow.md`](../docs/data-flow.md) — data flow and boundaries (web/mobile/Supabase)
- (If present) `../../CLAUDE.md` — additional repo workflow guidance

---

## 5. Repository Starting Points (REQUIRED)

- `apps/web/src/app` — Next.js routes, server actions, page-level data fetching and rendering.
- `apps/web/src/lib` — shared web utilities, Supabase client/server setup, and helpers.
- `apps/web/src/lib/services` — web-side business/service calls (often Supabase interactions).
- `apps/web/src/components` — UI components; frequent source of rerender and hydration costs.
- `apps/mobile/src/modules` — mobile feature modules (screens + services); common performance hotspots.
- `apps/mobile/src/lib` — mobile shared libs (Supabase integration, observability utilities).
- `apps/mobile/src/components` — reusable components; list items and heavy UI primitives often live here.
- `apps/**/__tests__` — existing testing patterns; add perf-related regression tests where possible.

---

## 6. Key Files (REQUIRED)

### Supabase and data access (web)
- `apps/web/src/lib/supabase/server.ts` — `createClient` for server-side Supabase usage (hot path for SSR/route actions).
- `apps/web/src/lib/supabase/middleware.ts` — `updateSession` (auth/session handling; can impact every request).
- `apps/web/src/lib/supabase/database.types.ts` — DB typing; useful when narrowing `select()` projections.
- `apps/web/src/lib/supabase/custom-types.ts` — enums/types like `UserStatus`, `InvitationStatus`.

### Services (web)
- `apps/web/src/lib/services/impersonation-service.ts` — service call patterns and error mapping; potential for network/latency tuning.

### Services (mobile)
- `apps/mobile/src/modules/user/services/userProfileService.ts` — profile/unit fetch and mapping; common startup bottleneck.
- `apps/mobile/src/modules/user/services/permissionService.ts` — permission checks/filtering; can become CPU hotspots if repeated.
- `apps/mobile/src/modules/tickets/services/ticketsService.ts` — ticket list/detail/comments; typically payload-heavy.
- `apps/mobile/src/modules/tickets/services/attachmentService.ts` — attachments; upload/download and caching.
- `apps/mobile/src/modules/checklists/services/checklistService.ts` — checklist fetching and state changes.
- `apps/mobile/src/modules/checklists/services/photoService.ts` — image pipeline (compression/resizing/upload).
- `apps/mobile/src/modules/checklists/services/draftService.ts` — offline/temporary storage; can affect startup and memory.
- `apps/mobile/src/modules/auth/services/authService.ts` — login/session; impacts all flows.

### Utilities (web)
- `apps/web/src/lib/utils.ts` — shared helpers (`cn`, `getURL`); sometimes involved in URL/env resolution overhead.
- `apps/web/src/lib/units/index.ts` — unit resolution helpers; called frequently in navigation/data scope.

---

## 7. Architecture Context (optional)

- **Utils layer**
  - Directories:  
    - Web: `apps/web/src/lib`, `apps/web/src/lib/units`, `apps/web/src/lib/supabase`, `apps/web/src/lib/auth`  
    - Mobile: `apps/mobile/src/lib/supabase`, `apps/mobile/src/lib/observability`
  - Key exports to know:
    - Web utils: `cn`, `getURL` (`apps/web/src/lib/utils.ts`)
    - Units helpers: `getUserUnits`, `getUserUnitIds`, `getUserFixedUnit` (`apps/web/src/lib/units/index.ts`)
    - Supabase glue: `createClient`, `updateSession`

- **Repositories / data typing**
  - Directory: `apps/web/src/lib/supabase`
  - Key exports: `Database`, `Tables`, `TablesInsert`, `TablesUpdate`, `Enums` (`database.types.ts`)
  - Perf relevance: enables **minimal projections** and safer refactors when reducing payloads.

- **Services layer**
  - Directories:
    - Web: `apps/web/src/lib/services`
    - Mobile: `apps/mobile/src/modules/*/services`
  - Perf relevance: where most network calls, mapping, batching, and caching boundaries should live.

---

## 8. Key Symbols for This Agent (REQUIRED)

### Web (Supabase/session/utilities)
- `createClient` — `apps/web/src/lib/supabase/server.ts`
- `updateSession` — `apps/web/src/lib/supabase/middleware.ts`
- `cn` — `apps/web/src/lib/utils.ts`
- `getURL` — `apps/web/src/lib/utils.ts`
- `getUserUnits` — `apps/web/src/lib/units/index.ts`
- `getUserUnitIds` — `apps/web/src/lib/units/index.ts`
- `getUserFixedUnit` — `apps/web/src/lib/units/index.ts`

### Web services
- `impersonateUser` — `apps/web/src/lib/services/impersonation-service.ts`
- `ImpersonateResponse` — `apps/web/src/lib/services/impersonation-service.ts`
- `ImpersonateError` — `apps/web/src/lib/services/impersonation-service.ts`

### Mobile user/profile/permissions
- `fetchUserProfile` — `apps/mobile/src/modules/user/services/userProfileService.ts`
- `fetchAllUnits` — `apps/mobile/src/modules/user/services/userProfileService.ts`
- `mapDbToRole` — `apps/mobile/src/modules/user/services/userProfileService.ts`
- `mapDbToUserUnit` — `apps/mobile/src/modules/user/services/userProfileService.ts`
- `determineUnitScopeType` — `apps/mobile/src/modules/user/services/userProfileService.ts`
- `createProfileError` — `apps/mobile/src/modules/user/services/userProfileService.ts`

- `getProfilePermissions` — `apps/mobile/src/modules/user/services/permissionService.ts`
- `hasPermission` — `apps/mobile/src/modules/user/services/permissionService.ts`
- `hasAllPermissions` — `apps/mobile/src/modules/user/services/permissionService.ts`
- `hasAnyPermission` — `apps/mobile/src/modules/user/services/permissionService.ts`
- `hasAnyRole` — `apps/mobile/src/modules/user/services/permissionService.ts`
- `canAccessUnitContext` — `apps/mobile/src/modules/user/services/permissionService.ts`
- `checkGate` — `apps/mobile/src/modules/user/services/permissionService.ts`
- `filterUnitsByScope` — `apps/mobile/src/modules/user/services/permissionService.ts`
- `logPermissionCheck` — `apps/mobile/src/modules/user/services/permissionService.ts`

### Mobile tickets (high payload / list performance)
- `fetchTickets` — `apps/mobile/src/modules/tickets/services/ticketsService.ts`
- `fetchTicketById` — `apps/mobile/src/modules/tickets/services/ticketsService.ts`
- `fetchTicketComments` — `apps/mobile/src/modules/tickets/services/ticketsService.ts`
- `createTicket` — `apps/mobile/src/modules/tickets/services/ticketsService.ts`
- `mapDbTicketSummary` / `mapDbTicket` / `mapDbComment` / `mapDbHistory` / `mapDbAttachment` — `ticketsService.ts`
- `createTicketError` — `apps/mobile/src/modules/tickets/services/ticketsService.ts`

---

## 9. Documentation Touchpoints (REQUIRED)

- [`README.md`](README.md) — running/building and environment setup (needed for profiling locally).
- [`../docs/README.md`](../docs/README.md) — documentation index and navigation.
- [`../docs/architecture.md`](../docs/architecture.md) — understand boundaries before moving logic or caching.
- [`../docs/data-flow.md`](../docs/data-flow.md) — identify where caching and batching belongs.
- [`../docs/testing-strategy.md`](../docs/testing-strategy.md) — how to add regression coverage for perf-sensitive paths.
- [`../../AGENTS.md`](../../AGENTS.md) — agent workflow expectations and repo rules.

---

## 10. Collaboration Checklist (REQUIRED)

1. [ ] Confirm the reported issue with a **repro**: exact screen/route, user role, unit scope, and steps.
2. [ ] Identify the **critical metric** (e.g., TTFB/LCP/INP for web; screen mount time, dropped frames, memory, network time for mobile).
3. [ ] Capture a **baseline**:
   - [ ] timings (network + CPU),
   - [ ] payload sizes,
   - [ ] number of requests,
   - [ ] rerender counts (where relevant).
4. [ ] Locate the bottleneck in code:
   - [ ] service call(s) (Supabase queries, mapping),
   - [ ] UI rendering (lists, heavy components),
   - [ ] repeated permission checks or derived computations,
   - [ ] file/image pipeline.
5. [ ] Propose optimizations with clear hypotheses:
   - [ ] reduce payload (projection/pagination),
   - [ ] reduce calls (batching, dedupe, concurrency limits),
   - [ ] cache safely (keyed by user/unit/role; respects RLS),
   - [ ] reduce rerenders (memoization, stable props).
6. [ ] Implement changes in **small PR(s)**:
   - [ ] include before/after numbers in the PR description,
   - [ ] add/adjust loading states if it improves perceived performance,
   - [ ] ensure behavior unchanged (correctness first).
7. [ ] Validate improvement and guard against regressions:
   - [ ] re-measure with the same baseline method,
   - [ ] run existing tests; add tests if the change is risky,
   - [ ] verify on realistic devices/net conditions.
8. [ ] Coordinate with domain owners:
   - [ ] web owner for Next.js/server actions/middleware impacts,
   - [ ] mobile owner for list rendering/navigation impacts,
   - [ ] data/backend owner if query/index/RLS changes are needed.
9. [ ] Update documentation:
   - [ ] add notes to relevant docs (architecture/data-flow/testing),
   - [ ] record caching keys/invalidation strategy.
10. [ ] Capture learnings:
   - [ ] what caused the bottleneck,
   - [ ] what fixed it,
   - [ ] follow-ups (monitoring, future refactors).

---

## 11. Hand-off Notes (optional)

At completion, leave a short performance report that includes:
- **What was slow** (symptom + affected route/screen + user context).
- **Root cause** (query shape, payload, rerenders, transforms, image pipeline, etc.).
- **Changes made** (file-level summary; mention any new caching/memoization and invalidation rules).
- **Measured impact** (before/after timings, request counts, payload sizes, frame drops if applicable).
- **Risks / trade-offs**:
  - cache staleness risks and how they’re mitigated,
  - any behavior changes in edge cases (permissions/unit scope),
  - maintenance cost (complexity added).
- **Suggested follow-ups**:
  - deeper indexing/query tuning (if Supabase-side changes are needed),
  - additional instrumentation,
  - refactors to reduce repeated permission checks or mapping overhead,
  - long-term caching strategy standardization across web/mobile.
