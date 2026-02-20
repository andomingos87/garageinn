---
name: module-context-creator
description: Creates and maintains .context/modules/ documentation for project modules. Identifies module boundaries, generates module READMEs with scope, data flow, integrations, error handling, and conventions. Use when the user asks to document a module, create module context, add a new module to .context/modules/, or update existing module documentation.
---

# Module Context Creator

## When to Use

- User asks to document a module, service, or domain area
- User says "create module context" or "add module to .context"
- A new app, service, or domain is added to the codebase
- Existing module docs need updating after significant changes
- User asks to set up `.context/modules/` for the first time

## Workflow

```
Task Progress:
- [ ] Step 1: Identify the module(s)
- [ ] Step 2: Explore the module codebase
- [ ] Step 3: Write the module README
- [ ] Step 4: Update the modules index
- [ ] Step 5: Verify completeness
```

---

## Step 1: Identify the Module

A module is a cohesive unit with a distinct business responsibility. Look for these signals:

| Signal | Example |
|--------|---------|
| Separate app/service in monorepo | `apps/billing/`, `services/auth/` |
| Distinct API domain | Payment processing, user management |
| Owns database tables | `orders`, `invoices`, `subscriptions` |
| Integrates with specific external system | Stripe, Twilio, OMIE |
| Separate deployment unit | Edge Functions, microservice |

**Sizing guide:**
- Too small: a utility function → part of "shared" module
- Just right: a business domain → own module
- Too big: "the backend" → break into domain modules

If `.context/modules/` doesn't exist yet, create it with a README. Use the generic guide at `.context/modules/MODULE-CONTEXT-GUIDE.md` as the base if available, otherwise create one following the template in [module-index-template.md](module-index-template.md).

---

## Step 2: Explore the Module Codebase

Before writing, gather this information:

### Required Research

1. **Directories**: List all folders that belong to this module
2. **Key files**: Identify the main entry points, services, controllers, routes
3. **Data flow**: Trace the primary request/event path through the module
4. **Database tables**: Find all tables read/written by this module
5. **External integrations**: Identify APIs, webhooks, queues, other modules
6. **Environment variables**: Find all env vars used
7. **Error handling**: Identify error types, mapping patterns, logging
8. **Tests**: Locate test files and determine coverage areas

### Exploration Strategy

```
1. Start with package.json or entry point → understand purpose
2. Map directory structure → understand organization
3. Read routes/controllers → understand API surface
4. Read services → understand business logic
5. Read config/env → understand dependencies
6. Read tests → understand expected behavior
7. Read error handling → understand failure modes
```

Use `explore` (getStructure, search, analyze) or direct file reads to gather this data.

---

## Step 3: Write the Module README

Create `README.md` inside `.context/modules/{module-name}/`.

### Required Sections (always include)

```markdown
# Module: {Name}

## Overview
{One specific paragraph. Not "handles X" but "orchestrates X through Y
with Z compliance, triggered by W events."}

## Scope
### Directories
| Path | Description |
|------|-------------|

### Edge Functions / Services (if applicable)
| Name | Purpose |
|------|---------|

### Dependencies
| Package/Module | Usage |
|----------------|-------|

## Key Components
| Component | Path | Responsibility |
|-----------|------|----------------|

## Data Flow
{Describe primary flow(s) with ASCII diagrams:}
```
Entry → Step 1 → Step 2 → Output
```

## Integration Points
| System | Direction | Protocol | Notes |
|--------|-----------|----------|-------|

## Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|

## Error Handling
{Error types, mapping strategy, logging, propagation.}

## Testing
| Type | Location | Command |
|------|----------|---------|

## Conventions
- {Module-specific rules}

## Known Limitations
- {Honest tech debt and gaps}
```

### Optional Sections (add when valuable)

| Section | When to Add |
|---------|-------------|
| **Data Model** | Module owns DB tables with complex schemas |
| **API Reference** | Module exposes HTTP endpoints |
| **Security** | Handles auth, PII, payments, compliance |
| **Deployment** | Special deploy steps or feature flags |

### Writing Principles

1. **Be specific**: "orchestrates Stripe payments with PCI-DSS" not "handles payments"
2. **Document boundaries**: what the module OWNS, DEPENDS ON, and EXPOSES
3. **Link to code, don't paste it**: reference paths, the agent can read files
4. **Prioritize why/how over what**: code says what, docs explain intent
5. **Be honest about limitations**: undocumented debt is worse than documented debt

---

## Step 4: Update the Modules Index

After creating a module README, update `.context/modules/README.md`:

1. Add the module to the **Module Index** table
2. Update the directory structure diagram if shown
3. If this is the first module, create the root README using the guide template

### Module Index Table Format

```markdown
## Module Index

| Module | Domain | Components |
|--------|--------|------------|
| [module-name](./module-name/) | Business domain | Key components summary |
```

Also update `.context/README.md` if `modules/` is not yet listed in the directory structure.

---

## Step 5: Verify Completeness

### Checklist

- [ ] Overview is specific (not just the module name restated)
- [ ] Scope lists ALL directories, services, and functions
- [ ] Key Components covers files an agent would actually edit
- [ ] Data Flow has at least one end-to-end flow diagram
- [ ] Integration Points lists every external system and internal module dependency
- [ ] Environment Variables documented (no actual secrets!)
- [ ] Error Handling explains strategy, not just "errors are handled"
- [ ] Testing includes file locations AND run commands
- [ ] Conventions are module-specific (not generic project rules)
- [ ] Known Limitations are honest and actionable
- [ ] Modules index README is updated

---

## Special Scenarios

### First-Time Setup (.context/modules/ doesn't exist)

1. Create `.context/modules/` directory
2. Create `.context/modules/README.md` with index template and module documentation guide
3. Create individual module folders with READMEs
4. Update `.context/README.md` to include `modules/` in directory tree

### Monorepo with Many Modules

Group by domain if there are many small modules:

```
modules/
├── checkout/       # Groups: app + edge functions + shared utils
├── billing/        # Groups: invoicing + ERP sync
└── shared/         # Cross-cutting infrastructure
```

Edge Functions that belong to a domain should be documented within that domain's module, not as separate modules.

### Updating Existing Module Docs

1. Read the current module README
2. Explore what changed in the codebase (new files, removed files, changed patterns)
3. Update affected sections (don't rewrite everything)
4. Add new entries to Known Limitations if tech debt was introduced
5. Remove resolved limitations

---

## Additional Resources

- For the complete generic guide and template: see [module-index-template.md](module-index-template.md)