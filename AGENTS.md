# Garageinn App

## Project Snapshot
- Monorepo com npm workspaces: `apps/web` (Next.js) e `apps/mobile` (Expo/React Native).
- Backend e dados via Supabase (edge functions em `supabase/functions`, SQL e schema em `docs/database`).
- Testes: Playwright (web) e Jest (mobile).
- Documentacao e specs vivem em `docs/` e `specs/`.

## Root Setup Commands
- Instalar dependencias: `npm install`
- Web dev: `npm run dev:web`
- Mobile dev: `npm run dev:mobile`
- Build web: `npm run build:web`
- Lint all: `npm run lint`
- Typecheck all: `npm run typecheck`
- Tests all: `npm run test`
- E2E web: `npm run test:e2e`
- Format check: `npm run format:check`

## Universal Conventions
- Preferir TypeScript e seguir o padrao de arquivos ja existente em cada app.
- Variaveis de ambiente: web em `apps/web/.env.local` (prefixo `NEXT_PUBLIC_*`), mobile em `apps/mobile/.env` (prefixo `EXPO_PUBLIC_*`).
- Nunca commitar `.env` ou chaves de acesso; service role apenas server-side.
- Para Next.js, mantenha a estrutura em `apps/web/src/app` (App Router).
- Use `npm run lint` e `npm run format` antes de PR quando mexer em UI.

## Security & Secrets
- Nao inclua chaves ou PII em commits, logs ou fixtures.
- `SUPABASE_SERVICE_ROLE_KEY` nunca deve ir para o client.
- URLs/anon keys sao publicas, mas ainda devem ficar somente em `.env`.

## JIT Index
### Package Structure
- Web UI: `apps/web/` -> ver `apps/web/AGENTS.md`
- Mobile: `apps/mobile/` -> ver `apps/mobile/AGENTS.md`
- Supabase: `supabase/`
- SQL, schema e seeds: `docs/database/`
- Specs e requisitos: `specs/`

### Quick Find Commands
- Buscar componente web: `rg -n "export (function|const) .*" apps/web/src`
- Buscar hooks web: `rg -n "use[A-Z]" apps/web/src`
- Buscar rotas Next: `rg -n "export const (GET|POST|PUT|DELETE)" apps/web/src`
- Buscar tela mobile: `rg -n "function .*Screen|const .*Screen" apps/mobile/src`
- Buscar edge functions: `rg -n "Deno\.serve|createClient" supabase/functions`
- Buscar schema/SQL: `rg -n "CREATE TABLE|CREATE FUNCTION" docs/database`

## Deploy (Vercel - Web)
- Root Directory: `apps/web`
- Build Command: `npm run build` (executado dentro de `apps/web`)
- Output Directory: `.next`
- Node version: use o valor do `.nvmrc` (atual: 24)
- Variaveis web: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL` (opcional), `SUPABASE_SERVICE_ROLE_KEY` (somente server-side)
- Referencia: `apps/ENV_SETUP.md`

## Definition of Done
- `npm run lint` e `npm run typecheck` passaram
- Testes relevantes rodaram (web: `npm run test:e2e` quando mudar fluxo critico)
- Sem secrets adicionados, `.env` intactos
## AI Context References
- Documentation index: `.context/docs/README.md`
- Agent playbooks: `.context/agents/README.md`

