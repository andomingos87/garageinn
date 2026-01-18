# Data Flow & Integrations

This document outlines the architectural patterns and data pipelines used in the GarageInn application. The system follows a modern Next.js architecture using Server Actions for data mutations and Server Components for data fetching, with Supabase as the primary persistence and authentication layer.

## High-Level Architecture

The application follows a unidirectional data flow pattern:
1.  **User Interaction**: Users interact with Client Components (forms, buttons).
2.  **Server Actions**: Interactions trigger Server Actions defined in `actions.ts` files within the route groups.
3.  **Supabase Client**: Actions use the `createClient` utility from `src/lib/supabase/server.ts` to interact with the database.
4.  **Database Persistence**: Data is stored in PostgreSQL (Supabase).
5.  **Revalidation**: Server Actions call `revalidatePath` or `revalidateTag` to update the UI.

## Authentication & Authorization Flow

The security layer is integrated into every data request via Role-Based Access Control (RBAC).

### 1. Identity Flow
- **Login**: Handled by `src/app/(auth)/login/actions.ts`. Uses Supabase Auth to establish a session.
- **Session Management**: Middleware (`src/lib/supabase/middleware.ts`) refreshes the session and ensures protected routes are only accessible to authenticated users.
- **Hooks**: `useAuth` and `useProfile` provide client-side access to user state, while `getUserPermissions` (`src/lib/auth/rbac.ts`) provides server-side verification.

### 2. Impersonation Flow
Administrators can act as other users for debugging or support:
- **Trigger**: `impersonateUser` in `src/lib/services/impersonation-service.ts`.
- **State Storage**: The original session is stored in cookies/local storage via `src/lib/auth/impersonation.ts`.
- **UI Context**: `AppShell` detects impersonation state and displays a global `ImpersonationBanner`.

## Ticket Lifecycle (Core Data Flow)

The "Chamados" (Tickets) module is the primary data driver in the system, divided into Maintenance, Purchasing, Claims, and HR.

### Creation Pipeline
1.  **Form Submission**: A user fills out a form (e.g., `MaintenanceTicketForm`).
2.  **Validation**: Zod schemas validate the input on the client and server.
3.  **Action Execution**: `createTicket` action is invoked.
4.  **Unit Association**: Tickets are automatically linked to the user's assigned unit via `getUserUnits` (`src/lib/units/index.ts`).
5.  **Audit Trail**: Every change is logged in the `audit_logs` table via database triggers or explicit service calls.

### Workflow & Triage
- **Triage**: Tickets start in a `PENDENTE` (Pending) state. A manager uses the `triage-dialog.tsx` component to assign a technician or vendor.
- **Status Transitions**: Handled by `changeTicketStatus` actions. Transitions are governed by permissions (e.g., only specific roles can "Complete" a ticket).
- **Comments & Attachments**: Handled by `addComment` actions. Attachments are uploaded to Supabase Storage, and the URL is stored in the ticket metadata.

## Module-Specific Integrations

### 1. Checklist Execution
Checklists move from templates to live executions:
- **Templates**: Configured in `checklists/configurar`.
- **Execution**: When a user starts a checklist, an entry is created in `checklist_executions`.
- **Real-time Saves**: `question-item.tsx` triggers individual answer saves to prevent data loss on mobile devices during inspections.

### 2. Inventory (Uniformes)
- **Stock Adjustments**: Managed through `adjustUniformStock` in `src/app/(app)/configuracoes/uniformes/actions.ts`.
- **Flow**: Transactions are recorded in `uniform_transactions` whenever stock is added or assigned to an HR ticket.

### 3. Claims (Sinistros)
- **Communications**: `addClaimCommunication` records interactions with insurance companies.
- **Quotations**: Multiple quotations can be linked to a single claim, with a workflow for "Approve/Reject" quotations.

## Data Fetching Patterns

The application uses two primary methods for fetching data:

### Server-Side (RSC)
Used for initial page loads and SEO-sensitive data.
```typescript
// Example pattern found in src/app/(app)/usuarios/page.tsx
export default async function UsersPage({ searchParams }) {
  const users = await getUsers(searchParams); // Direct call to Server Action
  return <UsersTable data={users} />;
}
```

### Client-Side (Hooks)
Used for interactive elements and user-specific state.
- **`usePermissions`**: Fetches the current user's permission set to conditionally render UI elements.
- **`useProfile`**: Retrieves the user's profile and unit assignments.

## External Integrations

| Service | Purpose | Implementation |
| :--- | :--- | :--- |
| **Supabase Auth** | User identity & session management | `src/lib/supabase/` |
| **Supabase Storage** | File uploads (Photos, CSVs, Documents) | `perfil/actions.ts`, `chamados/actions.ts` |
| **Supabase DB** | PostgreSQL relational storage | Generated types in `database.types.ts` |
| **Resend / SMTP** | Email notifications (Invites, Password Reset) | `src/app/(auth)/recuperar-senha/actions.ts` |

## Observability & Error Handling

1.  **Server Action Results**: All actions return an `ActionResult` type containing `{ success: boolean, error?: string, data?: T }`.
2.  **Toasts**: Client components use the `toast()` utility to display success or failure messages based on the `ActionResult`.
3.  **Audit Logs**: Significant data changes (User updates, Ticket status changes, Checklist completion) are recorded in the system audit logs for traceability.
4.  **Validation Errors**: Handled by Zod; errors are mapped back to form fields using `react-hook-form`.
