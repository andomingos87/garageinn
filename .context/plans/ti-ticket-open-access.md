---
status: filled
generated: 2026-01-26
agents:
  - type: "code-reviewer"
    role: "Review code changes for quality, style, and best practices"
  - type: "bug-fixer"
    role: "Analyze bug reports and error messages"
  - type: "feature-developer"
    role: "Implement new features according to specifications"
  - type: "refactoring-specialist"
    role: "Identify code smells and improvement opportunities"
  - type: "test-writer"
    role: "Write comprehensive unit and integration tests"
  - type: "documentation-writer"
    role: "Create clear, comprehensive documentation"
  - type: "performance-optimizer"
    role: "Identify performance bottlenecks"
  - type: "security-auditor"
    role: "Identify security vulnerabilities"
  - type: "backend-specialist"
    role: "Design and implement server-side architecture"
  - type: "frontend-specialist"
    role: "Design and implement user interfaces"
  - type: "architect-specialist"
    role: "Design overall system architecture and patterns"
  - type: "devops-specialist"
    role: "Design and maintain CI/CD pipelines"
  - type: "database-specialist"
    role: "Design and optimize database schemas"
  - type: "mobile-specialist"
    role: "Develop native and cross-platform mobile applications"
docs:
  - "project-overview.md"
  - "architecture.md"
  - "development-workflow.md"
  - "testing-strategy.md"
  - "glossary.md"
  - "data-flow.md"
  - "security.md"
  - "tooling.md"
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

# Permitir abertura de chamado TI para todos Plan

> C:\Users\asdom\OneDrive\Área de Trabalho\projects\garageinn\.context\plans\ti-ticket-open-access.md

## Task Snapshot
- **Primary goal:** permitir criacao de chamado TI por qualquer usuario com `tickets:create` sem liberar lista/detalhe.
- **Success signal:** usuario manobrista abre `/chamados/ti/novo` e segue bloqueado em `/chamados/ti`; admin e TI continuam OK.
- **Key references:**
  - [Documentation Index](../docs/README.md)
  - [Agent Handbook](../agents/README.md)
  - [Plans Index](./README.md)

## Codebase Context
- **Total files analyzed:** targeted scan (ti access, actions e paginas de TI)
- **Total symbols discovered:** not measured
- **Architecture layers:** Config, Utils, Components, Services
- **Entry points:** `apps/web/src/app/(app)/chamados/ti/*`

### Key Components

**Key Files / Functions:**
- `apps/web/src/lib/auth/ti-access.ts` (canAccessTiArea, helper de acesso)
- `apps/web/src/app/(app)/chamados/ti/actions.ts` (ensureTiAccess, createTiTicket)
- `apps/web/src/app/(app)/chamados/ti/novo/page.tsx` (gate da abertura)
- `apps/web/src/app/(app)/chamados/ti/page.tsx` (gate da lista)
- `apps/web/src/components/auth/access-denied.tsx` (mensagem de bloqueio)

## Agent Lineup
| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Code Reviewer | Verificar separacao de acesso lista vs criacao | [Code Reviewer](../agents/code-reviewer.md) | Review code changes for quality, style, and best practices |
| Bug Fixer | Mapear fluxo atual e pontos de bloqueio | [Bug Fixer](../agents/bug-fixer.md) | Analyze bug reports and error messages |
| Feature Developer | Implementar nova regra de criacao e ajustar pages/actions | [Feature Developer](../agents/feature-developer.md) | Implement new features according to specifications |
| Refactoring Specialist | Revisar helpers de acesso para clareza | [Refactoring Specialist](../agents/refactoring-specialist.md) | Identify code smells and improvement opportunities |
| Test Writer | Ajustar/validar E2E de abertura e lista | [Test Writer](../agents/test-writer.md) | Write comprehensive unit and integration tests |
| Documentation Writer | Confirmar se docs precisam de ajuste | [Documentation Writer](../agents/documentation-writer.md) | Create clear, comprehensive documentation |
| Performance Optimizer | Not needed for this change | [Performance Optimizer](../agents/performance-optimizer.md) | Identify performance bottlenecks |
| Security Auditor | Garantir fronteira de acesso (lista/detalhe) | [Security Auditor](../agents/security-auditor.md) | Identify security vulnerabilities |
| Backend Specialist | Validar guardas nas server actions | [Backend Specialist](../agents/backend-specialist.md) | Design and implement server-side architecture |
| Frontend Specialist | Atualizar gate da pagina de abertura | [Frontend Specialist](../agents/frontend-specialist.md) | Design and implement user interfaces |
| Architect Specialist | Confirmar consistencia do modelo de permissoes | [Architect Specialist](../agents/architect-specialist.md) | Design overall system architecture and patterns |
| Devops Specialist | Not needed for this change | [Devops Specialist](../agents/devops-specialist.md) | Design and maintain CI/CD pipelines |
| Database Specialist | Sem mudancas de schema ou RLS | [Database Specialist](../agents/database-specialist.md) | Design and optimize database schemas |
| Mobile Specialist | Fora de escopo (web only) | [Mobile Specialist](../agents/mobile-specialist.md) | Develop native and cross-platform mobile applications |

## Documentation Touchpoints
| Guide | File | Primary Inputs |
| --- | --- | --- |
| Project Overview | [project-overview.md](../docs/project-overview.md) | No changes expected |
| Architecture Notes | [architecture.md](../docs/architecture.md) | No changes expected |
| Development Workflow | [development-workflow.md](../docs/development-workflow.md) | No changes expected |
| Testing Strategy | [testing-strategy.md](../docs/testing-strategy.md) | Update if E2E coverage changes |
| Glossary & Domain Concepts | [glossary.md](../docs/glossary.md) | No changes expected |
| Data Flow & Integrations | [data-flow.md](../docs/data-flow.md) | No changes expected |
| Security & Compliance Notes | [security.md](../docs/security.md) | Note rule separation if documented |
| Tooling & Productivity Guide | [tooling.md](../docs/tooling.md) | No changes expected |

## Risk Assessment
Identify potential blockers, dependencies, and mitigation strategies before beginning work.

### Identified Risks
| Risk | Probability | Impact | Mitigation Strategy | Owner |
| --- | --- | --- | --- | --- |
| Liberar lista/detalhe por engano | Medium | High | Manter canAccessTiArea em lista/detalhe, revisar rotas | Dev |
| Regra duplicada/confusa | Low | Medium | Nomear helpers de forma explicita e documentar uso | Dev |

### Dependencies
- **Internal:** helpers de RBAC em `apps/web/src/lib/auth`
- **External:** none
- **Technical:** permissao `tickets:create` precisa existir para roles nao-TI

### Assumptions
- `tickets:create` ja esta concedida aos usuarios que devem abrir TI (ex: manobrista).
- Rotas de TI usam o mesmo helper de acesso, facilitando a separacao.

## Resource Estimation

### Time Allocation
| Phase | Estimated Effort | Calendar Time | Team Size |
| --- | --- | --- | --- |
| Phase 1 - Discovery | 0.5 day | 0.5-1 day | 1 |
| Phase 2 - Implementation | 0.5 day | 0.5-1 day | 1 |
| Phase 3 - Validation | 0.25 day | 0.25-0.5 day | 1 |
| **Total** | **1.25 days** | **1-2 days** | **1** |

### Required Skills
- Next.js App Router, server actions
- RBAC / permissions modeling
- Playwright E2E basics

### Resource Availability
- **Available:** 1 dev (web)
- **Blocked:** none
- **Escalation:** tech lead do web

## Working Phases
### Phase 1 — Discovery & Alignment
**Steps**
1. Mapear o fluxo atual de bloqueio em `ti-access.ts`, `actions.ts`, pages de TI (Bug Fixer).
2. Confirmar permissao `tickets:create` para manobrista em `permissions.ts` (Feature Developer).

**Commit Checkpoint**
- Registrar contexto e ajustes de plano se necessario (commit opcional, somente se solicitado).

### Phase 2 — Implementation & Iteration
**Steps**
1. Criar helper separado para criacao (ex: `canCreateTiTicket`) e atualizar `novo/page.tsx`.
2. Trocar guard da action de criacao para `ensureTiCreateAccess`.
3. Garantir que lista e detalhe seguem usando `canAccessTiArea`.

**Commit Checkpoint**
- Commit de implementacao (somente se solicitado).

### Phase 3 — Validation & Handoff
**Steps**
1. Rodar E2E: manobrista cria TI; manobrista bloqueado na lista.
2. Smoke manual para admin e TI em lista/detalhe/criacao.

**Commit Checkpoint**
- Commit de validacao com evidencias (somente se solicitado).

## Rollback Plan
Document how to revert changes if issues arise during or after implementation.

### Rollback Triggers
When to initiate rollback:
- Bloqueio indevido de criacao de chamado TI
- Exposicao indevida da lista/detalhe de TI
- Erros de permissao para admin/TI

### Rollback Procedures
#### Phase 1 Rollback
- Action: descartar ajustes de plano
- Data Impact: none
- Estimated Time: < 1 hour

#### Phase 2 Rollback
- Action: reverter mudancas em helpers e pages de TI
- Data Impact: none
- Estimated Time: 15-30 minutes

#### Phase 3 Rollback
- Action: reverter commit e validar fluxo antigo
- Data Impact: none
- Estimated Time: 30-60 minutes

### Post-Rollback Actions
1. Documentar causa e impacto
2. Notificar stakeholders
3. Registrar lições aprendidas
4. Ajustar plano antes de tentar novamente

## Evidence & Follow-up
- Log ou screenshot do E2E com manobrista abrindo TI
- Evidencia de bloqueio em `/chamados/ti`
- Nota de smoke manual com admin/TI
