# Prompt Templates for GarageInn Development

Use these templates when working with AI assistants on GarageInn features.

---

## Template 1: RBAC Feature Development

```markdown
# Task: [Feature Name]

## Context Loading (Read First)
- .context/specs/rbac/spec.md
- .context/specs/rbac/roles-matrix.md
- .context/specs/cross-cutting.md
- src/lib/auth/permissions.ts

## Current State
[Describe what currently exists]

## Desired Behavior
[Describe the change you want]

## Affected Roles
- [ ] List each role that will be affected
- [ ] Note current vs new permissions

## Acceptance Criteria
- [ ] Permission check works for [role A]
- [ ] Permission check blocks [role B]
- [ ] RLS policy updated (if database access changes)
- [ ] E2E test added for affected roles

## Constraints
- Must maintain backward compatibility
- No changes to global admin behavior
- Update decision-log.md with rationale
```

---

## Template 2: Ticket Status Change

```markdown
# Task: Add/Modify Ticket Status

## Context Loading (Read First)
- .context/specs/tickets/spec.md
- .context/specs/tickets/approval-flow.md
- src/lib/ticket-statuses.ts
- src/app/(app)/chamados/[type]/constants.ts

## Change Description
- **Current Status Flow:** [describe]
- **New Status Flow:** [describe with new status]
- **New Status Name:** [exact value]

## State Machine Update
```
[Draw the new state machine]
```

## Files to Modify
1. src/lib/ticket-statuses.ts - Add type
2. src/app/(app)/chamados/[type]/constants.ts - Add transitions
3. RLS policies (if visibility changes)
4. UI components (status badges, filters)

## Constraints
- All existing tickets must still work
- No orphaned states allowed
- Document in tickets/decision-log.md
```

---

## Template 3: Visibility Rule Change

```markdown
# Task: Modify Visibility Rules

## Context Loading (Read First)
- .context/specs/tickets/visibility-rules.md
- .context/specs/rbac/department-rules.md
- src/app/(app)/chamados/[type]/actions.ts (buildVisibilityFilter)

## Current Visibility
| Role | Can See |
|------|---------|
[Fill in current rules]

## Proposed Visibility
| Role | Can See |
|------|---------|
[Fill in new rules]

## Rationale
[Why this change is needed]

## Implementation Plan
1. Update buildVisibilityFilter()
2. Update RLS policy (if database-level)
3. Update getTicketDetails() access check
4. Add E2E tests

## Test Scenarios
- [ ] [Role A] CAN see [ticket type]
- [ ] [Role B] CANNOT see [ticket type]
- [ ] Edge case: [describe]
```

---

## Template 4: New Ticket Type

```markdown
# Task: Add New Ticket Type

## Context Loading (Read First)
- .context/specs/tickets/spec.md
- Existing ticket type: src/app/(app)/chamados/compras/

## New Type Details
- **Name:** [e.g., "juridico"]
- **Department:** [target department]
- **Portuguese Label:** [e.g., "Jurídico"]

## Status Flow
```
[Initial] → [Intermediate states] → [Final states]
```

## Required Permissions
| Action | Permission |
|--------|------------|
| Read | tickets:read |
| Create | tickets:create |
| ... | ... |

## Files to Create
1. src/app/(app)/chamados/[type]/page.tsx
2. src/app/(app)/chamados/[type]/actions.ts
3. src/app/(app)/chamados/[type]/constants.ts
4. src/app/(app)/chamados/[type]/[ticketId]/page.tsx
5. src/app/(app)/chamados/[type]/components/

## Database Changes
- [ ] Add department if new
- [ ] Add categories
- [ ] Add type-specific details table (if needed)
- [ ] Update RLS policies
```

---

## Template 5: Approval Flow Modification

```markdown
# Task: Modify Approval Flow

## Context Loading (Read First)
- .context/specs/tickets/approval-flow.md
- .context/specs/rbac/department-rules.md
- src/app/(app)/chamados/compras/actions.ts (handleApproval)

## Current Flow
```
[Draw current state machine]
```

## Proposed Flow
```
[Draw new state machine]
```

## Changes
1. [Describe each change]
2. [New approval level? New skip rules?]

## Affected SQL Functions
- [ ] get_initial_approval_status
- [ ] create_ticket_approvals
- [ ] [others]

## Test Cases
- [ ] [Role] creates ticket → Initial status is [X]
- [ ] [Role] approves → Status becomes [Y]
- [ ] Denial flow works correctly
```

---

## Template 6: Bug Fix in RBAC/Permissions

```markdown
# Bug: [Short Description]

## Context Loading (Read First)
- .context/specs/rbac/spec.md
- .context/specs/cross-cutting.md

## Symptoms
- Expected: [what should happen]
- Actual: [what is happening]
- Affected roles: [list]

## Root Cause Analysis
[After investigation, describe the cause]

## Fix Approach
1. [Step 1]
2. [Step 2]

## Files to Modify
- [ ] [file1] - [what to change]
- [ ] [file2] - [what to change]

## Verification
- [ ] Manual test with [role]
- [ ] E2E test covers this case
- [ ] No regression in other roles

## Post-Fix
- [ ] Update decision-log if rules clarified
- [ ] Update spec if behavior was ambiguous
```

---

## Template 7: Database Migration (RLS/Policy Change)

```markdown
# Task: Database Policy Change

## Context Loading (Read First)
- .context/specs/cross-cutting.md (Database Objects section)
- Current RLS policies in supabase/migrations/

## Change Description
- **Table:** [table name]
- **Policy Type:** SELECT/INSERT/UPDATE/DELETE
- **Current Behavior:** [describe]
- **New Behavior:** [describe]

## SQL Migration
```sql
-- Migration: YYYYMMDD_description.sql

-- Drop existing policy
DROP POLICY IF EXISTS "policy_name" ON table_name;

-- Create new policy
CREATE POLICY "policy_name" ON table_name
FOR [SELECT|INSERT|UPDATE|DELETE]
USING (
  -- conditions
);
```

## Rollback SQL
```sql
-- Restore previous policy
```

## Testing
- [ ] Test with admin user
- [ ] Test with restricted user
- [ ] Verify no data leakage
- [ ] Verify legitimate access works
```

---

## Quick Reference: Which Template to Use

| Scenario | Template |
|----------|----------|
| Adding/changing permissions | Template 1 |
| Adding/changing ticket statuses | Template 2 |
| Changing who can see what | Template 3 |
| New ticket type (TI, Jurídico, etc.) | Template 4 |
| Changing approval chain | Template 5 |
| Fixing permission bug | Template 6 |
| Database policy change | Template 7 |

---

## Tips for Effective Prompts

1. **Always load context first** - Reference specific spec files
2. **Be explicit about roles** - Name exact roles affected
3. **Include acceptance criteria** - Define what "done" looks like
4. **Mention constraints** - Backward compatibility, no breaking changes
5. **Request decision-log update** - Document why for future reference
