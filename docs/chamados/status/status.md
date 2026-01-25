# Status de Chamados (atual)

Este documento lista os status usados hoje na aplicacao por departamento.
No banco, o status do chamado fica em `tickets.status` (tipo `text`).

## Fonte principal
- `apps/web/src/app/(app)/chamados/components/status-badge.tsx`
- `apps/web/src/app/(app)/chamados/*/constants.ts`
- `apps/web/src/app/(app)/chamados/ti/components/ti-filters.tsx`

## Compras
Arquivo: `apps/web/src/app/(app)/chamados/compras/constants.ts`
- awaiting_approval_encarregado
- awaiting_approval_supervisor
- awaiting_approval_gerente
- awaiting_triage
- in_progress
- quoting
- awaiting_approval
- approved
- purchasing
- in_delivery
- delivered
- evaluating
- denied
- closed
- cancelled

## Manutencao
Arquivo: `apps/web/src/app/(app)/chamados/manutencao/constants.ts`
- awaiting_approval_encarregado
- awaiting_approval_supervisor
- awaiting_approval_gerente
- awaiting_triage
- in_progress
- technical_analysis
- awaiting_approval
- approved
- executing
- waiting_parts
- completed
- evaluating
- denied
- closed
- cancelled

## Financeiro
Arquivo: `apps/web/src/app/(app)/chamados/financeiro/constants.ts`
- awaiting_approval_encarregado
- awaiting_approval_supervisor
- awaiting_approval_gerente
- awaiting_triage
- prioritized
- in_progress
- resolved
- denied
- closed
- cancelled

## Comercial
Arquivo: `apps/web/src/app/(app)/chamados/comercial/constants.ts`
- awaiting_triage
- prioritized
- in_progress
- resolved
- denied
- closed
- cancelled

## Sinistros
Arquivo: `apps/web/src/app/(app)/chamados/sinistros/constants.ts`
- awaiting_approval_encarregado
- awaiting_approval_supervisor
- awaiting_approval_gerente
- awaiting_triage
- in_analysis
- in_investigation
- awaiting_customer
- awaiting_quotations
- in_repair
- awaiting_payment
- resolved
- denied
- closed
- cancelled

Observacao: sinistros tambem tem status internos de compra (PURCHASE_STATUS),
mas eles nao ficam em `tickets.status`.

## TI
Arquivo: `apps/web/src/app/(app)/chamados/ti/components/ti-filters.tsx`
- awaiting_approval_encarregado
- awaiting_approval_supervisor
- awaiting_approval_gerente
- awaiting_triage
- in_progress
- executing
- waiting_parts
- resolved
- closed
- denied
- cancelled
