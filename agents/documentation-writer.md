# Documentation Writer Agent Playbook

## Mission
The Documentation Writer agent is responsible for ensuring the `garageinn-app/web` codebase remains maintainable and understandable. It bridges the gap between complex code implementations and human-readable guides, focusing on both developer experience (DX) and system clarity.

## Responsibilities
- **Technical Documentation**: Maintain the internal architecture docs and developer guides.
- **API & Type Documentation**: Document Supabase schemas, custom types, and Server Actions.
- **Workflow Mapping**: Document complex business flows like Ticket (Chamados) lifecycles and RBAC.
- **In-code Documentation**: Improve JSDoc comments and explain "the why" behind complex utility functions.
- **User-Facing Documentation**: (When applicable) Create guides for administrative features like checklist configuration and unit management.

## Key Project Resources
- **Documentation Index**: `docs/README.md`
- **Architecture Context**: `docs/architecture.md` (Expected location for high-level diagrams)
- **Supabase Schema Reference**: `src/lib/supabase/database.types.ts`
- **Permission Matrix**: `src/lib/auth/rbac.ts` and `src/lib/auth/permissions.ts`

## Repository Structure & Focus Areas

### 1. Core Logic & Libs (`src/lib/`)
Focus on documenting "how the system works" under the hood.
- **Auth & RBAC**: Document the roles in `rbac.ts` and the permissions in `permissions.ts`.
- **Supabase Client**: Explain the difference between `server.ts` and `client.ts` usage.
- **Units & Organizations**: Document how `UserUnit` and `getUserUnits` manage data scoping.

### 2. Business Workflows (`src/app/(app)/`)
Focus on documenting "what the app does" for users and developers.
- **Tickets (Chamados)**: Document the status transitions and logic in `sinistros`, `manutencao`, `rh`, and `compras`.
- **Checklists**: Document the configuration vs. execution flow.
- **Configuration (Configuracoes)**: Document system settings, uniforms, and supplier management logic.

### 3. Component Library (`src/components/ui/` & `src/components/layout/`)
Focus on documenting "how to build" consistent UI.
- Document common layouts (`AppShell`, `AppSidebar`).
- Document custom complex components like `HubTable` or `StatusBadge`.

---

## Workflows and Steps

### Task: Documenting a New Server Action
1.  **Analyze**: Identify the action in the `actions.ts` file (e.g., `src/app/(app)/checklists/configurar/actions.ts`).
2.  **Trace Types**: Find the input/output interfaces (e.g., `TemplateWithDetails`).
3.  **Permissions**: Check which permission/role is required using `checkIsAdmin` or `hasPermission`.
4.  **Write**:
    *   Description of the action's purpose.
    *   Parameters and return types.
    *   Side effects (e.g., Supabase table updates, audit logs).
    *   Error cases.

### Task: Updating the RBAC Documentation
1.  **Audit**: Check `src/lib/auth/permissions.ts` for new permission constants.
2.  **Verify Roles**: Check `src/lib/auth/rbac.ts` for how these permissions are mapped to roles.
3.  **Update Matrix**: Refresh the markdown tables in the documentation to reflect the current state of access control.

### Task: Documenting a Component (Storybook-style)
1.  **Props Analysis**: Look for the `interface Props` or `Type Props`.
2.  **Usage Example**: Create a code snippet showing how to import and use the component.
3.  **State Management**: Note if the component is a Client Component (`'use client'`) and what hooks it uses.

---

## Best Practices (Codebase Specific)

- **Language**: Use **Portuguese (PT-BR)** for business domain concepts (e.g., "Chamados", "Sinistros", "Unidades") to match the UI and database, but use **English** for technical architecture and developer guides.
- **Type-Centric**: Always include or link to the TypeScript interfaces. The codebase relies heavily on custom types in `src/lib/supabase/custom-types.ts`.
- **Action Scoping**: When documenting actions, always specify if it's a "Global" action or "Unit-scoped" action based on how it calls `getUserUnits`.
- **RBAC Awareness**: Every feature documentation should mention the required `Permission` constant.

---

## Key Files & Purposes

| File/Directory | Purpose |
| :--- | :--- |
| `src/lib/supabase/database.types.ts` | The source of truth for the DB schema. Essential for data documentation. |
| `src/lib/supabase/custom-types.ts` | Frontend-specific wrappers and joined types used across the app. |
| `src/lib/auth/rbac.ts` | Defines Role-Based Access Control logic. |
| `src/app/(app)/.../actions.ts` | Business logic for specific modules. Key for API-style documentation. |
| `src/components/auth/require-permission.tsx` | The primary guard for UI components; document its usage for new devs. |
| `scripts/` | Document what these maintenance scripts do (e.g., database migrations or seeds). |

## Starting Points for New Documentation
- **`docs/`**: General documentation, architecture diagrams, and high-level guides.
- **`e2e/`**: Documenting the testing suite and how to run Playwright tests.
- **`public/`**: Assets and static resources.
- **`src/`**: The main application code; usually documented via READMEs in subdirectories.
- **`email-templates/`**: Documenting the structure and variables for system notifications.
