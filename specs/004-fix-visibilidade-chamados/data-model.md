# Data Model - Visibilidade de chamados por perfil

## Entities

### Chamado

**Descricao**: Registro da demanda, com status e contexto de unidade/departamento.  
**Campos relevantes**:
- id
- ticket_number
- status
- department_id
- unit_id
- created_by
- assigned_to_id
- created_at

### Aprovacao de Chamado

**Descricao**: Etapas de aprovacao associadas ao chamado.  
**Campos relevantes**:
- id
- ticket_id
- approval_level
- approval_role
- status (pending/approved/rejected)
- approved_by

### Perfil de Usuario

**Descricao**: Papel do usuario que define visibilidade.  
**Campos relevantes**:
- role_id
- role_name (Gerente, Assistente de Compras, Supervisor, etc.)
- department_id (quando aplicavel)

### Unidade

**Descricao**: Unidade organizacional associada ao chamado e ao gerente responsavel.  
**Campos relevantes**:
- id
- name
- code

## Validation Rules

- Gerente de operacoes visualiza chamados elegiveis das unidades sob sua responsabilidade.
- Assistente de compras nao visualiza chamados com status "awaiting_approval_gerente".
- Lista e detalhe obedecem as mesmas regras de visibilidade por perfil.

## State Transitions

- Sem novas transicoes de estado; usa o fluxo atual de aprovacao (encarregado -> supervisor -> gerente -> triagem).

## Observacoes

- Nao ha novas entidades persistidas; a feature usa dados existentes e a view `tickets_with_details`.
