---
status: in_progress
generated: 2026-02-01
agents:
  - type: "code-reviewer"
    role: "Revisar mudancas transversais (UI + DB) e evitar regressao"
  - type: "bug-fixer"
    role: "Apoiar na investigacao de erros de migracao ou validacao"
  - type: "feature-developer"
    role: "Implementar lista de itens no fluxo de compras"
  - type: "refactoring-specialist"
    role: "Ajustar estruturacao de dados/props sem quebrar compatibilidade"
  - type: "test-writer"
    role: "Definir e implementar testes e cenarios de validacao"
  - type: "documentation-writer"
    role: "Atualizar docs de compras e schema"
  - type: "performance-optimizer"
    role: "Garantir que carregamento de itens/quotacoes nao degrade"
  - type: "security-auditor"
    role: "Revisar RLS e validacao de input para lista"
  - type: "backend-specialist"
    role: "Atualizar server actions, RPCs e view de tickets"
  - type: "frontend-specialist"
    role: "Atualizar formularios e exibicao de itens"
  - type: "architect-specialist"
    role: "Definir modelo de itens/cotacoes e compatibilidade"
  - type: "devops-specialist"
    role: "Apoiar publicacao e rollback de migracoes"
  - type: "database-specialist"
    role: "Desenhar e migrar schema para itens de compra"
  - type: "mobile-specialist"
    role: "Avaliar impacto no mobile e ajustar se necessario"
docs:
  - "docs/chamados/execucao_de_compras/fluxo-execucao-compras.md"
  - "docs/chamados/execucao_de_compras/fluxo-execucao-compras-tecnico.md"
  - "docs/database/schema.md"
  - ".context/specs/tickets/spec.md"
  - "apps/web/src/app/(app)/chamados/compras"
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

# Plano - Lista de Itens em Compras

> C:\Users\asdom\OneDrive\Área de Trabalho\projects\garageinn\.context\plans\20260201_compras-lista-itens.md

## Task Snapshot
- **Primary goal:** Permitir lista de itens em chamados de compras (abertura e execucao), persistindo itens no banco e exibindo-os no fluxo de triagem, cotacao e detalhes.
- **Success signal:** Usuario consegue adicionar/remover multiplos itens no formulario; itens aparecem nos detalhes e nas cotacoes; dados gravados no banco; chamados antigos continuam visiveis; validacoes passam.
- **Key references:**
  - [Documentacao de Compras](../../docs/chamados/execucao_de_compras/fluxo-execucao-compras.md)
  - [Fluxo Tecnico Compras](../../docs/chamados/execucao_de_compras/fluxo-execucao-compras-tecnico.md)
  - [Schema](../../docs/database/schema.md)
  - [Documentation Index](../docs/README.md)
  - [Agent Handbook](../agents/README.md)
  - [Plans Index](./README.md)

## Codebase Context
- **Total files analyzed:** 8 (web compras form/actions/details, schema docs, mobile ticket form)
- **Total symbols discovered:** n/a (manual scan)
- **Architecture layers:** Web UI (Next.js), Server Actions, Supabase schema/RLS, Mobile UI (Expo)
- **Entry points:** `apps/web/src/app/(app)/chamados/compras/novo/page.tsx`, `apps/web/src/app/(app)/chamados/compras/actions.ts`, `apps/web/src/app/(app)/chamados/compras/components/ticket-form.tsx`, `apps/web/src/app/(app)/chamados/compras/[ticketId]/components/ticket-info.tsx`, `apps/web/src/app/(app)/chamados/compras/[ticketId]/components/ticket-quotations.tsx`, `supabase/migrations/*.sql`, `apps/mobile/src/modules/tickets/components/TicketForm.tsx`

### Key Components

**Key Interfaces / Functions / Tables:**
- `createPurchaseTicket` — `apps/web/src/app/(app)/chamados/compras/actions.ts`
- `TicketForm` — `apps/web/src/app/(app)/chamados/compras/components/ticket-form.tsx`
- `TicketInfo` — `apps/web/src/app/(app)/chamados/compras/[ticketId]/components/ticket-info.tsx`
- `TicketQuotations` — `apps/web/src/app/(app)/chamados/compras/[ticketId]/components/ticket-quotations.tsx`
- `ticket_purchase_details` — `docs/database/schema.md` (storage atual de item unico)
- `ticket_quotations` — `docs/database/schema.md`
- `tickets_with_details` — view usada por `getTicketById`

## Agent Lineup
| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Code Reviewer | Revisar mudancas de UI, actions e DB para regressao. | [Code Reviewer](../agents/code-reviewer.md) | Review code changes for quality, style, and best practices |
| Bug Fixer | Investigar erros de migracao ou validacao em runtime. | [Bug Fixer](../agents/bug-fixer.md) | Analyze bug reports and error messages |
| Feature Developer | Implementar fluxo multi-itens de ponta a ponta. | [Feature Developer](../agents/feature-developer.md) | Implement new features according to specifications |
| Refactoring Specialist | Ajustar modelo/props para lista sem quebrar compatibilidade. | [Refactoring Specialist](../agents/refactoring-specialist.md) | Identify code smells and improvement opportunities |
| Test Writer | Cobrir cenarios de criacao, visualizacao e cotacao multi-itens. | [Test Writer](../agents/test-writer.md) | Write comprehensive unit and integration tests |
| Documentation Writer | Atualizar docs de compras e schema. | [Documentation Writer](../agents/documentation-writer.md) | Create clear, comprehensive documentation |
| Performance Optimizer | Avaliar custo de carregar itens e cotacoes. | [Performance Optimizer](../agents/performance-optimizer.md) | Identify performance bottlenecks |
| Security Auditor | Garantir RLS e validacao de input para novas tabelas. | [Security Auditor](../agents/security-auditor.md) | Identify security vulnerabilities |
| Backend Specialist | Ajustar server actions, RPCs e view agregada. | [Backend Specialist](../agents/backend-specialist.md) | Design and implement server-side architecture |
| Frontend Specialist | Projetar UX da lista de itens e exibicao nos detalhes. | [Frontend Specialist](../agents/frontend-specialist.md) | Design and implement user interfaces |
| Architect Specialist | Definir modelo de dados (itens e cotacoes) e compatibilidade. | [Architect Specialist](../agents/architect-specialist.md) | Design overall system architecture and patterns |
| Devops Specialist | Suporte para aplicar migracoes e rollback seguro. | [Devops Specialist](../agents/devops-specialist.md) | Design and maintain CI/CD pipelines |
| Database Specialist | Criar tabelas, indices, backfill e politicas. | [Database Specialist](../agents/database-specialist.md) | Design and optimize database schemas |
| Mobile Specialist | Verificar impacto no mobile e adequar fluxo de compras se aplicavel. | [Mobile Specialist](../agents/mobile-specialist.md) | Develop native and cross-platform mobile applications |

## Documentation Touchpoints
| Guide | File | Primary Inputs |
| --- | --- | --- |
| Project Overview | [project-overview.md](../docs/project-overview.md) | Escopo geral, ownership e roadmap |
| Architecture Notes | [architecture.md](../docs/architecture.md) | Padrroes de dados, views e RLS |
| Development Workflow | [development-workflow.md](../docs/development-workflow.md) | Como rodar migracoes e checks |
| Testing Strategy | [testing-strategy.md](../docs/testing-strategy.md) | Cenarios e suites relevantes |
| Glossary & Domain Concepts | [glossary.md](../docs/glossary.md) | Termos de compras e cotacoes |
| Data Flow & Integrations | [data-flow.md](../docs/data-flow.md) | Fluxo de dados entre UI e Supabase |
| Security & Compliance Notes | [security.md](../docs/security.md) | RLS, validacao e privacidade |
| Tooling & Productivity Guide | [tooling.md](../docs/tooling.md) | Scripts, lint e typecheck |

## Risk Assessment
Identify potential blockers, dependencies, and mitigation strategies before beginning work.

### Identified Risks
| Risk | Probability | Impact | Mitigation Strategy | Owner |
| --- | --- | --- | --- | --- |
| Migracao/backfill pode quebrar tickets antigos | Medium | High | Manter colunas antigas, backfill idempotente e dual-read | Database Specialist |
| Cotacoes com multiplos itens podem gerar totais inconsistentes | Medium | Medium | Calcular total a partir de itens e validar no server | Backend Specialist |
| Regressao no formulario de compras | Medium | Medium | Validacoes compartilhadas + testes manuais dirigidos | Frontend Specialist |
| RLS insuficiente para novas tabelas | Low | High | Espelhar politicas de `ticket_purchase_details` e revisar | Security Auditor |

### Dependencies
- **Internal:** Atualizar view `tickets_with_details`, server actions e UI de compras
- **External:** Nenhuma dependencia externa esperada
- **Technical:** Criar migracao Supabase, atualizar RLS e regenerar tipos

### Assumptions
- Assumimos que cotacoes precisam armazenar valores por item quando houver lista (ajuste caso o negocio aceite cotacao global).
- Assumimos que a web e o principal ponto de abertura/execucao de compras; mobile pode ficar apenas em modo leitura se nao houver requisito de criacao.
- Assumimos que o fluxo de status e aprovacao permanece o mesmo.

## Resource Estimation

### Time Allocation
| Phase | Estimated Effort | Calendar Time | Team Size |
| --- | --- | --- | --- |
| Phase 1 - Discovery | 1-2 person-days | 2-3 days | 1-2 people |
| Phase 2 - Implementation | 4-6 person-days | 1-2 weeks | 2-3 people |
| Phase 3 - Validation | 1-2 person-days | 2-3 days | 1-2 people |
| **Total** | **6-10 person-days** | **2-3 weeks** | **-** |

### Required Skills
- Next.js/React e formulacao de forms dinamicos
- SQL/Supabase (migracoes, views, RLS)
- TypeScript e validacao de dados

### Resource Availability
- **Available:** 1 frontend dev, 1 backend dev, 1 reviewer de banco (nomes a definir)
- **Blocked:** Nenhum bloqueio conhecido
- **Escalation:** Tech lead / product owner para resolver duvidas de escopo

## Working Phases
### Phase 1 — Discovery & Alignment
**Steps**
1. Confirmar modelo de dados multi-itens: nova tabela `ticket_purchase_items` e, se necessario, `ticket_quotation_items`; definir campos obrigatorios e regras de validacao.
2. Mapear pontos de UI/acoes que usam `item_name` e `quantity`; decidir estrategia de compatibilidade para tickets existentes.

**Commit Checkpoint**
- After completing this phase, capture the agreed context and create a commit (for example, `git commit -m "chore(plan): complete phase 1 discovery"`).

### Phase 2 — Implementation & Iteration
**Steps**
1. Criar migracao Supabase: tabela de itens, indices, backfill a partir de `ticket_purchase_details`, atualizacao da view `tickets_with_details` e RLS.
2. Atualizar server actions de compras (`createPurchaseTicket`, `addQuotation`, `selectQuotation`) para suportar lista de itens e persistencia correta.
3. Atualizar UI web: formulario com lista dinamica de itens (add/remover), exibicao de itens em detalhes e cotacoes com itens/total.
4. Avaliar mobile: se `NewTicket` suportar compras, adicionar lista de itens no `TicketForm` e ajustar `useNewTicket`/services.
5. Atualizar docs e tipos: `docs/database/schema.md`, docs de compras e `apps/web/src/lib/supabase/database.types.ts`.

**Commit Checkpoint**
- Summarize progress, update cross-links, and create a commit documenting the outcomes of this phase (for example, `git commit -m "chore(plan): complete phase 2 implementation"`).

### Phase 3 — Validation & Handoff
**Steps**
1. Validar fluxo completo: criar chamado com 2+ itens, abrir detalhes, adicionar cotacao, selecionar cotacao e verificar totais.
2. Rodar lint/typecheck e revisar tickets antigos para garantir retrocompatibilidade.

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
- Action: Reverter migracao (drop new tables/views ou restaurar snapshot) e aplicar rollback de commits da UI/actions
- Data Impact: Itens criados apos a migracao podem ser perdidos; exportar antes do rollback
- Estimated Time: 2-4 hours

#### Phase 3 Rollback
- Action: Reverter deploy e voltar leitura apenas de `ticket_purchase_details` enquanto replaneja
- Data Impact: Nenhuma perda adicional se a migracao for mantida
- Estimated Time: 1-2 hours

### Post-Rollback Actions
1. Document reason for rollback in incident report
2. Notify stakeholders of rollback and impact
3. Schedule post-mortem to analyze failure
4. Update plan with lessons learned before retry

## Evidence & Follow-up
- Migracao aplicada e revisada (arquivo em `supabase/migrations`)
- Capturas de tela do formulario multi-itens e detalhes
- Registro de testes (lint/typecheck + checklist manual)
- Consulta SQL demonstrando itens persistidos por ticket
