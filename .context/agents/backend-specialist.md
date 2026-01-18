# Backend Specialist Agent Playbook

## Mission
To maintain and evolve the server-side infrastructure of the GarageInn application, ensuring robust data persistence, secure authentication, and efficient business logic orchestration via Supabase and Next.js Server Actions.

## Responsibilities
- **Data Modeling**: Manage Supabase schema definitions and TypeScript type generation.
- **Business Logic**: Implement complex workflows in `src/lib/services` and Next.js Server Actions.
- **Security**: Orchestrate Row Level Security (RLS) policies and RBAC (Role-Based Access Control).
- **Integration**: Manage authentication flows, file storage, and third-party service integrations.
- **Performance**: Optimize database queries and server-side state management.

## Key Backend Layers

### 1. Data Access (Repositories)
The application uses Supabase as the primary data store.
- **Location**: `src/lib/supabase`
- **Primary Type Definition**: `src/lib/supabase/database.types.ts` (Auto-generated from DB schema).
- **Custom Types**: `src/lib/supabase/custom-types.ts` for domain-specific interfaces and enums.
- **Client Factory**: Use `createClient` from `src/lib/supabase/server.ts` for Server Actions and `src/lib/supabase/client.ts` for Client Components.

### 2. Business Logic (Services & Actions)
Logic is split between dedicated service classes and Next.js Server Actions.
- **Services**: `src/lib/services/` (e.g., `impersonation-service.ts`). Use these for reusable, complex logic.
- **Server Actions**: Located within feature directories (e.g., `src/app/(app)/checklists/configurar/actions.ts`). These handle form submissions and direct UI-triggered mutations.

### 3. Authentication & Authorization
- **RBAC**: Handled in `src/lib/auth/rbac.ts` and `src/lib/auth/permissions.ts`.
- **Impersonation**: Managed via `src/lib/services/impersonation-service.ts` and `src/lib/auth/impersonation.ts`.
- **Middleware**: `src/lib/supabase/middleware.ts` handles session refreshment.

## Workflows & Tasks

### Developing a New Feature (Backend-First)
1.  **Define Schema**: Identify necessary table changes in Supabase.
2.  **Update Types**: Ensure `database.types.ts` is synced with the database.
3.  **Implement Server Actions**: 
    - Create an `actions.ts` file in the relevant route directory.
    - Implement CRUD operations using the Supabase server client.
    - Validate permissions using `hasPermission` or `isAdmin` from `src/lib/auth/rbac.ts`.
4.  **Error Handling**: Wrap logic in try/catch blocks and return consistent error objects.
5.  **Logging**: (If applicable) Implement audit logging using `AuditLog` type from `custom-types.ts`.

### Modifying Permissions
1.  Add new permission keys to `src/lib/auth/permissions.ts`.
2.  Update the `PermissionsMatrix` component in `src/app/(app)/configuracoes/permissoes/components/`.
3.  Implement enforcement in Server Actions using `checkCanConfigureChecklists` or similar pattern.

### Troubleshooting Auth Issues
1.  Check `src/lib/supabase/middleware.ts` for session handling.
2.  Verify the `isPublicRoute` logic in `src/proxy.ts`.
3.  Inspect `src/app/auth/callback/route.ts` for OAuth/Email link processing.

## Best Practices
- **Type Safety**: Always use `Tables<'table_name'>` or `TablesInsert<'table_name'>` from `database.types.ts` instead of `any`.
- **Server-Side Security**: Never trust client-side permission checks; always re-verify permissions inside Server Actions using `src/lib/auth/rbac.ts`.
- **Lean Actions**: Keep Server Actions focused on orchestration; move heavy logic to `src/lib/services`.
- **Transactional Logic**: Use Supabase RPCs (Stored Procedures) for operations requiring strict ACID transactions across multiple tables.
- **Consistent Responses**: Return objects with `{ data, error }` patterns to match Supabase's client style.

## Key Files Summary

| File | Purpose |
| :--- | :--- |
| `src/lib/supabase/server.ts` | Supabase client for Server Actions/Components |
| `src/lib/supabase/database.types.ts` | Source of truth for database schema types |
| `src/lib/auth/rbac.ts` | Logic for checking user roles and permissions |
| `src/lib/services/impersonation-service.ts` | Logic for admin-user impersonation |
| `src/proxy.ts` | Route-level public/private access definitions |
| `src/app/(app)/.../actions.ts` | Feature-specific server-side logic |

## Repository Structure for Backend Context
- `src/lib/auth/`: RBAC, Impersonation logic, and Permission definitions.
- `src/lib/supabase/`: Database types, client initializers, and middleware.
- `src/lib/services/`: Cross-cutting business logic services.
- `src/app/(app)/configuracoes/`: Backend management for system settings, departments, and roles.

## Collaboration Notes
- When modifying the database, notify the team to regenerate types.
- Ensure all new Server Actions are marked with `'use server'`.
- Coordinate with Frontend Specialists on the shape of data returned by actions.
