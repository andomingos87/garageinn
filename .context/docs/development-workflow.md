# Development Workflow

This document describes how day-to-day development is done in this repository: branching, local setup, making changes across apps (Web/Mobile/Supabase), review expectations, and release/deployment flow.

This repo is a monorepo with:
- **Web** app (Next.js App Router) under `apps/web`
- **Mobile** app (Expo/React Native) under `apps/mobile`
- **Supabase** (migrations + Edge Functions) under `supabase/`

Related docs:
- [`docs/testing-strategy.md`](./testing-strategy.md)
- [`docs/tooling.md`](./tooling.md)
- `AGENTS.md` (collaboration/ownership guidance)

---

## Principles

- **Trunk-based development**: short-lived branches off `main`, merged via PR.
- **Small, reviewable changes**: prefer incremental PRs over large batches.
- **Keep docs/specs in sync**: if behavior changes, update documentation in the same PR.
- **Security-first**: RBAC/RLS correctness is a requirement, not a nice-to-have.

---

## Branching Model

### Branches
- `main`: the trunk; always intended to be in a deployable state.
- Feature/fix branches: created from `main` and merged back via PR.

### Naming (recommended)
Use a descriptive prefix:
- `feat/<short-description>`
- `fix/<short-description>`
- `chore/<short-description>`
- `docs/<short-description>`

Examples:
- `feat/tickets-comments`
- `fix/rls-checklist-visibility`
- `docs/dev-workflow-update`

### Pull Requests
- PRs must target `main`.
- Keep PRs focused (single feature/fix).
- Include context: what changed, why, and how it was verified.

---

## Release & Deployment Overview

Deployments happen as needed (no fixed cadence), aligned to product/release requirements.

- **Web**: deployed via Vercel (typically from `main`).
- **Mobile**: released via Expo workflow.
- **Supabase**: schema/functions updates are applied through migrations and function deployments.

Because changes may span Web/Mobile/Supabase, coordinate PR scope carefully:
- Prefer **one PR per deployable unit** when possible.
- If you must split work, land backend (Supabase) changes first when they are required for clients.

---

## Local Development

### Prerequisites
Ensure you have:
- Node.js + npm installed (project uses npm scripts)
- Access to required environment variables for web/mobile and Supabase
- (Optional) Supabase CLI if you run Supabase locally

### Install dependencies
From repository root:

```bash
npm install
```

### Common root commands
```bash
# Web dev server
npm run dev:web

# Mobile dev (Expo)
npm run dev:mobile

# Build web
npm run build:web

# Lint (repo-wide)
npm run lint

# Typecheck (repo-wide)
npm run typecheck
```

### App-specific scripts
Some commands may be defined per app. Run them from the app directory:

```bash
cd apps/web
npm run <script>

cd apps/mobile
npm run <script>
```

---

## Making Changes: Web vs Mobile vs Supabase

### Web (`apps/web`)
Typical work includes:
- Next.js App Router routes under `apps/web/src/app`
- Server Actions (actions files) and server-only code boundaries
- UI components under `apps/web/src/components`
- Auth/RBAC helpers under `apps/web/src/lib/auth`
- Supabase typed access under `apps/web/src/lib/supabase`

Key expectations:
- Keep server-only secrets strictly server-side.
- Respect App Router conventions (server components vs client components, server actions boundaries).
- Re-check role/permission gates when adding new routes/actions.

### Mobile (`apps/mobile`)
Typical work includes:
- Feature modules under `apps/mobile/src/modules/*`
- Navigation under `apps/mobile/src/navigation`
- UI components under `apps/mobile/src/components`

Key expectations:
- Ensure permission-gated screens are correctly protected (guards).
- Validate user flows on device/simulator (not just compilation).

### Supabase (`supabase/`)
Typical work includes:
- Migrations: table/column changes, RLS policies, functions, triggers
- Edge Functions: backend endpoints with privileged operations

Key expectations:
- **RLS is mandatory** for data safety.
- Service role keys must be used only in server-side contexts (Edge Functions / server runtime), never shipped to clients.
- Update types (if applicable) when database schema changes.

---

## Code Review Expectations

Reviews prioritize correctness, safety, and user impact.

### What reviewers check
- **RBAC/RLS safety**
  - RLS policies cover new tables/columns.
  - Permission checks exist in the correct layer (server-side where needed).
  - No leakage of privileged credentials to client code.
- **Boundary correctness**
  - Next.js server actions are not accidentally invoked from unsafe contexts.
  - Server-only code stays server-only.
- **Testing & verification**
  - Automated tests added/updated where applicable.
  - Manual verification notes for critical flows (auth, permissions, ticket flows, checklists, reports).
- **Documentation**
  - If behavior, workflow, or contracts changed, docs are updated (including this folder when relevant).

### What to include in PR description (recommended)
- Summary of changes
- Screenshots/video for UI changes (web/mobile)
- Verification steps
- Migration notes (if Supabase changed)
- Rollout/backward compatibility notes (if clients and backend may be deployed separately)

---

## Quality Gates (Before Merging)

Run at least:
```bash
npm run lint
npm run typecheck
```

Additionally:
- Build web when changing web build/runtime behavior:
  ```bash
  npm run build:web
  ```
- Run relevant tests (see [`docs/testing-strategy.md`](./testing-strategy.md))
- For Supabase changes:
  - Review RLS policies carefully
  - Confirm migrations apply cleanly
  - Confirm Edge Functions behave with least privilege

---

## Working Agreements

- Prefer “small PRs, merged often”.
- If a change affects multiple surfaces (Web + Mobile + Supabase), explicitly call it out early in the PR and in team communication.
- Keep documentation and implementation synchronized—especially for permissions, workflows, and operational runbooks.

---

## See Also

- [`docs/testing-strategy.md`](./testing-strategy.md) — what to test and how
- [`docs/tooling.md`](./tooling.md) — repo tooling, scripts, and developer utilities
- `AGENTS.md` — ownership/collaboration notes and expectations
