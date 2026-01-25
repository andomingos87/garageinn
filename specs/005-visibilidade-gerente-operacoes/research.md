# Research - Visibilidade de chamados do Gerente de Operacoes

## Decision 1

**Decision**: Aplicar a regra de visibilidade baseada no criador na camada de dados (RLS/view) e reaproveitar essa regra nas consultas de lista e detalhe.  
**Rationale**: Garante consistencia de seguranca entre lista e detalhe e evita bypass via cliente.  
**Alternatives considered**: Filtrar apenas no cliente; filtrar apenas em server actions sem enforcement no banco.

## Decision 2

**Decision**: Ajustar a geracao da cadeia de aprovacoes para incluir o gerente de operacoes como ultima etapa quando o criador for Operacoes (manobrista/encarregado/supervisor).  
**Rationale**: Preserva governanca e padroniza o fluxo de aprovacao independentemente do departamento do chamado.  
**Alternatives considered**: Regras manuais de aprovacao; manter fluxo atual e tratar excecao apenas no frontend.

## Decision 3

**Decision**: Nao criar novos endpoints; manter consultas e contratos existentes, ajustando filtros e regras de visibilidade.  
**Rationale**: Reduz impacto, evita mudancas de integracao e mantem estabilidade do sistema.  
**Alternatives considered**: Criar endpoints dedicados para lista do gerente e para aprovacao final.
