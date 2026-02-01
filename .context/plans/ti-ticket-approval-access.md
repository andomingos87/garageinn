---
status: filled
generated: 2026-02-01
agents:
  - type: "code-reviewer"
    role: "Review access changes for regressions and consistency"
  - type: "bug-fixer"
    role: "Trace the Access Denied path and confirm root cause"
  - type: "feature-developer"
    role: "Implement the access fix and keep hierarchy intact"
  - type: "refactoring-specialist"
    role: "Keep access helpers clear and well named"
  - type: "test-writer"
    role: "Add or update tests for approval access by role"
  - type: "documentation-writer"
    role: "Update RBAC or approval docs if rules change"
  - type: "performance-optimizer"
    role: "Not expected for this change"
  - type: "security-auditor"
    role: "Ensure no over-broad access is introduced"
  - type: "backend-specialist"
    role: "Validate server actions and RLS alignment"
  - type: "frontend-specialist"
    role: "Confirm UI gating matches server checks"
  - type: "architect-specialist"
    role: "Validate cross-department rules and hierarchy"
  - type: "devops-specialist"
    role: "Not expected for this change"
  - type: "database-specialist"
    role: "Review RLS policies for approvals/tickets"
  - type: "mobile-specialist"
    role: "Out of scope (web only)"
docs:
  - "project-overview.md"
  - "architecture.md"
  - "development-workflow.md"
  - "testing-strategy.md"
  - "glossary.md"
  - "data-flow.md"
  - "security.md"
  - "tooling.md"
  - "specs/rbac/spec.md"
  - "specs/rbac/department-rules.md"
  - "specs/tickets/approval-flow.md"
  - "specs/tickets/visibility-rules.md"
  - "specs/cross-cutting.md"
phases:
  - id: "phase-1"
    name: "Discovery & Alignment"
    prevc: "P"
  - id: "phase-2"
    name: "Implementation & Iteration"
    prevc: "E"
  - id: "phase-3"
    name: "Validation & Handoff"
    prevc: "V"
---

# Acesso de aprovacao TI para Operacoes Plan

> C:\Users\asdom\OneDrive\Área de Trabalho\projects\garageinn\.context\plans\ti-ticket-approval-access.md

## Task Snapshot
- **Primary goal:** permitir que Encarregado, Supervisor e Gerente de Operacoes acessem e aprovem chamados de TI conforme a hierarquia existente.
- **Success signal:** usuarios de Operacoes com cargos aprovadores conseguem abrir o detalhe de TI e aprovar no nivel correto; outros cargos seguem bloqueados.
- **Key references:**
  - [Documentation Index](../docs/README.md)
  - [Agent Handbook](../agents/README.md)
  - [Plans Index](./README.md)

## Codebase Context
- **Total files analyzed:** targeted scan (TI access, approvals, RBAC specs)
- **Total symbols discovered:** not measured
- **Architecture layers:** Auth, Server Actions, UI Components, Supabase RLS
- **Entry points:** `apps/web/src/app/(app)/chamados/ti/[ticketId]/page.tsx`, `apps/web/src/app/(app)/chamados/ti/actions.ts`

### Key Components

**Key Files / Functions:**
- `apps/web/src/lib/auth/ti-access.ts` (canAccessTiArea, helpers de acesso)
- `apps/web/src/app/(app)/chamados/ti/actions.ts` (canAccessTiTicketDetail, ensureTiAccess, handleApproval, getApprovalContext)
- `apps/web/src/app/(app)/chamados/ti/components/ti-ticket-status.tsx` (UI de aprovacao por nivel)
- `apps/web/src/lib/auth/permissions.ts` (roles e permissoes por departamento)
- `apps/web/src/lib/auth/rbac.ts` (calculo de permissoes)
- `supabase/migrations/*_rls_*.sql` (politicas de acesso)

## Agent Lineup
| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Code Reviewer | Validar que a nova regra nao expande acesso indevido | [Code Reviewer](../agents/code-reviewer.md) | Review code changes for quality, style, and best practices |
| Bug Fixer | Confirmar a causa do Access Denied e pontos de bloqueio | [Bug Fixer](../agents/bug-fixer.md) | Analyze bug reports and error messages |
| Feature Developer | Implementar helper de acesso para aprovadores de Operacoes | [Feature Developer](../agents/feature-developer.md) | Implement new features according to specifications |
| Refactoring Specialist | Tornar helpers de acesso claros e reutilizaveis | [Refactoring Specialist](../agents/refactoring-specialist.md) | Identify code smells and improvement opportunities |
| Test Writer | Cobrir aprovacao por nivel e bloqueios incorretos | [Test Writer](../agents/test-writer.md) | Write comprehensive unit and integration tests |
| Documentation Writer | Atualizar specs se a regra for formalizada | [Documentation Writer](../agents/documentation-writer.md) | Create clear, comprehensive documentation |
| Performance Optimizer | Sem impacto de performance esperado | [Performance Optimizer](../agents/performance-optimizer.md) | Identify performance bottlenecks |
| Security Auditor | Verificar que roles de outros departamentos nao aprovam TI | [Security Auditor](../agents/security-auditor.md) | Identify security vulnerabilities |
| Backend Specialist | Ajustar guards em server actions e validar RLS | [Backend Specialist](../agents/backend-specialist.md) | Design and implement server-side architecture |
| Frontend Specialist | Garantir UI de aprovacao usa roles filtradas | [Frontend Specialist](../agents/frontend-specialist.md) | Design and implement user interfaces |
| Architect Specialist | Validar regra de visibilidade cross-department | [Architect Specialist](../agents/architect-specialist.md) | Design overall system architecture and patterns |
| Devops Specialist | Sem mudancas de CI/CD | [Devops Specialist](../agents/devops-specialist.md) | Design and maintain CI/CD pipelines |
| Database Specialist | Checar politicas RLS e views de tickets | [Database Specialist](../agents/database-specialist.md) | Design and optimize database schemas |
| Mobile Specialist | Fora do escopo (web only) | [Mobile Specialist](../agents/mobile-specialist.md) | Develop native and cross-platform mobile applications |

## Documentation Touchpoints
| Guide | File | Primary Inputs |
| --- | --- | --- |
| Project Overview | [project-overview.md](../docs/project-overview.md) | No changes expected |
| Architecture Notes | [architecture.md](../docs/architecture.md) | No changes expected |
| Development Workflow | [development-workflow.md](../docs/development-workflow.md) | No changes expected |
| Testing Strategy | [testing-strategy.md](../docs/testing-strategy.md) | Update if E2E coverage changes |
| Glossary & Domain Concepts | [glossary.md](../docs/glossary.md) | No changes expected |
| Data Flow & Integrations | [data-flow.md](../docs/data-flow.md) | No changes expected |
| Security & Compliance Notes | [security.md](../docs/security.md) | Note any new access rule |
| Tooling & Productivity Guide | [tooling.md](../docs/tooling.md) | No changes expected |

## Risk Assessment
Identify potential blockers, dependencies, and mitigation strategies before beginning work.

### Identified Risks
| Risk | Probability | Impact | Mitigation Strategy | Owner |
| --- | --- | --- | --- | --- |
| Permitir aprovacao por Supervisor/Gerente de outros departamentos | Medium | High | Filtrar roles por departamento Operacoes no contexto de aprovacao | Dev |
| RLS bloquear aprovacoes mesmo com UI liberada | Medium | High | Validar politicas de `ticket_approvals` e `tickets` para aprovadores | Dev |
| Nome de departamento divergente (Produção vs Operações) | Medium | Medium | Confirmar nomes reais no banco e nas specs | Dev |

### Dependencies
- **Internal:** helpers de acesso em `apps/web/src/lib/auth/ti-access.ts`
- **External:** none
- **Technical:** politicas RLS para `tickets` e `ticket_approvals` permitirem aprovacao

### Assumptions
- Operacoes e o nome oficial do departamento "Production" citado no requisito.
- A hierarquia de aprovacao TI usa os mesmos niveis (Encarregado, Supervisor, Gerente).
- As roles do usuario podem ser filtradas por departamento na camada server.

## Resource Estimation

### Time Allocation
| Phase | Estimated Effort | Calendar Time | Team Size |
| --- | --- | --- | --- |
| Phase 1 - Discovery | 0.5 day | 0.5-1 day | 1 |
| Phase 2 - Implementation | 0.5-1 day | 1-2 days | 1 |
| Phase 3 - Validation | 0.5 day | 0.5-1 day | 1 |
| **Total** | **1.5-2 days** | **2-4 days** | **1** |

### Required Skills
- Next.js App Router, server actions
- RBAC / permissions modeling
- Supabase RLS basics

### Resource Availability
- **Available:** 1 web dev
- **Blocked:** none
- **Escalation:** tech lead web

## Working Phases
### Phase 1 — Discovery & Alignment
**Steps**
1. Mapear os gates atuais: `canAccessTiArea`, `canAccessTiTicketDetail`, `ensureTiAccess`, `handleApproval`, `getApprovalContext`.
2. Ler specs de RBAC e approvals para confirmar regra de aprovadores Operacoes.
3. Revisar politicas RLS de `tickets` e `ticket_approvals` para acesso de aprovadores.

**Commit Checkpoint**
- Registrar contexto e ajustar plano, se necessario (commit somente se solicitado).

### Phase 2 — Implementation & Iteration
**Steps**
1. Criar helper de acesso para aprovadores de Operacoes (Encarregado/Supervisor/Gerente) sem alterar a hierarquia.
2. Usar o helper em `canAccessTiTicketDetail` e `handleApproval`.
3. Filtrar roles por departamento para o contexto de aprovacao e UI (`TiTicketStatus`).
4. Manter `canAccessTiArea` para lista geral de TI (sem liberar lista para Operacoes).

**Commit Checkpoint**
- Commit de implementacao e atualizacao de docs/decisao, se solicitado.

### Phase 3 — Validation & Handoff
**Steps**
1. Testar acesso ao detalhe de TI para Encarregado/Supervisor/Gerente de Operacoes.
2. Validar aprovacao por nivel e bloqueio fora do nivel atual.
3. Confirmar que roles de outros departamentos nao conseguem aprovar.
4. Verificar admin/TI permanecem com acesso total.

**Commit Checkpoint**
- Commit de validacao com evidencias (somente se solicitado).

## Rollback Plan
Document how to revert changes if issues arise during or after implementation.

### Rollback Triggers
When to initiate rollback:
- Acesso indevido de outros departamentos a aprovacoes TI
- Bloqueio de aprovadores legitimos
- Erros de permissao persistentes em producao

### Rollback Procedures
#### Phase 1 Rollback
- Action: descartar ajustes de plano
- Data Impact: none
- Estimated Time: < 1 hour

#### Phase 2 Rollback
- Action: reverter helper de acesso e guardas em TI actions/pages
- Data Impact: none
- Estimated Time: 15-30 minutes

#### Phase 3 Rollback
- Action: reverter commit, validar fluxo antigo e monitorar erros
- Data Impact: none
- Estimated Time: 30-60 minutes

### Post-Rollback Actions
1. Documentar causa e impacto
2. Notificar stakeholders
3. Registrar lições aprendidas
4. Ajustar plano antes de retomar

## Evidence & Follow-up
- Logs ou prints de aprovacao por nivel (Operacoes)
- Evidencia de bloqueio para roles nao-Operacoes
- Nota de smoke test para admin/TI
