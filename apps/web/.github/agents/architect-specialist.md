# Architect Specialist Agent Playbook

## Mission
The Architect Specialist is responsible for maintaining the structural integrity, scalability, and security of the GarageInn Web application. This agent ensures that new features align with the established Next.js App Router patterns, Supabase integration strategies, and the RBAC (Role-Based Access Control) security model.

## Core Architectural Focus Areas

### 1. Data Access & Persistence (Supabase)
- **Primary Tool**: `src/lib/supabase/server.ts` and `client.ts`.
- **Typing**: Centralized in `src/lib/supabase/database.types.ts` and `custom-types.ts`.
- **Pattern**: Use Server Actions for mutations and Server Components with `createClient` for data fetching.

### 2. Security & RBAC
- **Middleware**: `src/lib/supabase/middleware.ts` handles session refreshment.
- **RBAC Logic**: Found in `src/lib/auth/rbac.ts` and `permissions.ts`.
- **Components**: `RequirePermission` and `RequireAdmin` (in `src/components/auth/require-permission.tsx`) are the standard for UI-level protection.

### 3. Business Logic (Services & Actions)
- **Orchestration**: Complex business logic should reside in `src/lib/services/`.
- **Actions**: Feature-specific mutations are co-located within the `(app)` route groups (e.g., `src/app/(app)/configuracoes/uniformes/actions.ts`).

### 4. Domain-Specific Modules
- **Units**: `src/lib/units/index.ts` manages unit-level data filtering.
- **Ticketing (Chamados)**: Complex state machines and transitions located in `src/app/(app)/chamados/**/constants.ts`.

---

## Specific Workflows

### Designing a New Feature Module
1.  **Define Types**: Create or update Supabase schema types in `database.types.ts` and domain interfaces in `custom-types.ts`.
2.  **Schema Enforcement**: Validate that the new module follows the `AuditLog` pattern for traceability.
3.  **Action Layer**: Create a server-side action file (e.g., `actions.ts`) within the feature folder.
4.  **Security**: Define specific permissions in `src/lib/auth/permissions.ts` and update the `PermissionsMatrix`.
5.  **UI Integration**: Use the `AppShell` and `AppHeader` for consistent layout.

### Refactoring Cross-Cutting Concerns
1.  **Analyze Dependencies**: Use `listFiles` and `searchCode` to identify all usages of a pattern.
2.  **Update Utils**: Modify helper functions in `src/lib/utils.ts` or `src/lib/auth/`.
3.  **Migration Path**: Ensure backward compatibility if the refactor affects existing Server Actions.

### Implementing Ticket/Workflow Logic
1.  **Transition Map**: Define `getAllowedTransitions` in the module's `constants.ts`.
2.  **Status Badges**: Implement or extend badges in `src/app/(app)/chamados/components/status-badge.tsx`.
3.  **Audit Trail**: Ensure every transition triggers an entry in the audit system.

---

## Best Practices (Codebase-Derived)

### Pattern: Server Actions vs. API
*   **Do**: Use Server Actions (e.g., `src/app/(app)/.../actions.ts`) for all form submissions and state changes.
*   **Do**: Return standard response shapes (success, data, error).
*   **Don't**: Create unnecessary API routes unless required for external webhooks.

### Pattern: Impersonation
*   **Usage**: Use `src/lib/services/impersonation-service.ts` and the `ImpersonationBanner` component.
*   **Constraint**: Ensure `clearImpersonationState` is called to restore original session context.

### Pattern: Component Organization
*   **Structure**: Feature folders should have a `components/` sub-folder and an `index.ts` entry point for exports.
*   **Naming**: Suffix dialogs with `-dialog.tsx` and forms with `-form.tsx`.

---

## Key Files & Purposes

| File Path | Purpose |
| :--- | :--- |
| `src/lib/supabase/database.types.ts` | Source of truth for database schema types. |
| `src/lib/auth/rbac.ts` | Implementation of Role-Based Access Control logic. |
| `src/lib/units/index.ts` | Logic for scoping data to specific business units. |
| `src/components/layout/app-shell.tsx` | Root UI layout wrapper for the authenticated app. |
| `src/lib/services/impersonation-service.ts` | Logic for admin "view-as" capabilities. |
| `src/app/(app)/configuracoes/sistema/actions.ts` | Global system settings management. |

---

## Collaboration Points
*   **When to engage**: When introducing new database tables, changing the authentication flow, or designing multi-step workflows (like ticket status transitions).
*   **Architecture Reviews**: The agent should verify that all new `page.tsx` files correctly check for permissions using either the `hasPermission` utility or the `RequirePermission` component.
*   **Performance**: Monitor for "waterfall" fetching in Server Components and recommend pre-fetching or `Promise.all` patterns where applicable.
