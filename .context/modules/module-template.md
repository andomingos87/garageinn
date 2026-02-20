# .context/modules — Module Context Documentation

> **Portable guide.** Copy this file as `README.md` into any project's `.context/modules/` folder to establish module-level context documentation.

---

## What Is This?

While `.context/docs/` provides project-wide documentation (architecture, workflows, tooling), **`.context/modules/`** goes deeper — it documents each business domain or service boundary individually.

A "module" is any cohesive unit of your codebase that:
- Owns a distinct business responsibility
- Has its own data model, APIs, or integration points
- Can be worked on somewhat independently
- Would benefit from focused context when an AI agent (or developer) works within it

### Why Module Context Matters

Generic project docs tell the AI *what the project is*. Module docs tell it *how to work inside a specific area* — what to touch, what not to touch, how data flows, what errors look like, and what conventions matter here specifically.

Without module context, AI agents:
- Miss integration boundaries and break contracts
- Don't know about module-specific error handling patterns
- Can't distinguish which env vars, tables, or services belong to which domain
- Produce code that's technically correct but architecturally wrong

---

## Directory Structure

```
.context/modules/
├── README.md              # This file (or MODULE-CONTEXT-GUIDE.md)
├── {module-a}/
│   ├── README.md          # Required: module context documentation
│   ├── data-model.md      # Optional: detailed schema/ERD
│   ├── api-reference.md   # Optional: endpoint documentation
│   └── error-catalog.md   # Optional: error codes and handling
├── {module-b}/
│   └── README.md
└── {module-c}/
    └── README.md
```

---

## How to Identify Modules

### Common Module Boundaries

| Signal | Example |
|--------|---------|
| Separate app/service in a monorepo | `apps/billing/`, `apps/notifications/` |
| Distinct API domain | Payment processing, user management |
| Owns database tables | `orders`, `invoices`, `subscriptions` |
| Integrates with a specific external system | Stripe, Twilio, SAP |
| Has its own deployment unit | Serverless functions, microservice |
| Different team or domain expert | "Ask Maria about billing" |

### Anti-Patterns (Not a Module)

| Not a Module | Why |
|-------------|-----|
| A single utility function | Too granular — belongs in "shared" module |
| An entire monorepo | Too broad — break into domain modules |
| A test suite | Tests document the module they test, not themselves |
| A config file | Config is part of the module it configures |

### Module Sizing Guide

```
Too small:  "The formatDate utility"     → Part of shared/utils
Just right: "The payment processing domain" → checkout module
Too big:    "The entire backend"          → Break into billing, auth, notifications, etc.
```

---

## Module README Template

Every module folder **must** contain a `README.md`. Copy the template below and fill it in.

### Required Sections

These sections should appear in every module README:

````markdown
# Module: {Name}

## Overview

{One paragraph: what this module does, who uses it, and its core responsibility.
Be specific — "orchestrates Stripe payments" not "handles payments".}

## Scope

### Directories

| Path | Description |
|------|-------------|
| `path/to/dir/` | What it contains and when to edit it |

### External Services (if applicable)

| Service | Purpose |
|---------|---------|
| Service name | What role it plays |

### Dependencies

| Package/Module | Usage |
|----------------|-------|
| Internal or external dep | How this module uses it |

## Key Components

| Component | Path | Responsibility |
|-----------|------|----------------|
| Name | `path/to/file.ts` | One-line description of what it does |

## Data Flow

```
Describe the primary flow through this module:

Entry Point (HTTP request, event, cron, etc.)
  → Step 1: What happens first
    → Step 2: Processing / business logic
      → Step 3: External call or DB write
  ← Response / output
```

## Integration Points

| System | Direction | Protocol | Notes |
|--------|-----------|----------|-------|
| System name | inbound/outbound/both | REST/gRPC/queue/DB | Key details |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VAR_NAME` | Yes/No | What it configures (never document the value!) |

## Error Handling

{Describe:
- What error types exist in this module
- How external errors are mapped to internal errors
- How errors propagate to the caller
- Where errors are logged}

## Testing

| Type | Location | Command |
|------|----------|---------|
| Unit | `path/to/tests/unit/` | `npm test` or equivalent |

## Conventions

- {Module-specific convention 1}
- {Module-specific convention 2}

## Known Limitations

- {Current limitation or tech debt item 1}
- {Current limitation or tech debt item 2}
````

### Optional Sections

Add these when they provide value:

````markdown
## Data Model

| Table/Collection | Purpose |
|-----------------|---------|
| `table_name` | What data it holds and key fields |

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/resource` | What it returns |
| POST | `/api/v1/resource` | What it creates |

## Security

{Authentication model, PII handling, encryption, compliance requirements.}

## Deployment

{Special deploy steps, feature flags, rollback procedures.}

## Changelog

| Date | Change | Impact |
|------|--------|--------|
| YYYY-MM-DD | What changed | What it affects |
````

---

## Writing Guidelines

### 1. Be Specific, Not Generic

| Bad | Good |
|-----|------|
| "Handles payments" | "Processes Stripe credit card and PIX payments with PCI-DSS compliance" |
| "Talks to the database" | "Reads from `orders` and writes to `invoices` and `audit_log`" |
| "Has error handling" | "Maps Stripe decline codes to user-friendly messages with retry policies" |

### 2. Document Boundaries, Not Internals

Focus on what the module **owns**, **depends on**, and **exposes**:

```
OWNS:       Tables, APIs, business rules
DEPENDS ON: Other modules, external APIs, shared utilities  
EXPOSES:    Public APIs, events, shared types
```

The AI agent can read the code for implementation details. What it can't infer is the *intent* behind architectural boundaries.

### 3. Link to Code, Don't Duplicate It

```markdown
<!-- Good: reference the file -->
The retry logic lives in `src/services/api/retry.ts` with exponential backoff (3 attempts).

<!-- Bad: paste the entire file -->
```typescript
export async function retry(fn, attempts = 3) {
  // ... 50 lines of code ...
}
`` `
```

### 4. Prioritize "Why" and "How" Over "What"

The code already says *what* it does. Your docs should explain:
- **Why** this pattern was chosen (and what alternatives were rejected)
- **How** data flows through the module end-to-end
- **When** specific conventions apply (and when they don't)
- **Where** to look when things break

### 5. Keep It Honest

Document known limitations and tech debt. A module that "has no limitations" is a module with undocumented ones.

```markdown
## Known Limitations

- Rate limiting is in-memory; resets on restart (tracked in JIRA-123)
- City name matching requires exact match; fuzzy search not implemented
- No automatic retry for failed webhook deliveries
```

---

## Maintenance Workflow

### When to Create a Module Doc

- New service or app is added to the codebase
- An existing area grows complex enough to warrant focused documentation
- A team member (or AI agent) consistently makes mistakes in a specific area

### When to Update a Module Doc

- New integration point or external dependency added
- Error handling strategy changes
- New database tables or API endpoints
- Conventions change (e.g., new validation approach)
- Known limitation is resolved or new one discovered

### Review Cadence

- **On every PR** that touches the module: check if docs need updating
- **Monthly**: quick scan for stale information
- **On incidents**: update error handling and known limitations sections

---

## Integration with ai-coders/context

If you're using `@ai-coders/context` with MCP, modules are complementary to the standard scaffolding:

| Layer | Source | Scope |
|-------|--------|-------|
| **Project docs** | `.context/docs/` | Architecture, workflows, tooling (project-wide) |
| **Module docs** | `.context/modules/` | Domain-specific context (per module) |
| **Agent playbooks** | `.context/agents/` | Role-specific behavior (per agent type) |
| **Skills** | `.context/skills/` | Task-specific procedures (on demand) |
| **Plans** | `.context/plans/` | Work plans (per feature/task) |

### PREVC Phase Usage

| Phase | How Module Docs Help |
|-------|---------------------|
| **P** (Planning) | Understand scope, boundaries, and integration points before designing |
| **R** (Review) | Validate approach against module conventions and known limitations |
| **E** (Execution) | Know which files to edit, which patterns to follow, which errors to handle |
| **V** (Validation) | Check against module's testing strategy and error catalog |
| **C** (Confirmation) | Update module docs if architecture or conventions changed |

---

## Quick Start

1. **Create the directory:**
   ```bash
   mkdir -p .context/modules
   ```

2. **Copy this guide** as the root README:
   ```bash
   cp MODULE-CONTEXT-GUIDE.md .context/modules/README.md
   ```

3. **Identify your modules** using the boundaries guide above

4. **Create one folder per module** with a README.md:
   ```bash
   mkdir -p .context/modules/{module-name}
   # Copy and fill the template from "Module README Template" section
   ```

5. **Fill the required sections** — start with Overview, Scope, Key Components, and Data Flow. The rest can be added incrementally.

6. **Reference from `.context/README.md`** — add `modules/` to your directory structure docs.

---

## Checklist

Before considering a module doc complete:

- [ ] Overview clearly states what the module does (not just its name)
- [ ] Scope lists all directories, services, and functions that belong to this module
- [ ] Key Components table covers the main files an agent would need to edit
- [ ] Data Flow describes at least one primary flow end-to-end
- [ ] Integration Points lists all external systems and other modules
- [ ] Environment Variables are documented (no actual secrets!)
- [ ] Error Handling explains the strategy, not just "errors are handled"
- [ ] Testing section includes locations and commands
- [ ] Conventions are module-specific (not just "follow project standards")
- [ ] Known Limitations are honest and actionable