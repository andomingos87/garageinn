<!--
Sync Impact Report:
Version change: N/A → 1.0.0
Modified principles: N/A (initial creation)
Added sections: Core Principles, Security & Compliance, Development Workflow, Governance
Templates requiring updates:
  ✅ plan-template.md - Constitution Check section already present
  ✅ spec-template.md - User scenarios structure aligns with principles
  ✅ tasks-template.md - Task organization aligns with principles
  ⚠️ checklist-template.md - No changes needed (generic template)
  ⚠️ agent-file-template.md - No changes needed (generic template)
Follow-up TODOs: None
-->

# Gapp Constitution

## Core Principles

### I. Monorepo Structure
All code MUST be organized within the monorepo workspace structure. Web and Mobile applications are separate workspaces under `apps/`, sharing common utilities and types when appropriate. Each workspace MUST be independently buildable and testable. Shared code MUST be clearly identified and documented to prevent circular dependencies.

### II. Type Safety (NON-NEGOTIABLE)
TypeScript MUST be used for all application code. Type definitions MUST be generated from Supabase schema and kept in sync. All functions MUST have explicit return types. `any` types are prohibited except in exceptional cases with documented justification. Type errors MUST be resolved before code is merged.

### III. Code Quality Standards
All code MUST pass linting (ESLint) and formatting (Prettier) checks before merge. Code reviews MUST verify adherence to project conventions. Consistent naming conventions MUST be followed across Web and Mobile codebases. Code MUST be self-documenting with clear variable and function names.

### IV. Security & RBAC
All authentication and authorization MUST use Supabase Auth with RBAC (Role-Based Access Control). Permission checks MUST be enforced both client-side (for UX) and server-side (for security). Row Level Security (RLS) policies MUST be defined for all Supabase tables. Sensitive operations MUST require explicit permission verification.

### V. Testing Discipline
E2E tests MUST be written for critical user journeys using Playwright. Unit tests SHOULD be written for complex business logic. Integration tests SHOULD verify API contracts and data flows. Tests MUST be independent and not rely on external state. Test failures MUST block merges.

### VI. Documentation
All features MUST include documentation in `docs/`. PRD and BACKLOG MUST be kept up to date. Code comments MUST explain "why" not "what". README files MUST exist for each major module. API contracts and data models MUST be documented.

## Security & Compliance

All user data MUST comply with LGPD (Brazilian data protection law). Sensitive data MUST be encrypted in transit (HTTPS/TLS) and at rest. Authentication tokens MUST be stored securely. Environment variables MUST never be committed to version control. Security vulnerabilities MUST be addressed immediately.

## Development Workflow

All changes MUST be made via feature branches. Pull requests MUST be reviewed before merge. Commits MUST follow conventional commit format. Breaking changes MUST be documented and versioned appropriately. Database migrations MUST be reversible when possible. Feature flags SHOULD be used for gradual rollouts.

## Governance

This constitution supersedes all other development practices. Amendments require documentation of rationale, approval from project maintainers, and migration plan for existing code. All PRs and reviews MUST verify compliance with these principles. Complexity beyond these principles MUST be justified with clear business or technical rationale. Use feature specifications and implementation plans for runtime development guidance.

**Version**: 1.0.0 | **Ratified**: 2026-01-22 | **Last Amended**: 2026-01-22
