# Apps Web (Next.js)

## Package Identity
- App web em Next.js (App Router) com UI em `src/components` e logica compartilhada em `src/lib`.

## Setup & Run
- Instalar deps na raiz: `npm install`
- Dev local: `npm run dev` (dentro de `apps/web`)
- Build: `npm run build`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`
- E2E: `npm run test:e2e`

## Patterns & Conventions
- Rotas de pagina em `src/app/**/page.tsx` (ex: `src/app/(app)/chamados/compras/[ticketId]/page.tsx`).
- Rotas de API em `src/app/api/**/route.ts` (ex: `src/app/api/relatorios/chamados/pdf/route.ts`).
- Componentes de UI em `src/components/ui` (ex: `src/components/ui/button.tsx`).
- Layouts e shell em `src/components/layout` (ex: `src/components/layout/app-shell.tsx`).
- Guardas e auth em `src/components/auth` (ex: `src/components/auth/require-permission.tsx`).
- Hooks em `src/hooks` (ex: `src/hooks/use-permissions.ts`).
- Supabase em `src/lib/supabase` (ex: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`).
- RBAC em `src/lib/auth/rbac.ts` (teste em `src/lib/auth/__tests__/rbac.test.ts`).

## Key Files
- `src/app/page.tsx`
- `src/app/(app)/dashboard/page.tsx`
- `src/app/(auth)/login/page.tsx`
- `src/app/api/relatorios/chamados/excel/route.ts`
- `src/components/layout/app-shell.tsx`
- `src/components/ui/button.tsx`
- `src/lib/supabase/client.ts`
- `src/lib/auth/rbac.ts`

## JIT Index Hints
- Rotas API: `rg -n "export const (GET|POST|PUT|DELETE)" src/app/api`
- Paginas: `rg -n "page.tsx" src/app`
- UI: `rg -n "components/ui" -g "*.tsx" src`
- Supabase: `rg -n "supabase" src/lib`
- Hooks: `rg -n "use[A-Z]" src/hooks`

## Common Gotchas
- Secrets server-side ficam em `src/lib/supabase/server.ts`, nunca em client components.
- App Router exige `page.tsx` nas pastas de rota.

## Pre-PR Checks
- `npm run lint && npm run typecheck`
