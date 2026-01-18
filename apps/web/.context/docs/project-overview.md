# Project Overview

GarageInn App is a comprehensive management platform designed to streamline operations across multiple parking units and service departments. It serves as a centralized hub for managing users, parking units, checklists, and specialized ticketing systems (Maintenance, Procurement, HR, and Claims/Sinistros).

The system is built to benefit operational managers, unit supervisors, and administrative staff by providing real-time visibility into unit performance, maintenance needs, and administrative workflows.

## Quick Facts

- **Root path**: `apps/web`
- **Primary Architecture**: Next.js (App Router) with Supabase (Database/Auth/Storage)
- **Primary Languages**:
  - **.tsx (245 files)**: React components and page layouts
  - **.ts (83 files)**: Server actions, utilities, and type definitions
  - **.md (50 files)**: Project and technical documentation
  - **.sql (11 files)**: Database migrations and schema definitions

## Key Domains

The application is structured around several core business domains:

1.  **Identity & Access (RBAC)**: Fine-grained permission system based on roles and departments. Includes user impersonation for troubleshooting.
2.  **Unit Management**: Detailed tracking of parking locations, staffing levels, and operational metrics.
3.  **Checklists**: Dynamic template system for unit inspections and operational audits.
4.  **Ticketing Hub**: specialized workflows for:
    - **Maintenance**: Facility and equipment repair tracking.
    - **Procurement (Compras)**: Requesting and approving supplies.
    - **HR (RH)**: Personnel-related requests and uniform management.
    - **Claims (Sinistros)**: Handling insurance and incident reports with photo evidence.

## Core Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (React 19)
- **Backend-as-a-Service**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [Shadcn UI](https://ui.shadcn.com/)
- **State Management**: React Hooks & Server Actions
- **Forms**: React Hook Form with Zod validation
- **Testing**: Playwright (E2E)

## Architecture & Code Organization

The project follows a modular Next.js App Router structure:

- `src/app/(auth)`: Authentication flows (Login, Password Recovery).
- `src/app/(app)`: The main authenticated application, further divided by domain.
- `src/components`:
  - `ui/`: Base design system components (buttons, inputs, etc.).
  - `layout/`: Shared layout components like the Sidebar and Header.
- `src/lib`: Core logic including Supabase clients, RBAC utilities, and shared types.
- `src/hooks`: Custom React hooks for auth, permissions, and UI state.

## Key Technical Entry Points

| Purpose | File Path |
| :--- | :--- |
| **Database Schema** | `src/lib/supabase/database.types.ts` |
| **Auth Middleware** | `src/lib/supabase/middleware.ts` |
| **RBAC Logic** | `src/lib/auth/rbac.ts` |
| **Global Layout** | `src/components/layout/app-shell.tsx` |
| **API/Server Actions** | Distributed within `actions.ts` files in domain folders |

## Development Workflows

### Role-Based Access Control (RBAC)
The application uses a strict permission-based system. Developers should use the `hasPermission` utility from `src/lib/auth/rbac.ts` or the `usePermissions` hook in client components to gate features.

### Server Actions
Most data mutations and fetches are performed via Server Actions. These are typically located in `actions.ts` files within the specific route directory (e.g., `src/app/(app)/usuarios/actions.ts`).

### Data Fetching
Server Components fetch data directly from Supabase using the server client (`src/lib/supabase/server.ts`). Client components rely on hooks or props passed from parents.

## Getting Started

1.  **Prerequisites**: Ensure you have Node.js installed and access to the Supabase project credentials.
2.  **Installation**:
    ```bash
    npm install
    ```
3.  **Environment Setup**: Create a `.env.local` file with:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4.  **Running Development**:
    ```bash
    npm run dev
    ```
5.  **Tests**: Run E2E tests with `npx playwright test`.

## Directory Guide

- `scripts/`: Maintenance and validation scripts (e.g., `validate-rbac.ts`).
- `email-templates/`: React-based templates for system notifications.
- `public/`: Static assets and brand resources.
- `docs/`: In-depth documentation for specific features and workflows.
