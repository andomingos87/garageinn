## Contexto e regras globais (para todos os bugs)
- Controle de visibilidade no menu/rotas: `apps/web/src/components/layout/app-sidebar.tsx`, `apps/web/src/components/auth/require-permission.tsx`, `apps/web/src/hooks/use-permissions.ts`, `apps/web/src/hooks/use-profile.ts`, `apps/web/src/lib/auth/permissions.ts`, `apps/web/src/lib/auth/rbac.ts`.
- Chamados por departamento (Compras, TI, RH, Financeiro) com actions específicas em `apps/web/src/app/(app)/chamados/*/actions.ts`.
- RLS no banco (tickets e detalhes) em `docs/database/migrations/003_create_rls_policies.sql` e `docs/database/migrations/004_create_ticket_it_details.sql`.

## Bugs mapeados (escopo, fluxo e arquivos)

### 1) Manobrista e Encarregado vendo tab de TI na sidebar
- Fluxo completo: renderização do menu → controle de permissão/department → acesso à rota de chamados TI.
- Arquivos relevantes:
  - Menu e permissões: `apps/web/src/components/layout/app-sidebar.tsx`
  - Regras de permissões: `apps/web/src/lib/auth/permissions.ts`, `apps/web/src/components/auth/require-permission.tsx`
  - Acesso a TI: `apps/web/src/app/(app)/chamados/ti/*`
- Observação sistêmica: item de TI parece não exigir `requirePermission`/`requireDepartment` explícito no menu. Pode haver outra barreira no nível da página, mas o menu já está exposto.
- Proposta estrutural (sem implementar): centralizar regras de visibilidade por setor/cargo em uma camada única (menu + guard de rota), evitando itens “abertos por padrão”.
- Risco de regressão: médio. Ajustes no menu podem esconder itens legítimos se regras não estiverem alinhadas com `permissions.ts`.

### 2) Supervisor só pode ver as unidades dele em `/unidades`
- Fluxo completo: page `/unidades` → `actions.ts` (`getUnits`, `checkCanAccessUnits`) → RLS de `units`.
- Arquivos relevantes:
  - Página: `apps/web/src/app/(app)/unidades/page.tsx`
  - Ações: `apps/web/src/app/(app)/unidades/actions.ts`
  - RLS: `docs/database/migrations/003_create_rls_policies.sql`
- Observação sistêmica: não há filtro por supervisor no front; RLS permite visualizar unidades ativas. A regra “supervisor vê só suas unidades” não está implementada como regra global (pode precisar filtrar via `user_units`/`is_coverage`).
- Proposta estrutural (sem implementar): alinhar regra no backend (RLS) e no front (queries) para que o filtro de unidades respeite vínculos do usuário.
- Risco de regressão: alto. Alterar RLS de unidades afeta múltiplos fluxos (listas, relatórios, filtros).

### 3) Organizar menu de Checklists: [abertura, supervisão]; somente supervisor vê supervisão
- Fluxo completo: menu → submenus de checklists → permissão `supervision:read` → página de supervisão.
- Arquivos relevantes:
  - Menu: `apps/web/src/components/layout/app-sidebar.tsx`
  - Página base: `apps/web/src/app/(app)/checklists/page.tsx`
  - Supervisão: `apps/web/src/app/(app)/checklists/supervisao/page.tsx`
  - Permissões: `apps/web/src/lib/auth/permissions.ts`
- Observação sistêmica: submenu “supervisão” já depende de `supervision:read`, mas o agrupamento do menu pode não refletir “abertura/supervisão”.
- Proposta estrutural (sem implementar): modelar o menu de checklists por categorias com permissões explícitas por subitem, mantendo consistência com guard de rota.
- Risco de regressão: baixo/médio (menu e visibilidade).

### 4) Gerente de operações vendo apenas o chamado #21
- Fluxo completo: listagem de chamados do gerente → `get*Tickets()` por departamento → RLS de tickets.
- Arquivos relevantes:
  - Ações: `apps/web/src/app/(app)/chamados/compras/actions.ts`, `apps/web/src/app/(app)/chamados/ti/actions.ts`, `apps/web/src/app/(app)/chamados/rh/actions.ts`, `apps/web/src/app/(app)/chamados/financeiro/actions.ts`
  - RLS: `docs/database/migrations/003_create_rls_policies.sql`
- Observação sistêmica: RLS permite ver por criação, atribuição, departamento e unidade. Se gerente só vê 1 ticket, pode haver filtro adicional no front (ex: status, unidade, departamento) ou falta de associação do usuário com departamentos/unidades.
- Proposta estrutural (sem implementar): consolidar a regra de “escopo visível de chamados” em uma única query/serviço (com filtros declarativos), e alinhar RLS com essa regra.
- Risco de regressão: médio/alto (alterações de escopo afetam todos os papéis).

### 5) Assistente de compras vendo chamado em “Aguardando aprovação (gerente)”
- Fluxo completo: status do ticket → regra de visibilidade por papel → lista/ações do ticket.
- Arquivos relevantes:
  - Status/ações: `apps/web/src/app/(app)/chamados/compras/[ticketId]/components/ticket-actions.tsx`
  - Ações de aprovação: `apps/web/src/app/(app)/chamados/compras/actions.ts`
- Observação sistêmica: o status “awaiting_approval_gerente” aparece na listagem de compras, indicando que não há filtro de visibilidade por papel/etapa.
- Proposta estrutural (sem implementar): definir matriz de visibilidade (papel x status) centralizada e reutilizada por lista e detalhes.
- Risco de regressão: médio (mudança pode esconder chamados necessários para outros papéis).

### 6) Assistente de compras vendo container de Ações (Reenviar triagem, negar)
- Fluxo completo: ticket details → `ticket-actions` → regras `canManage`/`canTriage`.
- Arquivos relevantes:
  - `apps/web/src/app/(app)/chamados/compras/[ticketId]/components/ticket-actions.tsx`
- Observação sistêmica: regras de ações parecem baseadas em permissões amplas (ex: `tickets:triage`) e não em papel/etapa. Assistente tem `tickets:read`, mas ainda vê ações.
- Proposta estrutural (sem implementar): separar permissões de leitura de permissões de ação por papel e etapa do fluxo, centralizando a lógica.
- Risco de regressão: médio.

### 7) O que é “Reenviar para triagem”
- Fluxo completo: status `awaiting_triage` → ação “Reenviar para Triagem” → transição de status.
- Arquivos relevantes:
  - Ações: `apps/web/src/app/(app)/chamados/compras/[ticketId]/components/ticket-actions.tsx`
  - Regras de transição: `apps/web/src/app/(app)/chamados/*/actions.ts` (funções de aprovação/triagem)
- Observação sistêmica: a ação existe quando status é `awaiting_triage`, mas não há definição explícita visível no menu/UX do que ela faz.
- Proposta estrutural (sem implementar): documentar transições de status e exibir descrições consistentes no UI.
- Risco de regressão: baixo (documentação/UX).

### 8) Assistente de compras vendo tab TI e Checklists; deveria ver tab Compras
- Fluxo completo: menu → regras de permissões por setor → itens exibidos.
- Arquivos relevantes:
  - Menu: `apps/web/src/components/layout/app-sidebar.tsx`
  - Permissões: `apps/web/src/lib/auth/permissions.ts`
- Observação sistêmica: falta item “Compras” no menu e item “TI” sem proteção; Checklists aparece sem segmentação por setor.
- Proposta estrutural (sem implementar): criar configuração de menu por setor/cargo (TI/Compras/Operações) em um único mapa de permissões.
- Risco de regressão: médio (itens podem sumir para perfis legítimos).

### 9) Manobrista abrindo chamado de RH: erro RLS `ticket_rh_details`
- Fluxo completo: criação de ticket RH → insert em `ticket_rh_details` → policy RLS.
- Arquivos relevantes:
  - Criação: `apps/web/src/app/(app)/chamados/rh/actions.ts` (createRHTicket)
  - RLS: `docs/database/migrations/003_create_rls_policies.sql`
- Observação sistêmica: policies de INSERT não existem para `ticket_rh_details`, apenas SELECT/Admin. Isso afeta qualquer papel que crie ticket RH (não só manobrista).
- Proposta estrutural (sem implementar): adicionar policy de INSERT para detalhes usando `created_by` como critério, alinhada ao fluxo de criação.
- Risco de regressão: médio/alto (RLS afeta integridade e segurança).

### 10) Manobrista abrindo chamado de TI: erro RLS `ticket_it_details`
- Fluxo completo: criação de ticket TI → insert em `ticket_it_details` → policy RLS.
- Arquivos relevantes:
  - Criação: `apps/web/src/app/(app)/chamados/ti/actions.ts` (createTiTicket)
  - RLS: `docs/database/migrations/004_create_ticket_it_details.sql`
- Observação sistêmica: policies de INSERT não existem para `ticket_it_details`, apenas SELECT/Admin. Afeta qualquer papel que crie ticket TI.
- Proposta estrutural (sem implementar): política de INSERT para detalhes TI com base no criador do ticket.
- Risco de regressão: médio/alto.

## Pontos correlatos que podem ter o mesmo problema
- Menu e visibilidade por papel: todos os itens de sidebar devem usar a mesma fonte de verdade (permissões/departamento).
- Listas de chamados: filtros por papel/status aparecem duplicados em várias actions de departamento; risco de inconsistência.
- RLS de detalhes de ticket: verificar outras tabelas “details” sem policy de INSERT equivalente.

## Histórias do usuário e critérios de aceite

### 1) Tab de TI visível para não‑TI
- História: Como usuário não pertencente ao setor de TI (manobrista/encarregado), quero não ver nem acessar a área de TI para evitar confusão e acessos indevidos.
- Critérios de aceite:
  - Usuários fora do setor de TI não veem o item “TI” no menu.
  - Acessar diretamente `/chamados/ti` sem permissão exibe bloqueio/sem acesso.
  - Usuários do setor de TI continuam vendo e acessando normalmente.

### 2) Supervisor ver somente suas unidades
- História: Como supervisor, quero ver apenas as unidades sob minha responsabilidade para focar na minha cobertura.
- Critérios de aceite:
  - A lista de `/unidades` exibe somente unidades vinculadas ao supervisor.
  - Filtros (cidade, região, status, busca) atuam somente dentro desse conjunto.
  - Perfis com permissão global (ex.: admin) mantêm a visão completa.

### 3) Menu de Checklists com submenus e supervisão restrita
- História: Como supervisor, quero acessar o submenu “Supervisão” em Checklists; como não‑supervisor, quero ver apenas “Abertura”.
- Critérios de aceite:
  - O menu “Checklists” exibe subitens “Abertura” e “Supervisão”.
  - Apenas quem possui `supervision:read` vê e acessa “Supervisão”.
  - Acesso direto a `/checklists/supervisao` sem permissão é bloqueado.

### 4) Gerente de operações ver escopo correto de chamados
- História: Como gerente de operações, quero ver todos os chamados dentro do meu escopo para acompanhar a operação.
- Critérios de aceite:
  - A listagem inclui todos os tickets do escopo do gerente (por unidade/departamento/atribuição), sem filtros ocultos.
  - O resultado da listagem é consistente com as regras de visibilidade definidas no RLS.
  - Não há limitação indevida a um único chamado quando há mais no escopo.

### 5) Assistente de compras não ver chamados “Aguardando aprovação (gerente)”
- História: Como assistente de compras, quero ver apenas os chamados nas etapas que me dizem respeito para evitar ruído.
- Critérios de aceite:
  - Chamados em status exclusivo de gerente não aparecem para assistentes.
  - A regra de visibilidade por status é aplicada de forma consistente na lista e no detalhe.

### 6) Assistente de compras não ver container de Ações
- História: Como assistente de compras, quero acesso apenas de leitura quando não tenho permissão de ação.
- Critérios de aceite:
  - O container “Ações” não aparece para assistentes sem permissão de triagem/aprovação.
  - Ações como “Reenviar para triagem” e “Negar” não ficam visíveis para esse perfil.

### 7) Significado de “Reenviar para triagem”
- História: Como usuário autorizado, quero entender o que a ação “Reenviar para triagem” faz antes de executá‑la.
- Critérios de aceite:
  - A ação exibe descrição clara do efeito (ex.: retorno ao status de triagem).
  - A ação só aparece quando o status permite essa transição.
  - Após confirmar, o status é atualizado de forma consistente com a transição definida.

### 8) Assistente de compras ver tab Compras e não ver TI/Checklists
- História: Como assistente de compras, quero ter acesso rápido à área de Compras e não ver áreas que não utilizo.
- Critérios de aceite:
  - O menu exibe o item “Compras” para assistentes desse setor.
  - Itens “TI” e “Checklists” não aparecem para esse perfil.

### 9) Criação de chamado RH com RLS em `ticket_rh_details`
- História: Como manobrista (ou qualquer usuário autorizado), quero abrir chamado de RH sem bloqueio de RLS.
- Critérios de aceite:
  - O criador do ticket consegue inserir registros em `ticket_rh_details`.
  - Usuários sem relação com o ticket continuam bloqueados pela RLS.
  - A criação falha apenas quando regras de permissão realmente não são atendidas.

### 10) Criação de chamado TI com RLS em `ticket_it_details`
- História: Como manobrista (ou qualquer usuário autorizado), quero abrir chamado de TI sem bloqueio de RLS.
- Critérios de aceite:
  - O criador do ticket consegue inserir registros em `ticket_it_details`.
  - Usuários sem relação com o ticket continuam bloqueados pela RLS.
  - A criação falha apenas quando regras de permissão realmente não são atendidas.