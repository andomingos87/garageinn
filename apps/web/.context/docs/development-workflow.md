# Development Workflow

This document outlines the day-to-day engineering processes for the GarageInn Web repository. Adhering to these practices ensures code quality, maintainability, and consistent deployments.

## Branching & Releases

We follow a **Trunk-Based Development** model with short-lived feature branches.

- **Main Branch (`main`)**: The source of truth. All code in `main` should be deployable.
- **Feature Branches**: Named `feat/description`, `fix/description`, or `chore/description`. 
- **Pull Requests**: Every change must go through a Pull Request (PR) into `main`.
- **Releases**: We use automated versioning based on conventional commits. Tags are generated automatically upon merging to `main`.

## Local Development

The project is built with **Next.js 14 (App Router)** and **Supabase**.

### Prerequisites
- Node.js 18.x or higher
- NPM or PNPM
- Access to the Supabase project environment variables

### Getting Started

1.  **Clone and Install**:
    ```bash
    git clone <repository-url>
    cd garageinn-app/apps/web
    npm install
    ```

2.  **Environment Setup**:
    Copy `.env.example` to `.env.local` and fill in the Supabase credentials:
    ```bash
    NEXT_PUBLIC_SUPABASE_URL=your_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

4.  **Database Types**:
    When the database schema changes, sync the local types:
    ```bash
    npm run update-types
    ```

## Code Standards & Reviews

### PR Checklist
Before marking a PR as "Ready for Review", ensure:
- [ ] Code follows the established project structure (Actions in `actions.ts`, UI in `components/`).
- [ ] RBAC checks are implemented using `hasPermission` or `checkIsAdmin` where applicable.
- [ ] TypeScript types are correctly defined and no `any` is used.
- [ ] New components are responsive and use the UI library (`src/components/ui`).
- [ ] Server actions handle errors gracefully using the `ActionResult` pattern.

### Linting and Formatting
We use ESLint and Prettier. Most editors will handle this automatically, but you can run them manually:
```bash
npm run lint
```

## Architecture Patterns

- **Server Actions**: Located within the route folders (e.g., `src/app/(app)/usuarios/actions.ts`). These handle all data mutations and logic.
- **Custom Hooks**: Use `usePermissions()` for client-side authorization checks and `useProfile()` for accessing the current user's data.
- **RBAC**: Permissions are managed via `src/lib/auth/rbac.ts`. Always verify permissions on the server side even if the UI hides a button.
- **Supabase Client**: Use `createClient` from `@/lib/supabase/server` for Server Components/Actions and `@/lib/supabase/client` for Client Components.

## Onboarding Tasks

For developers new to the repository, start with these tasks:

1.  **Explore the Auth Flow**: Check `src/app/(auth)` to understand how Supabase Auth is integrated with the middleware.
2.  **Review the Layout**: See `src/components/layout/app-shell.tsx` and `app-sidebar.tsx` to understand the application structure.
3.  **Check RBAC Logic**: Read `src/lib/auth/permissions.ts` to see the available system permissions.
4.  **First Ticket**: Look for issues labeled `good first issue` or `documentation` in the project board.

## Building for Production

To test a production build locally:
```bash
npm run build
npm run start
```

For agent collaboration and automated tool usage tips, refer to the [AGENTS.md](../../AGENTS.md) file in the repository root.
