# Security and Compliance

This document outlines the security architecture, authorization models, and compliance practices implemented in the GarageInn Web application.

## Authentication & Authorization

The application uses a robust security model based on **Supabase Auth** and a custom **Role-Based Access Control (RBAC)** system.

### Identity Management
- **Provider**: Supabase Auth (GoTrue).
- **Session Strategy**: JWT-based sessions managed via HTTP-only cookies for Server-Side Rendering (SSR) and Client-Side state.
- **Middleware**: Sessions are automatically refreshed and validated in `src\lib\supabase\middleware.ts`.

### Role-Based Access Control (RBAC)
Authorization is handled through a hierarchical permission system defined in `src\lib\auth\permissions.ts` and managed via helper functions in `src\lib\auth\rbac.ts`.

- **User Roles**: Users are assigned roles (e.g., Administrator, Manager, Supervisor, Operator) linked to specific departments.
- **Permissions**: Granular flags (e.g., `units:read`, `tickets:manage`, `users:write`) that determine access to specific actions.
- **Utility Functions**:
    - `hasPermission(user, permission)`: Checks if a user has a specific permission.
    - `isAdmin(user)`: Short-circuit check for global administrative privileges.
    - `checkIsAdmin()`: Server-side action check for administrative operations.

### User Impersonation
For troubleshooting purposes, administrators can impersonate users using the `ImpersonationService` (`src\lib\services\impersonation-service.ts`).
- **Security Guardrails**: Original sessions are stored in secure cookies (`sb-original-session`).
- **Audit Trace**: All actions performed during impersonation are tagged with the original administrator's ID.

---

## Data Security & Privacy

### Multi-Tenancy (Unit-Based Access)
The application enforces strict data isolation based on "Units" (Unidades).
- **Access Control**: Users are linked to specific units via the `user_units` table.
- **Enforcement**: Server actions like `checkCanAccessUnits` (`src\app\(app)\unidades\actions.ts`) validate that a user cannot view or modify data outside their assigned units.

### Sensitive Data Handling
- **Passwords**: Never stored in plain text; handled entirely by Supabase Auth (Argon2/Bcrypt).
- **Environment Variables**: Sensitive keys (Supabase Service Key, API secrets) are stored in encrypted environment variables and never exposed to the client-side unless prefixed with `NEXT_PUBLIC_`.
- **Encryption**: Data at rest is encrypted by the underlying PostgreSQL (Supabase) infrastructure.

### Audit Logs
The system maintains an audit trail for critical operations (stored in the `audit_logs` table):
- **Tracked Actions**: User creation/deletion, permission changes, and ticket status updates.
- **Metadata**: Logs capture the performer's ID, timestamp, and the previous/new values of the changed records.

---

## Infrastructure Security

### Middleware & Route Protection
Access to the `(app)` group routes is restricted by `src\middleware.ts`.
- **Public Routes**: Defined in `src\proxy.ts` (e.g., `/login`, `/recuperar-senha`).
- **Private Routes**: Require a valid Supabase session. Unauthorized attempts are redirected to the login page with a `next` return URL.

### API & Server Actions
All Server Actions implement manual authorization checks at the entry point:
```typescript
// Example pattern used in actions.ts
const { data: { user } } = await supabase.auth.getUser();
if (!user) throw new Error("Unauthorized");

const canManage = await canManageTicket(ticketId, user.id);
if (!canManage) throw new Error("Permission denied");
```

---

## Compliance & Policies

### Data Residency & GDPR
- **GDPR Compliance**: The application supports user data deletion and provides profile management views (`src\app\(app)\perfil`).
- **Validation**: Input validation is enforced using **Zod** schemas across all forms and API endpoints to prevent injection and malformed data entry.

### Security Best Practices
- **Content Security Policy (CSP)**: Managed via Next.js headers.
- **Rate Limiting**: Handled at the Supabase/Infrastructure layer to prevent brute-force attacks on auth endpoints.
- **Cross-Site Scripting (XSS)**: Mitigated by React's automatic escaping and strict use of `dangerouslySetInnerHTML` (only where absolutely necessary).

---

## Incident Response

In the event of a security breach or vulnerability discovery:

1.  **Triage**: Identify affected users and data scopes.
2.  **Containment**: Revoke active sessions for compromised accounts using the Supabase Admin API.
3.  **Rotation**: If environment secrets are leaked, immediately rotate keys in the Vercel/Production dashboard.
4.  **Logging**: Consult the `AuditLog` interface and database table for forensic analysis of the attacker's actions.

**Contact**: For internal security escalations, contact the DevOps/System Admin team via the GarageInn technical support channel.
