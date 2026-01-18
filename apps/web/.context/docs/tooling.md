# Tooling & Productivity Guide

This document outlines the tools, scripts, and configurations used to maintain high development velocity and code quality in the GarageInn application.

## Required Tooling

Ensure these tools are installed and configured according to the versions specified.

| Tool | Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | `^20.0.0` | Runtime environment (LTS recommended). |
| **pnpm** | `^8.0.0` | Package management and workspace orchestration. |
| **Supabase CLI** | Latest | Database migrations, type generation, and local development. |
| **Docker** | Latest | Required for running local Supabase containers. |

### Installation Commands

```bash
# Install pnpm globally
npm install -g pnpm

# Install Supabase CLI (Windows/Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Install Supabase CLI (macOS/Homebrew)
brew install supabase/tap/supabase
```

---

## Recommended Automation

The project uses several scripts to automate repetitive tasks and ensure consistency across the codebase.

### Core Commands

- `pnpm dev`: Starts the Next.js development server.
- `pnpm build`: Production build optimized for performance.
- `pnpm lint`: Runs ESLint to check for code quality and style issues.
- `pnpm type-check`: Runs TypeScript compiler in `noEmit` mode to verify types.

### Code Generators & Helpers

- **Database Types**: Generate TypeScript definitions directly from your local or remote Supabase schema.
  ```bash
  # Generate types for the web app
  pnpm gen:types
  ```
- **RBAC Validation**: Check for inconsistencies in Role-Based Access Control definitions.
  ```bash
  # Execute the validation script
  pnpm ts-node scripts/validate-rbac.ts
  ```

### Git Hooks

We use **Husky** and **lint-staged** to ensure that all commits meet quality standards.
- **Pre-commit**: Automatically runs `prettier` and `eslint` on changed files.
- **Pre-push**: Runs `pnpm type-check` to prevent breaking the build.

---

## IDE / Editor Setup

### Visual Studio Code (Recommended)

To ensure consistency, please install the following extensions:

- **ESLint** (`dbaeumer.vscode-eslint`): Real-time linting feedback.
- **Prettier** (`esbenp.prettier-vscode`): Automatic code formatting on save.
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`): Autocomplete for utility classes.
- **PostgreSQL** (`ckolkman.vscode-postgres`): Optional, for direct DB inspection.

### Workspace Settings

The repository includes a `.vscode/settings.json` file. Ensure "Format on Save" is enabled:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

---

## Productivity Tips

### Database Migrations

When working on features requiring schema changes, always use the Supabase CLI to create migrations. This ensures the team can sync changes effortlessly.

```bash
# Create a new migration file
supabase migration new feature_name

# Reset local DB to match current migrations
supabase db reset
```

### User Impersonation

For debugging role-specific issues (e.g., checking if a Supervisor sees the correct units), use the **Impersonation Tool** available in the admin dashboard. This allows you to view the app through another user's permissions without needing their credentials.

- **Logic Location**: `src/lib/services/impersonation-service.ts`
- **Hook**: `useImpersonation()` in `src/hooks/use-impersonation.ts`

### Terminal Aliases

Add these to your `.zshrc` or `.bashrc` to speed up common workflows:

```bash
alias gdev="pnpm dev"
alias ggen="pnpm gen:types"
alias gdb="supabase db reset"
```

### Shared Utils

Before writing a new helper, check `src/lib/utils.ts`. It contains common patterns for:
- `cn(...)`: Merging Tailwind classes safely using `clsx` and `tailwind-merge`.
- `getURL()`: Dynamically generating the correct base URL for environments (local, preview, production).
