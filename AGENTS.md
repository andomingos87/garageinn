# AGENTS.md

Este arquivo fornece instruções para agentes AI trabalhando neste repositório, com foco no uso do MCP ai-context para orquestração e análise de código.

## Uso do MCP AI-Context

**IMPORTANTE:** Todos os agentes devem usar as ferramentas do MCP `ai-context` para análise de código, gerenciamento de contexto e orquestração de workflows. Consulte `AI-CONTEXT-MCP-TOOLS.md` para documentação completa.

### Ferramentas Essenciais para Agentes

#### 1. Descoberta e Análise de Agentes

- **`discoverAgents`** — Descobrir todos os agentes disponíveis (built-in + custom)
  - Use no início para ver agentes disponíveis no projeto
  - Escaneia `.context/agents/` para playbooks customizados

- **`getAgentInfo`** — Obter informações detalhadas sobre um agente específico
  - Use para entender capacidades de um agente antes de usá-lo

- **`listAgentTypes`** — Listar tipos de agentes com descrições
  - Use para visão geral rápida de agentes disponíveis

#### 2. Orquestração de Agentes

- **`orchestrateAgents`** — Selecionar agentes apropriados baseado em:
  - `task`: Descrição da tarefa para seleção inteligente
  - `phase`: Fase PREVC (`P`, `R`, `E`, `V`, `C`)
  - `role`: Role PREVC (`planner`, `designer`, `architect`, `developer`, `qa`, `reviewer`, `documenter`, `solo-dev`)

- **`getAgentSequence`** — Obter sequência recomendada de agentes para uma tarefa
  - Inclui ordem de handoff entre agentes
  - Use `includeReview: true` para incluir code review na sequência

**Exemplo de uso:**
```
Orquestrar agentes para "Implementar autenticação OAuth"
→ Retorna agentes recomendados: architect-specialist, backend-specialist, security-auditor
```

#### 3. Contexto e Documentação para Agentes

- **`getAgentDocs`** — Obter guias de documentação relevantes para um tipo de agente
  - Use para fornecer contexto adequado a um agente específico
  - Agentes disponíveis: `code-reviewer`, `bug-fixer`, `feature-developer`, `refactoring-specialist`, `test-writer`, `documentation-writer`, `performance-optimizer`, `security-auditor`, `backend-specialist`, `frontend-specialist`, `architect-specialist`, `devops-specialist`, `database-specialist`, `mobile-specialist`

- **`getPhaseDocs`** — Obter documentação relevante para uma fase PREVC
  - Use para entender documentação necessária em cada fase

#### 4. Análise de Código para Agentes

- **`getCodebaseMap`** — Obter mapa do codebase (arquitetura, stack, símbolos)
  - Use seções específicas para reduzir tokens: `architecture`, `stack`, `symbols.classes`
  - Essencial antes de iniciar trabalho em áreas desconhecidas

- **`buildSemanticContext`** — Construir contexto semântico otimizado
  - Use `contextType: "playbook"` para contexto focado em agentes
  - Use `targetFile` para contexto focado em arquivo específico

- **`analyzeSymbols`** — Analisar símbolos em arquivos específicos
  - Use para entender APIs públicas antes de modificações

### Workflow Recomendado para Agentes

#### Iniciando uma Tarefa Complexa

1. **Descobrir agentes disponíveis:**
   ```
   discoverAgents() → Ver agentes built-in e custom
   ```

2. **Orquestrar agentes apropriados:**
   ```
   orchestrateAgents({ task: "Descrição da tarefa" })
   → Retorna agentes recomendados com descrições
   ```

3. **Obter sequência de execução:**
   ```
   getAgentSequence({ task: "Descrição da tarefa" })
   → Retorna ordem de handoff entre agentes
   ```

4. **Obter contexto para cada agente:**
   ```
   getAgentDocs({ agent: "frontend-specialist" })
   getCodebaseMap({ section: "architecture" })
   ```

#### Durante Execução

- Use `getCodebaseMap` para entender estrutura antes de modificar código
- Use `analyzeSymbols` para entender APIs de módulos específicos
- Use `searchCode` para encontrar padrões e dependências
- Use `buildSemanticContext` para contexto rico quando necessário

#### Para Code Review

1. **Obter skill de code review:**
   ```
   getSkillContent({ skillSlug: "code-review" })
   ```

2. **Analisar código:**
   ```
   analyzeSymbols({ filePath: "arquivo.ts" })
   searchCode({ pattern: "padrão-procurado" })
   ```

### Integração com Workflow PREVC

Agentes podem trabalhar dentro do framework PREVC:

- **Fase P (Planejamento):** `orchestrateAgents({ phase: "P" })` → Retorna agentes de planejamento
- **Fase R (Revisão):** `orchestrateAgents({ phase: "R" })` → Retorna code-reviewer, security-auditor
- **Fase E (Execução):** `orchestrateAgents({ phase: "E" })` → Retorna feature-developer, backend-specialist, etc.
- **Fase V (Validação):** `orchestrateAgents({ phase: "V" })` → Retorna test-writer, qa
- **Fase C (Confirmação):** `orchestrateAgents({ phase: "C" })` → Retorna documentation-writer

### Skills para Agentes

- **`getSkillContent`** — Obter instruções detalhadas de uma skill
  - Skills comuns: `code-review`, `pr-review`, `commit-message`, `feature-breakdown`

- **`getSkillsForPhase`** — Obter skills relevantes para uma fase PREVC
  - Use para saber quais skills ativar em cada fase

### Exemplos Práticos

#### Exemplo 1: Implementar Nova Feature

```typescript
// 1. Descobrir agentes
const agents = await discoverAgents();

// 2. Orquestrar para tarefa
const recommended = await orchestrateAgents({
  task: "Implementar sistema de notificações em tempo real"
});

// 3. Obter sequência
const sequence = await getAgentSequence({
  task: "Implementar sistema de notificações em tempo real",
  includeReview: true
});

// 4. Para cada agente na sequência:
// - getAgentDocs({ agent: "architect-specialist" })
// - getCodebaseMap({ section: "architecture" })
// - Executar trabalho do agente
```

#### Exemplo 2: Code Review

```typescript
// 1. Obter skill de review
const reviewSkill = await getSkillContent({ skillSlug: "code-review" });

// 2. Analisar arquivos modificados
const symbols = await analyzeSymbols({ 
  filePath: "src/components/TicketForm.tsx",
  symbolTypes: ["function", "interface"]
});

// 3. Buscar padrões problemáticos
const patterns = await searchCode({
  pattern: "useState|useEffect",
  fileGlob: "**/*.tsx"
});
```

### Referências

- **Documentação Completa:** `AI-CONTEXT-MCP-TOOLS.md`
- **Playbooks de Agentes:** `.context/agents/`
- **Skills:** `.context/skills/`
- **Planos:** `.context/plans/`

---

# Project Rules and Guidelines

> Auto-generated from .context/docs on 2026-01-17T22:18:05.423Z

## README

# GarageInn Web App Documentation

Welcome to the technical documentation for the GarageInn web application. This repository contains the front-end and server-side logic for the GarageInn management platform, built with Next.js, TypeScript, and Supabase.

## 🚀 Getting Started

GarageInn is a comprehensive management system for parking operations, maintenance requests, procurement, and human resources. This documentation provides a deep dive into the system's architecture and inner workings.

### Core Documentation
- **[Project Overview](./project-overview.md)**: High-level vision, main features, and business context.
- **[Architecture Notes](./architecture.md)**: System design, directory structure, and technical stack choices.
- **[Security & RBAC](./security.md)**: Details on the Permission-Based Access Control (RBAC) and authentication flow.
- **[Data Flow & Integrations](./data-flow.md)**: How data moves between the client, server actions, and Supabase.
- **[Development Workflow](./development-workflow.md)**: Coding standards, branch strategy, and CI/CD pipelines.

---

## 🏗️ Repository Structure

The project follows a modern Next.js App Router structure:

```text
src/
├── app/               # Next.js App Router (Routes, Actions, Pages)
│   ├── (app)/         # Main application routes (requires auth)
│   └── (auth)/        # Authentication routes (login, recovery)
├── components/        # Reusable UI components
│   ├── layout/        # AppShell, Sidebar, Header
│   └── ui/            # Base Shadcn UI components
├── hooks/             # Custom React hooks (useAuth, usePermissions)
├── lib/               # Shared logic and utilities
│   ├── auth/          # RBAC logic and session management
│   ├── supabase/      # Database types and clients
│   └── utils/         # Helper functions (formatting, validation)
└── scripts/           # Maintenance and validation scripts
```

---

## 🛠️ Key Technical Modules

### 1. Authentication & Permissions
The system uses a robust RBAC (Role-Based Access Control) system managed via Supabase.
- **Hook**: `usePermissions()` provides real-time access checks.
- **Logic**: `src/lib/auth/rbac.ts` contains functions like `hasPermission(permission)`.
- **Impersonation**: Admin users can impersonate other profiles for debugging using the `impersonateUser` service.

### 2. Ticketing System (Chamados)
The application handles five distinct ticket types:
- **Maintenance (Manutenção)**: Physical repairs and infrastructure.
- **Procurement (Compras)**: Requesting items or services.
- **Claims (Sinistros)**: Handling vehicle damage and insurance incidents.
- **HR (RH)**: Employee-related requests.
- **Commercial (Comercial)**: Commercial operations including contracts, proposals, renewals, and client complaints.

### 3. Unit Management (Unidades)
Units represent physical locations. The system tracks:
- **Staffing**: Linking users to specific units.
- **Supervision**: Hierarchical relationships between managers and units.
- **Checklists**: Operational procedures executed at specific locations.

---

## 📖 Glossary of Terms

| Term | Definition |
| :--- | :--- |
| **Unidade** | A physical parking lot or business location managed in the system. |
| **Chamado** | A ticket or request (Maintenance, Purchase, etc.). |
| **Sinistro** | An insurance claim or incident involving customer vehicles. |
| **Checklist** | A set of recurring tasks or inspections to be performed at a Unit. |
| **Impersonation** | The ability for admins to view the app as a specific user. |
| **Comercial** | Commercial department ticket for contracts, proposals, renewals, and client complaints. |

---

## 🛠️ Developer Tooling

- **Testing**: Playwright for E2E testing (located in `/e2e`).
- **Styling**: Tailwind CSS with Shadcn/UI components.
- **Database**: Supabase (PostgreSQL) with generated TypeScript types in `src/lib/supabase/database.types.ts`.
- **Validation**: Zod for schema validation in forms and server actions.

For detailed setup instructions, refer to the **[Tooling & Productivity Guide](./tooling.md)**.

