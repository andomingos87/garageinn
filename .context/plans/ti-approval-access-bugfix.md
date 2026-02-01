---
status: filled
generated: 2026-02-01
agents:
  - type: "code-reviewer"
    role: "Review access changes for regressions and consistency"
  - type: "bug-fixer"
    role: "Analyze the access regression and confirm root cause"
  - type: "feature-developer"
    role: "Implement the access fix while preserving hierarchy"
  - type: "refactoring-specialist"
    role: "Keep access helpers clear and reusable"
  - type: "test-writer"
    role: "Write or update tests for approver access"
  - type: "documentation-writer"
    role: "Update specs and decision logs if rules change"
  - type: "performance-optimizer"
    role: "Check for unnecessary query overhead"
  - type: "security-auditor"
    role: "Validate no over-broad access is introduced"
  - type: "backend-specialist"
    role: "Validate server actions and RLS alignment"
  - type: "frontend-specialist"
    role: "Ensure UI gating aligns with server checks"
  - type: "architect-specialist"
    role: "Validate cross-department rules and hierarchy scope"
  - type: "devops-specialist"
    role: "Confirm no CI/CD changes are needed"
  - type: "database-specialist"
    role: "Review RLS policies and approval queries"
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
  - "specs/rbac/roles-matrix.md"
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

# Plano de correção do acesso apos aprovacao TI

> C:\Users\asdom\OneDrive\Área de Trabalho\projects\garageinn\.context\plans\ti-approval-access-bugfix.md

## Task Snapshot
- **Primary goal:** corrigir o acesso ao detalhe de TI para aprovadores de Operacoes apos aprovacao, sem alterar a hierarquia.
- **Success signal:** Encarregado/Supervisor/Gerente conseguem abrir o detalhe antes e depois de aprovar; outros cargos continuam bloqueados; hierarquia preservada.
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

**Key Interfaces:**
- `UserRole` — `apps/web/src/lib/auth/rbac.ts`
- `Permission` — `apps/web/src/lib/auth/permissions.ts`
- `TiAccessContext` — `apps/web/src/app/(app)/chamados/ti/actions.ts`
- `TicketApproval` — `.context/specs/tickets/approval-flow.md`

## Agent Lineup
| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Code Reviewer | Checar regressao e consistencia do acesso | [Code Reviewer](../agents/code-reviewer.md) | Review code changes for quality, style, and best practices |
| Bug Fixer | Mapear causa do Access Denied apos aprovacao | [Bug Fixer](../agents/bug-fixer.md) | Analyze bug reports and error messages |
| Feature Developer | Implementar ajuste de acesso pos-aprovacao | [Feature Developer](../agents/feature-developer.md) | Implement new features according to specifications |
| Refactoring Specialist | Simplificar helpers de acesso sem alterar regra | [Refactoring Specialist](../agents/refactoring-specialist.md) | Identify code smells and improvement opportunities |
| Test Writer | Garantir cobertura de todos os niveis | [Test Writer](../agents/test-writer.md) | Write comprehensive unit and integration tests |
| Documentation Writer | Atualizar specs se a regra for formalizada | [Documentation Writer](../agents/documentation-writer.md) | Create clear, comprehensive documentation |
| Performance Optimizer | Verificar consultas extras ou N+1 | [Performance Optimizer](../agents/performance-optimizer.md) | Identify performance bottlenecks |
| Security Auditor | Garantir que outros departamentos nao ganhem acesso | [Security Auditor](../agents/security-auditor.md) | Identify security vulnerabilities |
| Backend Specialist | Ajustar server actions e validar RLS | [Backend Specialist](../agents/backend-specialist.md) | Design and implement server-side architecture |
| Frontend Specialist | Ajustar gating do detalhe/acao se necessario | [Frontend Specialist](../agents/frontend-specialist.md) | Design and implement user interfaces |
| Architect Specialist | Validar regra cross-department e hierarquia | [Architect Specialist](../agents/architect-specialist.md) | Design overall system architecture and patterns |
| Devops Specialist | Confirmar que nao ha impacto em CI/CD | [Devops Specialist](../agents/devops-specialist.md) | Design and maintain CI/CD pipelines |
| Database Specialist | Revisar politicas RLS de tickets/aprovacoes | [Database Specialist](../agents/database-specialist.md) | Design and optimize database schemas |
| Mobile Specialist | Fora de escopo (web only) | [Mobile Specialist](../agents/mobile-specialist.md) | Develop native and cross-platform mobile applications |

## Documentation Touchpoints
| Guide | File | Primary Inputs |
| --- | --- | --- |
| Project Overview | [project-overview.md](../docs/project-overview.md) | Contexto do produto e limites de escopo |
| Architecture Notes | [architecture.md](../docs/architecture.md) | Limites de responsabilidade entre camadas |
| Development Workflow | [development-workflow.md](../docs/development-workflow.md) | Fluxo de PR, commits e testes |
| Testing Strategy | [testing-strategy.md](../docs/testing-strategy.md) | Cobertura e2e e criteros de validacao |
| Glossary & Domain Concepts | [glossary.md](../docs/glossary.md) | Termos de dominio (Operacoes, TI) |
| Data Flow & Integrations | [data-flow.md](../docs/data-flow.md) | Fluxo de dados via Supabase |
| Security & Compliance Notes | [security.md](../docs/security.md) | Regras de acesso e riscos |
| Tooling & Productivity Guide | [tooling.md](../docs/tooling.md) | Scripts de lint/test |

## Risk Assessment
Identify potential blockers, dependencies, and mitigation strategies before beginning work.

### Identified Risks
| Risk | Probability | Impact | Mitigation Strategy | Owner |
| --- | --- | --- | --- | --- |
| Liberar acesso de TI para outros departamentos | Medium | High | Filtrar por departamento Operacoes e role aprovadora | Dev |
| RLS impedir leitura do ticket apos aprovacao | Medium | High | Revisar politicas de `tickets` e `ticket_approvals` | Dev |
| Nome de departamento divergente (Operacoes vs Produção) | Medium | Medium | Confirmar strings no banco e specs | Dev |

### Dependencies
- **Internal:** `apps/web/src/lib/auth/ti-access.ts`, `apps/web/src/app/(app)/chamados/ti/actions.ts`
- **External:** none
- **Technical:** alinhamento com RLS e views de tickets

### Assumptions
- O departamento de producao corresponde a "Operacoes" no banco.
- A aprovacao de TI segue a mesma hierarquia Encarregado → Supervisor → Gerente.
- O fluxo de aprovacao deve manter visibilidade para o aprovador apos a decisao.

## Resource Estimation

### Time Allocation
| Phase | Estimated Effort | Calendar Time | Team Size |
| --- | --- | --- | --- |
| Phase 1 - Discovery | 0.5 day | 0.5-1 day | 1 |
| Phase 2 - Implementation | 0.5-1 day | 1-2 days | 1 |
| Phase 3 - Validation | 0.5 day | 0.5-1 day | 1 |
| **Total** | **1.5-2 days** | **2-4 days** | **1** |

### Required Skills
- Next.js App Router e server actions
- RBAC e regras de visibilidade
- Supabase RLS e policies

### Resource Availability
- **Available:** 1 dev web
- **Blocked:** none
- **Escalation:** tech lead web

## Working Phases
### Phase 1 — Discovery & Alignment
**Steps**
1. Reproduzir o Access Denied apos aprovacao (Encarregado/Supervisor/Gerente).
2. Mapear gates de acesso em `canAccessTiTicketDetail`, `handleApproval`, `getApprovalContext` e RLS.
3. Alinhar comportamento esperado com specs de RBAC e visibilidade.

**Commit Checkpoint**
- Registrar achados e ajustar plano se necessario (commit somente se solicitado).

### Phase 2 — Implementation & Iteration
**Steps**
1. Ajustar regra de acesso para aprovadores manterem visibilidade apos aprovar (sem abrir lista TI).
2. Garantir que o acesso considera unidade quando aplicavel (Operacoes).
3. Alinhar UI de aprovacao com o contexto de roles filtrado por departamento.
4. Atualizar specs/decision logs se a regra for oficializada.

**Commit Checkpoint**
- Commit de implementacao e docs, se solicitado.

### Phase 3 — Validation & Handoff
**Steps**
1. Testar fluxo completo: Encarregado → Supervisor → Gerente, sem perda de acesso.
2. Verificar bloqueio para outros departamentos e roles sem aprovacao.
3. Validar admin/TI continuam com acesso total.
4. Registrar evidencias de teste.

**Commit Checkpoint**
- Commit de validacao com evidencias (somente se solicitado).

## Rollback Plan
Document how to revert changes if issues arise during or after implementation.

### Rollback Triggers
When to initiate rollback:
- Acesso indevido para usuarios nao autorizados
- Bloqueio de aprovadores legitimos
- Erros de permissao em producao

### Rollback Procedures
#### Phase 1 Rollback
- Action: descartar ajustes de plano
- Data Impact: none
- Estimated Time: < 1 hour

#### Phase 2 Rollback
- Action: reverter helpers de acesso e ajustes em server actions
- Data Impact: none
- Estimated Time: 15-30 minutes

#### Phase 3 Rollback
- Action: reverter commits, validar fluxo anterior e monitorar logs
- Data Impact: none
- Estimated Time: 30-60 minutes

### Post-Rollback Actions
1. Documentar causa e impacto
2. Notificar stakeholders
3. Registrar licoes aprendidas
4. Ajustar plano antes de retomar

## Evidence & Follow-up
- Logs ou prints de aprovacao sem Access Denied
- Evidencia de bloqueio para roles nao autorizadas
- Resultado de testes e2e e smoke tests
