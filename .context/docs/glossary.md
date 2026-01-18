# Glossary & Domain Concepts

This document defines the core terminology, domain entities, and personas used throughout the GarageInn application. It serves as a reference for developers to ensure consistent naming and understanding of business logic.

## Domain Entities

### Tickets (Chamados)
The central workflow entity representing a request for service or action. Tickets are divided into four main types:
- **Maintenance (Manutenção):** Requests for physical repairs or infrastructure tasks within a unit.
- **Purchases (Compras):** Requests for acquiring new supplies, equipment, or services.
- **Human Resources (RH):** Requests related to personnel, such as uniform requests, documentation, or hiring.
- **Claims (Sinistros):** Reports of incidents involving damage, theft, or accidents that may require insurance or legal action.

### Units (Unidades)
Physical locations (garages, parking lots, or offices) where the business operates.
- **Fixed Unit:** The primary location assigned to a user.
- **Unit Staff:** Members assigned to work at or manage a specific unit.
- **Supervisor:** A role responsible for overseeing multiple units.

### Checklists
Digital forms used to audit or inspect units.
- **Template:** A blueprint for a checklist, containing categories and questions.
- **Execution:** A specific instance of a checklist being filled out by a user at a unit.
- **Question Types:** Includes Boolean (Yes/No), Text, and Numeric answers.

### Uniforms (Uniformes)
Inventory items managed within the RH module.
- **Stock Adjustment:** A manual override of current inventory levels.
- **Uniform Transaction:** Records of items being issued to or returned by employees.

## Personas / Roles

### Admin (Administrador)
Full system access. Can manage system settings, global permissions, departments, and audit logs.

### Manager (Gestor)
Responsible for overseeing departments or specific workflows (e.g., a Maintenance Manager). They can triage tickets and approve purchases.

### Supervisor
Middle management role focusing on a group of Units. They monitor checklist executions and unit-level performance.

### Operator / Collaborator (Colaborador)
The end-user at the unit level. They open tickets, execute checklists, and receive uniforms.

## Core Business Rules

| Rule | Description | Implementation Context |
| :--- | :--- | :--- |
| **RBAC (Role Based Access Control)** | Permissions are tied to Roles, which are grouped by Departments. A user can have multiple roles. | `src/lib/auth/rbac.ts` |
| **Unit Isolation** | Most users can only see data (tickets, checklists) related to the Units they are explicitly assigned to. | `src/lib/units/index.ts` |
| **Impersonation** | Admins can "impersonate" other users to troubleshoot issues or verify permission configurations. | `src/lib/auth/impersonation.ts` |
| **Ticket Triage** | New tickets must be "Triaged" (status update and assignment) before they can move to execution. | `canTriageTicket` actions |

## Technical Terminology

- **ActionResult:** A standardized wrapper for Server Action responses, typically containing `data`, `error`, and `success` boolean.
- **Audit Log:** A record of sensitive actions (deletions, permission changes) for compliance.
- **Sinistro (Claim):** Brazilian Portuguese term for insurance claims or incident reports.
- **Hub:** The main dashboard or entry point for a specific module (e.g., Ticket Hub).

## Key Type Definitions Reference

### Authentication & Permissions
- **[Permission](src/lib/auth/permissions.ts):** String literal representing a specific action (e.g., `tickets:create`).
- **[UserRoleInfo](src/lib/supabase/custom-types.ts):** Maps a user to their role and department metadata.
- **[ImpersonationState](src/lib/auth/impersonation.ts):** Stores the original admin session when viewing the app as another user.

### Unit Management
- **[UnitStatus](src/lib/supabase/custom-types.ts):** Enum indicating if a unit is `active`, `inactive`, or `pending`.
- **[UnitMetrics](src/app/(app)/unidades/actions.ts):** Aggregated data for a unit, including open tickets and checklist compliance.

### Ticket System
- **[MaintenanceType](src/app/(app)/chamados/manutencao/constants.ts):** Categorizes maintenance as `Preventive`, `Corrective`, or `Predictive`.
- **[ExecutionStatus](src/app/(app)/chamados/manutencao/constants.ts):** Lifecycle states of a ticket task (e.g., `Pending`, `In Progress`, `Completed`).

### System Settings
- **[SystemSetting](src/app/(app)/configuracoes/sistema/actions.ts):** Key-value pairs for global app configuration (logos, timeout settings, etc.).
