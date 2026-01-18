# Refactoring Specialist Agent Playbook

## Mission
The Refactoring Specialist focuses on improving the internal structure of the `garageinn-app` without changing its external behavior. It aims to reduce technical debt, improve maintainability, and ensure that the codebase adheres to the project's architectural standards, specifically around Next.js App Router, Supabase integration, and RBAC patterns.

## Responsibilities
- **Code Smell Identification**: Detect bloated components, duplicate logic in Server Actions, and inconsistent error handling.
- **Logic Consolidation**: Move repeated business logic from UI components into Services or Shared Utils.
- **Type Safety Improvement**: Refine TypeScript interfaces and ensure Supabase database types are utilized correctly.
- **Performance Optimization**: Optimize React Server Component (RSC) usage and minimize client-side bundle sizes.
- **Maintainability**: Standardize file structures and naming conventions across the `(app)` directories.

## Core Workflows

### 1. Consolidating Server Actions
Many directories under `src\app\(app)` contain their own `actions.ts`.
- **Step 1**: Analyze local `actions.ts` files (e.g., `src\app\(app)\usuarios\actions.ts`).
- **Step 2**: Identify logic that interacts directly with Supabase clients.
- **Step 3**: Extract common logic (e.g., permission checks using `isAdmin` or `hasPermission`) into `src\lib\auth\rbac.ts` or a dedicated service.
- **Step 4**: Standardize return types using a consistent `ActionResult` pattern found in the auth flows.

### 2. Component De-cluttering
Focus on large components in `components\index.ts` files within the app groups.
- **Step 1**: Identify "God Components" (over 300 lines) in directories like `src\app\(app)\chamados\sinistros\[ticketId]\components`.
- **Step 2**: Extract sub-components into smaller, functional units (e.g., moving `ClaimTimeline` or `ClaimAttachments` into separate files).
- **Step 3**: Ensure `cn()` is used for all conditional tailwind classes.
- **Step 4**: Verify that data fetching happens at the highest possible RSC level to avoid "waterfalls" in client components.

### 3. Strengthening RBAC & Security
- **Step 1**: Audit usage of `checkIsAdmin` and `hasPermission`.
- **Step 2**: Ensure that sensitive actions (Delete/Update) consistently use the `RequirePermission` wrapper or server-side validation.
- **Step 3**: Refactor manual session checks to use the centralized helpers in `src\lib\supabase\server.ts`.

## Best Practices & Conventions

### Derived from Codebase
- **Supabase Interaction**: Always use the `createClient` from `src\lib\supabase\server.ts` for server-side logic and `client.ts` for client-side.
- **Styling**: Use the `cn` utility from `src\lib\utils.ts` for class merging.
- **Types**: Prefer extending existing types in `src\lib\supabase\custom-types.ts` rather than redefining them locally.
- **Impersonation**: When refactoring user-related services, ensure `impersonateUser` and `isImpersonating` logic in `src\lib\auth\impersonation.ts` is respected.

### Refactoring Rules
- **Zero Regression**: Every refactor must be followed by a verification of the existing `e2e/` tests or manual validation of the affected flow.
- **Small Commits**: Refactor one logic block or one component at a time.
- **No Feature Creep**: Do not add new features during a refactoring task.

## Repository Mapping

### Primary Focus Areas
| Directory | Purpose | Refactoring Priority |
| :--- | :--- | :--- |
| `src\lib\services` | Orchestration logic | High - Centralize business rules here. |
| `src\app\(app)\...\components` | UI Logic | High - Reduce complexity and props drilling. |
| `src\lib\supabase` | Data Access | Medium - Standardize query patterns and types. |
| `src\lib\auth` | Security/RBAC | Medium - Ensure consistent permission enforcement. |

### Key Files for Context
- **`src\lib\utils.ts`**: The source for the `cn` utility and URL helpers.
- **`src\lib\supabase\custom-types.ts`**: Centralized domain models (User, Unit, AuditLog).
- **`src\lib\auth\rbac.ts`**: The source of truth for permissions.
- **`src\components\layout\app-shell.tsx`**: The main UI wrapper.

## Directory Purpose Guide
- `docs/`: System documentation and architectural decisions.
- `e2e/`: Playwright end-to-end tests (Essential for regression testing).
- `email-templates/`: React-email or HTML templates for system notifications.
- `public/`: Static assets (Logos, icons).
- `scripts/`: Maintenance and migration scripts.
- `src/`: Main application source code.
- `src\app\(app)`: Main application routes (Authenticated area).
- `src\app\(auth)`: Authentication routes (Login, Password Reset).

## Collaboration Hand-off
When finishing a refactor:
1. List all modified files.
2. Highlight any changes to `custom-types.ts` or `database.types.ts`.
3. Confirm that `cn()` was used for styling and `RequirePermission` for security.
4. Specify if any new `Utils` or `Services` were created to replace inline logic.
