# Research - Correcao da visibilidade de chamados por perfil

## Decision 1

**Decision**: Aplicar regras de visibilidade no servidor (server actions) para listagem e detalhe dos chamados de Compras.  
**Rationale**: Garante consistencia entre lista e detalhe e evita bypass via URL, alinhando com RBAC e RLS.  
**Alternatives considered**: Filtragem apenas no cliente; confiar somente em RLS sem logica de negocio adicional.

## Decision 2

**Decision**: Reaproveitar status existentes de aprovacao (ex.: `awaiting_approval_gerente`) para controlar elegibilidade por perfil.  
**Rationale**: Evita alteracoes no modelo de dados e preserva o fluxo atual de aprovacoes.  
**Alternatives considered**: Criar novo status especifico para "aguardando gerente" ou tabela auxiliar de visibilidade.

## Decision 3

**Decision**: Nao introduzir novos endpoints; ajustar consultas existentes (`tickets_with_details`) com filtros de perfil/unidade.  
**Rationale**: Reduz impacto e risco, mantendo contratos de API estaveis.  
**Alternatives considered**: Criar endpoints dedicados para cada perfil.
