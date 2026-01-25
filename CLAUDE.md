# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GarageInn App (GAPP) is a monorepo for an operational management system for parking garages. It handles tickets (chamados), checklists, units, and user management with a role-based access control (RBAC) system.

## Commands

### Root-level (monorepo)
```bash
npm run dev:web         # Start web dev server
npm run dev:mobile      # Start mobile app
npm run build:web       # Build web for production
npm run lint            # Lint all workspaces
npm run typecheck       # Type-check all workspaces
```

### Web app (apps/web)
```bash
npm run dev             # Start Next.js dev server
npm run build           # Build (runs typecheck first)
npm run lint:fix        # Auto-fix lint errors
npm run format          # Format with Prettier
npm run test:e2e        # Run Playwright E2E tests
npm run test:e2e:ui     # Run E2E tests with UI
```

### Mobile app (apps/mobile)
```bash
npm run start           # Start Expo
npm run android         # Start Android
npm run ios             # Start iOS
npm test                # Run Jest tests
npm run test:watch      # Run tests in watch mode
```

## Architecture

### Monorepo Structure
- `apps/web` - Next.js 16 web application (App Router)
- `apps/mobile` - React Native/Expo mobile application

### Web App Architecture

**Tech Stack**: Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui, Supabase

**Key Directories**:
- `src/app/(app)/` - Authenticated routes (dashboard, chamados, checklists, usuarios, unidades, configuracoes, relatorios)
- `src/lib/auth/` - RBAC system (permissions.ts, rbac.ts, impersonation.ts)
- `src/lib/supabase/` - Supabase clients (client.ts, server.ts, middleware.ts)
- `src/components/layout/` - App shell, sidebar, header
- `src/hooks/` - Custom hooks (use-auth, use-permissions, use-impersonation)

**RBAC System** (`src/lib/auth/permissions.ts`):
- Global roles: Desenvolvedor, Diretor, Administrador (full admin:all access)
- Department-based roles with specific permissions per department (Operações, Compras e Manutenção, Financeiro, TI, RH, Comercial, Auditoria, Sinistros)
- Permission types: users:*, units:*, tickets:*, checklists:*, supervision:*, settings:*, reports:*, admin:all

**Ticket Types (Chamados)**:
- Compras (purchases)
- Manutenção (maintenance)
- RH (human resources)
- TI (information technology)
- Sinistros (claims)
- Comercial (commercial)
- Financeiro (financial)

### Database

PostgreSQL via Supabase with Row-Level Security (RLS). Key tables:
- `profiles`, `departments`, `roles`, `user_roles`, `user_units`
- `units`
- `tickets`, `ticket_*` (various ticket-related tables per type)
- `checklist_templates`, `checklist_questions`, `checklist_executions`, `checklist_answers`

Regenerate TypeScript types: `npx supabase gen types typescript`

## Important Conventions

### ESM Imports
Always include `.js` extension in relative imports for backend/shared code (required for production on Vercel):
```typescript
// Correct
import { db } from "./db.js";

// Incorrect (fails in production)
import { db } from "./db";
```

### Server Actions
Server Actions are co-located with pages in `actions.ts` files within each route directory.

### E2E Testing
Use Playwright MCP for E2E validation. Save screenshots to `.playwright-mcp/` when needed.

### Database Operations
Use Supabase MCP tools for database operations when available.
