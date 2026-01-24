# Planejamento Técnico — Módulo de Chamados de TI

## 1. Inventário do projeto

### Reutilizar
- **Padrões de módulo de chamados**: estrutura de `apps/web/src/app/(app)/chamados/manutencao` como referência para páginas, actions e componentes.
- **Componentes base**: `StatusBadge`, `TicketTimeline`, `TicketComments`, `TicketApprovals`, `TicketsTable`, `TicketsFilters`, `TicketsStatsCards`.
- **Layout e navegação**: `AppSidebar` (`apps/web/src/components/layout/app-sidebar.tsx`) para item raiz.
- **Camada de dados**:
  - Tabelas: `tickets`, `ticket_categories`, `ticket_approvals`, `ticket_comments`, `ticket_history`, `ticket_attachments`.
  - Funções: `ticket_needs_approval`, `create_ticket_approvals`, `advance_ticket_approval`, `is_admin`.

### Criar
- **Módulo TI**: nova rota `chamados/ti` com listagem, criação e detalhes.
- **Detalhes específicos**: tabela `ticket_it_details` (ou equivalente) para armazenar tipo de equipamento.
- **View de consulta**: `tickets_it_with_details` (similar a `tickets_maintenance_with_details`).
- **Componentes específicos**: formulário e filtros de TI com campos de categoria e tipo de equipamento.

## 2. Estrutura de implementação

### Arquivos a criar
- `apps/web/src/app/(app)/chamados/ti/page.tsx`
  - Listagem de chamados de TI com filtros e paginação.
- `apps/web/src/app/(app)/chamados/ti/novo/page.tsx`
  - Tela de criação de chamado de TI.
- `apps/web/src/app/(app)/chamados/ti/[ticketId]/page.tsx`
  - Detalhe do chamado (histórico, aprovações, comentários).
- `apps/web/src/app/(app)/chamados/ti/actions.ts`
  - Actions server-side para listagem, criação e leitura de chamado.
- `apps/web/src/app/(app)/chamados/ti/components/ti-ticket-form.tsx`
  - Formulário com categoria e tipo de equipamento.
- `apps/web/src/app/(app)/chamados/ti/components/ti-filters.tsx`
  - Filtros por status, prioridade e categoria.
- `apps/web/src/app/(app)/chamados/ti/components/ti-stats-cards.tsx`
  - Indicadores de status dos tickets de TI.

### Arquivos a modificar
- `apps/web/src/components/layout/app-sidebar.tsx`
  - Adicionar item **TI** como item raiz.
- `docs/database/migrations/*`
  - Migration para `ticket_it_details` e view `tickets_it_with_details`.
- `docs/database/seeds/003_ticket_categories.sql`
  - Inserir categorias de TI: `Equipamento`, `Rede`, `Internet`, `Outros`.
- `docs/database/functions.md` + migration de funções
  - Ajuste na regra de aprovação, se necessário.

## 3. Contratos e interfaces

### Tipos (TypeScript)
- `TiCategory`
  - `id`, `name`, `department_id`, `status`
- `TiTicketDetails`
  - `ticket_id`
  - `equipment_type` (texto obrigatório)
- `TiTicketFilters`
  - `status`, `priority`, `category_id`, `unit_id`, `search`, `page`, `limit`

### Payloads (FormData)
- **Criação de TI**
  - `title`
  - `description`
  - `category_id` (Equipamento, Rede, Internet, Outros)
  - `equipment_type` (tipo de equipamento)
  - `unit_id` (se aplicável)
  - `perceived_urgency` (opcional)

## 4. Fluxo de dados

1. **Criação**
   - UI envia `FormData` → `createTiTicket` em `actions.ts`.
   - `createTiTicket` cria registro em `tickets` com `department_id` de TI.
   - Insere em `ticket_it_details` o `equipment_type`.
   - Verifica aprovação via `ticket_needs_approval`:
     - Se precisa aprovação: status `awaiting_approval_encarregado` e cria aprovações.
     - Caso contrário: status `awaiting_triage`.
2. **Listagem**
   - Listagem usa view `tickets_it_with_details`.
   - Filtros combinam `tickets` + `ticket_categories`.
3. **Detalhe**
   - Busca ticket + detalhes + comentários + aprovações + histórico.
4. **Aprovação**
   - `advance_ticket_approval` muda status do ticket conforme nível.

## 5. Critérios de aceitação

- [ ] Item **TI** aparece como item raiz na sidebar.
- [ ] Usuário de qualquer departamento consegue abrir chamado de TI.
- [ ] Formulário de TI possui **Categoria** (Equipamento, Rede, Internet, Outros).
- [ ] Formulário de TI possui **Tipo de Equipamento** obrigatório.
- [ ] Usuários de **TI (Analista/Gerente)** veem todos os chamados de TI.
- [ ] Usuários globais (Administrador, Desenvolvedor, Diretor) veem todos os chamados.
- [ ] Usuários comuns veem apenas seus próprios chamados de TI.
- [ ] Fluxo de aprovação segue o padrão definido em `docs/chamados/aprovacoes.md`.

## 6. Sequência de implementação

1. **Banco de dados**
   - Criar `ticket_it_details`.
   - Criar view `tickets_it_with_details`.
   - Inserir categorias de TI.
2. **Regras de aprovação**
   - Ajustar `ticket_needs_approval` para incluir TI como departamento elegível, se aplicável.
3. **Backend**
   - Implementar `actions.ts` (listagem, criação, detalhes).
4. **Frontend**
   - Criar páginas e componentes do módulo TI.
   - Adicionar item na sidebar.
5. **Validação**
   - Testar criação, aprovação e visibilidade por perfil (TI, global, usuário comum).

## Decisões e trade-offs

- **Aprovação para TI**:
  - **Opção A (recomendada)**: estender `ticket_needs_approval` para TI, mantendo fluxo padrão.
    - Prós: reusa regra centralizada; reduz divergência de comportamento.
    - Contras: altera regra global e impacta outros módulos se houver dependências ocultas.
  - **Opção B**: criar `ticket_needs_approval_it` e usar apenas no módulo TI.
    - Prós: isolamento total; baixo risco de efeitos colaterais.
    - Contras: lógica duplicada e mais manutenção.
