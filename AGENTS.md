# AGENTS.md

## About the Project

**GAPP (Garageinn App)** is a SaaS platform for managing tickets and operational checklists for the Garageinn parking network. The system uses role-based access control (RBAC) to manage permissions across multiple departments and roles.

### Monorepo Structure

- **apps/web**: Next.js 16 application (React 19, Tailwind CSS 4) for administrative management
- **apps/mobile**: Expo/React Native app (SDK 54) for field operations
- **supabase/**: Supabase Edge Functions and migrations
- **projeto/**: Requirements documentation, PRD, tests, and specifications

### Main Modules

- **Tickets**: Ticket system by department (Purchasing, Maintenance, HR, Claims, Commercial, Finance)
- **Checklists**: Opening and supervision checklists per unit
- **Units**: Management of network units/garages
- **Users**: User management with RBAC (multiple roles/departments)
- **RBAC**: Permission system based on department, role, and unit association

## Dev environment tips

### Web App (apps/web)
```bash
cd apps/web
npm install          # Install dependencies
npm run dev         # Development server (Next.js)
npm run build       # Production build
npm run lint        # ESLint
npm run lint:fix     # Fix lint errors
npm run format      # Prettier
npm run test:e2e     # E2E tests (Playwright)
```

### Mobile App (apps/mobile)
```bash
cd apps/mobile
npm install          # Install dependencies
npm start           # Expo dev server
npm run android      # Android
npm run ios         # iOS
npm run lint         # ESLint
npm run typecheck    # TypeScript check
npm test             # Jest tests
npm run test:watch   # Jest watch mode
```

### Database
- **Always use Supabase MCP** for database operations (see section below)
- After schema changes, regenerate types: `npx supabase gen types typescript`
- Migrations in `projeto/database/migrations/`
- Seeds in `projeto/database/seeds/`

## Testing instructions

### Web App
- Run `npm run test:e2e` for E2E tests with Playwright
- Use `npm run test:e2e:ui` for interactive mode
- Impersonation tests in `apps/web/e2e/impersonation.spec.ts

### E2E Testing with Playwright MCP
- **Use Playwright MCP for interactive E2E testing during development**
- See `.context/docs/e2e-testing-playwright-mcp.md` for complete guide
- Use MCP for: visual validation, permission testing, impersonation flows, bug validation
- Screenshots saved to `.playwright-mcp/` directory
- **Rule:** Always use Playwright MCP to validate bug fixes visually before marking as resolved

### Mobile App
- Run `npm test` to run the Jest suite
- Use `npm run test:watch` during development
- Use `npm run test:coverage` for coverage report
- Tests in `src/components/ui/__tests__/` and `src/theme/__tests__/`

## PR instructions

- **Always use Conventional Commits**: `feat(tickets): add status filter`
- **Cross-link**: Reference new modules in `projeto/PRD.md` and relevant documentation
- **Tests**: Add or update tests along with code changes
- **Documentation**: Update `.context/docs/` when necessary
- **RLS**: Always check security advisors after DDL changes

## Repository map

### Main Documentation
- `projeto/PRD.md` — Complete Product Requirements Document
- `projeto/database/` — Schema, migrations, seeds, and database documentation
- `projeto/chamados/` — Opening, approval, and execution specifications
- `projeto/testes/` — Pending tests, bugs, and testing strategies
- `projeto/usuarios/` — Department, role, and permission documentation
- `design-system.md` — Complete Design System (colors, components, tokens)

### Assets
- `favicon.ico` — Web application favicon
- `logo-garageinn.png` — Main Garageinn brand logo
- `apps/web/public/` — Public assets for web app
- `apps/mobile/assets/` — Mobile app assets

### AI Context
- `.context/docs/` — Technical documentation for AI agents
- `.context/agents/` — Specialized agent playbooks
- `.context/plans/` — Implementation plans

### Configuration
- `apps/web/next.config.ts` — Next.js configuration
- `apps/mobile/app.json` — Expo configuration
- `apps/web/components.json` — shadcn/ui configuration

## Supabase MCP Integration
This project uses **Supabase** as the backend. **Always use Supabase MCP** for database operations:

### When to use Supabase MCP:
- **Database queries**: Use `mcp_supabase_gapp_execute_sql` for SELECT queries
- **Schema changes**: Use `mcp_supabase_gapp_apply_migration` for DDL (CREATE, ALTER, DROP)
- **Check structure**: Use `mcp_supabase_gapp_list_tables` to list existing tables
- **Generate types**: Use `mcp_supabase_gapp_search_docs` to search Supabase documentation
- **Debug**: Use `mcp_supabase_gapp_get_logs` to investigate errors
- **Security**: Use `mcp_supabase_gapp_get_advisors` after DDL changes to verify RLS

### Important rules:
1. **Never execute DDL directly** — always use `apply_migration` to maintain history
2. **Always check security advisors** after creating/altering tables
3. **Generate TypeScript types** after schema changes to keep typing up to date
4. For simple read operations, prefer `execute_sql` over code calls

### RLS Best Practices for UPDATE Policies

> ⚠️ **Critical Rule**: In PostgreSQL, when an UPDATE policy **does not have `WITH CHECK`**, the `USING` clause is applied to both the OLD and NEW row. This causes silent failures when UPDATE modifies columns referenced in `USING`.

**Required pattern for UPDATE policies:**

```sql
-- ✅ CORRECT: Explicit WITH CHECK
CREATE POLICY example_update ON table_name
FOR UPDATE TO authenticated
USING (
  -- Checks permission to ACCESS the original row
  owner_id = auth.uid()
)
WITH CHECK (
  -- Checks if the NEW value is allowed
  -- Use (true) if any new value is accepted
  true
);

-- ❌ INCORRECT: Without WITH CHECK
CREATE POLICY example_update ON table_name
FOR UPDATE TO authenticated
USING (status = 'pending');  -- FAILS if UPDATE changes status!
```

**When to use `WITH CHECK (true)`:**
- The intention is only to verify if the user can access the row
- There are no restrictions on new values

**When to define specific `WITH CHECK`:**
- There are restrictions on which values the user can set
- Ex: `WITH CHECK (priority <= user_max_priority)`

**Debugging RLS 42501 Errors:**
1. List ALL policies for the table: `SELECT * FROM pg_policies WHERE tablename = 'x'`
2. Check `with_check` of each policy - if NULL, `USING` will be used
3. Mentally simulate the UPDATE: will the `USING` condition be valid AFTER the UPDATE?
4. Remember: multiple PERMISSIVE policies have their `WITH CHECK` combined with AND

**Complete reference:** `.context/docs/rls-patterns.md`

## Modules and Features

### Tickets
- **Departments**: Purchasing, Maintenance, HR, Claims, Commercial, Finance
- **Flow**: Creation → Approvals (when applicable) → Triage → Execution → Resolution → Closure
- **Specific statuses**: Each department has custom statuses (see `projeto/chamados/execuções.md`)
- **Approvals**: Only for Valet → Purchasing/Maintenance (chain: Supervisor → Manager → Director)

### Checklists
- **Opening Checklist**: Daily, per unit, Yes/No questions
- **Supervision Checklist**: Per unit, multiple question types, supervisor signature
- **Templates**: Configurable per unit (admin on web, execution on mobile)

### RBAC and Permissions
- **Multiple roles**: User can have multiple roles in multiple departments
- **Permission union**: System sums permissions from all roles
- **Unit association**: Valet/Supervisor (1 unit), Manager (multiple), Director (all)
- **Complete documentation**: `projeto/usuarios/PERMISSOES_COMPLETAS.md`

### Database
- **33 tables** organized by module (authentication, tickets, checklists, units, etc.)
- **8 SQL functions** for business logic
- **RLS (Row Level Security)**: All tables protected by RLS policies
- **Documentation**: `projeto/database/README.md`, `schema.md`, `relationships.md`

## AI Context References
- **Documentation index**: `.context/docs/README.md`
- **Agent playbooks**: `.context/agents/README.md` (if exists)
- **Project overview**: `.context/docs/project-overview.md`
- **Architecture**: `.context/docs/architecture.md`
- **RLS Patterns**: `.context/docs/rls-patterns.md` ⚠️ **Required reading**
- **Development workflow**: `.context/docs/development-workflow.md`
