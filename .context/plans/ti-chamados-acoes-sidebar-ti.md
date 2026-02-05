---
status: draft
generated: 2026-02-05
agents:
  - type: "code-reviewer"
    role: "Review RBAC + UI changes for quality and consistency"
  - type: "bug-fixer"
    role: "Validate edge cases (status conflicts, access regressions)"
  - type: "feature-developer"
    role: "Implement TI ticket actions and UI components"
  - type: "refactoring-specialist"
    role: "Reduce duplication by reusing existing ticket patterns"
  - type: "test-writer"
    role: "Add/adjust tests (RBAC + E2E smoke) for TI flow"
  - type: "documentation-writer"
    role: "Document new TI flow and permissions (internal docs)"
  - type: "performance-optimizer"
    role: "Sanity-check new queries/uploads do not degrade UX"
  - type: "security-auditor"
    role: "Review permissions, RLS and storage upload paths"
  - type: "backend-specialist"
    role: "Implement server actions and status transitions safely"
  - type: "frontend-specialist"
    role: "Design sidebar gating and TI detail actions UX"
  - type: "architect-specialist"
    role: "Ensure changes align with RBAC model and route patterns"
  - type: "devops-specialist"
    role: "Ensure builds/checks are unaffected; advise on deploy risks"
  - type: "database-specialist"
    role: "Validate status values, history, attachments tables and RLS"
  - type: "mobile-specialist"
    role: "Confirm no unintended impact on mobile (out of scope changes)"
docs:
  - "../docs/README.md"
  - "../agents/README.md"
  - "../../docs/database/seeds/usuarios_teste.md"
  - "../../apps/web/src/components/layout/app-sidebar.tsx"
  - "../../apps/web/src/lib/auth/permissions.ts"
  - "../../apps/web/src/app/(app)/chamados/ti/actions.ts"
  - "../../apps/web/src/app/(app)/chamados/ti/[ticketId]/page.tsx"
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

# Plano de Desenvolvimento — TI: Ações no Chamado + Sidebar

> Arquivo: `.context/plans/ti-chamados-acoes-sidebar-ti.md`

## Task Snapshot
- **Primary goal:** Ajustar RBAC/menus e habilitar ações no detalhe de Chamados TI: **Iniciar** (vira `in_progress`), **registrar comentários e anexos**, e **Concluir** (vira `closed`) para **Analista TI** e **Gerente TI**.
- **Success signal:**
  - Analista TI não vê **Checklists** na sidebar.
  - Gerente TI não vê **Financeiro, Checklists, Unidades, Usuários, Relatórios** na sidebar.
  - Em um ticket TI com status `awaiting_triage`, ambos veem e executam **Iniciar** → status muda para `in_progress`.
  - Em `in_progress`, ambos conseguem **comentar** e **adicionar anexos**.
  - Em `in_progress`, ambos veem e executam **Concluir** → status muda para `closed`.
- **Key references:**
  - [Documentation Index](../docs/README.md)
  - [Agent Handbook](../agents/README.md)
  - [Plans Index](./README.md)
  - `docs/database/seeds/usuarios_teste.md` (usuários: `analista_ti_teste@garageinn.com`, `gerente_ti_teste@garageinn.com`)

## Codebase Context
- **Apps/escopo:** `apps/web` (Next.js App Router). (Mobile fora de escopo.)
- **Arquivos-chave (observados):**
  - Sidebar: `apps/web/src/components/layout/app-sidebar.tsx` (menu “Checklists” hoje não tem gate)
  - RBAC: `apps/web/src/lib/auth/permissions.ts`
  - TI server actions: `apps/web/src/app/(app)/chamados/ti/actions.ts`
  - TI detail page: `apps/web/src/app/(app)/chamados/ti/[ticketId]/page.tsx`
- **Status relevantes (já usados no sistema):**
  - `awaiting_triage`, `in_progress`, `closed` (e status de aprovação `awaiting_approval_*`)

### Key Components

**Key Interfaces:**
- `Permission` — `apps/web/src/lib/auth/permissions.ts`
- `TiTicketDetail` — `apps/web/src/app/(app)/chamados/ti/types.ts`

### Matriz RBAC proposta (TI)

**Objetivo do RBAC:** permitir ações “Iniciar/Concluir + Comentários/Anexos” para Analista/Gerente de TI, e ao mesmo tempo **evitar** que o Gerente TI veja menus indevidos (especialmente Relatórios).

| Departamento | Cargo | Permissões (final) | Observações |
| --- | --- | --- | --- |
| TI | Analista | `tickets:read`, `tickets:execute`, `settings:read`, `reports:read` | Mantém relatórios/config como hoje. Permite iniciar/concluir via `tickets:execute`. |
| TI | Gerente | `tickets:read`, `tickets:execute`, `settings:read` | **Remove `admin:all`** e **não inclui `reports:read`** para esconder “Relatórios” na sidebar. |

### Mapeamento Sidebar (resultado esperado)

| Menu | Implementação atual | Regra alvo | Analista TI | Gerente TI |
| --- | --- | --- | --- | --- |
| Chamados | Sempre visível | Mantém | ✅ | ✅ |
| TI | `requireDepartment: TI` | Mantém | ✅ | ✅ |
| Financeiro | `requireDepartment: Financeiro` | Mantém | ❌ | ❌ |
| Checklists | Sempre visível | **Gate por departamento Operações** | ❌ | ❌ |
| Unidades | `requirePermission: units:read/admin:all` | Mantém | ❌ | ❌ |
| Usuários | `requirePermission: users:read/admin:all` | Mantém | ❌ | ❌ |
| Relatórios | `requirePermission: reports:read/admin:all` | Mantém | ✅ (por `reports:read`) | ❌ |
| Configurações | `requirePermission: settings:read/admin:all` | Mantém | ✅ | ✅ |

## Agent Lineup
| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Code Reviewer | Garantir consistência com padrões existentes (Manutenção/RH) e evitar regressões na sidebar/RBAC. | [Code Reviewer](../agents/code-reviewer.md) | Review code changes for quality, style, and best practices |
| Bug Fixer | Cobrir conflitos de status, acesso negado indevido, e inconsistências entre server/client. | [Bug Fixer](../agents/bug-fixer.md) | Analyze bug reports and error messages |
| Feature Developer | Implementar ações “Iniciar/Concluir”, UI de comentários/anexos, e gates de menus. | [Feature Developer](../agents/feature-developer.md) | Implement new features according to specifications |
| Refactoring Specialist | Reaproveitar componentes/padrões já existentes (ex.: comentários) com mínima duplicação. | [Refactoring Specialist](../agents/refactoring-specialist.md) | Identify code smells and improvement opportunities |
| Test Writer | Garantir testes mínimos: RBAC esperado + smoke E2E do fluxo TI. | [Test Writer](../agents/test-writer.md) | Write comprehensive unit and integration tests |
| Documentation Writer | Documentar o novo comportamento: ações, status e permissões de TI. | [Documentation Writer](../agents/documentation-writer.md) | Create clear, comprehensive documentation |
| Performance Optimizer | Garantir que listagens/detalhe não ganhem N+1 ou uploads bloqueiem UI. | [Performance Optimizer](../agents/performance-optimizer.md) | Identify performance bottlenecks |
| Security Auditor | Checar RLS/Storage: uploads somente para usuários autorizados e sem vazamento de paths. | [Security Auditor](../agents/security-auditor.md) | Identify security vulnerabilities |
| Backend Specialist | Desenhar transições de status seguras e idempotentes com histórico. | [Backend Specialist](../agents/backend-specialist.md) | Design and implement server-side architecture |
| Frontend Specialist | UX do card “Ações” no detalhe TI e gating no menu “Checklists”. | [Frontend Specialist](../agents/frontend-specialist.md) | Design and implement user interfaces |
| Architect Specialist | Validar alinhamento com RBAC (`permissions.ts`) e guardas de acesso (`ti-access`). | [Architect Specialist](../agents/architect-specialist.md) | Design overall system architecture and patterns |
| Devops Specialist | Garantir que build/typecheck/lint passam e orientar rollout sem impactos. | [Devops Specialist](../agents/devops-specialist.md) | Design and maintain CI/CD pipelines |
| Database Specialist | Validar que status `in_progress/closed` são aceitos para TI e que RLS permite update/insert (comments/attachments). | [Database Specialist](../agents/database-specialist.md) | Design and optimize database schemas |
| Mobile Specialist | Confirmar ausência de impacto colateral (nenhuma mudança requerida). | [Mobile Specialist](../agents/mobile-specialist.md) | Develop native and cross-platform mobile applications |

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
| Gerente TI perder acesso necessário ao remover `admin:all` | Medium | High | Definir matriz mínima e validar por smoke test com `gerente_ti_teste@garageinn.com` | Frontend + Backend |
| RLS bloquear update de status / insert de comments/attachments | Medium | High | Validar políticas/RPCs antes; usar ações server-side com checagens claras e mensagens de erro | Database Specialist |
| Conflito de status (ticket mudou entre render e clique) | Medium | Medium | Implementar checagem de status atual + retorno `conflict` e refresh (padrão já existe em Manutenção) | Backend Specialist |
| Upload de anexos gerar URLs públicas indevidas | Low | High | Revisar bucket/policies; se necessário, migrar para URLs assinadas no futuro (fora de escopo imediato) | Security Auditor |
| Menu “Checklists” sumir para papéis que deveriam ver | Low | Medium | Gate explícito por `requireDepartment: Operações` (não por permissão genérica) e testar com usuário Operações | Frontend Specialist |

### Dependencies
- **Internal:** RBAC (`permissions.ts`), guardas TI (`ti-access.ts`), tabelas `tickets`, `ticket_history`, `ticket_comments`, `ticket_attachments`, bucket `ticket-attachments`.
- **External:** Supabase Storage (bucket `ticket-attachments`) e políticas associadas.
- **Technical:** Status `awaiting_triage`, `in_progress`, `closed` devem ser aceitos para TI (views/relatórios não devem quebrar).

### Assumptions
- Status `in_progress` e `closed` já são válidos no domínio de tickets e podem ser usados para TI sem ajustes de schema.
- Usuários do departamento TI (Analista/Gerente) devem poder **executar** ações no ticket TI, mas não acessar áreas de RH/Unidades/Usuários por default.
- Comentários e anexos serão permitidos para TI pelo menos quando o ticket estiver em `in_progress`.

## Resource Estimation

### Time Allocation
| Phase | Estimated Effort | Calendar Time | Team Size |
| --- | --- | --- | --- |
| Phase 1 - Discovery | 0.5–1.0 person-day | 0.5–1 dia | 1 pessoa |
| Phase 2 - Implementation | 2.0–3.0 person-days | 2–4 dias | 1–2 pessoas |
| Phase 3 - Validation | 1.0 person-day | 1–2 dias | 1 pessoa |
| **Total** | **3.5–5.0 person-days** | **4–7 dias** | **-** |

### Required Skills
- Next.js App Router (Server Actions) + React Client Components
- Supabase (Auth, Storage, RLS) e modelagem de status/history
- RBAC/Permissões e controle de visibilidade de UI

### Resource Availability
- **Available:** 1 dev full-stack (web) para implementar e validar
- **Blocked:** Dependente de confirmar RLS/policies do bucket `ticket-attachments` se houver erro de upload em ambiente atual
- **Escalation:** Responsável por banco/Supabase (para ajustes de RLS/policies se necessário)

## Working Phases
### Phase 1 — Discovery & Alignment
**Steps**
1. Confirmar “definição de pronto” do fluxo TI:
   - `awaiting_triage` → `in_progress` (Iniciar)
   - `in_progress` → `closed` (Concluir)
   - Comentários/anexos permitidos em `in_progress` (e opcionalmente também em `awaiting_triage` — definir explicitamente).
2. Validar impacto de remover `admin:all` do Gerente TI:
   - Conferir se existe alguma tela TI que depende de `isAdmin` ao invés de permissões específicas.
3. Confirmar políticas/RLS:
   - Update em `tickets.status` para usuários TI.
   - Insert em `ticket_comments` e `ticket_attachments` para usuários TI.
4. Fechar design de permissão (esta matriz) como “fonte de verdade” para o rollout.

**Commit Checkpoint**
- Após esta fase: commit apenas de documentação/plan (ex.: `git commit -m "chore(plan): define TI ticket actions + sidebar RBAC"`).

### Phase 2 — Implementation & Iteration
**Steps**
1. Sidebar:
   - Gate do menu “Checklists” para `requireDepartment: "Operações"` (ou equivalente).
2. RBAC TI:
   - Atualizar `permissions.ts` para TI/Gerente (remover `admin:all`, aplicar permissões mínimas).
3. Ações TI (server):
   - Implementar server actions:
     - `startTiTicket(ticketId)` (valida status atual `awaiting_triage`, altera para `in_progress`, registra `ticket_history`).
     - `closeTiTicket(ticketId)` (valida `in_progress`, altera para `closed`, registra `ticket_history`).
     - `addTiAttachments(ticketId, formData)` (upload + insert + history + revalidate).
   - Padronizar retornos `{ success?: true, error?: string, code?: "forbidden" | "conflict" }` (similar a Manutenção quando fizer sentido).
4. UI TI (detalhe):
   - Adicionar um card “Ações” com botões:
     - “Iniciar” (somente quando `awaiting_triage`)
     - “Concluir” (somente quando `in_progress`)
   - Adicionar UI de comentários (form + lista), reaproveitando padrão de `TicketComments` (Manutenção) com mínima divergência.
   - Adicionar UI de anexos (upload + lista). Escopo mínimo: upload e link para download/abrir.
5. Iterar com usuários de teste:
   - `analista_ti_teste@garageinn.com` e `gerente_ti_teste@garageinn.com`.

**Commit Checkpoint**
- Após esta fase: commit de implementação (ex.: `git commit -m "feat(ti): add start/close actions, comments and attachments"`).

### Phase 3 — Validation & Handoff
**Steps**
1. Verificação manual (happy path + edge cases):
   - Analista/Gerente em ticket `awaiting_triage`: “Iniciar”.
   - Em `in_progress`: comentar, anexar, concluir.
   - Conflito: status alterado em outra aba → UI deve avisar/refresh.
2. Verificação de menus:
   - Operações ainda vê Checklists; TI não vê.
   - Gerente TI não vê Relatórios.
3. Checks do repo:
   - `npm run lint` e `npm run typecheck` (root).
4. (Opcional) Smoke E2E com Playwright:
   - Login como Analista TI → abrir chamado TI → iniciar → concluir.

**Commit Checkpoint**
- Após esta fase: commit de evidências (ex.: `git commit -m "chore: validate TI ticket actions + RBAC"`).

## Rollback Plan
Document how to revert changes if issues arise during or after implementation.

### Rollback Triggers
When to initiate rollback:
- Bloqueio de acesso ao TI (usuários não conseguem abrir lista/detalhe)
- Impossibilidade de comentar/anexar por regressão de RLS
- Erros generalizados na sidebar (menus incorretos para vários departamentos)

### Rollback Procedures
#### Phase 1 Rollback
- Action: descartar branch de planejamento ou reverter commits de documentação
- Data Impact: none
- Estimated Time: < 1 hour

#### Phase 2 Rollback
- Action:
  - Reverter commits de UI/actions/RBAC
  - Restaurar permissões originais do TI/Gerente (retornar `admin:all`) **apenas se necessário** para restaurar operação rapidamente
- Data Impact:
  - Tickets que foram movidos para `in_progress/closed` permanecerão com histórico registrado; rollback de código não desfaz alterações de status já feitas.
- Estimated Time: 1–2 hours

#### Phase 3 Rollback
- Action: rollback de release/deploy para a versão anterior estável
- Data Impact: mesmo da Phase 2 (status/histórico já gravados)
- Estimated Time: 1–2 hours

### Post-Rollback Actions
1. Registrar incident report (qual fluxo quebrou e para quais roles)
2. Capturar logs/erros de Supabase (RLS/Storage) se aplicável
3. Ajustar matriz de permissões e/ou guardas de acesso
4. Replanejar rollout incremental

## Evidence & Follow-up
- Evidências a coletar:
  - Prints da sidebar (Analista TI e Gerente TI)
  - Prints do detalhe TI com botões “Iniciar/Concluir”
  - Registro de comentário e anexo (antes/depois)
  - Saída de `npm run lint` e `npm run typecheck`
- Follow-ups (se necessário):
  - Avaliar se anexos devem usar URLs assinadas ao invés de públicas (hardening)
  - Considerar permitir comentário/anexo também para solicitante (fora de TI) se o produto exigir

