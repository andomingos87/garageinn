# Backlog do Projeto - Gapp (Garageinn App)

## 0. Premissas e Escopo

- Este backlog cobre **Web, Mobile e Backend (Supabase)** com foco no MVP descrito no `projeto/PRD.md`.
- Estrutura por **Fase → Épico → Tarefas → Subtarefas**, com **contexto** e dependências.
- Prioriza Entregas 1 a 4 e inclui refinamentos Pós‑Entrega.

## 1. Fase 0 — Fundacao e Bootstrap

### Épico 0.1 — Setup do monorepo e padroes de codigo
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

### Épico 0.2 — Design System base (Web)
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

### Épico 0.3 — Infraestrutura Supabase
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

## 2. Fase 1 — Entrega 1 (Operacoes, Compras, Manutencao, RH)

### Épico 1.1 — Autenticacao e Protecao de Rotas (Web)
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

### Épico 1.2 — RBAC e Permissoes
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

### Épico 1.4 — Gestao de Unidades (Web)
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

### Épico 1.5 — Checklists de Abertura
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

### Épico 1.6 — Chamados de Compras
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

### Épico 1.7 — Chamados de Manutencao
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

### Épico 1.8 — Chamados de RH (Uniformes e Gerais)
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

### Épico 1.9 — Admin (exclusoes e controle)
**Contexto**: permissao elevada para limpeza e correcoes.

- [x] Tarefa 1.9.1: Excluir chamados (unitario e em massa)
  - ✅ Subtarefa: Validar permissao admin (checkAdminPermission verifica Administrador/Desenvolvedor)
  - ✅ Subtarefa: Confirmacao e auditoria (AlertDialog + RPC delete_ticket_cascade com p_deleted_by)
- [x] Tarefa 1.9.2: Excluir checklists (unitario e em massa)
  - ✅ Subtarefa: Validar dependencias (checkIsAdmin via RPC is_admin, deleteExecution/deleteExecutions)
  - ✅ Subtarefa: Registro no historico (revalidatePath, audit_logs disponivel)

## 3. Fase 2 — Entrega 2 (Sinistros, Comercial, Supervisao)

### Épico 2.1 — Chamados de Sinistros
**Contexto**: fluxo especifico e tabelas dedicadas.

- [ ] Tarefa 2.1.1: Listagem e filtros
  - [ ] Subtarefa: Filtros por categoria e status
  - [ ] Subtarefa: Busca e ordenacao
- [ ] Tarefa 2.1.2: Fluxo de execucao
  - [ ] Subtarefa: Registro de ocorrencias e danos
  - [ ] Subtarefa: Comunicacoes com cliente
- [ ] Tarefa 2.1.3: Compras internas
  - [ ] Subtarefa: Fornecedores credenciados
  - [ ] Subtarefa: Cotacoes e itens
  - [ ] Subtarefa: Aprovacoes internas

### Épico 2.2 — Chamados de Comercial
**Contexto**: fluxo padrao de abertura/triagem/execucao.

- [ ] Tarefa 2.2.1: Abertura e listagem
  - [ ] Subtarefa: Formulario padrao
  - [ ] Subtarefa: Filtros e busca
- [ ] Tarefa 2.2.2: Triagem e execucao
  - [ ] Subtarefa: Prioridade e responsavel
  - [ ] Subtarefa: Mudanca de status

### Épico 2.3 — Checklist de Supervisao
**Contexto**: supervisores criam e executam checklists por unidade.

- [ ] Tarefa 2.3.1: Modelagem e RLS
  - [ ] Subtarefa: Templates e perguntas flexiveis
  - [ ] Subtarefa: Permissao por cobertura
- [ ] Tarefa 2.3.2: Criacao/edicao de checklist
  - [ ] Subtarefa: Builder com tipos diversos
  - [ ] Subtarefa: Validacoes por tipo
- [ ] Tarefa 2.3.3: Execucao de supervisao
  - [ ] Subtarefa: Fluxo com inicio/fim
  - [ ] Subtarefa: Assinatura do encarregado
- [ ] Tarefa 2.3.4: Relatorio de supervisao
  - [ ] Subtarefa: Pontuacao e resumo
  - [ ] Subtarefa: Exportacao simples (PDF/print)

## 4. Fase 3 — Entrega 3 (Financeiro, Configuracoes, Relatorios)

### Épico 3.1 — Chamados Financeiros
**Contexto**: fluxo padrao com prioridade e triagem.

- [ ] Tarefa 3.1.1: Abertura e listagem
  - [ ] Subtarefa: Formulario com categoria financeira
  - [ ] Subtarefa: Filtros e busca
- [ ] Tarefa 3.1.2: Triagem e execucao
  - [ ] Subtarefa: Definir prioridade e responsavel
  - [ ] Subtarefa: Mudanca de status

### Épico 3.2 — Configuracoes do sistema
**Contexto**: parametros gerais e cadastros base.

- [ ] Tarefa 3.2.1: Configurar departamentos e cargos
  - [ ] Subtarefa: CRUD de departamentos
  - [ ] Subtarefa: CRUD de cargos e permissoes
- [ ] Tarefa 3.2.2: Configurar templates de checklist
  - [ ] Subtarefa: Centralizar templates globais
  - [ ] Subtarefa: Duplicar para unidades
- [ ] Tarefa 3.2.3: Preferencias gerais
  - [ ] Subtarefa: Parametros basicos (ex.: SLA)
  - [ ] Subtarefa: Config de notificacoes (stub)

### Épico 3.3 — Dashboard e Relatorios
**Contexto**: visibilidade gerencial pos-MVP.

- [ ] Tarefa 3.3.1: Dashboard gerencial
  - [ ] Subtarefa: Chamados abertos e por prioridade
  - [ ] Subtarefa: Tempo medio de resolucao
  - [ ] Subtarefa: Conformidade de checklists
- [ ] Tarefa 3.3.2: Relatorios de chamados
  - [ ] Subtarefa: Filtros por periodo/status
  - [ ] Subtarefa: Exportacao PDF/Excel
- [ ] Tarefa 3.3.3: Relatorios de supervisao
  - [ ] Subtarefa: Listagem por unidade
  - [ ] Subtarefa: Exportacao simples

## 5. Fase 4 — Entrega 4 (Mobile)

### Épico 4.1 — Setup Mobile (Expo)
**Contexto**: base do app para operacoes em campo.

- [ ] Tarefa 4.1.1: Configuracao inicial
  - [ ] Subtarefa: Estrutura de pastas e navigation
  - [ ] Subtarefa: Configurar tema e componentes base
- [ ] Tarefa 4.1.2: Autenticacao mobile
  - [ ] Subtarefa: Login e sessao
  - [ ] Subtarefa: Persistencia e refresh

### Épico 4.2 — Fluxo de Chamados (Mobile)
**Contexto**: listar, criar e acompanhar chamados em campo.

- [ ] Tarefa 4.2.1: Listagem de chamados
  - [ ] Subtarefa: Filtros basicos
  - [ ] Subtarefa: Detalhe do chamado
- [ ] Tarefa 4.2.2: Criacao de chamado
  - [ ] Subtarefa: Formulario padrao
  - [ ] Subtarefa: Anexos via camera

### Épico 4.3 — Checklists Mobile
**Contexto**: execucao de abertura e supervisao no campo.

- [ ] Tarefa 4.3.1: Checklist de abertura
  - [ ] Subtarefa: Fluxo Sim/Nao
  - [ ] Subtarefa: Upload de fotos
- [ ] Tarefa 4.3.2: Checklist de supervisao
  - [ ] Subtarefa: Tipos variados de perguntas
  - [ ] Subtarefa: Assinatura do encarregado

### Épico 4.4 — Notificacoes e Publicacao
**Contexto**: preparar push e publicar apps.

- [ ] Tarefa 4.4.1: Push notifications (FCM)
  - [ ] Subtarefa: Configurar projeto Firebase
  - [ ] Subtarefa: Integrar no app
- [ ] Tarefa 4.4.2: Publicacao
  - [ ] Subtarefa: Build iOS e Android
  - [ ] Subtarefa: Publicar nas lojas

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
