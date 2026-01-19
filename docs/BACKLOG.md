# Backlog do Projeto - Gapp (Garageinn App)

## 0. Premissas e Escopo

- Este backlog cobre **Web, Mobile e Backend (Supabase)** com foco no MVP descrito no `projeto/PRD.md`.
- Estrutura por **Fase → Épico → Tarefas → Subtarefas**, com **contexto** e dependências.
- Prioriza Entregas 1 a 4 e inclui refinamentos Pós‑Entrega.

## 1. Fase 0 — Fundacao e Bootstrap ✅

### Épico 0.1 — Setup do monorepo e padroes de codigo ✅
**Contexto**: preparar ambiente consistente para Web, Mobile e Supabase.

- [x] Tarefa 0.1.1: Configurar dependencias base do monorepo
  - ✅ Subtarefa: Definir versoes Node e package manager (.nvmrc, engines)
  - ✅ Subtarefa: Padronizar scripts raiz (lint, format, test) - package.json raiz
- [x] Tarefa 0.1.2: Padronizar lint e format
  - ✅ Subtarefa: ESLint e Prettier para Web
  - ✅ Subtarefa: ESLint e Prettier para Mobile (eslint.config.mjs, .prettierrc)
  - ✅ Subtarefa: Configurar regras compartilhadas
- [x] Tarefa 0.1.3: Estrutura base de pastas
  - ✅ Subtarefa: Separar apps, supabase e projeto
  - ✅ Subtarefa: Criar conventions (CONVENTIONS.md, hooks/index.ts barrel export)

### Épico 0.2 — Design System base (Web) ✅
**Contexto**: aplicar identidade visual e componentes shadcn/ui.

- [x] Tarefa 0.2.1: Tokens de cores e tipografia
  - ✅ Subtarefa: Definir paleta primaria e semantica (hsl(0 95% 60%) vermelho GarageInn)
  - ✅ Subtarefa: Definir tipografia (Inter) e tamanhos
- [x] Tarefa 0.2.2: Componentes base
  - ✅ Subtarefa: Buttons, Cards, Badges (shadcn/ui)
  - ✅ Subtarefa: Inputs, Select, Datepicker (Calendar + DatePicker com react-day-picker v9)
  - ✅ Subtarefa: Tabelas e filtros base
- [x] Tarefa 0.2.3: Layout principal
  - ✅ Subtarefa: Sidebar e Header responsivos (AppShell, AppSidebar, AppHeader)
  - ✅ Subtarefa: Containers e grids principais

### Épico 0.3 — Infraestrutura Supabase ✅
**Contexto**: preparar auth, banco e storage.

- [x] Tarefa 0.3.1: Setup do projeto Supabase
  - ✅ Subtarefa: Configurar projeto e ambientes (supabase/config.toml)
  - ✅ Subtarefa: Definir variaveis de ambiente (.env.local web e mobile)
- [x] Tarefa 0.3.2: Auth e perfis
  - ✅ Subtarefa: Habilitar magic link e recovery
  - ✅ Subtarefa: Criar tabela de perfis e triggers (is_admin(), is_rh())
- [x] Tarefa 0.3.3: Storage
  - ✅ Subtarefa: Buckets para anexos e fotos (ticket-attachments 50MB, checklist-photos 10MB)
  - ✅ Subtarefa: Politicas RLS de leitura/escrita

## 2. Fase 1 — Entrega 1 (Operacoes, Compras, Manutencao, RH) ✅

### Épico 1.1 — Autenticacao e Protecao de Rotas (Web) ✅
**Contexto**: garantir acesso seguro via Supabase Auth.
**Status**: COMPLETO (verificado em 2026-01-18)

- [x] Tarefa 1.1.1: Tela de login
  - [x] Subtarefa: Layout responsivo e validacoes
  - [x] Subtarefa: Integracao com Supabase Auth
- [x] Tarefa 1.1.2: Recuperacao de senha
  - [x] Subtarefa: Tela e fluxo de envio de link
  - [x] Subtarefa: Feedback de sucesso/erro
- [x] Tarefa 1.1.3: Middleware de protecao
  - [x] Subtarefa: Bloquear rotas privadas sem sessao
  - [x] Subtarefa: Redirect para login

### Épico 1.2 — RBAC e Permissoes ✅
**Contexto**: usuarios podem ter multiplos cargos/departamentos, com uniao de permissoes.
**Status**: COMPLETO (verificado em 2026-01-18)

- [x] Tarefa 1.2.1: Modelagem RBAC
  - [x] Subtarefa: Tabelas departments, roles, permissions
  - [x] Subtarefa: Tabelas user_roles e user_permissions (implementado via calculo em runtime)
- [x] Tarefa 1.2.2: Regras de visibilidade por unidade
  - [x] Subtarefa: Estruturar user_units e coverage_units (via user_units.is_coverage)
  - [x] Subtarefa: Views ou policies para escopo (RLS em 23 tabelas)
- [x] Tarefa 1.2.3: Middleware e guards
  - [x] Subtarefa: Hook para permissoes no front (usePermissions)
  - [x] Subtarefa: Verificacao server-side (RLS + rbac.ts)

### Épico 1.3 — Gestao de Usuarios (Web)
**Contexto**: CRUD com vinculos por departamento, cargo e unidade.
**Status**: COMPLETO (verificado em 2026-01-18)

- [x] Tarefa 1.3.1: Listagem de usuarios
  - [x] Subtarefa: Tabela com busca e filtros
  - [x] Subtarefa: Acoes rapidas (ativar/inativar)
- [x] Tarefa 1.3.2: Cadastro e edicao
  - [x] Subtarefa: Formulario com validacoes (CPF, telefone)
  - [x] Subtarefa: Selecao de departamentos e cargos
  - [x] Subtarefa: Vinculo obrigatorio por cargo
- [x] Tarefa 1.3.3: Fluxo de convite e primeiro acesso
  - [x] Subtarefa: Criar usuario no Auth
  - [x] Subtarefa: Enviar magic link

### Épico 1.4 — Gestao de Unidades (Web) ✅
**Contexto**: cadastro completo e visao detalhada de unidades.
**Status**: PARCIALMENTE COMPLETO (verificado em 2026-01-18) - Falta upload de foto

- [x] Tarefa 1.4.1: Listagem e filtros
  - [x] Subtarefa: Tabela/cards com status
  - [x] Subtarefa: Filtros por cidade e status
- [ ] Tarefa 1.4.2: Cadastro/edicao
  - [x] Subtarefa: Formulario completo com validacoes
  - [ ] Subtarefa: Upload de foto da fachada ⚠️ NAO IMPLEMENTADO
- [x] Tarefa 1.4.3: Detalhes da unidade
  - [x] Subtarefa: Tabs para contatos/infra/servicos
  - [x] Subtarefa: Lista de equipe vinculada

### Épico 1.5 — Checklists de Abertura ✅
**Contexto**: configuracao pelo admin e execucao por Operacoes.
**Status**: PARCIALMENTE COMPLETO (verificado em 2026-01-18) - Falta upload de fotos

- [x] Tarefa 1.5.1: Modelagem de templates e perguntas
  - [x] Subtarefa: Tabelas checklist_templates e questions
  - [x] Subtarefa: RLS para admin e operacoes
- [x] Tarefa 1.5.2: Tela admin de configuracao
  - [x] Subtarefa: CRUD de templates por unidade
  - [x] Subtarefa: Ordenacao e obrigatoriedade
- [ ] Tarefa 1.5.3: Execucao do checklist (Web)
  - [x] Subtarefa: Fluxo passo a passo
  - [x] Subtarefa: Observacao obrigatoria em "Nao"
  - [ ] Subtarefa: Upload de fotos ⚠️ NAO IMPLEMENTADO
- [x] Tarefa 1.5.4: Historico de execucoes
  - [x] Subtarefa: Listagem e filtros por data/unidade
  - [x] Subtarefa: Detalhe com respostas e midias

### Épico 1.6 — Chamados de Compras ✅
**Contexto**: fluxo completo com status especificos e aprovacao quando solicitado por Operacoes.
**Status**: COMPLETO (verificado em 2026-01-18)

- [x] Tarefa 1.6.1: Modelagem de dados
  - ✅ Subtarefa: tickets, comments, attachments, history (tabelas implementadas com RLS)
  - ✅ Subtarefa: Status especificos de Compras (ticket_purchase_details, ticket_quotations)
- [x] Tarefa 1.6.2: Abertura de chamado
  - ✅ Subtarefa: Formulario com campos especificos (item_name, quantity, unit_of_measure, estimated_price)
  - ✅ Subtarefa: Anexos e urgencia percebida (perceived_urgency, ticket_attachments)
- [x] Tarefa 1.6.3: Listagem e filtros
  - ✅ Subtarefa: Filtros por status/prioridade/unidade (tickets-filters.tsx)
  - ✅ Subtarefa: Busca por titulo/numero (search com ticket_number)
- [x] Tarefa 1.6.4: Triagem e priorizacao
  - ✅ Subtarefa: Definir prioridade oficial (triageTicket action)
  - ✅ Subtarefa: Atribuir responsavel (assigned_to)
- [x] Tarefa 1.6.5: Fluxo de execucao
  - ✅ Subtarefa: Mudancas de status (statusTransitions em constants.ts)
  - ✅ Subtarefa: Comentarios e historico (ticket_comments, ticket_history)
- [x] Tarefa 1.6.6: Aprovacao Operacoes
  - ✅ Subtarefa: Cadeia Encarregado → Supervisor → Gerente (ticket_approvals, handleApproval)
  - ✅ Subtarefa: Negacao com justificativa (denial_reason, notes)

### Épico 1.7 — Chamados de Manutencao ✅
**Contexto**: fluxo semelhante a Compras com status especificos.
**Status**: COMPLETO (verificado em 2026-01-18)

- [x] Tarefa 1.7.1: Modelagem de dados especifica
  - ✅ Subtarefa: Status de Manutencao (ticket_maintenance_details, ticket_maintenance_executions)
  - ✅ Subtarefa: Campos de abertura (assunto/unidade) (subject_id, maintenance_type, location_description, equipment_affected)
- [x] Tarefa 1.7.2: Abertura, listagem e filtros
  - ✅ Subtarefa: Formulario e anexos (ticket-form.tsx, ticket_attachments)
  - ✅ Subtarefa: Filtros e busca (tickets-filters.tsx com maintenance_type)
- [x] Tarefa 1.7.3: Triagem e execucao
  - ✅ Subtarefa: Definir prioridade e responsavel (triageTicket action)
  - ✅ Subtarefa: Fluxo de status (statusTransitions: awaiting_triage → technical_analysis → executing → completed)
- [x] Tarefa 1.7.4: Aprovacao Operacoes
  - ✅ Subtarefa: Cadeia e validacoes (ticket_approvals, handleApproval)
  - ✅ Subtarefa: Negacao com justificativa (denial_reason, notes)

### Épico 1.8 — Chamados de RH (Uniformes e Gerais) ✅
**Contexto**: fluxo padrao de chamados e gestao de uniformes.

- [x] Tarefa 1.8.1: Abertura e listagem de RH
  - ✅ Subtarefa: Formulario com categoria (uniformes/geral) (rh-ticket-form.tsx, RH_TYPES, ticket_rh_details)
  - ✅ Subtarefa: Filtros e busca (rh-tickets-filters.tsx com status, prioridade, categoria, unidade)
- [x] Tarefa 1.8.2: Fluxo de execucao
  - ✅ Subtarefa: Triagem e prioridades (rh-triage-dialog.tsx, triageRHTicket action)
  - ✅ Subtarefa: Status padrao (awaiting_triage → in_progress → resolved, fluxo aprovacao multi-nivel)
- [x] Tarefa 1.8.3: Gestao de uniformes
  - ✅ Subtarefa: Controle de estoque (configuracoes/uniformes/page.tsx, tabela uniforms com current_stock/min_stock)
  - ✅ Subtarefa: Registro de retirada (uniform-delivery-dialog.tsx, deliverUniform action, uniform_transactions)
  - ✅ Subtarefa: Historico por usuario (TransactionsTable com filtro por tipo, rastreamento user_id/unit_id)

### Épico 1.9 — Admin (exclusoes e controle) ✅
**Contexto**: permissao elevada para limpeza e correcoes.

- [x] Tarefa 1.9.1: Excluir chamados (unitario e em massa)
  - ✅ Subtarefa: Validar permissao admin (checkAdminPermission verifica Administrador/Desenvolvedor)
  - ✅ Subtarefa: Confirmacao e auditoria (AlertDialog + RPC delete_ticket_cascade com p_deleted_by)
- [x] Tarefa 1.9.2: Excluir checklists (unitario e em massa)
  - ✅ Subtarefa: Validar dependencias (checkIsAdmin via RPC is_admin, deleteExecution/deleteExecutions)
  - ✅ Subtarefa: Registro no historico (revalidatePath, audit_logs disponivel)

## 3. Fase 2 — Entrega 2 (Sinistros, Comercial, Supervisao) ✅

### Épico 2.1 — Chamados de Sinistros ✅
**Contexto**: fluxo especifico e tabelas dedicadas.
**Status**: COMPLETO (verificado em 2026-01-18)

- [x] Tarefa 2.1.1: Listagem e filtros
  - [x] Subtarefa: Filtros por categoria e status (claims-filters.tsx com status, prioridade, categoria, unidade)
  - [x] Subtarefa: Busca e ordenacao (busca por placa, nome ou numero, claims-table.tsx)
- [x] Tarefa 2.1.2: Fluxo de execucao
  - [x] Subtarefa: Registro de ocorrencias e danos (ticket_claim_details com occurrence_type, vehicle_*, customer_*)
  - [x] Subtarefa: Comunicacoes com cliente (claim_communications, claim-communications.tsx)
- [x] Tarefa 2.1.3: Compras internas
  - [x] Subtarefa: Fornecedores credenciados (accredited_suppliers, claim-quotation-form.tsx)
  - [x] Subtarefa: Cotacoes e itens (claim_purchase_items, claim_purchase_quotations)
  - [x] Subtarefa: Aprovacoes internas (claim-purchases.tsx com handleApproval, approveClaimPurchase)

### Épico 2.2 — Chamados de Comercial ✅
**Contexto**: fluxo padrao de abertura/triagem/execucao.
**Status**: COMPLETO (verificado em 2026-01-18)

- [x] Tarefa 2.2.1: Abertura e listagem
  - [x] Subtarefa: Formulario padrao (comercial-form.tsx com campos de cliente, contrato, concorrente)
  - [x] Subtarefa: Filtros e busca (comercial-filters.tsx com status, prioridade, tipo comercial, unidade)
- [x] Tarefa 2.2.2: Triagem e execucao
  - [x] Subtarefa: Prioridade e responsavel (comercial-triage-dialog.tsx, triageComercialTicket action)
  - [x] Subtarefa: Mudanca de status (comercial-status-actions.tsx, updateComercialTicketStatus action)

### Épico 2.3 — Checklist de Supervisao ✅
**Contexto**: supervisores criam e executam checklists por unidade.
**Status**: COMPLETO (atualizado em 2026-01-18)

- [x] Tarefa 2.3.1: Modelagem e RLS
  - [x] Subtarefa: Templates e perguntas flexiveis (checklist_templates.type = 'supervision' suportado)
  - [x] Subtarefa: Permissao por cobertura ✅ IMPLEMENTADO (policy `checklist_executions_select_by_type` filtra por `is_coverage`)
- [x] Tarefa 2.3.2: Criacao/edicao de checklist
  - [x] Subtarefa: Builder com tipos diversos (template-form.tsx suporta type='supervision')
  - [x] Subtarefa: Validacoes por tipo
- [x] Tarefa 2.3.3: Execucao de supervisao ✅ IMPLEMENTADO (2026-01-18)
  - [x] Subtarefa: Fluxo com inicio/fim ✅ Rotas /checklists/supervisao/* criadas, actions.ts suporta type='supervision'
  - [x] Subtarefa: Assinatura do encarregado ✅ IMPLEMENTADO (signature-pad.tsx, SupervisionSummary, completeSupervisionExecution)
- [x] Tarefa 2.3.4: Relatorio de supervisao ✅ IMPLEMENTADO (2026-01-18)
  - [x] Subtarefa: Pontuacao e resumo ✅ SupervisionReport com score de conformidade, estatisticas e lista de nao-conformidades
  - [x] Subtarefa: Exportacao simples (PDF/print) ✅ API /api/checklists/[id]/pdf + ExportButtons + estilos de impressao

## 4. Fase 3 — Entrega 3 (Financeiro, Configuracoes, Relatorios) ⚠️

### Épico 3.1 — Chamados Financeiros ✅
**Contexto**: fluxo padrao com prioridade e triagem.
**Status**: COMPLETO (implementado em 2026-01-18) - Rota /chamados/financeiro funcional

- [x] Tarefa 3.1.1: Abertura e listagem
  - [x] Subtarefa: Formulario com categoria financeira ✅ financeiro-form.tsx com validacao Zod
  - [x] Subtarefa: Filtros e busca ✅ financeiro-filters.tsx com status, prioridade, categoria, unidade
- [x] Tarefa 3.1.2: Triagem e execucao
  - [x] Subtarefa: Definir prioridade e responsavel ✅ financeiro-triage-dialog.tsx
  - [x] Subtarefa: Mudanca de status ✅ financeiro-actions.tsx com transicoes validas

#### Critérios de Aceite - Épico 3.1

##### Tarefa 3.1.1: Abertura e Listagem

**Subtarefa: Formulário com categoria financeira**

**Critérios de Aceite:**
1. **Rota e Navegação**
   - [x] Existe rota `/chamados/financeiro` acessível via menu lateral
   - [x] Existe rota `/chamados/financeiro/novo` para criação de chamado
   - [x] Menu lateral exibe "Financeiro" quando usuário tem permissão `tickets:read` para departamento Financeiro
   - [x] Botão "Novo Chamado" redireciona para `/chamados/financeiro/novo`

2. **Formulário de Abertura**
   - [x] Formulário exibe todos os campos obrigatórios:
     - Título (texto, obrigatório, mínimo 5 caracteres)
     - Categoria (select, obrigatório, carrega categorias do departamento Financeiro)
     - Unidade(s) (select, opcional, carrega unidades do usuário conforme RBAC)
     - Descrição/Justificativa (textarea, obrigatório, mínimo 10 caracteres)
     - Valor Estimado (input numérico, opcional)
   - [x] Categorias disponíveis são as definidas no seed:
     - Pagamento a Fornecedor
     - Reembolso
     - Nota Fiscal
     - Cobrança
     - Conciliação
     - Relatório Financeiro
     - Outros
   - [x] Validação client-side e server-side funcionam corretamente
   - [x] Mensagens de erro são claras e específicas
   - [x] Após submissão bem-sucedida, redireciona para `/chamados/financeiro/[ticketId]`

3. **Criação do Chamado**
   - [x] Chamado é criado com status `awaiting_triage` ou `awaiting_approval_*` (se valor alto)
   - [x] Número do chamado é gerado automaticamente (formato: FIN-XXXX)
   - [x] Departamento destinatário é automaticamente "Financeiro"
   - [x] Autor do chamado é o usuário logado
   - [x] Histórico inicial é registrado em `ticket_history`
   - [x] RLS (Row Level Security) aplica corretamente as políticas de visibilidade

4. **Aprovações (quando aplicável)**
   - [x] Se chamado tiver valor >= R$ 10.000, segue fluxo de aprovação (Encarregado → Supervisor → Gerente)
   - [x] Se não houver aprovação necessária, vai direto para `awaiting_triage`

**Subtarefa: Filtros e Busca**

**Critérios de Aceite:**
1. **Listagem de Chamados**
   - [x] Página `/chamados/financeiro` exibe lista de chamados do departamento Financeiro
   - [x] Lista mostra informações essenciais: número, título, status, prioridade, unidade, responsável, data de criação
   - [x] Ordenação padrão é por data de criação (mais recente primeiro)
   - [x] Paginação funciona corretamente (10 itens por página)
   - [x] Contador total de chamados é exibido

2. **Filtros Disponíveis**
   - [x] Filtro por Status (dropdown): Todos, Aguardando Triagem, Priorizado, Em Andamento, Resolvido, Fechado, Negado, Cancelado
   - [x] Filtro por Prioridade (dropdown): Todas, Baixa, Média, Alta, Urgente
   - [x] Filtro por Categoria (dropdown): Todas + categorias ativas do Financeiro
   - [x] Filtro por Unidade (dropdown): Todas + unidades visíveis ao usuário (conforme RBAC)
   - [x] Botão "Limpar Filtros" reseta todos os filtros

3. **Busca**
   - [x] Campo de busca permite pesquisar por:
     - Número do chamado (ex: "FIN-123" ou "123")
     - Título do chamado (busca parcial, case-insensitive)
   - [x] Busca funciona em conjunto com os filtros
   - [x] Resultados são atualizados ao aplicar filtros/busca
   - [x] Mensagem "Nenhum chamado encontrado" quando não há resultados

4. **Estatísticas**
   - [x] Cards de estatísticas exibem:
     - Total de chamados abertos
     - Chamados aguardando triagem
     - Chamados em andamento
     - Chamados resolvidos (últimos 30 dias)
   - [x] Estatísticas são calculadas conforme visibilidade do usuário (RBAC)

5. **Permissões e Visibilidade**
   - [x] Usuários veem apenas chamados conforme regras RBAC (via RLS existente)
   - [x] RLS aplica corretamente as políticas de visibilidade

##### Tarefa 3.1.2: Triagem e Execução

**Subtarefa: Definir Prioridade e Responsável**

**Critérios de Aceite:**
1. **Permissões de Triagem**
   - [x] Apenas Gerentes e Supervisores do departamento Financeiro podem triar chamados
   - [x] Usuários sem permissão não veem botão/opção de triagem
   - [x] Verificação server-side bloqueia tentativas não autorizadas

2. **Dialog/Modal de Triagem**
   - [x] Dialog de triagem é exibido ao clicar em "Triar Chamado"
   - [x] Campos do formulário de triagem:
     - Prioridade (select obrigatório): Baixa, Média, Alta, Urgente
     - Responsável (select opcional): lista membros do departamento Financeiro
     - Previsão de Conclusão (date picker, opcional)
   - [x] Validação impede submissão sem prioridade

3. **Processo de Triagem**
   - [x] Ao triar, status muda de `awaiting_triage` para `prioritized`
   - [x] Prioridade oficial é definida
   - [x] Responsável é atribuído ao chamado (se selecionado)
   - [x] Previsão de conclusão é salva (se informada)
   - [x] Histórico registra ação de triagem em `ticket_history`
   - [x] Após triagem, chamado sai da lista "Aguardando Triagem"

4. **Negação na Triagem**
   - [x] Opção de negar chamado via botões de status
   - [x] Justificativa é obrigatória ao negar (deny reason dialog)
   - [x] Status muda para `denied`

**Subtarefa: Mudança de Status**

**Critérios de Aceite:**
1. **Transições de Status Permitidas**
   - [x] Transições seguem o fluxo definido em constants.ts:
     - `awaiting_approval_*` → fluxo de aprovação multi-nível
     - `awaiting_triage` → `prioritized`, `in_progress`, `denied`
     - `prioritized` → `in_progress`, `denied`, `cancelled`
     - `in_progress` → `resolved`, `denied`, `cancelled`
     - `resolved` → `closed`
     - `closed` → (sem transições)
     - `cancelled` → (sem transições)
   - [x] Apenas transições válidas são permitidas (validação client e server-side)

2. **Permissões para Mudança de Status**
   - [x] Responsável pelo chamado pode alterar status
   - [x] Gerentes/Admins podem alterar status de qualquer chamado
   - [x] Autor pode cancelar chamado via botão

3. **Interface de Mudança de Status**
   - [x] Botões de ações de status são exibidos conforme estado atual
   - [x] Apenas transições permitidas são mostradas
   - [x] Confirmação via dialog para ações críticas (negar, cancelar)
   - [x] Campo de justificativa é obrigatório para negação e cancelamento

4. **Registro de Histórico**
   - [x] Toda mudança de status é registrada em `ticket_history`
   - [x] Histórico inclui: usuário, data/hora, ação, status anterior, novo status
   - [x] Histórico é visível na página de detalhes do chamado (Timeline)

5. **Comentários**
   - [x] Usuários podem adicionar comentários em qualquer momento
   - [x] Comentários são exibidos em lista cronológica

6. **Detalhes do Chamado**
   - [x] Página `/chamados/financeiro/[ticketId]` exibe:
     - Informações completas do chamado (FinanceiroInfo)
     - Status atual com badge colorido (FinanceiroHeader)
     - Prioridade oficial
     - Responsável atribuído
     - Histórico de mudanças (FinanceiroTimeline)
     - Comentários (FinanceiroComments)
     - Ações disponíveis (FinanceiroActions, FinanceiroTriageDialog)
     - Fluxo de Aprovação quando aplicável (FinanceiroApprovals)
   - [x] Layout é responsivo e segue design system

7. **Validações e Regras de Negócio**
   - [x] Chamado não pode ser fechado sem estar resolvido (validação de transição)
   - [x] Transições de status são validadas server-side

### Épico 3.2 — Configuracoes do sistema ✅
**Contexto**: parametros gerais e cadastros base.
**Status**: COMPLETO (verificado em 2026-01-18)

- [x] Tarefa 3.2.1: Configurar departamentos e cargos
  - [x] Subtarefa: CRUD de departamentos (configuracoes/departamentos/actions.ts: createDepartment, updateDepartment, deleteDepartment)
  - [x] Subtarefa: CRUD de cargos e permissoes (createRole, updateRole, deleteRole + configuracoes/permissoes com matriz visual)
- [x] Tarefa 3.2.2: Configurar templates de checklist
  - [x] Subtarefa: Centralizar templates globais (redirect para /checklists/configurar)
  - [x] Subtarefa: Duplicar para unidades (unit_checklist_templates existente)
- [x] Tarefa 3.2.3: Preferencias gerais
  - [x] Subtarefa: Parametros basicos (configuracoes/sistema: company_name, timezone, upload_max_size_mb)
  - [x] Subtarefa: Config de notificacoes (NotificationSettingsForm: notifications_email_enabled, notifications_push_enabled)

### Épico 3.3 — Dashboard e Relatorios ✅
**Contexto**: visibilidade gerencial pos-MVP.
**Status**: COMPLETO (verificado em 2026-01-18)

- [x] Tarefa 3.3.1: Dashboard gerencial
  - [x] Subtarefa: Chamados abertos e por prioridade (dashboard/page.tsx: openTicketsCount, recentTickets)
  - [x] Subtarefa: Tempo medio de resolucao (resolutionRate calculado nos ultimos 30 dias)
  - [x] Subtarefa: Conformidade de checklists (checklistsTodayCount/totalExpectedChecklists, pendingChecklists)
- [x] Tarefa 3.3.2: Relatorios de chamados
  - [x] Subtarefa: Filtros por periodo/status (relatorios/chamados/page.tsx com filtros de data, status, prioridade, departamento, unidade)
  - [x] Subtarefa: Exportacao PDF/Excel (api/relatorios/chamados/pdf e excel com @react-pdf/renderer e exceljs)
- [x] Tarefa 3.3.3: Relatorios de supervisao
  - [x] Subtarefa: Listagem por unidade (relatorios/supervisao/page.tsx com filtros de unidade, supervisor, score, NC)
  - [x] Subtarefa: Exportacao simples (api/relatorios/supervisao/pdf e excel com estatisticas e distribuicao)

#### Critérios de Aceite - Épico 3.3

##### Tarefa 3.3.1: Dashboard Gerencial ✅

**Status**: COMPLETO (verificado em 2026-01-18)

**Subtarefa: Chamados abertos e por prioridade**

**Critérios de Aceite:**
1. **Métricas de Chamados**
   - [x] Dashboard exibe contador de chamados abertos (excluindo resolved, closed, cancelled)
   - [x] Lista de chamados recentes é exibida (últimos 5-10)
   - [x] Chamados recentes mostram: número, título, departamento, status formatado
   - [x] Dados são filtrados conforme visibilidade do usuário (RLS)

**Subtarefa: Tempo médio de resolução**

**Critérios de Aceite:**
1. **Cálculo de Taxa de Resolução**
   - [x] Taxa é calculada para os últimos 30 dias
   - [x] Fórmula: (chamados resolvidos + fechados) / total de chamados no período * 100
   - [x] Taxa é exibida em formato percentual (ex: "75%")
   - [x] Dados consideram apenas chamados visíveis ao usuário (RLS)

**Subtarefa: Conformidade de checklists**

**Critérios de Aceite:**
1. **Métricas de Checklists**
   - [x] Dashboard exibe contador de checklists executados hoje
   - [x] Dashboard exibe total de checklists esperados (unit_checklist_templates)
   - [x] Progresso é calculado: (executados / esperados) * 100
   - [x] Lista de checklists pendentes é exibida (até 5 unidades)
   - [x] Lista pendente mostra: nome da unidade, tipo (Abertura/Supervisão), status "Pendente"

##### Tarefa 3.3.2: Relatórios de Chamados ✅

**Status**: COMPLETO (verificado em 2026-01-18)

**Subtarefa: Filtros por período/status**

**Critérios de Aceite:**
1. **Rota e Navegação**
   - [x] Existe rota `/relatorios/chamados` acessível via menu lateral
   - [x] Menu lateral exibe "Relatórios" quando usuário tem permissão de visualização de relatórios
   - [x] Submenu "Relatórios de Chamados" redireciona para `/relatorios/chamados`

2. **Filtros Disponíveis**
   - [ ] Filtro por Período (date range):
     - Data inicial (date picker, obrigatório)
     - Data final (date picker, obrigatório)
     - Validação: data final >= data inicial
     - Opções rápidas: Hoje, Últimos 7 dias, Últimos 30 dias, Últimos 90 dias, Mês atual, Mês anterior
   - [ ] Filtro por Status (multi-select):
     - Todos os status disponíveis: awaiting_triage, prioritized, in_progress, resolved, closed, denied, cancelled
     - Permite seleção múltipla
     - Opção "Todos" seleciona todos os status
   - [ ] Filtro por Departamento (multi-select):
     - Lista todos os departamentos: Compras, Manutenção, RH, Sinistros, Comercial, Financeiro, TI
     - Permite seleção múltipla
     - Opção "Todos" seleciona todos os departamentos
   - [ ] Filtro por Prioridade (multi-select):
     - Baixa, Média, Alta, Urgente
     - Permite seleção múltipla
     - Opção "Todas" seleciona todas as prioridades
   - [ ] Filtro por Unidade (multi-select):
     - Lista unidades visíveis ao usuário (conforme RBAC)
     - Permite seleção múltipla
     - Opção "Todas" seleciona todas as unidades
   - [ ] Botão "Limpar Filtros" reseta todos os filtros para valores padrão
   - [ ] Botão "Aplicar Filtros" atualiza a listagem

3. **Listagem de Resultados**
   - [ ] Tabela exibe colunas:
     - Número do chamado (formato: DEP-XXXX)
     - Título
     - Departamento
     - Status (com badge colorido)
     - Prioridade (com badge colorido)
     - Unidade(s)
     - Responsável
     - Data de criação
     - Data de resolução (se aplicável)
     - Tempo de resolução (em dias/horas, se resolvido)
   - [ ] Ordenação:
     - Padrão: data de criação (mais recente primeiro)
     - Permite ordenar por qualquer coluna (clicando no header)
     - Indicação visual da coluna e direção de ordenação
   - [ ] Paginação:
     - 50 itens por página (padrão)
     - Opções: 25, 50, 100 itens por página
     - Navegação: primeira, anterior, próxima, última
     - Contador: "Mostrando X de Y resultados"
   - [ ] Mensagem "Nenhum chamado encontrado" quando não há resultados

4. **Estatísticas do Relatório**
   - [ ] Cards de resumo exibem:
     - Total de chamados no período
     - Chamados por status (distribuição)
     - Chamados por prioridade (distribuição)
     - Chamados por departamento (distribuição)
     - Tempo médio de resolução (em dias)
     - Taxa de resolução (%)
   - [ ] Estatísticas são calculadas com base nos filtros aplicados
   - [ ] Estatísticas são atualizadas ao aplicar/remover filtros

5. **Permissões e Visibilidade**
   - [ ] Usuários veem apenas chamados conforme regras RBAC (via RLS existente)
   - [ ] RLS aplica corretamente as políticas de visibilidade por unidade/departamento
   - [ ] Apenas usuários com permissão `reports:read` ou equivalente podem acessar relatórios

**Subtarefa: Exportação PDF/Excel**

**Critérios de Aceite:**
1. **Botões de Exportação**
   - [ ] Botão "Exportar PDF" está visível na página de relatórios
   - [ ] Botão "Exportar Excel" está visível na página de relatórios
   - [ ] Botões são desabilitados quando não há resultados
   - [ ] Indicador de carregamento durante geração do arquivo

2. **Exportação PDF**
   - [ ] PDF contém todas as informações da listagem filtrada
   - [ ] PDF inclui cabeçalho com:
     - Logo da empresa (se disponível)
     - Título: "Relatório de Chamados"
     - Período do relatório (data inicial - data final)
     - Filtros aplicados (status, departamento, prioridade, unidade)
     - Data/hora de geração
   - [ ] PDF inclui tabela com todas as colunas da listagem
   - [ ] PDF inclui rodapé com:
     - Total de chamados
     - Página X de Y
   - [ ] Layout do PDF é profissional e legível
   - [ ] PDF é gerado server-side (API route)
   - [ ] Nome do arquivo: `relatorio-chamados-YYYY-MM-DD.pdf`

3. **Exportação Excel**
   - [ ] Arquivo Excel (.xlsx) contém todas as informações da listagem filtrada
   - [ ] Planilha inclui cabeçalho com informações do relatório (mesmas do PDF)
   - [ ] Planilha inclui tabela com todas as colunas da listagem
   - [ ] Colunas são formatadas adequadamente:
     - Datas no formato brasileiro (DD/MM/YYYY)
     - Números com formatação numérica
     - Textos alinhados à esquerda
   - [ ] Planilha inclui aba de "Resumo" com estatísticas:
     - Total de chamados
     - Distribuição por status
     - Distribuição por prioridade
     - Distribuição por departamento
     - Tempo médio de resolução
   - [ ] Excel é gerado server-side (API route)
   - [ ] Nome do arquivo: `relatorio-chamados-YYYY-MM-DD.xlsx`

4. **Performance e Limites**
   - [ ] Exportação funciona corretamente com até 10.000 registros
   - [ ] Mensagem de aviso se resultado exceder limite recomendado (ex: "Exportando muitos registros, pode levar alguns minutos")
   - [ ] Timeout adequado para geração de arquivos grandes
   - [ ] Tratamento de erro: mensagem clara se exportação falhar

##### Tarefa 3.3.3: Relatórios de Supervisão ✅

**Status**: COMPLETO (verificado em 2026-01-18)

**Subtarefa: Listagem por unidade**

**Critérios de Aceite:**
1. **Rota e Navegação**
   - [x] Existe rota `/relatorios/supervisao` acessível via menu lateral
   - [x] Submenu "Relatórios de Supervisão" redireciona para `/relatorios/supervisao`
   - [x] Acesso restrito a usuários com permissão de visualização de relatórios de supervisão

2. **Filtros Disponíveis**
   - [ ] Filtro por Unidade (select):
     - Lista unidades visíveis ao usuário (conforme RBAC)
     - Para Supervisores: apenas unidades com `is_coverage = true`
     - Para Gerentes/Admins: todas as unidades
     - Opção "Todas" para ver todas as unidades
   - [ ] Filtro por Período (date range):
     - Data inicial (date picker, obrigatório)
     - Data final (date picker, obrigatório)
     - Validação: data final >= data inicial
     - Opções rápidas: Hoje, Últimos 7 dias, Últimos 30 dias, Mês atual, Mês anterior
   - [ ] Filtro por Status (multi-select):
     - Em Andamento, Concluído
     - Permite seleção múltipla
     - Opção "Todos" seleciona todos os status
   - [ ] Filtro por Score de Conformidade (range slider ou inputs):
     - Mínimo: 0%
     - Máximo: 100%
     - Permite filtrar por faixa de score (ex: apenas supervisões com score >= 80%)
   - [ ] Filtro por Não-Conformidades (checkbox):
     - Opção "Apenas com não-conformidades" filtra supervisões que tiveram respostas "Não"
   - [ ] Botão "Limpar Filtros" reseta todos os filtros
   - [ ] Botão "Aplicar Filtros" atualiza a listagem

3. **Listagem de Execuções**
   - [ ] Tabela exibe colunas:
     - Data/Hora de execução
     - Unidade (nome e código)
     - Template (nome do checklist)
     - Supervisor (nome do executante)
     - Score de Conformidade (% com badge colorido)
     - Total de Perguntas
     - Conformidades (número de "Sim")
     - Não-Conformidades (número de "Não")
     - Status (Em Andamento / Concluído)
     - Duração (tempo de execução, se concluído)
     - Ações (visualizar, exportar)
   - [ ] Ordenação:
     - Padrão: data/hora de execução (mais recente primeiro)
     - Permite ordenar por: unidade, score, data, supervisor
     - Indicação visual da coluna e direção de ordenação
   - [ ] Paginação:
     - 20 itens por página (padrão)
     - Opções: 10, 20, 50 itens por página
     - Navegação: primeira, anterior, próxima, última
     - Contador: "Mostrando X de Y resultados"
   - [ ] Mensagem "Nenhuma supervisão encontrada" quando não há resultados

4. **Visualização de Detalhes**
   - [ ] Ao clicar em uma execução, exibe modal ou redireciona para página de detalhes
   - [ ] Detalhes incluem:
     - Informações completas da execução
     - Score de conformidade
     - Lista de todas as perguntas e respostas
     - Lista de não-conformidades com observações
     - Assinaturas (supervisor e encarregado, se disponíveis)
     - Fotos anexadas (se houver)
   - [ ] Botão "Ver Relatório Completo" redireciona para `/checklists/[executionId]`

5. **Estatísticas do Relatório**
   - [ ] Cards de resumo exibem:
     - Total de supervisões no período
     - Supervisões por unidade (distribuição)
     - Score médio de conformidade (%)
     - Total de não-conformidades
     - Unidades com maior número de não-conformidades (top 5)
     - Taxa de conclusão (supervisões concluídas / iniciadas)
   - [ ] Estatísticas são calculadas com base nos filtros aplicados
   - [ ] Gráfico de distribuição de scores (histograma ou barras)
   - [ ] Gráfico de supervisões por unidade (barras ou pizza)

6. **Permissões e Visibilidade**
   - [ ] Supervisores veem apenas supervisões das unidades sob sua cobertura (`is_coverage = true`)
   - [ ] Gerentes/Admins veem todas as supervisões
   - [ ] RLS aplica corretamente as políticas de visibilidade
   - [ ] Apenas usuários com permissão adequada podem acessar relatórios de supervisão

**Subtarefa: Exportação simples**

**Critérios de Aceite:**
1. **Botões de Exportação**
   - [ ] Botão "Exportar PDF" está visível na página de relatórios de supervisão
   - [ ] Botão "Exportar Excel" está visível na página de relatórios de supervisão
   - [ ] Botões são desabilitados quando não há resultados
   - [ ] Indicador de carregamento durante geração do arquivo
   - [ ] Opção de exportar relatório consolidado (todas as supervisões filtradas) ou individual

2. **Exportação PDF - Relatório Consolidado**
   - [ ] PDF contém resumo executivo com:
     - Período do relatório
     - Filtros aplicados
     - Estatísticas gerais (total, score médio, não-conformidades)
   - [ ] PDF inclui lista de todas as supervisões filtradas com:
     - Data/hora, unidade, supervisor, score, status
   - [ ] PDF inclui seção de não-conformidades agrupadas por unidade
   - [ ] PDF inclui gráficos de distribuição (se aplicável)
   - [ ] Layout do PDF é profissional e legível
   - [ ] PDF é gerado server-side (API route)
   - [ ] Nome do arquivo: `relatorio-supervisao-YYYY-MM-DD.pdf` ou `relatorio-supervisao-[unidade]-YYYY-MM-DD.pdf`

3. **Exportação PDF - Relatório Individual**
   - [ ] Reutiliza funcionalidade existente de exportação PDF de supervisão individual
   - [ ] Botão "Exportar PDF" em cada linha da tabela gera PDF da supervisão específica
   - [ ] PDF individual segue mesmo formato do relatório de supervisão existente (`/api/checklists/[executionId]/pdf`)

4. **Exportação Excel**
   - [ ] Arquivo Excel (.xlsx) contém planilha "Resumo" com:
     - Informações do período e filtros
     - Estatísticas gerais
   - [ ] Planilha "Supervisões" com todas as execuções filtradas:
     - Todas as colunas da listagem
     - Formatação adequada (datas, percentuais)
   - [ ] Planilha "Não-Conformidades" com:
     - Unidade, data, pergunta, observação
     - Agrupadas por unidade
   - [ ] Planilha "Estatísticas por Unidade" com:
     - Unidade, total de supervisões, score médio, total de não-conformidades
   - [ ] Excel é gerado server-side (API route)
   - [ ] Nome do arquivo: `relatorio-supervisao-YYYY-MM-DD.xlsx`

5. **Performance e Limites**
   - [ ] Exportação funciona corretamente com até 1.000 supervisões
   - [ ] Mensagem de aviso se resultado exceder limite recomendado
   - [ ] Timeout adequado para geração de arquivos grandes
   - [ ] Tratamento de erro: mensagem clara se exportação falhar

## 5. Fase 4 — Entrega 4 (Mobile) ⚠️

### Épico 4.1 — Setup Mobile (Expo) ✅
**Contexto**: base do app para operacoes em campo.
**Status**: COMPLETO (verificado em 2026-01-18)

- [x] Tarefa 4.1.1: Configuracao inicial
  - [x] Subtarefa: Estrutura de pastas e navigation (src/modules, src/navigation, src/components, src/theme, src/lib)
  - [x] Subtarefa: Configurar tema e componentes base (colors.ts, typography.ts, spacing.ts + Button, Card, Badge, Input, etc)
- [x] Tarefa 4.1.2: Autenticacao mobile
  - [x] Subtarefa: Login e sessao (LoginScreen.tsx, AuthContext.tsx, authService.ts com Supabase)
  - [x] Subtarefa: Persistencia e refresh (AsyncStorage, onAuthStateChange listener, TOKEN_REFRESHED handler)

### Épico 4.2 — Fluxo de Chamados (Mobile) ✅
**Contexto**: listar, criar e acompanhar chamados em campo.
**Status**: COMPLETO (implementado em 2026-01-18)

- [x] Tarefa 4.2.1: Listagem de chamados
  - [x] Subtarefa: Filtros basicos ✅ TicketsListScreen.tsx com integracao Supabase, paginacao, pull-to-refresh
  - [x] Subtarefa: Detalhe do chamado ✅ TicketDetailsScreen.tsx com tabs (Detalhes, Comentarios, Historico), anexos, timeline
- [x] Tarefa 4.2.2: Criacao de chamado
  - [x] Subtarefa: Formulario padrao ✅ NewTicketScreen.tsx com TicketForm, categorias, unidades, validacao
  - [x] Subtarefa: Anexos via camera ✅ PhotoPicker com expo-image-picker, upload para Supabase Storage

### Épico 4.3 — Checklists Mobile ✅
**Contexto**: execucao de abertura e supervisao no campo.
**Status**: COMPLETO (verificado em 2026-01-18)

- [x] Tarefa 4.3.1: Checklist de abertura
  - [x] Subtarefa: Fluxo Sim/Nao (ChecklistExecutionScreen.tsx com QuestionCard, validacao, observacoes obrigatorias)
  - [x] Subtarefa: Upload de fotos (PhotoPicker.tsx com camera e galeria via expo-image-picker)
- [x] Tarefa 4.3.2: Checklist de supervisao
  - [x] Subtarefa: Tipos variados de perguntas (ChecklistsListScreen permite iniciar abertura ou supervisao)
  - [x] Subtarefa: Assinatura do encarregado ✅ IMPLEMENTADO (SignaturePad.tsx, SupervisionSummary.tsx, completeSupervisionExecution)

### Épico 4.4 — Notificacoes e Publicacao ⚠️
**Contexto**: preparar push e publicar apps.
**Status**: NAO IMPLEMENTADO (verificado em 2026-01-18)

- [ ] Tarefa 4.4.1: Push notifications (FCM)
  - [ ] Subtarefa: Configurar projeto Firebase ⚠️ NAO EXISTE google-services.json ou expo-notifications
  - [ ] Subtarefa: Integrar no app ⚠️ NotificationsScreen.tsx apenas mockada com dados estaticos
- [ ] Tarefa 4.4.2: Publicacao
  - [ ] Subtarefa: Build iOS e Android ⚠️ NAO EXISTE eas.json
  - [ ] Subtarefa: Publicar nas lojas ⚠️ NAO INICIADO

#### Critérios de Aceite — Épico 4.4

##### Tarefa 4.4.1: Push notifications (FCM)

**Subtarefa: Configurar projeto Firebase**

✅ **Critérios de Aceite:**
1. **Projeto Firebase criado e configurado:**
   - Projeto Firebase criado no console (https://console.firebase.google.com)
   - Aplicativos iOS e Android registrados no projeto Firebase
   - Bundle ID iOS: `com.garageinn.gapp` (conforme `app.json`)
   - Package Name Android: `com.garageinn.gapp` (conforme `app.json`)

2. **Arquivos de configuração presentes:**
   - `apps/mobile/google-services.json` (Android) existe e está configurado corretamente
   - `apps/mobile/GoogleService-Info.plist` (iOS) existe e está configurado corretamente
   - Arquivos adicionados ao `.gitignore` ou versionados com dados não sensíveis (conforme política do projeto)

3. **Dependências instaladas:**
   - `expo-notifications` instalado e configurado no `package.json`
   - Versão compatível com Expo SDK 54
   - Plugin `expo-notifications` adicionado ao `app.json` na seção `plugins`

4. **Configuração no app.json:**
   - Seção `expo.notifications` configurada com ícone e cores apropriadas
   - Configuração de Android e iOS presente

5. **Permissões configuradas:**
   - Permissões de notificação declaradas no `app.json` para Android (`android.permissions`)
   - Info.plist iOS configurado com permissões de notificação (via `app.json` → `ios.infoPlist`)

6. **Validação técnica:**
   - `npx expo-doctor` não reporta erros relacionados a notificações
   - Build de desenvolvimento executa sem erros relacionados ao Firebase/FCM

---

**Subtarefa: Integrar no app**

✅ **Critérios de Aceite:**
1. **Serviço de notificações implementado:**
   - Módulo `apps/mobile/src/lib/notifications/` criado com:
     - Função para solicitar permissões de notificação
     - Função para registrar token FCM no Supabase (tabela `user_push_tokens` ou similar)
     - Função para inicializar listener de notificações
     - Handler para notificações recebidas em foreground
     - Handler para notificações recebidas em background
     - Handler para cliques em notificações (deep linking)

2. **Integração com Supabase:**
   - Tabela `user_push_tokens` criada no Supabase com campos:
     - `id` (uuid, primary key)
     - `user_id` (uuid, foreign key para `auth.users`)
     - `token` (text, unique)
     - `platform` (text: 'ios' | 'android')
     - `device_id` (text, opcional)
     - `created_at` (timestamp)
     - `updated_at` (timestamp)
   - RLS configurado: usuário só pode gerenciar seus próprios tokens
   - Função server-side para enviar notificações via FCM (Edge Function ou Server Action)

3. **NotificationsScreen funcional:**
   - Tela `NotificationsScreen.tsx` atualizada para exibir notificações reais do Supabase
   - Lista de notificações ordenada por data (mais recentes primeiro)
   - Estados de loading, empty e error implementados
   - Pull-to-refresh funcional
   - Marcação de notificações como lidas ao visualizar
   - Badge de contador de não lidas no ícone de notificações (tab bar)

4. **Fluxo completo de notificações:**
   - Ao abrir o app, solicita permissão de notificação (primeira vez)
   - Ao receber token FCM, registra automaticamente no Supabase
   - Notificações recebidas são exibidas no sistema operacional
   - Ao clicar em notificação, navega para tela apropriada (deep linking)
   - Notificações em foreground são exibidas via componente nativo ou custom

5. **Eventos que disparam notificações (MVP):**
   - Novo chamado atribuído ao usuário
   - Mudança de status em chamado do usuário
   - Novo comentário em chamado do usuário
   - Checklist pendente (abertura diária)
   - Aprovação/negação de chamado (quando aplicável)

6. **Configurações de notificação:**
   - Tela de configurações permite ativar/desativar notificações por tipo
   - Preferências salvas no Supabase (tabela `user_notification_preferences`)
   - Respeita preferências do usuário ao enviar notificações

7. **Validação técnica:**
   - Notificações funcionam em iOS (simulador e dispositivo físico)
   - Notificações funcionam em Android (emulador e dispositivo físico)
   - Deep linking funciona corretamente
   - Token é atualizado quando necessário (refresh automático)
   - Não há memory leaks nos listeners de notificações

8. **Tratamento de erros:**
   - Erro ao solicitar permissão exibe mensagem amigável
   - Erro ao registrar token é logado mas não quebra o app
   - Notificações falhadas são logadas para debugging

---

##### Tarefa 4.4.2: Publicação

**Subtarefa: Build iOS e Android**

✅ **Critérios de Aceite:**
1. **EAS Build configurado:**
   - Arquivo `apps/mobile/eas.json` criado na raiz do projeto mobile
   - Configurações de build para `development`, `preview` e `production`
   - Perfis de build definidos com:
     - `development`: para testes internos
     - `preview`: para testes com testers externos
     - `production`: para publicação nas lojas

2. **Configuração iOS:**
   - Apple Developer Account configurada
   - App ID criado no Apple Developer Portal: `com.garageinn.gapp`
   - Certificados de desenvolvimento e distribuição configurados
   - Provisioning profiles criados
   - `app.json` contém:
     - `ios.bundleIdentifier`: `com.garageinn.gapp`
     - `ios.buildNumber`: incrementado para cada build
     - `ios.supportsTablet`: `true` (conforme PRD)
   - Build iOS executado com sucesso via `eas build --platform ios --profile production`

3. **Configuração Android:**
   - Google Play Console configurado
   - App criado no Google Play Console
   - Keystore gerado e armazenado de forma segura (EAS Secrets ou similar)
   - `app.json` contém:
     - `android.package`: `com.garageinn.gapp`
     - `android.versionCode`: incrementado para cada build
     - `android.adaptiveIcon` configurado
   - Build Android executado com sucesso via `eas build --platform android --profile production`

4. **Assets e metadados:**
   - Ícone do app (`assets/icon.png`) presente e no formato correto (1024x1024)
   - Splash screen configurada (`assets/splash-icon.png`)
   - Adaptive icon Android configurado (`assets/adaptive-icon.png`)
   - Todas as imagens seguem as especificações do Design System (cor primária: `hsl(0, 95%, 60%)`)

5. **Validação de builds:**
   - Build de desenvolvimento instala e executa corretamente
   - Build de preview pode ser instalado via link de download
   - Build de produção está pronto para submissão nas lojas
   - Versão do app incrementada corretamente (`app.json` → `version`)
   - Changelog preparado para a versão

6. **Testes em dispositivos:**
   - Build iOS testado em dispositivo físico iOS
   - Build Android testado em dispositivo físico Android
   - Funcionalidades críticas validadas:
     - Autenticação
     - Navegação
     - Chamados
     - Checklists
     - Notificações (se implementadas)

---

**Subtarefa: Publicar nas lojas**

✅ **Critérios de Aceite:**
1. **Publicação iOS (App Store):**
   - App submetido para revisão na App Store Connect
   - Informações da App Store preenchidas:
     - Nome: "Gapp" (ou conforme definição do produto)
     - Subtítulo (se aplicável)
     - Descrição completa em português
     - Palavras-chave (keywords)
     - Categoria: Business ou Productivity
     - Classificação etária configurada
     - Screenshots para iPhone (vários tamanhos)
     - Screenshots para iPad (se `supportsTablet: true`)
     - Ícone do app (1024x1024)
     - Política de privacidade (URL)
   - Preço configurado (gratuito ou pago)
   - Informações de suporte (URL, email)
   - App aprovado e publicado na App Store
   - Link de download funcional: `https://apps.apple.com/app/id{APP_ID}`

2. **Publicação Android (Google Play Store):**
   - App submetido para revisão no Google Play Console
   - Informações da Play Store preenchidas:
     - Nome: "Gapp" (ou conforme definição do produto)
     - Descrição curta (80 caracteres)
     - Descrição completa em português
     - Screenshots para telefones (mínimo 2)
     - Screenshots para tablets (se suportado)
     - Ícone do app (512x512)
     - Feature graphic (1024x500)
     - Política de privacidade (URL)
     - Classificação de conteúdo
     - Categoria: Business ou Productivity
   - Preço configurado (gratuito ou pago)
   - Informações de contato do desenvolvedor
   - App aprovado e publicado na Google Play Store
   - Link de download funcional: `https://play.google.com/store/apps/details?id=com.garageinn.gapp`

3. **Documentação de publicação:**
   - Processo de publicação documentado (README ou documentação interna)
   - Checklist de publicação criado para futuras versões
   - Credenciais e acessos documentados de forma segura
   - Versionamento e changelog documentados

4. **Pós-publicação:**
   - App disponível para download nas lojas
   - Usuários podem instalar e usar o app
   - Monitoramento de crashes configurado (Sentry já integrado)
   - Analytics básico configurado (se aplicável)
   - Feedback inicial coletado e documentado

5. **Validação final:**
   - App instalado via App Store funciona corretamente
   - App instalado via Play Store funciona corretamente
   - Autenticação funciona em produção
   - Integração com Supabase funciona em produção
   - Notificações funcionam em produção (se implementadas)
   - Performance aceitável em dispositivos reais

---

**Critérios de Aceite Gerais do Épico:**

1. **Documentação:**
   - README do mobile atualizado com instruções de build e publicação
   - Guia de configuração do Firebase documentado
   - Processo de atualização de versão documentado

2. **Segurança:**
   - Credenciais do Firebase não expostas no código
   - Keystore Android protegido (EAS Secrets)
   - Certificados iOS protegidos (EAS Secrets)

3. **Conformidade:**
   - App segue políticas das lojas (App Store Guidelines e Google Play Policies)
   - Política de privacidade publicada e acessível
   - Termos de uso publicados (se aplicável)
   - LGPD compliance (conforme PRD seção 8.3)

4. **Qualidade:**
   - App não apresenta crashes críticos em produção
   - Performance aceitável (tempo de abertura < 3s)
   - Acessibilidade básica implementada
   - Design System aplicado consistentemente

## 6. Fase 5 — Pos‑Entrega (Continuo)

### Épico 5.1 — Performance e Otimizacao
**Contexto**: melhorar tempo de resposta e custo de consultas.

- [ ] Tarefa 5.1.1: Otimizar queries e indexes
  - [ ] Subtarefa: Revisar queries criticas
  - [ ] Subtarefa: Criar indexes necessarios
- [ ] Tarefa 5.1.2: Cache de dados frequentes
  - [ ] Subtarefa: Cache no client
  - [ ] Subtarefa: Estrategia de invalidacao

### Épico 5.2 — UX e refinamentos
**Contexto**: ajustes baseados em feedback real.

- [ ] Tarefa 5.2.1: Testes de usabilidade
  - [ ] Subtarefa: Roteiro de testes
  - [ ] Subtarefa: Coleta de feedback
- [ ] Tarefa 5.2.2: Ajustes de UX
  - [ ] Subtarefa: Priorizar top friccoes
  - [ ] Subtarefa: Atualizar design system

### Épico 5.3 — Documentacao e Treinamento
**Contexto**: preparar equipes para operacao.

- [ ] Tarefa 5.3.1: Documentacao tecnica
  - [ ] Subtarefa: Atualizar docs de arquitetura
  - [ ] Subtarefa: Guia de deploy
- [ ] Tarefa 5.3.2: Treinamento de usuarios
  - [ ] Subtarefa: Manuais por perfil
  - [ ] Subtarefa: Sessao de onboarding

## 7. Dependencias Principais (Resumo)

- RBAC e vinculos de unidades sao pre-requisito para Chamados e Checklists.
- Checklist de Supervisao depende do cadastro de unidades e cobertura de supervisores.
- Relatorios dependem de historico e padronizacao de dados.
- Mobile depende de APIs e fluxos estabilizados no Web.
