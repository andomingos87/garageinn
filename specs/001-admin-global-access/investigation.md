# Investigacao - Acesso admin nao aparece na sidebar

## Contexto

Usuarios com cargo global (admin) nao veem os menus "Usuarios" e
"Configuracoes" na sidebar. Na pagina de perfil, aparece "Sem cargo definido".
O acesso direto a `/usuarios` e `/configuracoes` funciona.

## Reproducao (Playwright MCP)

1. Encerrar impersonacao ativa (banner "Você está visualizando como...").
2. Login com `admin@garageinn.com.br`.
3. Verificar sidebar no dashboard.
4. Acessar `/perfil`, `/usuarios` e `/configuracoes`.

## Observado

- Sidebar mostra apenas "Inicio", "Chamados" e "Checklists".
- Perfil exibe "Sem cargo definido".
- `/usuarios` e `/configuracoes` abrem normalmente.

## Evidencias

- `.playwright-mcp/admin-sidebar-after-login.png`
- `.playwright-mcp/admin-profile-sem-cargo.png`
- `.playwright-mcp/admin-usuarios-access.png`
- `.playwright-mcp/admin-configuracoes-access.png`

## Verificacao de dados (Supabase)

Usuario de teste `admin@garageinn.com.br` possui cargo global:

- `user_roles`: 1 linha com role `Administrador` (is_global = true).
- `profiles`: status ativo, nome "Administrador do Sistema".

## Inspecao de codigo

### 1) Hook de permissoes (client)

`apps/web/src/hooks/use-permissions.ts`:

- Consulta `user_roles` e faz join com `roles`.
- Mapeia `ur.role` como **array**, mas a relacao `user_roles -> roles`
  e **many-to-one**, logo o retorno padrao do Supabase e **objeto**.
- O filtro `ur.role && ur.role.length > 0` falha e remove todas as roles.
- Resultado: `permissions` vazio -> `RequirePermission` nao libera a sidebar.

### 2) Perfil (server)

`apps/web/src/app/(app)/perfil/actions.ts`:

- Mesma abordagem de mapeamento (`role` como array).
- Resultado: `profile.roles` vazio -> UI mostra "Sem cargo definido".

### 3) Listagem de usuarios

`apps/web/src/app/(app)/usuarios/actions.ts`:

- Tambem usa `role` como array; departamentos aparecem como `-`.

## Hipotese de causa raiz

**Mapeamento incorreto do formato de `role`** nas consultas com join.
Para relacao many-to-one, o Supabase retorna **objeto**, nao array.
Isso zera as roles no frontend e no server, causando:

- Menus ocultos na sidebar (client-side RBAC).
- Perfil exibindo "Sem cargo definido".
- Departamentos vazios na listagem de usuarios.

## Proxima acao sugerida (nao aplicada aqui)

Atualizar o mapeamento para aceitar objeto ou array:

- `const role = Array.isArray(ur.role) ? ur.role[0] : ur.role;`
- Aplicar em:
  - `apps/web/src/hooks/use-permissions.ts`
  - `apps/web/src/app/(app)/perfil/actions.ts`
  - `apps/web/src/app/(app)/usuarios/actions.ts`

Opcional: ajustar os tipos para refletir o formato correto do Supabase.
