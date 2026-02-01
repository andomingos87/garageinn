# Domain Specifications

This folder contains **authoritative specifications** for cross-cutting concerns and domain rules.

## Purpose

When AI assistants work on features that touch global systems (RBAC, approvals, visibility), they MUST read the relevant specs first to understand the complete picture.

## Structure

```
specs/
├── README.md                    # This file
├── cross-cutting.md             # Impact map for global features
├── rbac/
│   ├── spec.md                  # Complete RBAC specification
│   ├── roles-matrix.md          # Role × Permission matrix
│   ├── department-rules.md      # Department-specific rules
│   └── decision-log.md          # Historical decisions and rationale
└── tickets/
    ├── spec.md                  # Ticket system specification
    ├── approval-flow.md         # Approval state machine
    ├── visibility-rules.md      # Who sees what
    └── assignment-rules.md      # Assignment and triage rules
```

## How to Use

### Before Starting Work

1. **Identify the domain** - Which spec folder is relevant?
2. **Read the main spec.md** - Understand the complete picture
3. **Check cross-cutting.md** - Identify all affected files
4. **Review decision-log.md** - Understand why things are the way they are

### When Making Changes

1. **Update the spec first** - Document the intended change
2. **Implement the change** - Follow the spec
3. **Update decision-log.md** - Record why the change was made

### Prompt Template

```markdown
## Context Loading

Before implementing [feature], read:
- .context/specs/[domain]/spec.md
- .context/specs/cross-cutting.md
- [Specific implementation files from impact map]

## Task
[What you want to do]

## Constraints
- Follow patterns established in the spec
- Update decision-log if rules change
```

## Spec File Format

Each spec.md should contain:

1. **Overview** - What this system does
2. **Actors** - Who interacts with it
3. **Rules** - Business logic and constraints
4. **State Machine** (if applicable) - States and transitions
5. **Edge Cases** - Documented exceptions
6. **Implementation References** - Links to code files

## Cross-References

- [RBAC Specification](./rbac/spec.md)
- [Ticket Specification](./tickets/spec.md)
- [Cross-Cutting Impact Map](./cross-cutting.md)
