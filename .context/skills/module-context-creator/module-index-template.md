# Module Index README Template

Copy this as `.context/modules/README.md` when setting up module context for a new project.

---

````markdown
# .context/modules — Module Context Documentation

This directory provides **domain-specific context** for each module in the project. While `.context/docs/` covers project-wide architecture and patterns, `modules/` goes deeper into each business domain — its boundaries, components, data flow, integration points, and conventions.

> **Purpose:** Give AI agents (and developers) the focused context they need to work safely within a specific module without needing to understand the entire codebase.

---

## Directory Structure

```
.context/modules/
├── README.md              # This file
├── {module-a}/
│   └── README.md          # Module context documentation
├── {module-b}/
│   └── README.md
└── {module-c}/
    └── README.md
```

---

## How to Document a Module

Each module folder **must** contain a `README.md` with these sections:

| Section | Purpose |
|---------|---------|
| **Overview** | One-paragraph summary: what the module does and why it exists |
| **Scope** | Directories, packages, and services that belong to this module |
| **Key Components** | Main files/classes/services and what each one does |
| **Data Flow** | How requests/data move through the module |
| **Integration Points** | External APIs, other modules, or databases it talks to |
| **Environment Variables** | Required env vars with descriptions (no secrets!) |
| **Error Handling** | Error types, mapping strategy, failure propagation |
| **Testing** | Where tests live, how to run them, what's covered |
| **Conventions** | Module-specific patterns, naming rules, constraints |
| **Known Limitations** | Current gaps, tech debt, areas needing attention |

### Optional Sections

| Section | When to Add |
|---------|-------------|
| **Data Model** | Module owns database tables or complex schemas |
| **API Reference** | Module exposes HTTP endpoints or public functions |
| **Security** | Module handles auth, PII, or sensitive data |
| **Deployment** | Module has special deploy steps or dependencies |

---

## Guidelines

1. **Be specific**: "orchestrates Stripe payments with retry and idempotency" not "handles payments"
2. **Document boundaries**: what the module OWNS, DEPENDS ON, and EXPOSES
3. **Link to code**: reference file paths, don't paste large blocks
4. **Explain why/how**: code says what — docs explain intent and constraints
5. **Stay honest**: document known limitations and tech debt

---

## Module Index

| Module | Domain | Components |
|--------|--------|------------|
<!-- Add modules here as they are documented -->
````

---

## Module README Template

Copy this into `.context/modules/{module-name}/README.md`:

````markdown
# Module: {Name}

## Overview

{One paragraph: what this module does, who uses it, and its core responsibility.
Be specific — not "handles payments" but "orchestrates Stripe credit card and
PIX payments with PCI-DSS compliance, triggered by checkout session creation."}

## Scope

### Directories

| Path | Description |
|------|-------------|
| `path/to/dir/` | What it contains |

### Services / Functions (if applicable)

| Name | Purpose |
|------|---------|
| `service-name` | What it does |

### Dependencies

| Package/Module | Usage |
|----------------|-------|
| `dependency` | How this module uses it |

## Key Components

| Component | Path | Responsibility |
|-----------|------|----------------|
| Name | `path/to/file.ts` | What it does |

## Data Flow

```
Entry Point (HTTP request, event, cron, etc.)
  → Step 1: What happens first
    → Step 2: Processing / business logic
      → Step 3: External call or DB write
  ← Response / output
```

## Integration Points

| System | Direction | Protocol | Notes |
|--------|-----------|----------|-------|
| System name | inbound/outbound | REST/gRPC/queue/DB | Key details |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VAR_NAME` | Yes/No | What it configures |

## Error Handling

{Error types, mapping strategy, logging, and how errors propagate to callers.}

## Testing

| Type | Location | Command |
|------|----------|---------|
| Unit | `path/to/tests/` | `npm test` |

## Conventions

- {Module-specific convention 1}
- {Module-specific convention 2}

## Known Limitations

- {Limitation 1}
- {Limitation 2}
````