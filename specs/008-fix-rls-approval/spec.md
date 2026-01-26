# Feature Specification: Fix RLS Approval Policies for Hierarchical Approvals

**Feature Branch**: `008-fix-rls-approval`
**Created**: 2026-01-25
**Status**: Draft
**Input**: Bug fix for RLS policies that incorrectly block hierarchical approvals when tickets are created by users above Manobrista level

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Supervisor Approves Encarregado's Ticket (Priority: P1)

When an Encarregado creates a purchase ticket, the Supervisor should be able to approve it as the first approver in the chain. Currently, the approval silently fails because RLS policies incorrectly map `approval_level` to expected ticket status.

**Why this priority**: This is the core bug - Supervisors cannot approve any tickets created by Encarregados, completely blocking the approval workflow for this common scenario.

**Independent Test**: Can be fully tested by having an Encarregado create a ticket and a Supervisor approve it, verifying the database actually updates.

**Acceptance Scenarios**:

1. **Given** an Encarregado creates a purchase ticket that goes to status `awaiting_approval_supervisor`, **When** a Supervisor clicks "Approve" and confirms, **Then** the ticket status changes to `awaiting_approval_gerente` AND the approval record shows `status = 'approved'` with the Supervisor's ID in `approved_by`.

2. **Given** a Supervisor attempts to approve a ticket, **When** the RLS policy evaluates the approval, **Then** the system uses `approval_role` (not `approval_level`) to determine if the approval is permitted.

3. **Given** a Supervisor approves a ticket successfully, **When** the approval completes, **Then** the UI reflects the updated status AND the approve button is no longer available for that level.

---

### User Story 2 - Gerente Approves Encarregado's Ticket (Priority: P1)

When an Encarregado's ticket reaches the Gerente for final approval, the Gerente should be able to approve it. Currently this also fails due to the same `approval_level` mapping issue.

**Why this priority**: Equal to P1 because it's the same root cause and affects the completion of the approval chain.

**Independent Test**: Can be tested by having a ticket in `awaiting_approval_gerente` status (created by Encarregado, already approved by Supervisor) and having a Gerente approve it.

**Acceptance Scenarios**:

1. **Given** a ticket created by Encarregado is in status `awaiting_approval_gerente` (Supervisor already approved), **When** a Gerente clicks "Approve" and confirms, **Then** the ticket status changes to `awaiting_triage` AND the approval record is updated correctly.

---

### User Story 3 - Gerente Approves Supervisor's Ticket (Priority: P1)

When a Supervisor creates a purchase ticket, the Gerente is the only approver needed. Currently this fails because `approval_level = 1` but ticket status is `awaiting_approval_gerente`.

**Why this priority**: Same root cause affecting a different user hierarchy path.

**Independent Test**: Can be tested by having a Supervisor create a ticket and a Gerente approve it directly.

**Acceptance Scenarios**:

1. **Given** a Supervisor creates a purchase ticket that goes to status `awaiting_approval_gerente`, **When** a Gerente clicks "Approve" and confirms, **Then** the ticket status changes to `awaiting_triage` AND the approval record shows `status = 'approved'`.

---

### User Story 4 - Application Detects Failed Silent Approvals (Priority: P2)

The application should detect when an approval operation affects zero rows (RLS silently blocked) and show an appropriate error message instead of a false success toast.

**Why this priority**: This is a defense-in-depth measure. Even after fixing RLS, the application should handle edge cases where approvals fail silently.

**Independent Test**: Can be tested by simulating a scenario where RLS blocks an update and verifying the UI shows an error.

**Acceptance Scenarios**:

1. **Given** a user attempts an approval that RLS blocks, **When** the database update affects 0 rows, **Then** the system displays an error message "Could not process the approval. Check your permissions." instead of a success toast.

2. **Given** a user attempts an approval that succeeds, **When** the database update affects 1 row, **Then** the system displays the success toast as normal.

---

### User Story 5 - Manobrista Approval Chain Continues Working (Priority: P2)

The existing approval chain for tickets created by Manobristas must continue working correctly after the fix.

**Why this priority**: Regression prevention - the fix must not break existing working functionality.

**Independent Test**: Can be tested by running the full approval chain for a Manobrista-created ticket.

**Acceptance Scenarios**:

1. **Given** a Manobrista creates a purchase ticket (status `awaiting_approval_encarregado`), **When** an Encarregado approves, **Then** status changes to `awaiting_approval_supervisor`.

2. **Given** a Manobrista's ticket is in `awaiting_approval_supervisor`, **When** a Supervisor approves, **Then** status changes to `awaiting_approval_gerente`.

3. **Given** a Manobrista's ticket is in `awaiting_approval_gerente`, **When** a Gerente approves, **Then** status changes to `awaiting_triage`.

---

### Edge Cases

- What happens when a user tries to approve a ticket they've already approved? System should prevent duplicate approvals via existing constraints.
- What happens when a user tries to approve out of order (e.g., Gerente tries to approve before Supervisor)? System should block based on current ticket status - only the role matching the current status can approve.
- What happens when a user's role changes mid-approval chain? The approval should use the user's current role at the time of approval attempt.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST use `approval_role` (the role name: Encarregado, Supervisor, Gerente) instead of `approval_level` (numeric position) when determining if a user can approve a ticket in RLS policies.

- **FR-002**: System MUST correctly map ticket status to expected approval role:
  - `awaiting_approval_encarregado` requires approval from role "Encarregado"
  - `awaiting_approval_supervisor` requires approval from role "Supervisor"
  - `awaiting_approval_gerente` requires approval from role "Gerente"

- **FR-003**: The `can_approve_ticket` database function MUST be updated to compare `approval_role` with the expected role derived from ticket status.

- **FR-004**: The `tickets_update_approver` RLS policy MUST be updated to use role-based matching instead of level-based matching.

- **FR-005**: The `ticket_approvals_update` RLS policy MUST correctly allow updates when the approval role matches the ticket's expected approval status.

- **FR-006**: The application MUST verify that database updates affected at least one row before showing a success message.

- **FR-007**: System MUST display an error message when an approval operation fails silently (0 rows affected).

- **FR-008**: System MUST maintain backward compatibility with existing approved tickets and approval records.

### Key Entities

- **Ticket (`tickets`)**: Purchase request with hierarchical approval workflow. Key attribute: `status` indicates which role should approve next.

- **Ticket Approval (`ticket_approvals`)**: Individual approval record linking a ticket to an approver. Key attributes:
  - `approval_level`: Numeric position in the approval chain (1, 2, or 3) - relative to the creator's level
  - `approval_role`: The role name required for this approval (Encarregado, Supervisor, Gerente) - absolute role identifier
  - `status`: pending/approved/rejected
  - `approved_by`: User ID who approved

- **User Role**: Determines what approvals a user can perform. Relevant roles in Operations department: Manobrista, Encarregado, Supervisor, Gerente.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of approval attempts by authorized users result in successful database updates (no silent failures).

- **SC-002**: Users see accurate feedback - success message only when approval actually persisted, error message when it failed.

- **SC-003**: All 7 approval scenarios work correctly:
  1. Manobrista ticket -> Encarregado approves
  2. Manobrista ticket -> Supervisor approves
  3. Manobrista ticket -> Gerente approves
  4. Encarregado ticket -> Supervisor approves
  5. Encarregado ticket -> Gerente approves
  6. Supervisor ticket -> Gerente approves
  7. Gerente ticket -> goes directly to triage (no approvals needed)

- **SC-004**: Zero regression in existing Manobrista approval workflows after the fix is deployed.

- **SC-005**: Approval operations complete within normal user expectations (no perceivable delay introduced by the fix).

## Assumptions

- The `approval_role` field already exists and is correctly populated in `ticket_approvals` records.
- The role names (Encarregado, Supervisor, Gerente) are consistent and stored as exact strings in the database.
- The ticket status values follow the pattern `awaiting_approval_<role>` where role is lowercase.
- Gerente-created tickets bypass the approval chain entirely and go directly to `awaiting_triage`.
