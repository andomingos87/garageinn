# Research - Visibilidade de TI na sidebar

## Decisions

1. Decision: Regra unica de elegibilidade para acesso a TI (departamento TI ou perfil global/admin).  
   Rationale: Evita inconsistencias entre menu e rota e reduz risco de exposicao indevida.  
   Alternatives considered: Verificacao apenas no menu ou apenas nas rotas.

2. Decision: Bloqueio server-side nas rotas de TI com mensagem de acesso negado.  
   Rationale: Protege contra acesso por URL direta e evita renderizacao de dados sensiveis.  
   Alternatives considered: Apenas redirecionar no cliente.

3. Decision: Manter o escopo de acesso alinhado ao RBAC existente, sem criar novas permissões.  
   Rationale: Evita aumento de complexidade e reaproveita o modelo de cargos/departamentos.  
   Alternatives considered: Criar permissao exclusiva para "area de TI".
