# Data Model: RBAC Operacoes

## Entities

### User
- **Attributes**: id, name, email, department_id (referencia indireta via roles)
- **Relationships**: possui um ou mais UserRole

### Department
- **Attributes**: id, name
- **Relationships**: possui muitos Role

### Role
- **Attributes**: id, name, is_global, department_id (opcional)
- **Relationships**: pertence a Department (quando nao global)

### UserRole
- **Attributes**: user_id, role_id
- **Relationships**: vincula User a Role

### Permission
- **Attributes**: code, description
- **Relationships**: mapeada a Role (matriz RBAC)

### ModuleSection
- **Attributes**: key, label
- **Relationships**: associada a Permission para liberar acesso em navegacao

## Validation Rules

- Role.name e Department.name devem corresponder exatamente ao cadastro no banco.
- Para Operacoes, somente os cargos Manobrista, Encarregado, Supervisor e Gerente sao considerados no escopo.

## State Transitions

- N/A (nao ha fluxo de estados para esta feature).
