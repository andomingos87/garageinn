# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**GAPP (Garageinn App)** is a SaaS platform for managing tickets and operational checklists developed for **Garageinn**, a parking network. The system uses role-based access control (RBAC) to manage permissions across multiple departments and roles.

### Monorepo Structure

- **apps/web**: Next.js 16 application (React 19, Tailwind CSS 4) for administrative management
- **apps/mobile**: Expo/React Native app (Expo SDK 54, React Native 0.81) for field operations
- **supabase/**: Supabase Edge Functions and migrations
- **projeto/**: Complete documentation (PRD, specifications, tests, database)

### Backend

Both applications share **Supabase** as the backend:
- **PostgreSQL**: 33 tables organized by module
- **Supabase Auth**: Authentication with magic links and SSR sessions
- **Supabase Storage**: Ticket attachments and checklist photos
- **RLS (Row Level Security)**: All tables protected by RLS policies

## Commands

### Web App (apps/web)
```bash
cd apps/web
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # ESLint
npm run lint:fix     # ESLint with auto-fix
npm run format       # Prettier format
npm run format:check # Prettier check
npm run test:e2e     # Playwright E2E tests
npm run test:e2e:ui  # Playwright with UI
npm run test:e2e:debug              # Debug specific test
npx playwright test path/to/test.ts # Run single test file
```

### Mobile App (apps/mobile)
```bash
cd apps/mobile
npm start            # Expo start
npm run android      # Android development
npm run ios          # iOS development
npm run lint         # ESLint
npm run typecheck    # TypeScript check
npm run test         # Jest tests
npm run test:watch   # Jest watch mode
npm run test:coverage # Coverage report
npm test -- path/to/test.ts          # Run single test file
npm test -- --testNamePattern="name" # Run tests matching pattern
```

## Architecture

### Web App Structure (Next.js App Router)

```
src/app/
├── (app)/                    # Authenticated routes (route group)
│   ├── actions.ts            # Shared server actions (signOut, etc.)
│   ├── layout.tsx            # App shell layout (sidebar, header)
│   ├── chamados/             # Tickets module (Purchasing, Maintenance, HR, Claims, etc.)
│   ├── checklists/           # Opening and supervision checklists
│   ├── configuracoes/        # System settings (chamados, checklists, departamentos, etc.)
│   ├── dashboard/            # Main dashboard
│   ├── perfil/               # Logged-in user profile
│   ├── unidades/             # Unit/garage management
│   └── usuarios/             # User management and RBAC
├── (auth)/                   # Authentication routes
│   ├── login/
│   ├── recuperar-senha/
│   └── redefinir-senha/
└── auth/callback/            # OAuth callback handler

src/components/
├── ui/                       # shadcn/ui components (Button, Card, Table, etc.)
└── layout/                   # Layout components (Sidebar, Header, AppShell)

src/hooks/                    # React hooks
├── use-auth.ts               # Authentication state and methods
├── use-permissions.ts        # RBAC permission checks
├── use-profile.ts            # Current user profile
├── use-impersonation.ts      # User impersonation (admin feature)
└── use-mobile.ts             # Mobile detection

src/lib/
├── supabase/
│   ├── client.ts             # Browser client (createBrowserClient)
│   ├── server.ts             # Server components client (createServerClient with cookies)
│   ├── middleware.ts         # Session refresh for middleware
│   └── database.types.ts     # Generated TypeScript types (regenerate after schema changes)
└── utils.ts                  # Utilities (cn for class merging)

src/proxy.ts                  # Authentication middleware (exported in middleware.ts)
```

### Mobile App Structure (Expo)

```
src/
├── modules/                  # Feature modules
│   ├── auth/                 # Authentication (login, password recovery)
│   ├── checklists/           # Opening and supervision checklists
│   ├── tickets/              # Tickets (listing, creation, details)
│   ├── home/                 # Dashboard/home
│   ├── profile/              # User profile
│   └── notifications/        # Notifications (future)
├── navigation/               # React Navigation (Tabs + Stacks)
│   ├── RootNavigator.tsx     # Main navigator
│   ├── MainTabNavigator.tsx  # Bottom tabs
│   └── stacks/               # Stack navigators per feature
├── components/
│   ├── ui/                   # Base components (Button, Input, Card, Badge, etc.)
│   └── guards/               # Route guards (authentication)
├── lib/
│   ├── supabase/             # Supabase client
│   └── observability/        # Sentry integration (hooks, logger)
├── theme/                    # Design tokens (colors, typography, spacing)
└── types/                    # Shared TypeScript types
```

### Authentication Flow
Uses Supabase Auth with SSR support (@supabase/ssr). The `proxy.ts` middleware:
1. Refreshes session tokens via `updateSession()`
2. Protects routes (redirects unauthenticated users to `/login`)
3. Redirects authenticated users away from auth pages
4. Preserves intended destination via `?next=` query param

Public routes: `/login`, `/recuperar-senha`, `/redefinir-senha`, `/auth/callback`

### Server Actions Pattern
Server Actions are placed in `actions.ts` files:
- `(app)/actions.ts` — Shared actions for authenticated routes (signOut)
- `feature/actions.ts` — Feature-specific mutations (create, update, delete)

Always use `"use server"` directive and import `createClient` from `@/lib/supabase/server`.

## Supabase Integration

**Always use Supabase MCP for database operations:**

### Available MCP Tools
- `mcp_supabase_gapp_execute_sql` — SELECT queries (data reading)
- `mcp_supabase_gapp_apply_migration` — DDL changes (CREATE, ALTER, DROP)
- `mcp_supabase_gapp_list_tables` — List existing tables
- `mcp_supabase_gapp_list_migrations` — List applied migrations
- `mcp_supabase_gapp_get_logs` — Debug logs (api, postgres, edge-function, auth, storage, realtime)
- `mcp_supabase_gapp_get_advisors` — Check RLS and performance after DDL changes
- `mcp_supabase_gapp_search_docs` — Search Supabase documentation

### Important Rules
1. **Never execute DDL directly** — always use `apply_migration` to maintain history
2. **Always check security advisors** after creating/altering tables
3. **Generate TypeScript types** after schema changes: `npx supabase gen types typescript`
4. **For simple reads**, prefer `execute_sql` over code calls
5. **Migrations** should be created in `projeto/database/migrations/` and applied via MCP

### Database Structure
- **33 tables** organized by module (authentication, tickets, checklists, units)
- **8 SQL functions** for business logic
- **RLS enabled** on all tables
- **Complete documentation**: `projeto/database/README.md`, `schema.md`, `relationships.md`

## Design System

The system follows a complete Design System documented in `/design-system.md`:

### Visual Identity
- **Primary Color**: Vibrant red `hsl(0, 95%, 60%)` — Garageinn brand identity
- **Font**: Inter (sans-serif)
- **Border Radius**: 8px (base)
- **Spacing**: System based on multiples of 4px

### Web App (shadcn/ui)
- **Components**: `src/components/ui/` (Button, Card, Table, Form, etc.)
- **CSS Variables**: Defined in `src/app/globals.css`
- **Tailwind CSS 4**: With 4px spacing system
- **Dark Mode**: Supported via `next-themes` (`.dark` class)
- **Utilities**: `cn()` from `@/lib/utils` for conditional class merging

### Mobile App
- **Base components**: `src/components/ui/` (Button, Input, Card, Badge, Loading, EmptyState)
- **Design tokens**: `src/theme/` (colors, typography, spacing)
- **Semantic colors**: Success, Warning, Info, Destructive
- **Observability**: Sentry integrated for crash reporting and analytics

### Semantic Colors
- **Success**: `hsl(142, 76%, 36%)` — Confirmations, positive status
- **Warning**: `hsl(38, 92%, 50%)` — Alerts, attention required
- **Info**: `hsl(199, 89%, 48%)` — Information, tips
- **Destructive**: `hsl(0, 84%, 60%)` — Destructive actions, errors

## Environment Variables

### Web App (apps/web)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Optional
```

### Mobile App (apps/mobile)
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_SENTRY_DSN=your-sentry-dsn  # Optional (observability)
```

## Modules and Features

### Tickets
Centralized ticket management system between departments:
- **Departments**: Purchasing, Maintenance, HR, Claims, Commercial, Finance
- **Flow**: Creation → Approvals (when applicable) → Triage → Execution → Resolution → Closure
- **Specific statuses**: Each department has custom statuses (see `projeto/chamados/execuções.md`)
- **Approvals**: Only for Valet → Purchasing/Maintenance (chain: Supervisor → Manager → Director)
- **Documentation**: `projeto/chamados/abertura.md`, `aprovacoes.md`, `execuções.md`

### Checklists
- **Opening Checklist**: Daily, per unit, Yes/No questions, configurable per unit
- **Supervision Checklist**: Per unit, multiple question types, supervisor signature
- **Templates**: Configurable via admin (web), execution on mobile
- **Documentation**: `projeto/database/seeds/checklist_abertura_padrao.sql`

### RBAC and Permissions
- **Multiple roles**: User can have multiple roles in multiple departments
- **Permission union**: System sums permissions from all roles
- **Unit association**: Valet/Supervisor (1 unit), Manager (multiple), Director (all)
- **Documentation**: `projeto/usuarios/PERMISSOES_COMPLETAS.md`, `departamentos_cargos.md`

### Units
- **Complete management**: CRUD of network units/garages
- **Information**: Address, capacity, hours, contacts, infrastructure
- **User association**: Valets and Supervisors linked to specific units

## Conventions

### Commits
- **Always use Conventional Commits**: `feat(tickets): add status filter`
- Examples: `fix(checklists): fix required question validation`, `docs(rbac): update permission documentation`

### Code
- **Portuguese**: UI text and feature naming (chamados, unidades, usuarios)
- **Server Components**: Use by default; Client Components only when necessary
- **Server Actions**: In `actions.ts` files for data mutations
- **TypeScript**: Strict typing, use `database.types.ts` for Supabase types

### Tests
- **Web**: E2E tests with Playwright in `apps/web/e2e/`
- **Mobile**: Unit tests with Jest in `src/**/__tests__/`
- **Coverage**: Maintain minimum 70% coverage for critical components

## Important Documentation

- **PRD**: `projeto/PRD.md` — Complete Product Requirements Document
- **Database**: `projeto/database/README.md` — Database structure, migrations, seeds
- **Design System**: `design-system.md` — Complete design guide
- **Tests**: `projeto/testes/` — Pending tests, bugs, strategies
- **AI Context**: `.context/docs/` — Technical documentation for AI agents
