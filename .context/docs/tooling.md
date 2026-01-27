# Tooling & Productivity Guide

This repository is a **Node.js monorepo** using **npm workspaces**, with multiple apps (notably `apps/web` and `apps/mobile`) plus Supabase functions and scripts. This document describes the required tooling, recommended setup, and the day-to-day commands developers use.

Related docs: [`docs/development-workflow.md`](development-workflow.md)

---

## Monorepo overview

### Workspaces
The repo uses **npm workspaces**, so you should generally run scripts from the **repository root**. Root scripts orchestrate app-specific commands and help keep versions consistent.

Typical locations:
- **Web app**: `apps/web` (Next.js)
- **Mobile app**: `apps/mobile` (Expo / React Native)
- **E2E tests (web)**: `apps/web/e2e` (Playwright)
- **Supabase**:
  - Local project/config: `supabase/`
  - Edge Functions: `supabase/functions/*`

---

## Required tooling

### Node.js (required)
- Node version is pinned in **`.nvmrc`** (current value: **24**).
- Use a version manager to avoid mismatches.

**Recommended: nvm**
```bash
nvm install
nvm use
node -v
```

If you don’t use `nvm`, ensure your installed Node matches `.nvmrc`.

### npm (required)
This repo expects **npm** with workspace support.

Install dependencies at the root:
```bash
npm install
```

### Supabase CLI (required for DB/types/local backend work)
Used for:
- Running Supabase locally
- Applying migrations
- Generating TypeScript types from the database schema
- Working with Edge Functions

Install options:
- Via package runner (no global install required):
  ```bash
  npx supabase --version
  ```
- Or install globally (optional):
  ```bash
  npm i -g supabase
  ```

### Expo CLI (required for mobile development)
Expo is used to run the React Native app in development.

Most workflows can use `npx expo ...` (recommended to avoid global version drift):
```bash
npx expo --version
```

### Playwright (required for web E2E)
Web E2E tests live under `apps/web/e2e` and use Playwright. The project includes Playwright test utilities/fixtures (for example, login helpers) under the e2e suite.

After installing dependencies, you may need browser binaries:
```bash
npx playwright install
```

---

## Recommended IDE/editor setup

### VS Code extensions (recommended)
- **TypeScript** (built-in)
- **ESLint**
- **Prettier**
- **Tailwind CSS IntelliSense** (web app styling)
- **Expo / React Native tooling** (optional but helpful)

### Suggested editor settings
- Format on save (Prettier)
- ESLint fixes on save
- Use the workspace TypeScript version (if prompted by VS Code)

---

## Common scripts & automation

> Run these from the repository root unless a script is explicitly app-scoped.

### Lint
```bash
npm run lint
```

If the repo provides fix variants:
```bash
npm run lint:fix
```

### Typecheck
```bash
npm run typecheck
```

### Format
```bash
npm run format
```

Some projects standardize formatting through lint fixing—use whichever is defined in `package.json`.

---

## Development commands (daily workflow)

### Run web and mobile in parallel
A common productivity pattern is keeping separate terminals:

**Terminal A (web):**
```bash
npm run dev:web
```

**Terminal B (mobile):**
```bash
npm run dev:mobile
```

If these scripts are not available in your environment, check the root `package.json` scripts and the app-level scripts in `apps/web/package.json` and `apps/mobile/package.json`.

---

## Supabase workflows

### Start Supabase locally
Use this when developing features that rely on database/auth/storage locally.

Typical commands (exact usage may vary by project setup):
```bash
npx supabase start
npx supabase status
```

Stop services when done:
```bash
npx supabase stop
```

### Generate TypeScript types
The repo includes generated DB types (for example under `apps/web/src/lib/supabase/database.types.ts`). Regenerate them after schema changes:

```bash
npx supabase gen types typescript
```

Common patterns:
- Redirect output to the expected file:
  ```bash
  npx supabase gen types typescript --local > apps/web/src/lib/supabase/database.types.ts
  ```
- Or target a linked remote project (if your workflow uses Supabase linking).

> Tip: Keep type generation in the same terminal/session you use for DB migrations to avoid mismatched schema vs. types.

### Edge Functions
Supabase Edge Functions live under:
- `supabase/functions/*` (e.g., `invite-user`, `impersonate-user`, `create-test-users`)

You’ll typically:
- Develop and test functions locally with the Supabase CLI
- Deploy via the CLI (depending on your release process)

---

## Testing

### Web E2E (Playwright)
E2E specs live under `apps/web/e2e`. There are helper fixtures for authentication (for example, login helpers in `apps/web/e2e/fixtures/auth.ts`).

Install browsers (first time only):
```bash
npx playwright install
```

Run the E2E suite (script name may vary):
```bash
npm run test:e2e
```

If you need to run Playwright directly:
```bash
npx playwright test
```

> If E2E tests require seeded users/roles, check Supabase functions (like `create-test-users`) and any project scripts under `apps/web/scripts/`.

---

## Keeping local tooling aligned

### Use the Node version from `.nvmrc`
Most “it works on my machine” issues in JS monorepos come from Node version drift. Always align Node first.

### Prefer `npx` for CLIs
To avoid global version mismatches:
- `npx supabase ...`
- `npx expo ...`
- `npx playwright ...`

---

## Productivity tips

- **Two terminals**: run `dev:web` and `dev:mobile` simultaneously.
- **One terminal dedicated to Supabase**: keep `supabase start/status/logs` separate to avoid losing context.
- **Regenerate types after schema changes**: update `database.types.ts` immediately after migrations to keep CI/typecheck green.
- **Search for existing fixtures/utilities** before writing new ones:
  - Playwright auth fixtures: `apps/web/e2e/fixtures/`
  - Supabase helpers/types: `apps/web/src/lib/supabase/`, `apps/mobile/src/lib/supabase/`

---

## Related files and directories

- `.nvmrc` — pinned Node version
- `apps/web/` — web application (Next.js)
- `apps/web/e2e/` — Playwright end-to-end tests
- `apps/mobile/` — mobile application (Expo)
- `supabase/` — Supabase project (migrations/config) and Edge Functions
- `apps/web/src/lib/supabase/database.types.ts` — generated database types (regenerate after schema changes)
- `docs/development-workflow.md` — broader development workflow and conventions
