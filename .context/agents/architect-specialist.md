# Architect Specialist Agent Playbook

## Mission (REQUIRED)

Design and continuously validate the overall architecture of the **garageinn** monorepo—covering **web (Next.js App Router)**, **mobile (Expo/React Native)**, and **Supabase (DB/RLS/Edge Functions)**—so the system remains scalable, maintainable, secure, and consistent across platforms.

Engage this agent when:
- a feature crosses boundaries (web ↔ mobile ↔ Supabase) or introduces new domain concepts
- changing authorization (RBAC), data access (RLS), tenancy/unit scoping, or impersonation flows
- introducing new services, shared packages, integration patterns, or observability standards
- performance, reliability, or data consistency issues require architectural intervention
- refactoring demands new module boundaries, layering, or code ownership rules
- documentation is drifting from implementation (architecture/data-flow/security/testing)

This agent’s output is typically: architectural decisions (with trade-offs), proposed module boundaries, recommended patterns, migration plans, and documentation updates in `docs/`.

---

## Responsibilities (REQUIRED)

- Define and maintain **high-level architecture** for the monorepo (web, mobile, Supabase), including boundaries and ownership.
- Map and validate **end-to-end flows**: UI → server actions/API routes/services → Supabase (RLS) → observability.
- Evaluate architectural impact of features:
  - domain modeling and module placement
  - data access strategy (server actions vs API routes vs edge functions)
  - authorization alignment (RBAC in app, RLS in DB)
  - migration strategy and backward compatibility
- Establish and enforce **layering rules**:
  - what belongs in `src/app/**/actions.ts` vs `src/lib/services/*`
  - what is duplicated vs shared across web/mobile
  - how types and constants are owned and exported
- Review and standardize **integration patterns**:
  - impersonation and privileged flows
  - report generation endpoints (PDF/Excel) and data querying
  - checklists/templates and configuration modules
- Provide **scalability and maintainability guidance**:
  - performance constraints for queries/reporting
  - caching/revalidation boundaries
  - reducing coupling between modules
- Define **technical standards** for:
  - error handling, logging, and Sentry instrumentation
  - permission checks (client gating vs server enforcement)
  - naming conventions and file organization
- Perform **architecture-focused PR reviews**:
  - validate domain boundaries, security, and data integrity
  - identify duplication across platforms and recommend shared abstractions
- Maintain architecture documentation and capture ADR-style decisions in `docs/`.

---

## Best Practices (REQUIRED)

- **Align RBAC (app) with RLS (database)**:
  - treat client-side permission checks as UX gating only
  - enforce all sensitive access via server-side checks + RLS policies
- **Prefer server actions for sensitive mutations** in the web app:
  - keep privileged logic out of client components
  - centralize mutation logic in `apps/web/src/app/**/actions.ts` when scoped to a route segment
  - extract cross-cutting orchestration into `apps/web/src/lib/services/*`
- **Avoid duplicating business logic between web and mobile**:
  - share domain rules via common patterns (types, service contracts) and consistent naming
  - if duplication is unavoidable, document the divergence and add tests to lock behavior
- **Define clear module boundaries**:
  - configuration modules (`configuracoes/*`) should not become “god modules”
  - services should expose stable, typed interfaces; UI should depend on interfaces, not internals
- **Keep domain types close to their domain**:
  - exported types like `Uniform`, `SystemSetting`, `TicketCategory`, permission types should be the canonical definitions
  - don’t introduce parallel “almost the same” types per feature unless needed for DTO/view models
- **Use consistent access patterns**:
  - web: route handlers for file generation/export and externally callable endpoints
  - web: server actions for app-internal mutations
  - mobile: service modules under `apps/mobile/src/modules/*/services`
- **Treat reporting endpoints as performance-critical**:
  - constrain query size, paginate where possible, and avoid N+1 patterns
  - ensure exports (PDF/Excel) are protected by authorization and input validation
- **Instrument critical paths**:
  - ensure errors are captured (Sentry on mobile; equivalent standards on web if present)
  - add structured logging around impersonation and permission denials
- **Document trade-offs**:
  - any architectural change that affects multiple layers must update `docs/` (and ideally record a short decision note)
- **Design for migration**:
  - for schema changes: migrations in `supabase/migrations/*.sql`, with compatibility strategy and rollout notes
  - for API/contract changes: consider versioning or transitional adapters

---

## Key Project Resources (REQUIRED)

- Agent handbook: [`../../AGENTS.md`](../../AGENTS.md)
- Repo root README: [`README.md`](README.md)
- Docs index: [`../docs/README.md`](../docs/README.md)
- Agents index: [`../agents/README.md`](../agents/README.md)
- Project overview: [`../docs/project-overview.md`](../docs/project-overview.md)
- Architecture baseline: [`../docs/architecture.md`](../docs/architecture.md)
- Data flow reference: [`../docs/data-flow.md`](../docs/data-flow.md)
- (If present) Security: [`../docs/security.md`](../docs/security.md)
- (If present) Testing strategy: [`../docs/testing-strategy.md`](../docs/testing-strategy.md)
- Additional repo guidance: [`../../CLAUDE.md`](../../CLAUDE.md)

---

## Repository Starting Points (REQUIRED)

- `apps/web/` — Next.js (App Router). Primary UI, server actions, API route handlers, and web-specific services.
- `apps/mobile/` — Expo/React Native. Mobile modules, services, permission gating, and observability.
- `supabase/` — Schema migrations, RLS policies, and edge functions; source of truth for data access enforcement.
- `docs/` — Architecture, data-flow, security/testing references; where architectural decisions must be recorded.
- `specs/` — Feature specifications; use as input constraints for architectural decisions.

---

## Key Files (REQUIRED)

### Cross-cutting auth, permissions, and security
- `apps/web/src/lib/auth/permissions.ts` — Web authorization helpers and permission logic entry point.
- `apps/web/src/lib/services/impersonation-service.ts` — Impersonation flow orchestration; high-risk security surface.
- `apps/mobile/src/modules/user/services/permissionService.ts` — Mobile permission evaluation utilities (gate checks, roles).
- `apps/mobile/src/modules/user/types/permissions.types.ts` — Canonical permission-related types (`GateConfig`).

### Supabase integration & source of truth
- `apps/web/src/lib/supabase/*` — Supabase client/types integration for web.
- `apps/web/src/lib/supabase/database.types.ts` — Generated/maintained database type contract (`Database`).
- `supabase/migrations/*.sql` — Schema and policy evolution; must match app assumptions.
- `supabase/functions/*/index.ts` — Edge functions entry points (if used for privileged or scheduled workflows).

### Web feature modules (server actions + UI)
- `apps/web/src/app/**/actions.ts` — Server actions for feature-level queries/mutations (critical for boundaries).
- `apps/web/src/app/(app)/configuracoes/layout.tsx` — Configurations area layout and navigation boundary.
- `apps/web/src/app/(app)/configuracoes/sistema/actions.ts` — System settings domain actions/types.
- `apps/web/src/app/(app)/configuracoes/uniformes/actions.ts` — Uniform management domain actions/types.
- `apps/web/src/app/(app)/configuracoes/departamentos/actions.ts` — Department/role structures and actions.
- `apps/web/src/app/(app)/configuracoes/chamados/actions.ts` — Ticket categories/stats actions.
- `apps/web/src/app/(app)/checklists/configurar/actions.ts` — Checklist template configuration actions/types.

### Web controllers (exports & documents)
- `apps/web/src/app/api/relatorios/supervisao/pdf/route.ts` — PDF generation route handler.
- `apps/web/src/app/api/relatorios/supervisao/excel/route.ts` — Excel export route handler.
- `apps/web/src/app/api/relatorios/chamados/pdf/route.ts` — PDF generation route handler.
- `apps/web/src/app/api/relatorios/chamados/excel/route.ts` — Excel export route handler.
- `apps/web/src/app/api/checklists/[executionId]/pdf/route.ts` — Checklist PDF route handler.

### Observability
- `apps/mobile/src/lib/observability/sentry.ts` — Mobile Sentry configuration (`SentryConfig`) and instrumentation patterns.

---

## Architecture Context (optional)

- **Config & constants**
  - Directories: `apps/web/src/app/(app)/relatorios/*`, `apps/web/src/app/(app)/configuracoes/*`, `apps/mobile/src/modules/*/constants`
  - Architectural role: centralize enums/labeling/date ranges and configuration constants; avoid embedding business rules in UI components.
  - Notable exports: `getDateRangeFromPeriod`, `getScoreColor`, `getScoreLabel` in reporting constants.

- **Services (business logic & orchestration)**
  - Directories: `apps/web/src/lib/services`, `apps/mobile/src/modules/*/services`
  - Architectural role: compose data fetching + security + domain rules; keep UI thin; standardize error handling and typed contracts.
  - Notable exports: `impersonateUser`, `fetchUserProfile`, permission gate utilities (`hasPermission`, `checkGate`, etc.).

- **Controllers / request handlers**
  - Directories: `apps/web/src/app/api/**`
  - Architectural role: boundary layer for HTTP; validate inputs, enforce authz, call services/actions; especially critical for exports (PDF/Excel).

- **Feature modules**
  - Directories: `apps/web/src/app/(app)/**`
  - Architectural role: co-locate UI, server actions, and feature-specific components; ensure route segments stay cohesive and don’t import across unrelated domains.

---

## Key Symbols for This Agent (REQUIRED)

> Use these as anchors when assessing architecture, enforcing boundaries, or defining standards.

- `impersonateUser` — `apps/web/src/lib/services/impersonation-service.ts`  
  High-risk privileged flow; validate auditing, scope rules, and RLS implications.

- `ImpersonateResponse` — `apps/web/src/lib/services/impersonation-service.ts`  
  Contract for impersonation outcomes; ensure stable shape and error semantics.

- `ImpersonateError` — `apps/web/src/lib/services/impersonation-service.ts`  
  Standardize error taxonomy; ensure safe messaging and consistent handling.

- `GateConfig` — `apps/mobile/src/modules/user/types/permissions.types.ts`  
  Core type for permission gating; ensure it maps cleanly to roles/permissions/RLS assumptions.

- `hasPermission` — `apps/mobile/src/modules/user/services/permissionService.ts`  
  Mobile authorization gating primitive; ensure consistent semantics with web.

- `checkGate` — `apps/mobile/src/modules/user/services/permissionService.ts`  
  Gate evaluation entry point; ensure it’s used consistently in UI navigation and feature toggles.

- `SentryConfig` — `apps/mobile/src/lib/observability/sentry.ts`  
  Observability standard; enforce consistent tagging/context for cross-layer debugging.

- `SystemSetting` / `SystemSettingsMap` — `apps/web/src/app/(app)/configuracoes/sistema/actions.ts`  
  Settings domain contract; validate typing, ownership, and mutation boundaries.

- `Uniform` / `UniformTransaction` / `UniformStats` — `apps/web/src/app/(app)/configuracoes/uniformes/actions.ts`  
  Domain types that shape stock/transactions; ensure invariants and auditability.

- `RoleWithPermissions`, `DepartmentWithRoles`, `PermissionGroup` — `apps/web/src/app/(app)/configuracoes/permissoes/constants.ts`  
  Web permission modeling primitives; ensure they map to mobile permission checks and Supabase policies.

- `TicketCategory`, `CategoryStats` — `apps/web/src/app/(app)/configuracoes/chamados/actions.ts`  
  Ticket taxonomy; ensure consistent across reporting and mobile modules.

- `TemplateWithDetails`, `TemplatesStats` — `apps/web/src/app/(app)/checklists/configurar/actions.ts`  
  Checklist template domain; often cross-cuts web UI + PDF export + mobile execution flows.

- `GET` route handlers (exports/PDF/Excel) —  
  `apps/web/src/app/api/relatorios/**/route.ts`, `apps/web/src/app/api/checklists/[executionId]/pdf/route.ts`  
  Boundary for externally accessible data exports; ensure authz, input validation, performance constraints.

- `Database` — `apps/web/src/lib/supabase/database.types.ts`  
  Contract between app and DB; ensure migrations and types remain aligned.

- `HashHandler` — `apps/web/src/components/auth/hash-handler.tsx`  
  Authentication-related routing/handling; validate security implications and client/server boundaries.

(From existing agent context; keep as architectural anchors)
- `useAuth` — `apps/web/src/hooks/use-auth.ts`
- `usePermissions` — `apps/web/src/hooks/use-permissions.ts`
- `AccessDenied` — `apps/web/src/components/auth/access-denied.tsx`

---

## Documentation Touchpoints (REQUIRED)

- Architecture baseline: [`../docs/architecture.md`](../docs/architecture.md)
- Data flow mapping: [`../docs/data-flow.md`](../docs/data-flow.md)
- Docs index: [`../docs/README.md`](../docs/README.md)
- Repo overview: [`README.md`](README.md)
- Agent operating rules: [`../../AGENTS.md`](../../AGENTS.md)
- Project overview: [`../docs/project-overview.md`](../docs/project-overview.md)
- Agents index: [`../agents/README.md`](../agents/README.md)
- (If present) Security reference: [`../docs/security.md`](../docs/security.md)
- (If present) Testing strategy: [`../docs/testing-strategy.md`](../docs/testing-strategy.md)

---

## Collaboration Checklist (REQUIRED)

1. [ ] Confirm feature intent, constraints, and scope boundaries (web/mobile/Supabase). Capture assumptions explicitly.  
2. [ ] Identify impacted domains and modules; propose where code should live (route `actions.ts`, `lib/services`, mobile `modules/*/services`, Supabase function/migration).  
3. [ ] Review authorization end-to-end:
   - [ ] Web permission model (`permissions.ts`, configuration permission constants)
   - [ ] Mobile gate checks (`permissionService.ts`, `GateConfig`)
   - [ ] Supabase RLS/policies and unit/tenant scoping  
4. [ ] Validate data contracts and typing:
   - [ ] `Database` types align with schema changes
   - [ ] exported domain types remain canonical (avoid parallel types)  
5. [ ] Check integration patterns and boundaries:
   - [ ] server actions used for sensitive mutations
   - [ ] API route handlers validate inputs and enforce authz
   - [ ] services encapsulate orchestration and reuse  
6. [ ] Assess scalability/performance:
   - [ ] reporting/export endpoints guarded and optimized
   - [ ] avoid N+1 and uncontrolled payload sizes
   - [ ] consider pagination, caching, and background processing when needed  
7. [ ] Confirm observability expectations:
   - [ ] errors captured with sufficient context (Sentry on mobile; equivalent patterns elsewhere)
   - [ ] critical security flows (impersonation, permission failures) are auditable  
8. [ ] Review PRs for architectural consistency:
   - [ ] no new circular dependencies or cross-domain imports
   - [ ] no duplicated business rules across web/mobile without explicit rationale  
9. [ ] Update documentation:
   - [ ] `docs/architecture.md` and/or `docs/data-flow.md` updated for cross-layer changes
   - [ ] add/adjust notes in docs index (`docs/README.md`) when new docs are introduced  
10. [ ] Capture learnings:
   - [ ] record trade-offs, follow-ups, and risks in `docs/` (or a decision note)
   - [ ] propose backlog items for tech debt uncovered during review

---

## Hand-off Notes (optional)

After completing an architecture task, leave a concise hand-off that includes:
- **What changed** (modules touched: web/mobile/Supabase; key files and symbols)
- **Decisions and trade-offs** (why server actions vs route handlers vs edge functions; why types live where they do)
- **Security posture** (RBAC/RLS alignment status, impersonation implications, any remaining gaps)
- **Migration/rollout plan** (schema migrations applied, compatibility strategy, required environment/config updates)
- **Performance risks** (report exports, heavy queries, client payload sizes) and mitigations
- **Follow-ups** (documentation updates still needed, refactors to reduce duplication, tests to add, observability improvements)

Cross-reference the canonical docs during hand-off:
- [`../docs/README.md`](../docs/README.md), [`README.md`](README.md), [`../../AGENTS.md`](../../AGENTS.md)
