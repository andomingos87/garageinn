# Research: Botões de Aprovar/Negar por Perfil

## Decision 1: Permissão por transição de status
**Rationale**: A visibilidade de botões deve refletir permissões específicas (aprovar vs executar), não apenas status.
**Alternatives considered**: Ajuste local na UI sem validar backend (rejeitado por risco de bypass).

## Decision 2: Consistência UI + backend
**Rationale**: Mesmo que o frontend esconda botões, o backend deve bloquear ações de perfis não autorizados.
**Alternatives considered**: Somente filtro no frontend (rejeitado por segurança).

## Decision 3: Abrangência por módulos com aprovação
**Rationale**: O padrão de transições é reutilizado em outros módulos, então a regra deve ser aplicada de forma consistente.
**Alternatives considered**: Corrigir apenas Compras (rejeitado por risco de regressão em Manutenção/Financeiro/Comercial).
