# Architecture Documentation

This document describes the system architecture for the GarageInn Web application, explaining how the various layers interact and the design patterns employed across the codebase.

## System Architecture Overview

The GarageInn Web application is built using **Next.js 15+** with the **App Router**, leveraging a modular architecture that separates concerns into clear layers. It follows a hybrid rendering model where high-level layouts and pages utilize Server Components for data fetching, while interactive elements are handled by Client Components.

The backend is powered by **Supabase**, providing Authentication, PostgreSQL database, and Storage. The application uses **Server Actions** as the primary bridge for data mutations and complex business logic, effectively removing the need for a separate REST/GraphQL API layer for internal operations.

### High-Level Topology
1.  **Frontend**: Next.js (React) application deployed on Vercel.
2.  **Backend-as-a-Service**: Supabase (Auth, DB, Storage).
3.  **Communication**: Server Actions for mutations; Direct Supabase client for real-time and client-side queries where necessary.

---

## Architectural Layers

### 1. Config & Constants (`src/app/(app)/configuracoes`, `src/lib/auth/permissions.ts`)
This layer defines the rules of the system, including UI constants, status transitions, and permission definitions.
- **RBAC Definition**: Defines roles and granular permissions.
- **Workflow Rules**: Functions like `getAllowedTransitions` define state machines for tickets (Maintenance, Purchases, Claims).
- **System Settings**: Management of global application variables (Email, Upload limits, Notifications).

### 2. Utils & Core Library (`src/lib`)
Shared utilities that provide foundational functionality across all features.
- **Supabase Clients**: Separate configurations for `server.ts` (using cookies), `client.ts` (browser), and `middleware.ts` (auth session refresh).
- **Auth & RBAC**: Logic for checking permissions (`hasPermission`), handling user impersonation, and extracting roles.
- **Unit Management**: Helper functions for resolving user-to-unit assignments and multi-unit access.

### 3. Repositories / Data Access (`src/lib/supabase/database.types.ts`)
The application relies heavily on TypeScript types generated from the Supabase schema.
- **Type Safety**: Centralized `Database`, `Tables`, and `Enums` types ensure end-to-end type safety from the database to the UI.
- **Custom Types**: Interfaces in `custom-types.ts` extend raw database types to include common joins (e.g., `UserWithRoles`).

### 4. Services / Business Logic (`actions.ts` files)
Instead of a separate "Service" directory, business logic is primarily housed in **Server Actions** co-located within the app directory features.
- **Orchestration**: Actions like `triageTicket` or `createClaimTicket` handle validation, database transactions, and notification triggers.
- **Impersonation**: specialized logic in `impersonation-service.ts` allows administrators to view the system as another user for debugging.

### 5. Components & UI (`src/components`, `.../components`)
UI is divided into two categories:
- **Global Components**: Found in `src/components`, these are generic, reusable UI atoms (Shadcn UI) and layout wrappers (`AppShell`, `AppSidebar`).
- **Feature Components**: Found in `components/` folders within specific routes. These are domain-specific (e.g., `ClaimTimeline`, `UniformTable`).

---

## Key Design Patterns

### Role-Based Access Control (RBAC)
The system uses a declarative permission model.
- **Usage**: Components are wrapped in `RequirePermission` or `RequireAdmin`.
- **Logic**: Permissions are derived from the user's roles and departments, validated both on the client for UI visibility and on the server for security.

### Server Actions for Forms
All data mutations use Next.js Server Actions.
- **Pattern**: Actions return an `ActionResult` type containing either `success: true` and data, or `error: string`.
- **Validation**: Server-side validation is performed before any database operation.

### State Machines for Tickets
Tickets (Manutenção, Compras, Sinistros) follow strict status flows.
- **Transition Logic**: Defined in `constants.ts` files within each ticket module.
- **Enforcement**: Status changes are validated against `getAllowedTransitions` to prevent illegal state jumps.

---

## Internal System Boundaries

### App Groups (Route Groups)
- **`(auth)`**: Handles login, password recovery, and session establishment.
- **`(app)`**: The main authenticated area. Contains the core modules:
    - **Chamados**: Maintenance, Purchases, and Claims workflows.
    - **Checklists**: Template configuration and execution.
    - **Unidades**: Management of physical locations and staff.
    - **Usuários**: Profile and permission management.

### Permission Boundaries
- **Global Admins**: Access to system settings and all units.
- **Department Managers**: Can triage and manage tickets within their department (e.g., RH, Manutenção).
- **Unit Staff**: Restricted to data related to their assigned units.

---

## External Service Dependencies

| Dependency | Purpose | Integration Method |
| --- | --- | --- |
| **Supabase Auth** | User identity and session management | Supabase Auth Helpers |
| **Supabase DB** | PostgreSQL relational storage | `supabase-js` via Server Actions |
| **Supabase Storage** | Document attachments and user avatars | `supabase-js` storage API |
| **Resend** | Email notifications (configured via system settings) | SMTP/API via Supabase hooks |

---

## Key Architectural Decisions

1.  **Server Actions over API Routes**: Chosen to simplify the codebase and leverage Next.js's built-in form handling and cache invalidation (`revalidatePath`).
2.  **Shared Layout (AppShell)**: A central shell manages the sidebar, header, and mobile responsiveness, providing a consistent experience across different modules.
3.  **Client-Side "Impersonation"**: Admins can switch context to a specific user. This is handled by storing the original session in a secure cookie while the active Supabase client uses the target user's identity.
4.  **Soft Deletes**: Critical data like Users and Units use a "status" field (Active/Inactive) or soft-delete patterns to maintain audit logs and referential integrity.
