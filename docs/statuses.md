# Status do Projeto (Mapa Atual)

Este documento consolida os status existentes no projeto (principalmente no
domínio de chamados) e descreve como eles estão organizados, usados e quais
são os principais gaps e riscos observados.

## Escopo e fontes

Inclui status de:
- `tickets.status` (campo central compartilhado por todos os departamentos).
- Entidades auxiliares ligadas a chamados (aprovações, cotações, execuções,
  compras de sinistro).
- Entidades gerais do sistema com status documentado (perfis, unidades,
  categorias, checklists).

Fontes principais:
- Constantes de cada módulo: `apps/web/src/app/(app)/chamados/*/constants.ts`
- Regras e mudanças de status: `apps/web/src/app/(app)/chamados/*/actions.ts`
- Status usados em métricas: `apps/web/src/app/(app)/chamados/actions.ts`,
  `apps/web/src/app/(app)/unidades/actions.ts`
- Documentação de schema: `docs/database/schema.md`
- Constraint de banco (produção): `tickets_status_check`
- Migração adicionada: `supabase/migrations/20260126170000_update_tickets_status_check.sql`

---

## 1) Status de `tickets.status` (campo compartilhado)

### 1.1 Lista aceita pelo banco (constraint atual)

Agrupada por macrofase:

**Aprovação hierárquica (Operações)**
- `awaiting_approval_encarregado`
- `awaiting_approval_supervisor`
- `awaiting_approval_gerente`

**Triagem e andamento genéricos**
- `awaiting_triage`
- `prioritized`
- `in_progress`

**Compras**
- `quoting`
- `awaiting_approval`
- `approved`
- `purchasing`
- `in_delivery`
- `delivered`
- `evaluating`

**Manutenção**
- `technical_analysis`
- `executing`
- `waiting_parts`
- `completed`

**Sinistros**
- `in_analysis`
- `in_investigation`
- `awaiting_customer`
- `awaiting_quotations`
- `in_repair`
- `awaiting_payment`

**Fechamento e finais**
- `awaiting_return`
- `resolved`
- `closed`
- `denied`
- `cancelled`

Observação: este conjunto é a união dos fluxos por departamento e não impõe
regras por área (ex.: Financeiro pode teoricamente receber `executing`).

### 1.2 Fluxos por departamento (transições)

As transições abaixo são definidas em `statusTransitions` de cada módulo
e aplicadas nas actions server-side.

**Compras e Manutenção (Compras)**
- `awaiting_approval_encarregado` → `awaiting_approval_supervisor` | `denied`
- `awaiting_approval_supervisor` → `awaiting_approval_gerente` | `denied`
- `awaiting_approval_gerente` → `awaiting_triage` | `denied`
- `awaiting_triage` → `in_progress` | `quoting` | `denied`
- `in_progress` → `quoting` | `denied` | `cancelled`
- `quoting` → `awaiting_approval` | `approved` | `denied`
- `awaiting_approval` → `approved` | `denied`
- `approved` → `purchasing`
- `purchasing` → `in_delivery`
- `in_delivery` → `delivered`
- `delivered` → `evaluating`
- `evaluating` → `closed`
- `denied` → `awaiting_triage`
- `closed` | `cancelled` → finais

Uso típico:
- `addQuotation()` força `quoting` (se estava em `awaiting_triage` ou
  `in_progress`).
- `selectQuotation()` força `approved`.
- `changeTicketStatus()` valida transições e permissões.

**Manutenção**
- `awaiting_approval_encarregado` → `awaiting_approval_supervisor` | `denied`
- `awaiting_approval_supervisor` → `awaiting_approval_gerente` | `denied`
- `awaiting_approval_gerente` → `awaiting_triage` | `denied`
- `awaiting_triage` → `in_progress` | `technical_analysis` | `denied`
- `in_progress` → `technical_analysis` | `executing` | `denied` | `cancelled`
- `technical_analysis` → `awaiting_approval` | `executing` | `denied`
- `awaiting_approval` → `approved` | `denied`
- `approved` → `executing`
- `executing` → `waiting_parts` | `completed`
- `waiting_parts` → `executing` | `completed`
- `completed` → `evaluating`
- `evaluating` → `closed`
- `denied` → `awaiting_triage`
- `closed` | `cancelled` → finais

Uso típico:
- Criar execução (`ticket_maintenance_executions`) força `executing`.
- `setWaitingParts()` força `waiting_parts` no ticket.
- Ao concluir todas as execuções, o ticket vai para `completed`.

**Financeiro**
- `awaiting_approval_*` → (fluxo hierárquico) → `awaiting_triage`
- `awaiting_triage` → `prioritized` | `in_progress` | `denied`
- `prioritized` → `in_progress` | `denied` | `cancelled`
- `in_progress` → `resolved` | `denied` | `cancelled`
- `resolved` → `closed`
- `denied` → `awaiting_triage`
- `closed` | `cancelled` → finais

**Comercial**
- `awaiting_triage` → `prioritized` | `in_progress` | `denied`
- `prioritized` → `in_progress` | `denied` | `cancelled`
- `in_progress` → `resolved` | `denied` | `cancelled`
- `resolved` → `closed`
- `denied` → `awaiting_triage`
- `closed` | `cancelled` → finais

**Sinistros**
- `awaiting_approval_*` → (fluxo hierárquico) → `awaiting_triage` | `denied`
- `awaiting_triage` → `in_analysis` | `denied`
- `in_analysis` → `in_investigation` | `awaiting_customer` |
  `awaiting_quotations` | `in_repair` | `denied`
- `in_investigation` → `in_analysis` | `awaiting_customer` |
  `awaiting_quotations` | `denied`
- `awaiting_customer` → `in_analysis` | `in_investigation` |
  `awaiting_quotations` | `in_repair` | `denied`
- `awaiting_quotations` → `in_repair` | `awaiting_customer` | `denied`
- `in_repair` → `awaiting_payment` | `resolved` | `denied`
- `awaiting_payment` → `resolved` | `denied`
- `resolved` → `closed`
- `denied` → `awaiting_triage`
- `closed` | `cancelled` → finais

**TI**
- Sem arquivo de `constants.ts` dedicado.
- Usa `awaiting_approval_encarregado/supervisor/gerente` e evolui para
  `awaiting_triage` ou `denied` via `ticket_approvals`.

**RH**
- Não há transições específicas documentadas; usa o conjunto geral de status
  do ticket e as mesmas regras globais de triagem.

### 1.3 Uso transversal (Hub e métricas)

- `getHubStats()` considera:
  - **Triagem:** `awaiting_triage`, `awaiting_approval_*`
  - **Em progresso:** `in_progress`, `prioritized`, `quoting`, `approved`,
    `executing`, `waiting_parts`
  - **Resolvidos:** `resolved`, `closed`
- `getUnitMetrics()` usa `openStatuses` com `in_triage` e `awaiting_quotation`
  (ambos não existem no constraint de tickets).

---

## 2) Status de entidades auxiliares

Status documentados em `docs/database/schema.md` e usados no código:

**Aprovações (`ticket_approvals.status`)**
- Schema: `pending`, `approved`, `denied`
- Código TI: `pending`, `approved`, `rejected`

**Cotações de Compras (`ticket_quotations.status`)**
- Schema: `pending`, `approved`, `rejected`
- Código Compras: usa `pending` e `approved` (não usa `rejected`)

**Execuções de Manutenção (`ticket_maintenance_executions.status`)**
- Schema: status livre (default `pending`)
- Código: `pending`, `in_progress`, `waiting_parts`, `completed`, `cancelled`

**Compras internas de Sinistros (`claim_purchases.status`)**
- Schema: `draft`
- Código: `awaiting_quotation`, `quotations_received`, `awaiting_approval`,
  `approved`, `rejected`, `in_progress`, `delivered`, `completed`

**Cotações de compra de Sinistros (`claim_purchase_quotations.status`)**
- Código: `pending`, `approved`, `rejected`

**Checklists**
- `checklist_templates.status`: `active`, `inactive`
- `checklist_questions.status`: `active`, `inactive`
- `checklist_executions.status`: `in_progress`, `completed`

**Cadastros**
- `profiles.status`: `active`, `inactive`, `pending`
- `units.status`: `active`, `inactive`
- `ticket_categories.status`: `active`, `inactive`

---

## 3) Gaps, redundâncias, riscos e inconsistências

**Gaps**
- `in_triage` e `awaiting_quotation` aparecem em métricas de unidade, mas não
  existem em `tickets_status_check`. Se houver tickets com esses valores,
  updates no ticket podem falhar.
- `claim_purchases.status` no schema (`draft`) não bate com o fluxo real
  implementado no código.

**Redundâncias**
- `awaiting_approval` coexiste com `awaiting_approval_*` (níveis), o que pode
  gerar dúvidas sobre qual usar por departamento.
- `resolved` vs `closed` aparecem juntos em alguns módulos e são finais em
  outros; o significado não é uniforme.
- `approved` é usado em tickets, aprovações e cotações com semânticas distintas.

**Riscos**
- `tickets.status` é um campo único compartilhado por todos os departamentos,
  mas o banco não impõe regras por departamento. Um status de Manutenção pode
  ser aplicado a um ticket de Financeiro por falha de lógica.
- Status são strings espalhadas em várias camadas (UI, actions e banco), o que
  aumenta risco de divergência e erros em migrações.
- A documentação de schema de tickets está desatualizada e pode induzir
  mudanças erradas em novos fluxos.

**Erros e inconsistências observadas**
- `docs/database/schema.md` e `docs/database/relationships.md` ainda descrevem
  um conjunto antigo de status para `tickets`.
- `ticket_quotations.status` prevê `rejected` mas o fluxo não aplica esse valor.

---

## 4) Observações finais

O conjunto de status de `tickets` hoje é uma união de fluxos por departamento,
sem separação por domínio. Isso facilita o crescimento rápido do sistema, mas
traz risco de inconsistências e exige disciplina na atualização de:
1) constantes de transição,
2) validações server-side,
3) constraints do banco,
4) documentação.

