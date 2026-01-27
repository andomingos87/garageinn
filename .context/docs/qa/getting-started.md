# Getting Started (QA)

This guide explains how to set up, run, and validate **GarageInn** locally for QA/testing purposes. The repository contains **Web** and **Mobile** apps plus **E2E tests** and **Supabase** functions.

---

## Project overview

### Apps and key folders

- **Web app**: `apps/web` (Next.js / React)
- **Web E2E tests**: `apps/web/e2e` (Playwright-style specs and fixtures)
- **Mobile app**: `apps/mobile` (React Native / Expo-style structure)
- **Supabase edge functions**: `supabase/functions` (e.g., `invite-user`, `impersonate-user`, `create-test-users`)
- **Shared docs**: `docs/`

---

## Prerequisites

Install the following on your machine:

- **Node.js** (LTS recommended)
- **npm** (comes with Node)
- **Git**

Recommended (for QA automation / E2E work):
- A Chromium-based browser installed (Playwright can manage this, depending on setup)
- Access to the project’s **Supabase environment** (URL + keys), if tests rely on it

---

## Installation

Clone the repository and install dependencies from the repo root:

```bash
git clone <repository-url>
cd garageinn
npm install
```

---

## Common workflows

### 1) See available scripts

Most day-to-day commands are exposed via root `package.json` scripts (monorepo). To discover what’s available:

```bash
cat package.json
# or search for the scripts section
```

Then run any script like:

```bash
npm run <script-name>
```

---

## Running the Web app (apps/web)

From the repository root, use the script provided by `package.json`. Common patterns you may find:

```bash
npm run web
# or
npm run dev
# or
npm run web:dev
```

If your repo uses workspace commands, you may also see:

```bash
npm run --workspace apps/web dev
```

### What to verify (QA smoke checklist)

After the web app starts:

- Can you reach the login page?
- Can you authenticate with a known test user?
- Do main routes load (Dashboard, Chamados, Checklists, Configurações, Relatórios)?
- Are permissions enforced (Access denied behavior)?

Relevant areas in the codebase:
- UI layout: `apps/web/src/components/layout/*`
- Auth/permissions hooks: `apps/web/src/hooks/use-auth.ts`, `apps/web/src/hooks/use-permissions.ts`
- Access denied component: `apps/web/src/components/auth/access-denied.tsx`

---

## Running Web E2E tests (apps/web/e2e)

E2E specs live in:

- `apps/web/e2e/*.spec.ts`
- `apps/web/e2e/checklists/*`
- Fixtures/helpers: `apps/web/e2e/fixtures/auth.ts`

Typical scripts you may find:

```bash
npm run e2e
# or
npm run test:e2e
# or
npm run web:e2e
```

### Notes about authentication in E2E

The E2E suite includes helper functions such as:

- `login`, `loginAsAdmin`, `loginAsSupervisor`, etc. in `apps/web/e2e/fixtures/auth.ts`

When tests fail at login, it’s usually one of:
- Missing/incorrect environment variables (Supabase/auth)
- Test users not present in the target environment
- RBAC/permissions changed (see `apps/web/scripts/validate-rbac.ts`)

---

## Running the Mobile app (apps/mobile)

Mobile code is in `apps/mobile`. Depending on how scripts are set up, you’ll commonly use something like:

```bash
npm run mobile
# or
npm run mobile:start
# or
npm run dev:mobile
```

Or workspace-style:

```bash
npm run --workspace apps/mobile start
```

### What to verify (QA smoke checklist)

- Login flow works
- Ticket list/detail and comments work
- Checklists list/detail/execution work
- Profile screen loads and permissions/guards behave as expected

Relevant modules:
- Tickets: `apps/mobile/src/modules/tickets/*`
- Checklists: `apps/mobile/src/modules/checklists/*`
- Auth: `apps/mobile/src/modules/auth/*`
- Navigation: `apps/mobile/src/navigation/*`
- Protected views/guards: `apps/mobile/src/components/guards/ProtectedView.tsx`

---

## Supabase functions and test data (QA utilities)

There are Supabase edge functions that support QA/admin flows:

- `supabase/functions/invite-user`
- `supabase/functions/impersonate-user`
- `supabase/functions/create-test-users`

If your QA flow depends on seeded users or impersonation, confirm:
- Which Supabase project/environment you are targeting
- Whether functions are deployed/enabled there
- Whether required secrets/keys exist in that environment

---

## Environment variables

This repo likely requires environment variables for Web/Mobile and Supabase.

What to do:

1. Search for example env files:
   ```bash
   ls -la | grep env
   ls -la apps/web | grep env
   ls -la apps/mobile | grep env
   ```

2. Search for required variable names in code:
   - Web utilities: `apps/web/src/lib/supabase/*`, `apps/web/src/lib/utils.ts`
   - Mobile supabase client: `apps/mobile/src/lib/supabase/*`

3. Create the corresponding `.env` files expected by each app and fill them with values provided by the team.

If you’re unsure which variables are mandatory, a fast way is to:
- start the app and read the first runtime error, or
- grep for `process.env` usage.

---

## Troubleshooting

### Dependency/install issues

- Delete and reinstall dependencies:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

### Web app starts but pages fail / unauthorized

- Confirm env vars for Supabase/auth
- Confirm the test user exists
- Check RBAC:
  - `apps/web/src/lib/auth/*`
  - `apps/web/scripts/validate-rbac.ts`

### E2E tests fail intermittently

- Make sure the web app is running and reachable at the expected base URL
- Verify test users and permissions
- Re-run a single spec (depending on configured scripts)

---

## Related documentation

- `docs/qa/*` — QA-focused guides
- `apps/web/e2e/*` — test specs and fixtures (good reference for “happy paths”)
- `supabase/functions/*` — QA/admin automation utilities
