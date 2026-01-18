# GarageInn Web App Documentation

Welcome to the technical documentation for the GarageInn web application. This repository contains the front-end and server-side logic for the GarageInn management platform, built with Next.js, TypeScript, and Supabase.

## 🚀 Getting Started

GarageInn is a comprehensive management system for parking operations, maintenance requests, procurement, and human resources. This documentation provides a deep dive into the system's architecture and inner workings.

### Core Documentation
- **[Project Overview](./project-overview.md)**: High-level vision, main features, and business context.
- **[Architecture Notes](./architecture.md)**: System design, directory structure, and technical stack choices.
- **[Security & RBAC](./security.md)**: Details on the Permission-Based Access Control (RBAC) and authentication flow.
- **[Data Flow & Integrations](./data-flow.md)**: How data moves between the client, server actions, and Supabase.
- **[Development Workflow](./development-workflow.md)**: Coding standards, branch strategy, and CI/CD pipelines.

---

## 🏗️ Repository Structure

The project follows a modern Next.js App Router structure:

```text
src/
├── app/               # Next.js App Router (Routes, Actions, Pages)
│   ├── (app)/         # Main application routes (requires auth)
│   └── (auth)/        # Authentication routes (login, recovery)
├── components/        # Reusable UI components
│   ├── layout/        # AppShell, Sidebar, Header
│   └── ui/            # Base Shadcn UI components
├── hooks/             # Custom React hooks (useAuth, usePermissions)
├── lib/               # Shared logic and utilities
│   ├── auth/          # RBAC logic and session management
│   ├── supabase/      # Database types and clients
│   └── utils/         # Helper functions (formatting, validation)
└── scripts/           # Maintenance and validation scripts
```

---

## 🛠️ Key Technical Modules

### 1. Authentication & Permissions
The system uses a robust RBAC (Role-Based Access Control) system managed via Supabase.
- **Hook**: `usePermissions()` provides real-time access checks.
- **Logic**: `src/lib/auth/rbac.ts` contains functions like `hasPermission(permission)`.
- **Impersonation**: Admin users can impersonate other profiles for debugging using the `impersonateUser` service.

### 2. Ticketing System (Chamados)
The application handles four distinct ticket types:
- **Maintenance (Manutenção)**: Physical repairs and infrastructure.
- **Procurement (Compras)**: Requesting items or services.
- **Claims (Sinistros)**: Handling vehicle damage and insurance incidents.
- **HR (RH)**: Employee-related requests.

### 3. Unit Management (Unidades)
Units represent physical locations. The system tracks:
- **Staffing**: Linking users to specific units.
- **Supervision**: Hierarchical relationships between managers and units.
- **Checklists**: Operational procedures executed at specific locations.

---

## 📖 Glossary of Terms

| Term | Definition |
| :--- | :--- |
| **Unidade** | A physical parking lot or business location managed in the system. |
| **Chamado** | A ticket or request (Maintenance, Purchase, etc.). |
| **Sinistro** | An insurance claim or incident involving customer vehicles. |
| **Checklist** | A set of recurring tasks or inspections to be performed at a Unit. |
| **Impersonation** | The ability for admins to view the app as a specific user. |

---

## 🛠️ Developer Tooling

- **Testing**: Playwright for E2E testing (located in `/e2e`).
- **Styling**: Tailwind CSS with Shadcn/UI components.
- **Database**: Supabase (PostgreSQL) with generated TypeScript types in `src/lib/supabase/database.types.ts`.
- **Validation**: Zod for schema validation in forms and server actions.

For detailed setup instructions, refer to the **[Tooling & Productivity Guide](./tooling.md)**.
