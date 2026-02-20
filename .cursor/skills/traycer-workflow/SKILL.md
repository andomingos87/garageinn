---
name: traycer-workflow
description: Plans and executes spec-driven delivery using Traycer patterns, including spec drafting, phased task breakdown, agent orchestration, and validation gates. Use when users mention Traycer, traycer.ai, spec-driven development, implementation plans, task decomposition, or requirement-to-code workflows.
---

# Traycer Workflow

Use this skill to convert product intent into a practical execution package with clear checkpoints.

## Quick start

When this skill is triggered:
1. Capture the objective, constraints, and acceptance criteria.
2. Draft a compact spec with scope, non-goals, dependencies, and risks.
3. Build a phased implementation plan with actionable tasks.
4. Define verification gates and rollout safeguards.
5. Return a concise delivery package.

## Workflow

### 1) Objective framing
- Identify business outcome and user-facing impact.
- Confirm technical constraints (stack, deadlines, compatibility).
- Record assumptions explicitly.

### 2) Spec drafting
- Include:
  - Problem statement
  - In-scope and out-of-scope items
  - Functional requirements
  - Non-functional requirements
  - Risks and dependencies
- Convert vague requirements into measurable acceptance criteria.

### 3) Task planning
- Break work into phases (for example: foundation, implementation, hardening, release).
- For each task, include:
  - Expected output
  - Dependencies
  - Suggested owner/profile (frontend, backend, tests, docs)
  - Validation step

### 4) Orchestration guidance
- Recommend delegation points for specialized agents.
- Highlight cross-team contracts (API shape, schemas, feature flags, migrations).
- Flag blockers early and offer fallback options.

### 5) Validation gates
- Define minimum checks:
  - Unit/integration tests
  - Critical path e2e checks
  - Regression checklist
  - Observability and rollback notes (when relevant)

## Output template

Use this response shape:

```markdown
## Objective
[One paragraph with expected outcome]

## Proposed Spec
- Scope:
- Non-goals:
- Requirements:
- Risks/dependencies:
- Acceptance criteria:

## Implementation Plan
### Phase 1
- Task:
- Output:
- Dependencies:
- Validation:

### Phase 2
- Task:
- Output:
- Dependencies:
- Validation:

## Verification Checklist
- [ ] Unit/integration checks
- [ ] Critical path e2e
- [ ] Regression checks
- [ ] Rollout/rollback notes

## Risks and Next Actions
- Risk:
- Mitigation:
- Next action:
```

## Constraints

- Keep recommendations concrete and repository-aware.
- Prefer one default approach; add alternatives only when trade-offs matter.
- Avoid speculative implementation details not grounded in stated requirements.
