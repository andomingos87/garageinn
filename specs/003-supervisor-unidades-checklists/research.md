# Research - Visibilidade de unidades e checklists do supervisor

## Decisions

1. Decision: Usar a RPC `get_user_accessible_units` para obter unidades visiveis por perfil.  
   Rationale: Centraliza a regra de acesso em uma unica fonte e respeita RBAC/RLS.  
   Alternatives considered: Filtrar apenas no client ou usar join direto em cada acao.

2. Decision: Manter a permissao `supervision:read` para liberar submenu e rota de supervisao.  
   Rationale: Permissao ja existente no RBAC e utilizada no guard de acesso atual.  
   Alternatives considered: Criar nova permissao exclusiva para o submenu.

3. Decision: Reorganizar o menu com submenu de Checklists usando os componentes `SidebarMenuSub`.  
   Rationale: Mantem consistencia visual e permite controle de visibilidade por item.  
   Alternatives considered: Manter "Supervisao" como item separado no menu principal.
