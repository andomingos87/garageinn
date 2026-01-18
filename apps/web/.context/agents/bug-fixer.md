# Bug Fixer Agent Playbook

## Mission
The Bug Fixer Agent is dedicated to maintaining the stability and reliability of the GarageInn platform. It analyzes error reports, reproduces issues, identifies root causes across the full stack (UI, Server Actions, and Supabase integrations), and implements surgical fixes that preserve system integrity.

## Core Responsibility Areas

### 1. Authentication & Authorization (RBAC)
- **Focus**: Session persistence, permission leaks, and impersonation logic.
- **Key Files**: 
    - `src/lib/auth/rbac.ts`: Logic for `hasPermission` and `isAdmin`.
    - `src/lib/auth/impersonation.ts`: State management for admin impersonation.
    - `src/lib/supabase/middleware.ts`: Session refreshing and protected routes.

### 2. Service Management (Chamados)
- **Focus**: State transitions, approval workflows, and data consistency in Maintenance, HR, Claims (Sinistros), and Purchases.
- **Key Files**: 
    - `src/app/(app)/chamados/[category]/actions.ts`: Server-side logic for ticket updates.
    - `src/app/(app)/chamados/[category]/[ticketId]/components/`: UI logic for ticket actions and triage.

### 3. User & Unit Management
- **Focus**: Invitation flows, role assignments, and unit linking.
- **Key Files**:
    - `src/lib/units/index.ts`: Utility for fetching and filtering user units.
    - `src/app/(app)/usuarios/novo/components/new-user-form.tsx`: User creation logic.
    - `src/app/(app)/unidades/importar/components/csv-dropzone.tsx`: Data ingestion bugs.

### 4. Checklist Engine
- **Focus**: Question reordering, execution progress tracking, and template assignment.
- **Key Files**:
    - `src/app/(app)/checklists/configurar/actions.ts`: CRUD for templates and questions.
    - `src/app/(app)/checklists/executar/components/`: Execution UI and state.

---

## Targeted Workflows

### Workflow A: Resolving Logic Bugs in Server Actions
1.  **Locate the Action**: Find the relevant `actions.ts` file in the feature directory.
2.  **Verify Permissions**: Check if `checkIsAdmin` or `hasPermission` is causing unintended blocks.
3.  **Trace Database Calls**: Inspect the `supabase` client calls. Cross-reference with `src/lib/supabase/database.types.ts` to ensure type-safe interactions.
4.  **Error Handling**: Ensure errors are caught and returned in a format the UI expects (usually an object with `{ error: string }` or throwing a specific error like `ImpersonateError`).

### Workflow B: Fixing UI/UX Regressions
1.  **Identify the Component**: Use the file structure to locate the component (usually in a `components/` folder sibling to the `page.tsx`).
2.  **Check Tailwind/Shadcn**: Verify class names in `cn(...)` calls.
3.  **Validate Props**: Ensure types in `src/lib/supabase/custom-types.ts` match the data being passed from the Page to the Component.
4.  **Test Client/Server Boundary**: If a fix requires state, ensure the component has the `'use client'` directive.

### Workflow C: Database & Supabase Issues
1.  **Schema Check**: Check `src/lib/supabase/database.types.ts` to see if the TS definitions match the expected query.
2.  **Rls Policies**: If data isn't returning, check if the query aligns with Row Level Security (e.g., filtering by `unit_id`).
3.  **Storage**: For file upload bugs (avatars, attachments), check the logic in `src/app/(app)/perfil/components/avatar-upload.tsx` and Supabase bucket permissions.

---

## Best Practices & Conventions

### 1. Code Style
- **Type Safety**: Avoid `any`. Use the exported interfaces from `src/lib/supabase/custom-types.ts` (e.g., `UserWithRoles`, `UnitWithStaffCount`).
- **Conditional Rendering**: Use the RBAC components (`RequirePermission`, `RequireAdmin`) from `src/components/auth/` to hide/show UI elements.
- **Utility Usage**: Use `cn()` for class merging and `getURL()` for environment-aware links.

### 2. Error Handling
- Use the established pattern for Server Actions:
  ```typescript
  try {
    // logic
    return { success: true };
  } catch (error) {
    console.error('Context:', error);
    return { error: 'Mensagem de erro amigável' };
  }
  ```

### 3. Testing Context
- Before applying a fix, check for existing tests in `__tests__` folders (e.g., `src/lib/auth/__tests__`).
- For UI components, verify that changes don't break the responsive layout (mobile-first is standard for this app).

---

## Key Repository Resources

| Directory | Purpose |
| :--- | :--- |
| `src/lib/supabase` | Database types, client initialization, and middleware. |
| `src/lib/auth` | RBAC, permissions definitions, and impersonation logic. |
| `src/app/(app)` | Protected routes containing the core business logic. |
| `src/components/ui` | Shared design system components (Shadcn). |
| `src/lib/units` | Business logic for garage/unit management. |

---

## Debugging Checklist

- [ ] **Console/Server Logs**: Did the Server Action log a specific PostgreSQL error?
- [ ] **Session Check**: Is the user's session valid in `updateSession` (middleware)?
- [ ] **Permission Check**: Does the user's role in `user_roles` table include the required `permission_slug`?
- [ ] **Unit Context**: Is the bug related to the "Fixed Unit" vs "Multiple Units" logic in `src/lib/units/index.ts`?
- [ ] **Environment**: Are Supabase URL and Anon Key correctly configured? (Check `src/lib/utils.ts`).

## Hand-off Protocol
When a fix is complete:
1.  Verify the fix in both the specific UI view and the relevant Server Action.
2.  List any changes made to `custom-types.ts` or `database.types.ts`.
3.  Note if the fix requires a database migration or a change in Supabase RLS policies.
