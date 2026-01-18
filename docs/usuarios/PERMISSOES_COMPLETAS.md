# Manual Completo de Permissões e Regras do Sistema GAPP

> **Versão:** 1.0  
> **Data:** Janeiro 2026  
> **Sistema:** GarageInn App (GAPP)

Este documento detalha todas as regras e permissões do sistema GAPP, incluindo o que cada tipo de usuário pode ou não pode fazer em cada funcionalidade.

---

## Sumário

1. [Visão Geral do Sistema de Permissões](#1-visão-geral-do-sistema-de-permissões)
2. [Estrutura Organizacional](#2-estrutura-organizacional)
3. [Tipos de Permissões](#3-tipos-de-permissões)
4. [Cargos Globais](#4-cargos-globais)
5. [Permissões por Departamento](#5-permissões-por-departamento)
6. [Funcionalidades do Sistema](#6-funcionalidades-do-sistema)
7. [Regras de Visibilidade (RLS)](#7-regras-de-visibilidade-rls)
8. [Fluxos de Aprovação](#8-fluxos-de-aprovação)
9. [Matriz Completa de Permissões](#9-matriz-completa-de-permissões)
10. [Referência Rápida por Cargo](#10-referência-rápida-por-cargo)

---

## 1. Visão Geral do Sistema de Permissões

O GAPP utiliza um sistema **RBAC (Role-Based Access Control)** - Controle de Acesso Baseado em Funções - onde as permissões são atribuídas a **cargos** e os usuários herdam essas permissões através dos cargos que possuem.

### 1.1 Princípios Fundamentais

1. **União de Permissões**: Se um usuário possui múltiplos cargos/departamentos, o sistema **soma automaticamente** todas as permissões (não há "troca de contexto" entre perfis).

2. **Modelo Misto de Acesso**:
   - **Por Departamento**: A execução do trabalho é organizada pelo Departamento Destinatário
   - **Por Unidade**: Usuários de Operações também navegam por unidade, pois sua rotina é local

3. **Segurança em Camadas**:
   - **Frontend**: Permissões controlam a visibilidade de elementos da interface (gating de UI)
   - **Backend**: Row Level Security (RLS) garante segurança real a nível de banco de dados

---

## 2. Estrutura Organizacional

### 2.1 Departamentos

O sistema possui **8 departamentos** + **cargos globais**:

| Departamento | Descrição |
|--------------|-----------|
| **Operações** | Equipe de campo (manobristas, encarregados, supervisores) |
| **Compras e Manutenção** | Gestão de compras e manutenções das unidades |
| **Financeiro** | Controle financeiro e pagamentos |
| **RH** | Gestão de pessoas e uniformes |
| **Sinistros** | Gestão de ocorrências e acidentes |
| **Comercial** | Relacionamento comercial |
| **Auditoria** | Controle e conformidade |
| **TI** | Tecnologia e sistemas |

### 2.2 Hierarquia de Cargos por Departamento

```
┌────────────────────────────────────────────────────────────────────┐
│                        CARGOS GLOBAIS                               │
│           Desenvolvedor | Diretor | Administrador                   │
│                    (Acesso Total ao Sistema)                        │
└────────────────────────────────────────────────────────────────────┘

┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│    OPERAÇÕES      │ │ COMPRAS/MANUT.    │ │    FINANCEIRO     │
├───────────────────┤ ├───────────────────┤ ├───────────────────┤
│ Gerente           │ │ Gerente           │ │ Gerente           │
│ Supervisor        │ │ Comprador         │ │ Supervisor        │
│ Encarregado       │ │ Assistente        │ │ Analista Sênior   │
│ Manobrista        │ │                   │ │ Analista Pleno    │
│                   │ │                   │ │ Analista Júnior   │
│                   │ │                   │ │ Assistente        │
│                   │ │                   │ │ Auxiliar          │
└───────────────────┘ └───────────────────┘ └───────────────────┘

┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│        RH         │ │    SINISTROS      │ │    COMERCIAL      │
├───────────────────┤ ├───────────────────┤ ├───────────────────┤
│ Gerente           │ │ Gerente           │ │ Gerente           │
│ Supervisor        │ │ Supervisor        │ │                   │
│ Analista Sênior   │ │                   │ │                   │
│ Analista Pleno    │ │                   │ │                   │
│ Analista Júnior   │ │                   │ │                   │
│ Assistente        │ │                   │ │                   │
│ Auxiliar          │ │                   │ │                   │
└───────────────────┘ └───────────────────┘ └───────────────────┘

┌───────────────────┐ ┌───────────────────┐
│    AUDITORIA      │ │        TI         │
├───────────────────┤ ├───────────────────┤
│ Gerente           │ │ Gerente           │
│ Auditor           │ │ Analista          │
└───────────────────┘ └───────────────────┘
```

### 2.3 Regras de Vínculo com Unidades

| Tipo de Vínculo | Cargos Aplicáveis | Descrição |
|-----------------|-------------------|-----------|
| **Uma unidade** | Manobrista, Encarregado | Trabalham em uma unidade específica |
| **Múltiplas unidades (cobertura)** | Supervisor (Operações) | Supervisionam várias unidades |
| **Sem vínculo obrigatório** | Todos os demais cargos | Atuam sobre todas as unidades |

---

## 3. Tipos de Permissões

O sistema define **18 permissões** organizadas em **6 grupos**:

### 3.1 Permissões de Usuários

| Permissão | Código | Descrição |
|-----------|--------|-----------|
| Visualizar usuários | `users:read` | Ver lista de usuários e seus dados |
| Criar usuários | `users:create` | Cadastrar novos usuários |
| Editar usuários | `users:update` | Alterar dados de usuários existentes |
| Excluir usuários | `users:delete` | Desativar/excluir usuários |
| Personificar | `users:impersonate` | Logar como outro usuário (debug) |

### 3.2 Permissões de Unidades

| Permissão | Código | Descrição |
|-----------|--------|-----------|
| Visualizar unidades | `units:read` | Ver lista de unidades |
| Criar unidades | `units:create` | Cadastrar novas unidades |
| Editar unidades | `units:update` | Alterar dados de unidades |

### 3.3 Permissões de Chamados (Tickets)

| Permissão | Código | Descrição |
|-----------|--------|-----------|
| Visualizar chamados | `tickets:read` | Ver chamados (conforme visibilidade) |
| Criar chamados | `tickets:create` | Abrir novos chamados |
| Triagem | `tickets:triage` | Definir prioridade e responsável |
| Aprovar | `tickets:approve` | Aprovar/negar chamados no fluxo |
| Executar | `tickets:execute` | Trabalhar na resolução do chamado |

### 3.4 Permissões de Checklists

| Permissão | Código | Descrição |
|-----------|--------|-----------|
| Visualizar checklists | `checklists:read` | Ver histórico de checklists |
| Executar checklists | `checklists:execute` | Preencher checklists |
| Configurar checklists | `checklists:configure` | Criar/editar templates |

### 3.5 Permissões de Configurações

| Permissão | Código | Descrição |
|-----------|--------|-----------|
| Visualizar configurações | `settings:read` | Ver configurações do sistema |
| Editar configurações | `settings:update` | Alterar configurações |

### 3.6 Permissão Admin

| Permissão | Código | Descrição |
|-----------|--------|-----------|
| Acesso Total | `admin:all` | Acesso irrestrito a todas as funcionalidades |

---

## 4. Cargos Globais

Cargos globais **não pertencem a nenhum departamento específico** e possuem **acesso total** (`admin:all`) ao sistema.

### 4.1 Lista de Cargos Globais

| Cargo | Permissões | Pode fazer |
|-------|------------|------------|
| **Desenvolvedor** | `admin:all` | Tudo (manutenção técnica) |
| **Diretor** | `admin:all` | Tudo (visão executiva) |
| **Administrador** | `admin:all` | Tudo (gestão administrativa) |

### 4.2 O que Admins podem fazer

- **Usuários**: Criar, editar, excluir, personificar qualquer usuário
- **Unidades**: Criar, editar, visualizar todas as unidades
- **Chamados**: Ver todos, triar, aprovar, executar, excluir chamados
- **Checklists**: Executar, configurar, ver histórico de qualquer unidade
- **Configurações**: Acessar e modificar todas as configurações do sistema
- **Exclusões em massa**: Excluir múltiplos chamados ou checklists de uma vez
- **Impersonação**: Logar como qualquer outro usuário para debug

---

## 5. Permissões por Departamento

### 5.1 Operações

| Cargo | Permissões |
|-------|------------|
| **Manobrista** | `tickets:read`, `tickets:create`, `checklists:read`, `checklists:execute` |
| **Encarregado** | `tickets:read`, `tickets:create`, `tickets:approve`, `checklists:read`, `checklists:execute`, `units:read` |
| **Supervisor** | `tickets:read`, `tickets:create`, `tickets:approve`, `checklists:read`, `checklists:execute`, `units:read` |
| **Gerente** | `tickets:read`, `tickets:create`, `tickets:triage`, `tickets:approve`, `checklists:read`, `checklists:execute`, `checklists:configure`, `units:read`, `units:update` |

**Detalhamento:**

| Cargo | O que pode fazer | O que NÃO pode fazer |
|-------|------------------|----------------------|
| **Manobrista** | Ver/criar chamados, executar checklists de abertura | Aprovar chamados, ver outras unidades, configurar sistema |
| **Encarregado** | Tudo do Manobrista + aprovar chamados (nível 1), ver dados da unidade | Triar chamados, configurar checklists |
| **Supervisor** | Tudo do Encarregado + aprovar chamados (nível 2) | Triar chamados, configurar checklists |
| **Gerente** | Tudo acima + triar chamados, configurar checklists, editar unidades | Gerenciar usuários, configurações globais |

### 5.2 Compras e Manutenção

| Cargo | Permissões |
|-------|------------|
| **Auxiliar** | `tickets:read` |
| **Analista** | `tickets:read`, `tickets:execute` |
| **Coordenador** | `tickets:read`, `tickets:execute`, `tickets:approve` |
| **Gerente** | `tickets:read`, `tickets:execute`, `tickets:approve`, `tickets:triage`, `settings:read` |

**Detalhamento:**

| Cargo | O que pode fazer | O que NÃO pode fazer |
|-------|------------------|----------------------|
| **Auxiliar** | Apenas visualizar chamados | Criar, aprovar, executar chamados |
| **Analista** | Ver e executar chamados | Aprovar, triar chamados |
| **Coordenador** | Tudo do Analista + aprovar chamados | Triar chamados |
| **Gerente** | Tudo acima + triar chamados, ver configurações | Criar usuários, configurar sistema |

### 5.3 Financeiro

| Cargo | Permissões |
|-------|------------|
| **Auxiliar** | `tickets:read` |
| **Analista** | `tickets:read`, `tickets:approve` |
| **Coordenador** | `tickets:read`, `tickets:approve` |
| **Gerente** | `tickets:read`, `tickets:approve`, `settings:read` |

### 5.4 RH

| Cargo | Permissões |
|-------|------------|
| **Auxiliar** | `users:read` |
| **Analista** | `users:read`, `users:create` |
| **Coordenador** | `users:read`, `users:create`, `users:update` |
| **Gerente** | `users:read`, `users:create`, `users:update`, `users:delete`, `settings:read` |

**Detalhamento específico RH:**

| Cargo | Gestão de Usuários | Uniformes |
|-------|-------------------|-----------|
| **Auxiliar** | Apenas visualizar | Visualizar estoque |
| **Analista** | Visualizar, criar | Visualizar, registrar transações |
| **Coordenador** | Visualizar, criar, editar | Visualizar, registrar, ajustar estoque |
| **Gerente** | Tudo (incluindo excluir) | Tudo (incluindo configurar) |

### 5.5 Sinistros

| Cargo | Permissões |
|-------|------------|
| **Auxiliar** | `tickets:read` |
| **Analista** | `tickets:read`, `tickets:execute` |
| **Coordenador** | `tickets:read`, `tickets:execute`, `tickets:approve` |
| **Gerente** | `tickets:read`, `tickets:execute`, `tickets:approve`, `settings:read` |

### 5.6 Comercial

| Cargo | Permissões |
|-------|------------|
| **Vendedor** | `units:read` |
| **Analista** | `units:read` |
| **Coordenador** | `units:read`, `tickets:read` |
| **Gerente** | `units:read`, `tickets:read`, `settings:read` |

### 5.7 Auditoria

| Cargo | Permissões |
|-------|------------|
| **Auditor** | `tickets:read`, `checklists:read` |
| **Auditor Sênior** | `tickets:read`, `tickets:approve`, `checklists:read` |
| **Coordenador** | `tickets:read`, `tickets:approve`, `checklists:read`, `checklists:configure` |
| **Gerente** | `tickets:read`, `tickets:approve`, `checklists:read`, `checklists:configure`, `settings:read` |

### 5.8 TI

| Cargo | Permissões |
|-------|------------|
| **Analista de Suporte** | `tickets:read`, `tickets:execute`, `settings:read` |
| **Desenvolvedor** | `admin:all` |
| **Coordenador** | `tickets:read`, `tickets:execute`, `settings:read`, `settings:update`, `users:read` |
| **Gerente** | `admin:all` |

---

## 6. Funcionalidades do Sistema

### 6.1 Dashboard (Início)

| Funcionalidade | Quem pode acessar |
|----------------|-------------------|
| Ver dashboard | Todos os usuários autenticados |
| Ver métricas gerais | Todos os usuários autenticados |
| Ver alertas do sistema | Admins |

### 6.2 Chamados

#### Criação de Chamados

| Ação | Quem pode |
|------|-----------|
| Criar chamado | Todos os usuários com `tickets:create` |
| Selecionar departamento destino | Todos que podem criar |
| Adicionar anexos | Todos que podem criar |
| Definir urgência percebida | Todos que podem criar (meramente informativo) |

#### Visualização de Chamados

| Escopo | Quem pode ver |
|--------|---------------|
| Próprios chamados | Todos os usuários |
| Chamados da unidade | Usuários vinculados à unidade |
| Chamados do departamento | Usuários do departamento destinatário |
| Todos os chamados | Admins |

#### Triagem de Chamados

| Ação | Quem pode |
|------|-----------|
| Definir prioridade | Gerentes e Supervisores do departamento destinatário |
| Atribuir responsável | Gerentes e Supervisores do departamento destinatário |
| Definir previsão de conclusão | Gerentes e Supervisores do departamento destinatário |

#### Aprovação de Chamados

| Cenário | Quem aprova |
|---------|-------------|
| Chamados de Manobrista para Compras/Manutenção | Encarregado → Supervisor → Gerente (em cadeia) |
| Demais chamados | Não necessita aprovação prévia |

#### Execução de Chamados

| Ação | Quem pode |
|------|-----------|
| Alterar status | Responsável pelo chamado, Gerentes |
| Adicionar comentários | Autor, Responsável, Admins |
| Adicionar anexos | Autor, Responsável, Admins |
| Fechar chamado | Autor (após resolução), Gerentes |
| Cancelar chamado | Autor, Gerentes |
| Reabrir chamado | Autor (até 7 dias), Gerentes |
| Excluir chamado | Apenas Admins |

### 6.3 Checklists

#### Checklist de Abertura

| Ação | Quem pode |
|------|-----------|
| Executar checklist | Manobristas, Encarregados |
| Ver histórico da unidade | Usuários vinculados à unidade |
| Ver histórico geral | Supervisores, Gerentes, Admins |
| Configurar perguntas | Gerentes de Operações, Admins |
| Excluir execuções | Apenas Admins |

#### Checklist de Supervisão

| Ação | Quem pode |
|------|-----------|
| Executar supervisão | Supervisores (nas unidades de cobertura) |
| Ver relatórios | Supervisores, Gerentes, Admins |
| Configurar checklist | Supervisores (própria cobertura), Gerentes, Admins |

### 6.4 Unidades

| Ação | Quem pode |
|------|-----------|
| Visualizar lista de unidades | Todos com `units:read` |
| Ver detalhes da unidade | Todos com `units:read` |
| Criar unidade | Apenas Admins |
| Editar unidade | Gerentes de Operações, Admins |
| Desativar unidade | Apenas Admins |

### 6.5 Usuários

| Ação | Quem pode |
|------|-----------|
| Visualizar lista de usuários | RH, Admins |
| Ver perfil próprio | Todos |
| Criar usuário | Analista+ de RH, Admins |
| Editar usuário | Coordenador+ de RH, Admins |
| Desativar/Excluir usuário | Gerente de RH, Admins |
| Personificar (impersonate) | Apenas Admins |

### 6.6 Configurações

| Seção | Quem pode acessar |
|-------|-------------------|
| Menu de Configurações | Apenas Admins |
| Departamentos e Cargos | Apenas Admins |
| Unidades | Admins |
| Checklists | Admins |
| Chamados (categorias) | Admins |
| Permissões | Apenas Admins |
| Uniformes | RH, Admins |
| Sistema | Apenas Admins |

---

## 7. Regras de Visibilidade (RLS)

O sistema utiliza **Row Level Security (RLS)** no PostgreSQL para garantir que os usuários só vejam os dados que têm permissão.

### 7.1 Profiles (Usuários)

| Regra | Descrição |
|-------|-----------|
| `profiles_select_all` | Todos podem ver perfis não deletados |
| `profiles_update_own` | Usuários podem editar apenas o próprio perfil |
| `profiles_admin_all` | Admins podem fazer tudo |

### 7.2 Tickets (Chamados)

| Regra | Descrição |
|-------|-----------|
| `tickets_select_own` | Ver chamados que criou |
| `tickets_select_assigned` | Ver chamados atribuídos a si |
| `tickets_select_department` | Ver chamados do seu departamento |
| `tickets_select_unit` | Ver chamados da sua unidade |
| `tickets_admin_select` | Admins veem todos |
| `tickets_insert_authenticated` | Qualquer autenticado pode criar |
| `tickets_update_own` | Pode atualizar o que criou |
| `tickets_update_assigned` | Responsável pode atualizar |

### 7.3 Checklists

| Regra | Descrição |
|-------|-----------|
| `checklist_executions_select_unit` | Ver execuções da sua unidade |
| `checklist_executions_insert` | Criar execução (como executor) |
| `checklist_executions_update_own` | Atualizar próprias execuções |

### 7.4 Uniformes

| Regra | Descrição |
|-------|-----------|
| `uniforms_select_all` | Todos podem ver uniformes |
| `uniforms_admin` | Admins e RH podem modificar |
| `uniform_transactions_insert` | Apenas Admins e RH podem registrar transações |

---

## 8. Fluxos de Aprovação

### 8.1 Fluxo de Aprovação - Operações → Compras/Manutenção

Quando um **Manobrista** abre chamado para **Compras** ou **Manutenção**, o chamado passa por uma cadeia de aprovações:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   MANOBRISTA                                                             │
│   Abre chamado                                                           │
│        │                                                                 │
│        ▼                                                                 │
│   ┌─────────────┐      ┌─────────────┐      ┌─────────────┐             │
│   │ ENCARREGADO │ ──▶  │ SUPERVISOR  │ ──▶  │  GERENTE    │             │
│   │  Aprova?    │      │  Aprova?    │      │  Aprova?    │             │
│   └──────┬──────┘      └──────┬──────┘      └──────┬──────┘             │
│          │                    │                    │                     │
│     ┌────┴────┐          ┌────┴────┐          ┌────┴────┐               │
│     │         │          │         │          │         │               │
│    Sim       Não        Sim       Não        Sim       Não              │
│     │         │          │         │          │         │               │
│     │    ┌────┴────┐     │    ┌────┴────┐     │    ┌────┴────┐         │
│     │    │ NEGADO  │     │    │ NEGADO  │     │    │ NEGADO  │         │
│     │    │(jusitf.)│     │    │(justif.)│     │    │(justif.)│         │
│     │    └─────────┘     │    └─────────┘     │    └─────────┘         │
│     │                    │                    │                         │
│     └────────────────────┴────────────────────┘                         │
│                          │                                               │
│                          ▼                                               │
│              ┌───────────────────────┐                                  │
│              │   AGUARDANDO TRIAGEM  │                                  │
│              │ (Dept. Destinatário)  │                                  │
│              └───────────────────────┘                                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Fluxo Geral de Chamados (Sem Aprovação)

Para demais casos, o chamado vai direto para triagem:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   SOLICITANTE                                                            │
│   Abre chamado                                                           │
│        │                                                                 │
│        ▼                                                                 │
│   ┌───────────────────────┐                                             │
│   │   AGUARDANDO TRIAGEM  │                                             │
│   └───────────┬───────────┘                                             │
│               │                                                          │
│               ▼                                                          │
│   ┌───────────────────────┐                                             │
│   │   GERENTE/SUPERVISOR  │ Define prioridade e responsável             │
│   │   (Triagem)           │                                             │
│   └───────────┬───────────┘                                             │
│               │                                                          │
│        ┌──────┴──────┐                                                  │
│        │             │                                                   │
│       OK          NEGADO                                                 │
│        │             │                                                   │
│        ▼             ▼                                                   │
│   ┌─────────┐   ┌─────────────┐                                         │
│   │PRIORIZADO│  │ Justificativa│                                        │
│   └────┬────┘   │ obrigatória │                                         │
│        │        └─────────────┘                                         │
│        ▼                                                                 │
│   ┌───────────────┐                                                     │
│   │ EM ANDAMENTO  │                                                     │
│   └───────┬───────┘                                                     │
│           │                                                              │
│           ▼                                                              │
│   ┌───────────────┐                                                     │
│   │   RESOLVIDO   │                                                     │
│   └───────┬───────┘                                                     │
│           │                                                              │
│           ▼                                                              │
│   ┌───────────────┐                                                     │
│   │    FECHADO    │                                                     │
│   └───────────────┘                                                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Matriz Completa de Permissões

### 9.1 Legenda

- ✅ = Permitido
- ❌ = Não permitido
- 🔸 = Parcial (com restrições)

### 9.2 Funcionalidades de Navegação

| Menu | Manobrista | Encarregado | Supervisor | Gerente Oper. | Compras/Manut. | Financeiro | RH | Sinistros | Auditoria | TI | Admin |
|------|------------|-------------|------------|---------------|----------------|------------|----|-----------|-----------|----|-------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Chamados | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Checklists | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Unidades | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Usuários | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | 🔸 | ✅ |
| Configurações | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

### 9.3 Ações em Chamados

| Ação | Manobrista | Encarregado | Supervisor | Gerente Oper. | Gerente Dept. | Admin |
|------|------------|-------------|------------|---------------|---------------|-------|
| Criar chamado | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Ver próprios chamados | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ver chamados da unidade | 🔸 | ✅ | ✅ | ✅ | - | ✅ |
| Ver chamados do depto. | - | - | - | - | ✅ | ✅ |
| Triagem | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Aprovar (nível 1) | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Aprovar (nível 2) | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Aprovar (nível 3) | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Executar | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Fechar | 🔸 | 🔸 | 🔸 | ✅ | ✅ | ✅ |
| Excluir | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

### 9.4 Ações em Checklists

| Ação | Manobrista | Encarregado | Supervisor | Gerente Oper. | Auditor | Admin |
|------|------------|-------------|------------|---------------|---------|-------|
| Executar abertura | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Executar supervisão | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| Ver histórico (própria unidade) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ver histórico (todas unidades) | ❌ | ❌ | 🔸 | ✅ | ✅ | ✅ |
| Configurar template | ❌ | ❌ | ❌ | ✅ | 🔸 | ✅ |
| Excluir execuções | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

### 9.5 Ações em Usuários

| Ação | Auxiliar RH | Analista RH | Coordenador RH | Gerente RH | Admin |
|------|-------------|-------------|----------------|------------|-------|
| Visualizar lista | ✅ | ✅ | ✅ | ✅ | ✅ |
| Criar usuário | ❌ | ✅ | ✅ | ✅ | ✅ |
| Editar usuário | ❌ | ❌ | ✅ | ✅ | ✅ |
| Desativar usuário | ❌ | ❌ | ❌ | ✅ | ✅ |
| Personificar | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 10. Referência Rápida por Cargo

### 10.1 Manobrista (Operações)

**Escopo:** Unidade específica onde trabalha

**Pode fazer:**
- Executar checklist de abertura da sua unidade
- Criar chamados para qualquer departamento
- Ver próprios chamados
- Comentar em chamados que criou

**Não pode fazer:**
- Aprovar chamados
- Triar chamados
- Ver chamados de outras unidades
- Configurar checklists
- Acessar configurações do sistema

---

### 10.2 Encarregado (Operações)

**Escopo:** Unidade específica onde trabalha

**Pode fazer:**
- Tudo que Manobrista pode
- Aprovar chamados de Manobristas (nível 1)
- Ver dados básicos da unidade

**Não pode fazer:**
- Triar chamados
- Aprovar chamados nos níveis 2 e 3
- Configurar checklists

---

### 10.3 Supervisor (Operações)

**Escopo:** Múltiplas unidades (cobertura)

**Pode fazer:**
- Tudo que Encarregado pode
- Executar checklist de supervisão
- Aprovar chamados (nível 2)
- Ver dados de todas as unidades da sua cobertura

**Não pode fazer:**
- Triar chamados
- Aprovar no nível 3 (Gerente)
- Configurar checklists

---

### 10.4 Gerente de Operações

**Escopo:** Todas as unidades

**Pode fazer:**
- Tudo que Supervisor pode
- Aprovar chamados (nível 3 - final)
- Triar chamados de Operações
- Configurar templates de checklist
- Editar dados de unidades

**Não pode fazer:**
- Gerenciar usuários
- Acessar configurações globais do sistema
- Excluir chamados ou checklists

---

### 10.5 Gerente de Departamento (Compras/Manutenção, Financeiro, etc.)

**Escopo:** Chamados direcionados ao seu departamento

**Pode fazer:**
- Triar chamados do departamento (definir prioridade/responsável)
- Aprovar/negar chamados do departamento
- Executar chamados
- Ver configurações do sistema (somente leitura)

**Não pode fazer:**
- Criar chamados (exceto exceções)
- Gerenciar usuários (exceto RH)
- Modificar configurações do sistema
- Executar checklists

---

### 10.6 Administrador / Diretor / Desenvolvedor

**Escopo:** Todo o sistema

**Pode fazer:**
- **TUDO** - acesso irrestrito a todas as funcionalidades
- Gerenciar usuários (criar, editar, excluir)
- Configurar sistema (departamentos, cargos, categorias)
- Excluir chamados e checklists
- Personificar outros usuários
- Acessar logs de auditoria

---

## Apêndice A: Funções SQL de Verificação

### is_admin()
Verifica se o usuário atual possui cargo global (Administrador, Desenvolvedor ou Diretor).

```sql
SELECT is_admin(); -- Retorna true/false
```

### is_rh()
Verifica se o usuário atual pertence ao departamento de RH.

```sql
SELECT is_rh(); -- Retorna true/false
```

### ticket_needs_approval(user_id, department_id)
Verifica se um chamado precisa passar pelo fluxo de aprovações.

```sql
SELECT ticket_needs_approval('uuid-usuario', 'uuid-departamento');
-- Retorna true se Manobrista → Compras/Manutenção
```

---

## Apêndice B: Glossário

| Termo | Definição |
|-------|-----------|
| **RBAC** | Role-Based Access Control - Controle de acesso baseado em funções/cargos |
| **RLS** | Row Level Security - Segurança a nível de linha no banco de dados |
| **Triagem** | Processo de definir prioridade e responsável para um chamado |
| **Cobertura** | Conjunto de unidades supervisionadas por um Supervisor |
| **Gating** | Controle de visibilidade de elementos na interface |
| **Impersonação** | Funcionalidade que permite logar como outro usuário |

---

> **Documento gerado automaticamente com base na análise do código-fonte e documentação do sistema GAPP.**
