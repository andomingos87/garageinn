# BUG - Visibilidade de TI na sidebar

Data: 2026-01-24

## Resumo do problema
Usuarios de Operacoes (manobrista e encarregado) estao vendo a aba de TI na sidebar e conseguem acessar a pagina de chamados de TI. Essa area deveria ser exclusiva do setor de TI.

## Escopo afetado
- **Sidebar**: item "TI" nao possui regra de `requireDepartment` ou `requirePermission`, logo aparece para todos.
- **Rotas de TI**: paginas `/chamados/ti`, `/chamados/ti/novo` e `/chamados/ti/[ticketId]` nao possuem guard de acesso explicito.
- **Permissoes**: perfis de Operacoes tem `tickets:*` e `checklists:*`, mas nao ha permissao exclusiva para "area de TI".
- **RLS**: policies permitem acesso por **unidade**, permitindo que Operacoes veja chamados de TI da unidade vinculada.

## Fluxo afetado (end-to-end)
1. Login carrega `useProfile` e `usePermissions`.
2. `AppSidebar` renderiza o menu; item "TI" passa sem filtros.
3. Usuario acessa `/chamados/ti`.
4. Queries de TI rodam e dependem apenas de RLS; como a policy aceita unidade, os registros aparecem.

## Pontos correlatos (risco de repeticao)
- Itens de menu sem restricao explicita (ex.: Checklists) podem estar expostos indevidamente.
- Acesso direto por URL em outras areas departamentais pode ignorar a ausencia do item na sidebar.
- Qualquer area cujo RLS aceite "mesma unidade" pode vazar dados entre departamentos.

## Proposta estrutural (nao implementar aqui)
- **Fonte unica de verdade**: criar matriz de acesso (feature -> departamento/permissao) e reutilizar em menu + guard de rota.
- **Guard server-side**: bloquear rotas de TI para nao-TI (exibir `AccessDenied`).
- **Revisar RLS**: impedir que tickets de TI sejam visiveis apenas por unidade; exigir departamento TI ou admin.

## Risco de regressao
- **Alto** se hoje usuarios nao-TI precisam abrir chamados de TI via hub; a restricao pode bloquear esse fluxo.
- **Medio/alto** ao ajustar RLS: impacta listas, relatorios e filtros que dependem do escopo atual.

## Referencias
- `apps/web/src/components/layout/app-sidebar.tsx`
- `apps/web/src/components/auth/require-permission.tsx`
- `apps/web/src/hooks/use-permissions.ts`
- `apps/web/src/hooks/use-profile.ts`
- `apps/web/src/lib/auth/permissions.ts`
- `apps/web/src/lib/auth/rbac.ts`
- `apps/web/src/app/(app)/chamados/ti/page.tsx`
- `apps/web/src/app/(app)/chamados/ti/novo/page.tsx`
- `apps/web/src/app/(app)/chamados/ti/[ticketId]/page.tsx`
- `apps/web/src/app/(app)/chamados/ti/actions.ts`
- `docs/database/migrations/003_create_rls_policies.sql`
- `docs/database/migrations/004_create_ticket_it_details.sql`
