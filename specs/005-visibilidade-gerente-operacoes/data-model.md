# Data Model - Visibilidade de chamados do Gerente de Operacoes

## Entities

### Chamado

**Descricao**: Registro da demanda com criador, departamento do chamado e historico de aprovacao.  
**Campos relevantes**:
- id
- ticket_number
- status
- department_id
- unit_id
- created_by
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

**Descricao**: Identifica departamento e cargo do criador e do visualizador.  
**Campos relevantes**:
- user_id
- department_id
- role_id
- role_name

### Departamento

**Descricao**: Classificacao organizacional do usuario e do chamado.  
**Campos relevantes**:
- id
- name
- code

### Cargo

**Descricao**: Funcao do usuario usada para elegibilidade (manobrista, encarregado, supervisor).  
**Campos relevantes**:
- id
- name

## Validation Rules

- Gerente de operacoes visualiza chamados cujo criador e do departamento Operacoes e possui cargo Manobrista, Encarregado ou Supervisor.
- Chamados criados por esses cargos devem ter o gerente como ultima etapa de aprovacao.
- Lista e detalhe devem obedecer as mesmas regras de visibilidade.
- Usuarios nao-gerentes nao ganham visibilidade adicional.

## State Transitions

- Sem novas transicoes de estado; ajuste apenas na cadeia de aprovacao para incluir o gerente como ultima etapa quando aplicavel.

## Observacoes

- Nao ha novas entidades persistidas; a feature usa dados existentes e regras de acesso.
