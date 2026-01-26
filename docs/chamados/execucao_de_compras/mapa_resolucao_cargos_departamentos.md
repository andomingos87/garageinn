# Mapeamento: resolucao de cargos por departamento

## Objetivo
Documentar onde e como o sistema resolve cargo + departamento (DB e app), e
mapear pontos de inconsistencia que podem gerar erros como
`column ur.department_id does not exist`.

## Modelo de dados (fonte de verdade)
- Tabela `user_roles` nao possui `department_id`.
- A relacao de departamento fica em `roles.department_id`.

Fonte:
- `docs/database/migrations/001_create_tables.sql`

## Banco de dados (Supabase)

### Funcoes de aprovacao (Operacoes)
- `supabase/migrations/20260125192945_approval_flow_functions.sql`
  - `get_highest_operacoes_role()`
  - Usa join correto: `user_roles -> roles -> departments`

- `supabase/migrations/20260125203030_fix_rls_approval_policies.sql`
  - `get_user_operacoes_role_name()`
  - **Join incorreto**: `JOIN departments d ON ur.department_id = d.id`
  - `can_approve_ticket()` depende dessa funcao
  - Politicas RLS `ticket_approvals_update_approver` e `tickets_update_approver`
    dependem de `can_approve_ticket()`

### Politicas de compras (RLS)
- `supabase/migrations/20260125_fix_compras_rls.sql`
  - Usa join correto: `user_roles -> roles -> departments`

### Observacao
O unico uso de `ur.department_id` em runtime esta em
`get_user_operacoes_role_name()` (migration 20260125203030). O schema atual
nao contem essa coluna, gerando o erro reportado.

## Aplicacao Web (Next.js)

### Hooks e RBAC
- `apps/web/src/hooks/use-permissions.ts`
  - Busca `user_roles` com join em `roles` e `departments`
  - Converte em `UserRole` e calcula permissoes via `rbac.ts`

- `apps/web/src/hooks/use-profile.ts`
  - Carrega perfil + `user_roles` e resolve `role -> department`

- `apps/web/src/lib/auth/rbac.ts` + `permissions.ts`
  - Mapeia permissoes por cargo e departamento (strings devem bater com DB)

### Fluxo de compras (aprovacoes)
- `apps/web/src/app/(app)/chamados/compras/actions.ts`
  - `getUserRoles()` resolve cargos + departamentos
  - `buildPurchaseVisibilityFilter()` usa departamento "Operacoes" e
    "Compras e Manutencao"

- `apps/web/src/app/(app)/chamados/compras/[ticketId]/page.tsx`
  - `getUserRole()` filtra `user_roles` por `departments.name = 'Operacoes'`
    e escolhe o cargo mais alto

### Outros pontos com resolucao cargo/departamento (lista de ocorrencias)
Arquivos que fazem join `user_roles -> roles -> departments` ou filtram por
departamento:
- `apps/web/src/app/(app)/chamados/ti/actions.ts`
- `apps/web/src/app/(app)/chamados/rh/actions.ts`
- `apps/web/src/app/(app)/chamados/manutencao/actions.ts`
- `apps/web/src/app/(app)/chamados/sinistros/actions.ts`
- `apps/web/src/app/(app)/chamados/financeiro/actions.ts`
- `apps/web/src/app/(app)/chamados/comercial/actions.ts`
- `apps/web/src/app/(app)/chamados/sinistros/[ticketId]/actions.ts`
- `apps/web/src/app/(app)/unidades/actions.ts`
- `apps/web/src/app/(app)/checklists/configurar/actions.ts`
- `apps/web/src/app/(app)/usuarios/actions.ts`
- `apps/web/src/app/(app)/perfil/actions.ts`
- `apps/web/src/app/(app)/relatorios/supervisao/actions.ts`
- `apps/web/src/app/(app)/relatorios/chamados/actions.ts`
- `apps/web/src/app/(app)/configuracoes/departamentos/actions.ts`
- `apps/web/src/app/(app)/configuracoes/chamados/actions.ts`
- `apps/web/src/app/(app)/checklists/executar/actions.ts`
- `apps/web/src/app/(app)/chamados/admin/actions.ts`

## Risco sistemico identificado
- A logica de "cargo por departamento" esta duplicada em:
  - Funcoes SQL (RLS e RPCs)
  - Server actions
  - Hooks de client
- Uma unica divergencia de join (ex.: `ur.department_id`) quebra fluxo critico
  de aprovacao em runtime, pois ocorre dentro de RLS.

## Proposta estrutural (sem aplicar)
- Centralizar resolucao de cargo/dep:
  - Criar view ou funcao SQL unica (ex.: `user_roles_with_department`)
  - Usar esse helper em todas as funcoes/RLS relevantes
- No app, preferir um helper server-side unico para resolver "cargo mais alto"
  por departamento, evitando duplicacao entre actions e hooks.

## Resumo da causa do erro atual
O erro `column ur.department_id does not exist` ocorre porque o schema real
nao possui essa coluna em `user_roles`, mas a funcao
`get_user_operacoes_role_name()` foi implementada assumindo que ela existe.
