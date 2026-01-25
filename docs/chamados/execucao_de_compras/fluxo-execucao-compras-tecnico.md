# Fluxo de Execucao de Compras (Tecnico)

Documento tecnico para o time, descrevendo a implementacao atual do fluxo de
compras. Baseado no que descreve o negocio em
[fluxo-execucao-compras.md](fluxo-execucao-compras.md).

## Escopo e fontes
- Regras de negocio: `docs/chamados/abertura.md`, `docs/chamados/aprovacoes.md`,
  `docs/chamados/execucoes.md`
- Dados: `docs/database/schema.md`
- Implementacao web: `apps/web/src/app/(app)/chamados/compras/**`
- Status e transicoes: `apps/web/src/app/(app)/chamados/compras/constants.ts`

## Mapa de arquivos (web)
- `apps/web/src/app/(app)/chamados/compras/page.tsx`
  Listagem com filtros, cards de status e paginacao.
- `apps/web/src/app/(app)/chamados/compras/novo/page.tsx`
  Criacao de chamado via `createPurchaseTicket`.
- `apps/web/src/app/(app)/chamados/compras/[ticketId]/page.tsx`
  Detalhes do chamado, incluindo aprovacoes, cotacoes e acoes.
- `apps/web/src/app/(app)/chamados/compras/components/*`
  Cards, filtros, tabela e form.
- `apps/web/src/app/(app)/chamados/compras/[ticketId]/components/*`
  Componentes de detalhes: header, info, timeline, comentarios, cotacoes,
  aprovacoes, acoes e dialogo de triagem.
- `apps/web/src/app/(app)/chamados/compras/actions.ts`
  Server actions e regras de negocio.
- `apps/web/src/app/(app)/chamados/compras/constants.ts`
  Status, labels e transicoes permitidas.

## Status e transicoes
As transicoes permitidas sao definidas em `statusTransitions`:
- `awaiting_approval_encarregado` -> `awaiting_approval_supervisor`, `denied`
- `awaiting_approval_supervisor` -> `awaiting_approval_gerente`, `denied`
- `awaiting_approval_gerente` -> `awaiting_triage`, `denied`
- `awaiting_triage` -> `in_progress`, `quoting`, `denied`
- `in_progress` -> `quoting`, `denied`, `cancelled`
- `quoting` -> `awaiting_approval`, `approved`, `denied`
- `awaiting_approval` -> `approved`, `denied`
- `approved` -> `purchasing`
- `purchasing` -> `in_delivery`
- `in_delivery` -> `delivered`
- `delivered` -> `evaluating`
- `evaluating` -> `closed`
- `denied` -> `awaiting_triage` (pode reenviar)
- `closed` -> (sem transicoes)
- `cancelled` -> (sem transicoes)

Os labels exibidos na UI ficam em `statusLabels` no mesmo arquivo.

## Fluxo tecnico (implementado)

### 1) Criacao do chamado
Server action: `createPurchaseTicket` em `actions.ts`.
- Valida campos obrigatorios (titulo, item, quantidade, justificativa).
- Consulta a RPC `ticket_needs_approval` para decidir o status inicial:
  `awaiting_approval_encarregado` ou `awaiting_triage`.
- Insere em `tickets` e em `ticket_purchase_details`.
- Se precisar de aprovacao, chama RPC `create_ticket_approvals`.

### 2) Aprovacoes (Operacoes -> Compras)
Server action: `handleApproval` em `actions.ts`.
- Atualiza `ticket_approvals` (status, aprovador, data e notas).
- Se rejeitado, atualiza o ticket para `denied` com `denial_reason`.
- Se aprovado, avanca o status conforme o nivel:
  1 -> `awaiting_approval_supervisor`
  2 -> `awaiting_approval_gerente`
  3 -> `awaiting_triage`

UI: `TicketApprovals` em
`apps/web/src/app/(app)/chamados/compras/[ticketId]/components/ticket-approvals.tsx`
valida quem pode aprovar com base no status atual e no cargo do usuario.

### 3) Triagem
Server action: `triageTicket` em `actions.ts`.
- Permitido para cargos listados em `TRIAGE_ROLES` (ex: Supervisor, Gerente,
  Coordenador, e cargos globais).
- Exige status `awaiting_triage`.
- Atualiza `priority`, `assigned_to`, `due_date` e move para `in_progress`.
- Registra historico manual em `ticket_history` com acao `triaged`.

UI: `TriageDialog` em
`apps/web/src/app/(app)/chamados/compras/[ticketId]/components/triage-dialog.tsx`
coleta prioridade, responsavel e previsao.

### 4) Cotacoes
Server action: `addQuotation` em `actions.ts`.
- Insere em `ticket_quotations`.
- Atualiza status para `quoting` quando o ticket esta em `awaiting_triage` ou
  `in_progress`.

Server action: `selectQuotation` em `actions.ts`.
- Marca a cotacao selecionada como `approved` e limpa selecoes anteriores.
- Atualiza `ticket_purchase_details.approved_quotation_id`.
- Atualiza status do ticket para `approved`.

UI: `TicketQuotations` em
`apps/web/src/app/(app)/chamados/compras/[ticketId]/components/ticket-quotations.tsx`
exibe cotacoes e permite:
- Adicionar cotacao (em `awaiting_triage`, `in_progress`, `quoting`).
- Selecionar cotacao (em `quoting` ou `awaiting_approval`).
- Remover cotacao (acao direta).

### 5) Mudanca de status
Server action: `changeTicketStatus` em `actions.ts`.
- Valida transicao com base em `statusTransitions`.
- Admin ou Gerente podem forcar `closed` ou `cancelled` fora da transicao
  padrao (se nao estiver em status final).
- Ao negar (`denied`), exige motivo.

UI: `TicketActions` em
`apps/web/src/app/(app)/chamados/compras/[ticketId]/components/ticket-actions.tsx`
renderiza botoes conforme transicoes permitidas.

## Dados e tabelas
Fonte: `docs/database/schema.md`.

- `tickets`: tabela principal de chamados.
- `ticket_purchase_details`: item, quantidade, preco estimado, entrega e
  `approved_quotation_id`.
- `ticket_quotations`: fornecedor, contato, preco, prazo, status
  (`pending`, `approved`, `rejected`) e `is_selected`.
- `ticket_approvals`: nivel de aprovacao e cargo aprovador.
- `ticket_history`: log de acoes e mudancas de status.
- `ticket_comments` e `ticket_attachments`: comentarios e anexos.

Observacao: `getTicketDetails` usa `tickets_with_details` como fonte de dados
agregada para a tela de detalhes.

## Permissoes e visibilidade (implementado)
- `canManageTicket` valida se o usuario pertence ao departamento de Compras
  (ou e admin).
- `canTriageTicket` valida cargos de triagem e departamento.
- Cadeia de aprovacao e triagem segue as regras descritas em
  `docs/chamados/aprovacoes.md` e aplicadas via RPCs e status.

## Pontos de integracao Supabase
RPCs usadas em `actions.ts`:
- `ticket_needs_approval` (define status inicial)
- `create_ticket_approvals` (cria niveis de aprovacao)
- `is_admin` (override de permissoes)

Views/tabelas consultadas:
- `tickets_with_details`, `tickets`, `ticket_purchase_details`,
  `ticket_quotations`, `ticket_approvals`, `ticket_history`,
  `ticket_comments`, `ticket_attachments`, `profiles`, `user_roles`, `roles`,
  `departments`.
