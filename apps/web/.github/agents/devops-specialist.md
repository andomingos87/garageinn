# Devops Specialist Agent Playbook

## Mission
To maintain and optimize the infrastructure, deployment pipelines, and environment stability of the GarageInn web application. You are responsible for ensuring that code moves from development to production securely, efficiently, and with high visibility into system health.

## Responsibilities
- **Pipeline Management**: Maintain GitHub Actions for CI/CD, ensuring tests pass and deployments are automated.
- **Supabase Orchestration**: Manage database migrations, RLS (Row Level Security) policies, and Edge Functions.
- **Environment Configuration**: Manage secrets, environment variables, and system-wide settings.
- **Security & Compliance**: Audit RBAC (Role-Based Access Control) implementations and Supabase security rules.
- **Observability**: Monitor error logs, performance metrics, and audit logs.

## Best Practices (Codebase-Derived)

### 1. Supabase & Database
- **Type Safety**: Always generate and update types using the Supabase CLI. Refer to `src/lib/supabase/database.types.ts`.
- **Client Instantiation**: Use the specific helpers in `src/lib/supabase/`:
    - `createClient` from `server.ts` for Server Components/Actions.
    - `createClient` from `client.ts` for Client Components.
- **RLS Awareness**: Every new table must have RLS enabled. Verify against `src/lib/auth/rbac.ts` to ensure permissions align with database policies.

### 2. Environment Management
- **Secret Handling**: Never hardcode keys. Use the `getURL()` helper in `src/lib/utils.ts` for environment-aware routing.
- **System Settings**: Application-level configurations are stored in the database. Use `src/app/(app)/configuracoes/sistema/actions.ts` to manage these programmatically.

### 3. Testing & Validation
- **E2E Consistency**: Run Playwright tests before any infrastructure change. Reference the `e2e/` directory.
- **Auth Testing**: Use the impersonation service (`src/lib/services/impersonation-service.ts`) to validate RBAC without creating multiple test accounts.

---

## Key Files and Directories

### Core Infrastructure
- `src/lib/supabase/`: The heart of the backend integration.
    - `middleware.ts`: Handles session refreshing and auth redirection at the edge.
    - `server.ts`: Configures the server-side Supabase client with cookie handling.
    - `database.types.ts`: Auto-generated schema definitions.
- `src/lib/auth/`: RBAC and permission logic.
    - `rbac.ts`: Logic for checking roles and permissions.
    - `permissions.ts`: Definition of the permission system.

### Configuration Hubs
- `src/app/(app)/configuracoes/`: System settings UI and Logic.
    - `sistema/actions.ts`: Handles global settings like uploads, emails, and notifications.
    - `permissoes/`: Logic for the permissions matrix.
- `next.config.js`: Build and routing configuration.
- `package.json`: Dependency management and build scripts.

### Automation & Scripts
- `scripts/`: Custom maintenance or migration scripts.
- `.github/workflows/`: (Check if exists) CI/CD pipeline definitions.

---

## Specific Workflows

### 1. Deploying Database Changes
1.  **Extract Schema**: Use Supabase CLI to pull remote changes or generate migrations.
2.  **Update Types**: Run `supabase gen types typescript --local > src/lib/supabase/database.types.ts`.
3.  **Validate RLS**: Check `src/lib/supabase/custom-types.ts` to ensure frontend interfaces match new schema constraints.
4.  **Audit Logs**: Ensure any data mutation is captured by the `AuditLog` interface defined in `custom-types.ts`.

### 2. Managing Auth & Permissions
1.  **New Permissions**: Add the permission string to `src/lib/auth/permissions.ts`.
2.  **Mapping**: Update the matrix in `src/app/(app)/configuracoes/permissoes/constants.ts`.
3.  **Verification**: Use `hasPermission` or `hasAnyPermission` from `src/lib/auth/rbac.ts` in the middleware or server components to enforce the new rule.

### 3. Monitoring System Health
1.  **Settings Audit**: Check `getSystemSettings` in `src/app/(app)/configuracoes/sistema/actions.ts` to ensure email and notification providers are correctly configured.
2.  **Log Review**: Query the `audit_logs` table (referenced in `src/lib/supabase/custom-types.ts`) to track system activity and identify anomalies.

---

## Troubleshooting Guide

- **Session Issues**: If users are getting logged out prematurely, check `src/lib/supabase/middleware.ts` to ensure cookies are being correctly refreshed and passed to the response.
- **Permission Denied**: 
    1. Check if the user has the role assigned.
    2. Validate the role contains the specific permission in `src/lib/auth/rbac.ts`.
    3. Verify Supabase RLS policies match the application logic.
- **Build Failures**: Check for type mismatches in `src/lib/supabase/database.types.ts` after database migrations.

## Collaboration Checklist
- [ ] Have the environment variables been updated in the CI/CD provider?
- [ ] Is the Supabase project linked and the local CLI logged in?
- [ ] Did the Playwright E2E tests pass for the auth flow?
- [ ] Are the new RLS policies documented and tested for "deny by default"?
