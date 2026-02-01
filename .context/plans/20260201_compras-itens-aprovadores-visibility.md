---
status: in_progress
generated: 2026-02-01
agents:
  - type: "code-reviewer"
    role: "Revisar politicas RLS e regressao de acesso"
  - type: "bug-fixer"
    role: "Investigar falhas de visibilidade em runtime"
  - type: "feature-developer"
    role: "Implementar ajuste de visibilidade dos itens"
  - type: "refactoring-specialist"
    role: "Ajustar consultas e fallback sem quebrar compatibilidade"
  - type: "test-writer"
    role: "Cobrir cenarios de aprovacao e visibilidade"
  - type: "documentation-writer"
    role: "Atualizar docs de RLS e compras"
  - type: "performance-optimizer"
    role: "Garantir que consultas adicionais nao afetem a tela"
  - type: "security-auditor"
    role: "Validar acesso correto para aprovadores e unidade"
  - type: "backend-specialist"
    role: "Atualizar politicas e views de dados"
  - type: "frontend-specialist"
    role: "Validar renderizacao de itens na tela de detalhes"
  - type: "architect-specialist"
    role: "Definir regra canonica de visibilidade para itens"
  - type: "devops-specialist"
    role: "Aplicar migracao RLS com rollback seguro"
  - type: "database-specialist"
    role: "Ajustar politicas e validar schema cache"
  - type: "mobile-specialist"
    role: "Verificar impacto em consumo de itens no mobile"
docs:
  - "docs/chamados/execucao_de_compras/fluxo-execucao-compras-tecnico.md"
  - "docs/chamados/execucao_de_compras/fluxo-execucao-compras.md"
  - ".context/specs/tickets/visibility-rules.md"
  - "apps/web/src/app/(app)/chamados/compras/actions.ts"
  - "apps/web/src/app/(app)/chamados/compras/[ticketId]/components/ticket-info.tsx"
  - "supabase/migrations/20260201120000_add_ticket_purchase_items.sql"
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

# Plano - Itens de Compras visiveis a aprovadores

> C:\Users\asdom\OneDrive\Área de Trabalho\projects\garageinn\.context\plans\20260201_compras-itens-aprovadores-visibility.md

## Task Snapshot
- **Primary goal:** Garantir que aprovadores (Operacoes e liderancas) vejam a lista de itens no detalhe do chamado de compras.
- **Success signal:** Aprovadores conseguem abrir detalhes e ver itens sem erros de RLS; tickets antigos continuam exibindo o item resumo.
- **Key references:**
  - [Documentation Index](../docs/README.md)
  - [Agent Handbook](../agents/README.md)
  - [Plans Index](./README.md)

## Codebase Context
- **Total files analyzed:** 6
- **Total symbols discovered:** n/a
- **Architecture layers:** Web UI, Server Actions, Supabase RLS
- **Entry points:** `apps/web/src/app/(app)/chamados/compras/actions.ts`, `apps/web/src/app/(app)/chamados/compras/[ticketId]/components/ticket-info.tsx`, `supabase/migrations/20260201120000_add_ticket_purchase_items.sql`

### Key Components

**Key Interfaces:**
- `getTicketDetails` — `apps/web/src/app/(app)/chamados/compras/actions.ts`
- `buildPurchaseVisibilityFilter` — `apps/web/src/app/(app)/chamados/compras/actions.ts`
- `TicketInfo` — `apps/web/src/app/(app)/chamados/compras/[ticketId]/components/ticket-info.tsx`
- `ticket_purchase_items` RLS — `supabase/migrations/20260201120000_add_ticket_purchase_items.sql`

## Agent Lineup
| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Code Reviewer | Garantir consistencia com regras de acesso existentes. | [Code Reviewer](../agents/code-reviewer.md) | Review code changes for quality, style, and best practices |
| Bug Fixer | Reproduzir erro e validar correcoes. | [Bug Fixer](../agents/bug-fixer.md) | Analyze bug reports and error messages |
| Feature Developer | Implementar ajuste de visibilidade. | [Feature Developer](../agents/feature-developer.md) | Implement new features according to specifications |
| Refactoring Specialist | Evitar duplicacao de regras de acesso. | [Refactoring Specialist](../agents/refactoring-specialist.md) | Identify code smells and improvement opportunities |
| Test Writer | Cobrir cenarios de aprovacao e leitura. | [Test Writer](../agents/test-writer.md) | Write comprehensive unit and integration tests |
| Documentation Writer | Atualizar docs de RLS/visibilidade. | [Documentation Writer](../agents/documentation-writer.md) | Create clear, comprehensive documentation |
| Performance Optimizer | Evitar impactos em queries adicionais. | [Performance Optimizer](../agents/performance-optimizer.md) | Identify performance bottlenecks |
| Security Auditor | Validar que somente roles corretas veem itens. | [Security Auditor](../agents/security-auditor.md) | Identify security vulnerabilities |
| Backend Specialist | Ajustar politicas e possiveis RPCs. | [Backend Specialist](../agents/backend-specialist.md) | Design and implement server-side architecture |
| Frontend Specialist | Confirmar exibicao da lista. | [Frontend Specialist](../agents/frontend-specialist.md) | Design and implement user interfaces |
| Architect Specialist | Definir regra canonica (ticket visivel -> itens visiveis). | [Architect Specialist](../agents/architect-specialist.md) | Design overall system architecture and patterns |
| Devops Specialist | Aplicar migracao em ambientes. | [Devops Specialist](../agents/devops-specialist.md) | Design and maintain CI/CD pipelines |
| Database Specialist | Ajustar RLS e validar schema cache. | [Database Specialist](../agents/database-specialist.md) | Design and optimize database schemas |
| Mobile Specialist | Avaliar impacto em telas de detalhes. | [Mobile Specialist](../agents/mobile-specialist.md) | Develop native and cross-platform mobile applications |

## Documentation Touchpoints
| Guide | File | Primary Inputs |
| --- | --- | --- |
| Project Overview | [project-overview.md](../docs/project-overview.md) | Roadmap, README, stakeholder notes |
| Architecture Notes | [architecture.md](../docs/architecture.md) | ADRs, service boundaries, dependency graphs |
| Development Workflow | [development-workflow.md](../docs/development-workflow.md) | Branching rules, CI config, contributing guide |
| Testing Strategy | [testing-strategy.md](../docs/testing-strategy.md) | Test configs, CI gates, known flaky suites |
| Glossary & Domain Concepts | [glossary.md](../docs/glossary.md) | Business terminology, user personas, domain rules |
| Data Flow & Integrations | [data-flow.md](../docs/data-flow.md) | System diagrams, integration specs, queue topics |
| Security & Compliance Notes | [security.md](../docs/security.md) | Auth model, secrets management, compliance requirements |
| Tooling & Productivity Guide | [tooling.md](../docs/tooling.md) | CLI scripts, IDE configs, automation workflows |

## Risk Assessment
Identify potential blockers, dependencies, and mitigation strategies before beginning work.

### Identified Risks
| Risk | Probability | Impact | Mitigation Strategy | Owner |
| --- | --- | --- | --- | --- |
| RLS permitir acesso indevido a itens | Medium | High | Reusar regra de visibilidade do ticket (departamento/unidade) | Security Auditor |
| Aprovadores continuarem sem ver itens | Medium | Medium | Teste com contas reais e logs de RLS | Bug Fixer |
| Regressao em tickets antigos | Low | Medium | Manter fallback via `ticket_purchase_details` | Backend Specialist |

### Dependencies
- **Internal:** Ajuste de RLS para `ticket_purchase_items`
- **External:** Nenhuma
- **Technical:** Schema cache atualizado no Supabase

### Assumptions
- Aprovadores devem enxergar o mesmo que quem pode ver o ticket
- Acesso a itens deve seguir restricao por unidade quando aplicavel

## Resource Estimation

### Time Allocation
| Phase | Estimated Effort | Calendar Time | Team Size |
| --- | --- | --- | --- |
| Phase 1 - Discovery | 0.5 person-day | 1 day | 1 |
| Phase 2 - Implementation | 1-2 person-days | 2-3 days | 1-2 |
| Phase 3 - Validation | 0.5 person-day | 1 day | 1 |
| **Total** | **2-3 person-days** | **1 week** | **-** |

### Required Skills
- Supabase RLS e SQL
- Next.js / Server Actions

### Resource Availability
- **Available:** 1 backend + 1 reviewer
- **Blocked:** Nenhum
- **Escalation:** Tech lead de plataforma

## Working Phases
### Phase 1 — Discovery & Alignment
**Steps**
1. Confirmar roles de aprovacao que precisam ver itens e mapear regras atuais de visibilidade.
2. Revisar politicas de `ticket_purchase_items` vs `tickets` e definir regra canonica.

**Commit Checkpoint**
- After completing this phase, capture the agreed context and create a commit (for example, `git commit -m "chore(plan): complete phase 1 discovery"`).

### Phase 2 — Implementation & Iteration
**Steps**
1. Atualizar RLS de `ticket_purchase_items` para permitir leitura quando o ticket for visivel (departamento/unidade).
2. Se necessario, adicionar RPC/VIEW para reuso da regra de visibilidade em tabelas auxiliares.
3. Validar que `getTicketDetails` retorna itens para aprovadores sem alterar a UI.

**Commit Checkpoint**
- Summarize progress, update cross-links, and create a commit documenting the outcomes of this phase (for example, `git commit -m "chore(plan): complete phase 2 implementation"`).

### Phase 3 — Validation & Handoff
**Steps**
1. Testar com conta de aprovador (Encarregado/Supervisor/Gerente) e confirmar itens na tela.
2. Registrar evidencias e atualizar documentacao de visibilidade se necessario.

**Commit Checkpoint**
- Record the validation evidence and create a commit signalling the handoff completion (for example, `git commit -m "chore(plan): complete phase 3 validation"`).

## Rollback Plan
Document how to revert changes if issues arise during or after implementation.

### Rollback Triggers
When to initiate rollback:
- Critical bugs affecting core functionality
- Performance degradation beyond acceptable thresholds
- Data integrity issues detected
- Security vulnerabilities introduced
- User-facing errors exceeding alert thresholds

### Rollback Procedures
#### Phase 1 Rollback
- Action: Discard discovery branch, restore previous documentation state
- Data Impact: None (no production changes)
- Estimated Time: < 1 hour

#### Phase 2 Rollback
- Action: Reverter politicas RLS para o estado anterior
- Data Impact: Itens continuam inacessiveis para aprovadores
- Estimated Time: 1 hour

#### Phase 3 Rollback
- Action: Reverter deploy e manter fallback apenas para criador/assigned_to
- Data Impact: Nenhuma perda de dados
- Estimated Time: 1 hour

### Post-Rollback Actions
1. Document reason for rollback in incident report
2. Notify stakeholders of rollback and impact
3. Schedule post-mortem to analyze failure
4. Update plan with lessons learned before retry

## Evidence & Follow-up

- Logs de acesso e consultas retornando itens
- Capturas de tela da tela de detalhes com itens visiveis para aprovadores
- Script SQL/policy aplicado e revisado
