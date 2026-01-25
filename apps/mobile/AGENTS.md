# Apps Mobile (Expo)

## Package Identity
- App mobile em Expo/React Native com modulos por feature em `src/modules`.

## Setup & Run
- Instalar deps na raiz: `npm install`
- Dev local: `npm run start` (dentro de `apps/mobile`)
- Android: `npm run android`
- iOS: `npm run ios`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`
- Tests: `npm run test`

## Patterns & Conventions
- Telas em `src/modules/**/screens` (ex: `src/modules/tickets/screens/TicketsListScreen.tsx`).
- Servicos em `src/modules/**/services` (ex: `src/modules/tickets/services/ticketsService.ts`).
- Hooks por feature em `src/modules/**/hooks` (ex: `src/modules/auth/hooks/useAuth.ts`).
- UI compartilhada em `src/components/ui` (ex: `src/components/ui/Button.tsx`).
- Navegacao em `src/navigation` (ex: `src/navigation/RootNavigator.tsx`).
- Supabase em `src/lib/supabase` (ex: `src/lib/supabase/client.ts`).
- Tema em `src/theme` (ex: `src/theme/colors.ts`).
- Observabilidade em `src/lib/observability/sentry.ts`.

## Key Files
- `App.tsx`
- `src/navigation/RootNavigator.tsx`
- `src/modules/auth/context/AuthContext.tsx`
- `src/modules/tickets/screens/TicketsListScreen.tsx`
- `src/modules/checklists/services/checklistService.ts`
- `src/components/ui/Button.tsx`
- `src/lib/supabase/client.ts`
- `src/theme/colors.ts`

## JIT Index Hints
- Telas: `rg -n "Screen" src/modules`
- Servicos: `rg -n "services" src/modules -g "*.ts"`
- Hooks: `rg -n "use[A-Z]" src/modules -g "*.ts*"`
- Navegacao: `rg -n "Navigator|Navigation" src/navigation -g "*.tsx"`
- Supabase: `rg -n "supabase" src/lib`

## Common Gotchas
- `.env` precisa ficar em `apps/mobile/.env` com prefixo `EXPO_PUBLIC_*`.
- Expo precisa de restart apos mudar `.env`.

## Pre-PR Checks
- `npm run lint && npm run typecheck && npm run test`
