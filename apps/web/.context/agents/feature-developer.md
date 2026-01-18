# Feature Developer Agent Playbook

## Mission
The Feature Developer Agent is responsible for end-to-end implementation of new functionalities within the `garageinn-app/web` repository. It translates business requirements into production-ready code, ensuring UI consistency, robust business logic, and secure data access via Supabase.

## Responsibilities
- **Frontend Development**: Building responsive UI components using Tailwind CSS and Radix UI (shadcn/ui).
- **Backend Logic**: Implementing Server Actions and services for business orchestration.
- **State Management**: Handling server-side state with Next.js App Router and client-side state where necessary.
- **Security & Permissions**: Enforcing RBAC (Role-Based Access Control) using the project's permission system.
- **Database Integration**: Performing CRUD operations and complex queries using the Supabase client.

## Core Focus Areas

### 1. Feature Modules (Next.js App Router)
Most feature-specific code lives in `src/app/(app)/`. Focus on these specific sub-directories:
- **Users**: `src/app/(app)/usuarios` (Management, Impersonation)
- **Units**: `src/app/(app)/unidades` (Site/Branch management)
- **Checklists**: `src/app/(app)/checklists` (Execution and Configuration)
- **Tickets (Chamados)**: `src/app/(app)/chamados` (Maintenance, RH, Claims/Sinistros, Purchases)
- **Settings**: `src/app/(app)/configuracoes` (System settings, Permissions, Suppliers)

### 2. Business Logic & Services
- **Services**: `src/lib/services/` (Orchestration logic like `impersonation-service.ts`)
- **Server Actions**: Located within feature folders (e.g., `src/app/(app)/unidades/actions.ts`)

### 3. Shared Infrastructure
- **Auth & RBAC**: `src/lib/auth/` and `src/components/auth/`
- **Database Types**: `src/lib/supabase/database.types.ts`
- **UI Kit**: `src/components/ui/` (Foundational components)

---

## Workflows & Steps

### Workflow A: Adding a New Feature Module
1.  **Define Types**: Update `src/lib/supabase/custom-types.ts` or the local module types if the feature introduces new data structures.
2.  **Server Actions**: Create an `actions.ts` file in the feature directory. Use `createClient` from `src/lib/supabase/server.ts`.
3.  **UI Components**: Create a `components/` directory inside the feature folder. Break down the UI into Table, Filter, Dialog, and Form components.
4.  **Enforce Permissions**: Wrap sensitive UI elements in `<RequirePermission permission="..." />` and check permissions in Server Actions using `hasPermission`.
5.  **Page Implementation**: Build the main `page.tsx`, fetching initial data on the server.

### Workflow B: Modifying Existing UI
1.  **Identify Component**: Locate the component in `src/app/(app)/[module]/components/`.
2.  **Verify Props**: Check the component's interface (e.g., `UsersTableProps`) in the same file.
3.  **Theming**: Use the `cn()` utility from `src/lib/utils.ts` for conditional Tailwind classes.
4.  **Testing**: Ensure changes don't break existing data flows (Check how `DataTable` or `Pagination` are used in existing views).

### Workflow C: Implementing a Complex Business Process
1.  **Service Layer**: If the logic involves multiple tables or external integrations, create a new service in `src/lib/services/`.
2.  **Audit Logs**: Ensure major actions are logged (see `AuditLog` interface in `custom-types.ts`).
3.  **Error Handling**: Use the established pattern of returning `{ data, error }` or throwing specific error types.

---

## Best Practices & Conventions

### 1. Data Access
- **Server-Side**: Always use the server client: `const supabase = await createClient();`.
- **Typing**: Use the generated `Database` types from `src/lib/supabase/database.types.ts` whenever possible.

### 2. UI/UX
- **Loading States**: Use Next.js `loading.tsx` or Skeleton components for async data.
- **Forms**: Use `react-hook-form` with `zod` validation (refer to `src/app/(app)/usuarios/novo/components/new-user-form.tsx` for a pattern).
- **Modals**: Use the Radix-based `Dialog` component. Manage "Open" state locally or via URL params for deep-linking.

### 3. Security
- **RBAC**: Never assume a user can perform an action. Verify `isAdmin()` or `hasPermission()` in every Server Action.
- **Impersonation**: Be aware of the `isImpersonating` state when dealing with session-sensitive data.

### 4. Code Structure
- **Index Files**: Maintain `index.ts` in component directories for cleaner imports.
- **Action Granularity**: Keep Server Actions focused. For example, `updateUserEmail` should be its own exported function, not part of a generic "update" blob.

---

## Key Files & Purposes

| File Path | Purpose |
| :--- | :--- |
| `src/lib/supabase/server.ts` | Supabase client for Server Components/Actions. |
| `src/lib/auth/rbac.ts` | Core logic for permission checking. |
| `src/lib/auth/permissions.ts` | Enum/Type definitions for all system permissions. |
| `src/components/layout/app-shell.tsx` | Main application wrapper and navigation structure. |
| `src/lib/utils.ts` | UI utilities (`cn`) and URL helpers. |
| `src/lib/supabase/custom-types.ts` | Domain-specific interfaces (e.g., `UserWithRoles`, `UnitWithStaffCount`). |

---

## Repository Structure Overview
- `src/app/(app)`: Authenticated routes for the main application.
- `src/app/(auth)`: Login, password recovery, and reset flows.
- `src/components/ui`: Shadcn/ui primitive components.
- `src/components/auth`: Logic-heavy components for session and permission handling.
- `src/lib/services`: Pure business logic separated from the React layer.
- `src/lib/units`: Logic specifically for site/unit scope and visibility.

## Hand-off & Completion
Before finishing a task:
1.  Verify that all new Server Actions have permission checks.
2.  Check for UI responsiveness across mobile/desktop.
3.  Ensure TypeScript types are fully resolved (no `any`).
4.  Summarize the new components or actions created in the PR/Hand-off notes.
