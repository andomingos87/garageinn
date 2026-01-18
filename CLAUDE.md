# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**GAPP Web** is the administrative web application for **Garageinn**, a parking network. Built with Next.js 16 (App Router), React 19, and Tailwind CSS 4. Uses Supabase as backend with SSR authentication.

GarageInn is a comprehensive management system for parking operations, maintenance requests, procurement, and human resources. This documentation provides a deep dive into the system's architecture and inner workings.

## Commands

```bash
npm run dev                         # Start development server (localhost:3000)
npm run build                       # Production build
npm run lint                        # ESLint
npm run lint:fix                    # ESLint with auto-fix
npm run format                      # Prettier format
npm run format:check                # Prettier check
npm run test:e2e                    # Playwright E2E tests
npm run test:e2e:ui                 # Playwright with UI
npm run test:e2e:debug              # Debug specific test
npx playwright test path/to/test.ts # Run single test file
```

## Architecture

```
src/
├── app/
│   ├── (app)/                    # Authenticated routes (route group)
│   │   ├── actions.ts            # Shared server actions (signOut)
│   │   ├── layout.tsx            # App shell (sidebar, header)
│   │   ├── chamados/             # Tickets module by department
│   │   ├── checklists/           # Opening and supervision checklists
│   │   ├── configuracoes/        # System settings
│   │   ├── dashboard/            # Main dashboard
│   │   ├── perfil/               # User profile
│   │   ├── unidades/             # Unit/garage management
│   │   └── usuarios/             # User management and RBAC
│   ├── (auth)/                   # Auth routes (login, recuperar-senha, redefinir-senha)
│   └── auth/callback/            # OAuth callback handler
├── components/
│   ├── ui/                       # shadcn/ui components
│   └── layout/                   # Sidebar, Header, AppShell
├── hooks/
│   ├── use-auth.ts               # Authentication state
│   ├── use-permissions.ts        # RBAC permission checks
│   ├── use-profile.ts            # Current user profile
│   ├── use-impersonation.ts      # Admin user impersonation
│   └── use-mobile.ts             # Mobile detection
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser client (createBrowserClient)
│   │   ├── server.ts             # Server client (createServerClient)
│   │   ├── middleware.ts         # Session refresh
│   │   └── database.types.ts     # Generated types (npx supabase gen types typescript)
│   └── utils.ts                  # cn() for class merging
└── proxy.ts                      # Auth middleware
```

## Key Technical Modules

### 1. Authentication & Permissions
The system uses a robust RBAC (Role-Based Access Control) system managed via Supabase.
- **Hook**: `usePermissions()` provides real-time access checks.
- **Logic**: `src/lib/auth/rbac.ts` contains functions like `hasPermission(permission)`.
- **Impersonation**: Admin users can impersonate other profiles for debugging using the `impersonateUser` service.

### 2. Ticketing System (Chamados)
The application handles four distinct ticket types:
- **Maintenance (Manutenção)**: Physical repairs and infrastructure.
- **Procurement (Compras)**: Requesting items or services.
- **Claims (Sinistros)**: Handling vehicle damage and insurance incidents.
- **HR (RH)**: Employee-related requests.

### 3. Unit Management (Unidades)
Units represent physical locations. The system tracks:
- **Staffing**: Linking users to specific units.
- **Supervision**: Hierarchical relationships between managers and units.
- **Checklists**: Operational procedures executed at specific locations.

## Key Patterns

### Supabase Clients
```tsx
// Server Components / Server Actions
import { createClient } from "@/lib/supabase/server";
const supabase = await createClient();

// Client Components
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();
```

### Server Actions
Place in `actions.ts` files with `"use server"` directive:
```tsx
"use server";
import { createClient } from "@/lib/supabase/server";

export async function createTicket(data: FormData) {
  const supabase = await createClient();
  // ...
}
```

### Authentication Flow
The `proxy.ts` middleware handles:
1. Session token refresh via `updateSession()`
2. Redirects unauthenticated users to `/login`
3. Preserves destination via `?next=` param
4. Redirects authenticated users away from auth pages

Public routes: `/login`, `/recuperar-senha`, `/redefinir-senha`, `/auth/callback`

## MCP Tools

### Supabase MCP Tools

Use MCP tools for database operations:
- `execute_sql` — SELECT queries
- `apply_migration` — DDL changes (CREATE, ALTER, DROP)
- `list_tables` — List tables
- `get_logs` — Debug logs (api, postgres, auth, storage)
- `get_advisors` — Check RLS and performance

**Rules:**
1. Never execute DDL directly — use `apply_migration`
2. Check security advisors after schema changes
3. Regenerate types: `npx supabase gen types typescript`

### AI-Context MCP Tools

**IMPORTANTE:** Use as ferramentas do MCP `ai-context` para análise de código, gerenciamento de contexto e orquestração de workflows. Consulte `AI-CONTEXT-MCP-TOOLS.md` para documentação completa.

#### Ferramentas de Análise de Código (Use Frequentemente)

- **`getCodebaseMap`** — Obter visão geral da arquitetura, stack tecnológico e símbolos do projeto
  - Use seções específicas (`architecture`, `stack`, `symbols`) para reduzir uso de tokens
  - Exemplo: `getCodebaseMap({ section: "architecture" })`

- **`buildSemanticContext`** — Construir contexto semântico otimizado para prompts
  - Use antes de tarefas complexas para obter contexto rico do codebase
  - Tipos: `documentation`, `playbook`, `plan`, `compact`

- **`analyzeSymbols`** — Analisar símbolos (classes, funções, interfaces) em arquivos específicos
  - Use para entender APIs públicas de módulos antes de modificá-los

- **`searchCode`** — Buscar padrões de código usando regex
  - Use para encontrar uso de APIs, imports ou dependências

- **`getFileStructure`** — Obter estrutura de diretórios do repositório
  - Use ao iniciar trabalho em áreas desconhecidas do projeto

#### Ferramentas de Workflow PREVC (Para Features Complexas)

O framework PREVC organiza trabalho em 5 fases: **P** (Planejamento), **R** (Revisão), **E** (Execução), **V** (Validação), **C** (Confirmação).

- **`workflowInit`** — Inicializar workflow para nova feature/projeto
  - Use ao iniciar features complexas ou projetos novos
  - Detecta escala automaticamente (`QUICK`, `SMALL`, `MEDIUM`, `LARGE`, `ENTERPRISE`)

- **`workflowStatus`** — Verificar status atual do workflow
  - Use para verificar progresso e identificar próximos passos

- **`workflowAdvance`** — Avançar para próxima fase do PREVC
  - Use quando uma fase está completa

- **`scaffoldPlan`** — Criar plano de implementação estruturado
  - Use para documentar estratégias de implementação

#### Ferramentas de Agentes (Para Orquestração)

- **`orchestrateAgents`** — Selecionar agentes apropriados para uma tarefa
  - Use para tarefas complexas que requerem múltiplos agentes
  - Pode ser baseado em `task`, `phase` ou `role`

- **`getAgentSequence`** — Obter sequência recomendada de agentes
  - Use para planejar fluxos multi-agente

- **`getAgentDocs`** — Obter documentação relevante para um tipo de agente
  - Use para fornecer contexto adequado a agentes específicos

#### Ferramentas de Skills (Para Expertise Específica)

- **`getSkillContent`** — Obter instruções detalhadas de uma skill
  - Use quando precisar executar tarefas específicas (ex: `code-review`, `pr-review`)

- **`getSkillsForPhase`** — Obter skills relevantes para uma fase PREVC
  - Use para saber quais skills ativar em cada fase

#### Quando Usar AI-Context MCP

1. **Antes de implementar features complexas:**
   - `workflowInit` → `scaffoldPlan` → `orchestrateAgents`

2. **Para entender o codebase:**
   - `getCodebaseMap` → `buildSemanticContext` → `analyzeSymbols`

3. **Para code review:**
   - `getSkillContent("code-review")` → `searchCode` → `analyzeSymbols`

4. **Para documentação:**
   - `checkScaffolding` → `initializeContext` → `fillScaffolding`

**Referência Completa:** Consulte `AI-CONTEXT-MCP-TOOLS.md` para documentação detalhada de todas as ferramentas disponíveis.

## Design System

- **Primary**: `hsl(0, 95%, 60%)` — Garageinn red
- **Components**: shadcn/ui in `src/components/ui/`
- **CSS Variables**: `src/app/globals.css`
- **Dark Mode**: Supported via `next-themes`
- **Utilities**: `cn()` from `@/lib/utils`

Semantic colors:
- Success: `hsl(142, 76%, 36%)`
- Warning: `hsl(38, 92%, 50%)`
- Info: `hsl(199, 89%, 48%)`
- Destructive: `hsl(0, 84%, 60%)`

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Optional
```

## Glossary of Terms

| Term | Definition |
| :--- | :--- |
| **Unidade** | A physical parking lot or business location managed in the system. |
| **Chamado** | A ticket or request (Maintenance, Purchase, etc.). |
| **Sinistro** | An insurance claim or incident involving customer vehicles. |
| **Checklist** | A set of recurring tasks or inspections to be performed at a Unit. |
| **Impersonation** | The ability for admins to view the app as a specific user. |

## Developer Tooling

- **Testing**: Playwright for E2E testing (located in `/e2e`).
- **Styling**: Tailwind CSS with Shadcn/UI components.
- **Database**: Supabase (PostgreSQL) with generated TypeScript types in `src/lib/supabase/database.types.ts`.
- **Validation**: Zod for schema validation in forms and server actions.

## Conventions

- **Portuguese**: UI text and route names (chamados, unidades, usuarios)
- **Server Components**: Default; Client Components only when necessary
- **Commits**: Conventional Commits (`feat(tickets): add filter`)
- **TypeScript**: Strict typing with `database.types.ts`
- **Tests**: E2E with Playwright in `e2e/`

## Documentation

### Core Documentation
- **[Project Overview](./.context/docs/project-overview.md)**: High-level vision, main features, and business context.
- **[Architecture Notes](./.context/docs/architecture.md)**: System design, directory structure, and technical stack choices.
- **[Security & RBAC](./.context/docs/security.md)**: Details on the Permission-Based Access Control (RBAC) and authentication flow.
- **[Data Flow & Integrations](./.context/docs/data-flow.md)**: How data moves between the client, server actions, and Supabase.
- **[Development Workflow](./.context/docs/development-workflow.md)**: Coding standards, branch strategy, and CI/CD pipelines.

### Additional Resources
- **PRD**: `../../projeto/PRD.md`
- **Database**: `../../projeto/database/README.md`
- **Design System**: `../../design-system.md`
- **Permissions**: `../../projeto/usuarios/PERMISSOES_COMPLETAS.md`
- **Tooling Guide**: `.context/docs/tooling.md` — Detailed setup instructions and productivity tools.