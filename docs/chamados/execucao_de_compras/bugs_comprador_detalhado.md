# Bugs Comprador - Detalhado

## Fonte
- Base: `docs/chamados/compras_exec/bugs_comprador.md` (itens 9-23)
- Perfil: comprador_compras_e_manutencao_teste@garageinn.com
- Escopo: hub geral de chamados e fluxo de compras

## Grupo 1: Visibilidade e acesso (lista geral de chamados)

### BUG-COMP-01 - Comprador ve chamados fora do status "prontos para execucao"
**Contexto:** tela `/chamados` (hub geral).

**Passos resumidos:**
1) Logar como comprador.
2) Acessar `/chamados`.

**Resultado atual:**
- A lista exibe chamados em varios status, sem restricao de prontidao.

**Esperado:**
- Exibir apenas chamados prontos para execucao (status a confirmar com negocio).

**Arquivos e contextos:**
- `apps/web/src/app/(app)/chamados/page.tsx` (hub geral).
- `apps/web/src/app/(app)/chamados/actions.ts`:
  - `getHubTickets` lista `tickets_with_details` sem filtro por role/status.
- `apps/web/src/app/(app)/chamados/components/hub-table.tsx` (render da lista).
- View `tickets_with_details` e politicas RLS (Supabase).

---

### BUG-COMP-02 - Filtro "Departamento" mostra RH e TI
**Contexto:** filtros no hub `/chamados`.

**Resultado atual:**
- Dropdown exibe RH e TI para comprador.

**Esperado:**
- Para comprador, listar apenas Compras e Manutencao.

**Arquivos e contextos:**
- `apps/web/src/app/(app)/chamados/actions.ts`:
  - `getDepartments` usa `.in("name", ["Compras", "Manutencao", "RH", "TI"])`.
- `apps/web/src/app/(app)/chamados/components/hub-filters.tsx` (dropdown).

---

### BUG-COMP-03 - Abertura de chamado de TI bloqueada para comprador
**Contexto:** `/chamados/ti/novo` e acesso a area TI.

**Resultado atual:**
- Comprador recebe `AccessDenied` ao tentar abrir chamado de TI.

**Esperado:**
- Todos os usuarios podem abrir chamados de TI.
- Restricao so para executar chamados e acessar area TI (lista e menu).

**Arquivos e contextos:**
- `apps/web/src/app/(app)/chamados/ti/novo/page.tsx` (gate por `getTiAccessContext`).
- `apps/web/src/app/(app)/chamados/ti/actions.ts`:
  - `getTiAccessContext` / `ensureTiAccess`.
- `apps/web/src/lib/auth/ti-access.ts`:
  - `canAccessTiArea` restringe ao departamento TI ou admin.
- `apps/web/src/components/layout/app-sidebar.tsx` (menu TI restrito).
- `apps/web/src/app/(app)/chamados/components/new-ticket-dialog.tsx` (botao TI sempre visivel).

## Grupo 2: Cotacoes (modal e persistencia)

### BUG-COMP-04 - Mascaras ausentes para CNPJ, contato e preco
**Contexto:** modal "Adicionar Cotacao".

**Resultado atual:**
- Inputs sao livres (sem mascara/formato).

**Esperado:**
- Aplicar mascaras/formatacao para CNPJ, contato (telefone/email) e preco.

**Arquivos e contextos:**
- `apps/web/src/app/(app)/chamados/compras/[ticketId]/components/ticket-quotations.tsx`
  (inputs do formulario de cotacao).
- `apps/web/src/app/(app)/chamados/compras/actions.ts` (`addQuotation` parse/validacao).

---

### BUG-COMP-05 - RLS bloqueia insercao de cotacoes
**Contexto:** salvar cotacao no modal.

**Resultado atual:**
- Erro: `new row violates row-level security policy for table "ticket_quotations"`.

**Esperado:**
- Comprador autorizado conseguir inserir cotacao.

**Arquivos e contextos:**
- `apps/web/src/app/(app)/chamados/compras/actions.ts`:
  - `addQuotation` faz `insert` em `ticket_quotations`.
- `docs/database/migrations/003_create_rls_policies.sql`:
  - politicas para `ticket_quotations` apenas `SELECT` e `ADMIN`.
- `docs/database/schema.md`:
  - definicao da tabela `ticket_quotations`.

## Grupo 3: Comentarios e historico

### BUG-COMP-06 - Comentario nao envia com Ctrl + Enter
**Contexto:** formulario de comentario no detalhe do chamado.

**Resultado atual:**
- Apenas o botao "Enviar" envia.

**Esperado:**
- Ctrl + Enter enviar comentario.

**Arquivos e contextos:**
- `apps/web/src/app/(app)/chamados/compras/[ticketId]/components/ticket-comments.tsx`
  (nao ha handler de atalho no `Textarea`).
- `apps/web/src/app/(app)/chamados/compras/actions.ts` (`addComment`).

---

### BUG-COMP-07 - Historico mostra label "status_change"
**Contexto:** timeline do chamado.

**Resultado atual:**
- A acao aparece com label "status_change" em ingles.

**Esperado:**
- Label em portugues (ex: "Status alterado").

**Arquivos e contextos:**
- `apps/web/src/app/(app)/chamados/compras/[ticketId]/components/ticket-timeline.tsx`
  (mapeia `status_changed`, nao `status_change`).
- `docs/database/migrations/002_create_functions.sql`
  (triggers gravam `ticket_history.action` como `status_change`).

## Grupo 4: Mudanca de status sem reflexo visual

### BUG-COMP-08 - Status nao atualiza apos acao (Cotacao/Andamento/Negar)
**Contexto:** botoes de acao no detalhe do chamado.

**Resultado atual:**
- Toast indica sucesso, mas status visual/botoes nao mudam.

**Esperado:**
- Status e botoes devem refletir a nova etapa.

**Arquivos e contextos:**
- `apps/web/src/app/(app)/chamados/compras/[ticketId]/components/ticket-actions.tsx`
  (botoes e toast).
- `apps/web/src/app/(app)/chamados/compras/actions.ts`:
  - `changeTicketStatus` atualiza o status e revalida rotas.
- `apps/web/src/app/(app)/chamados/compras/constants.ts`
  (`statusTransitions` e labels).
- `apps/web/src/app/(app)/chamados/compras/[ticketId]/page.tsx`
  (recarrega dados do ticket).
- View `tickets_with_details` (fonte da tela de detalhes).
