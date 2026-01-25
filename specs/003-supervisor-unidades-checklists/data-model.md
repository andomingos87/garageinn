# Data Model: Visibilidade de unidades e checklists do supervisor

## Entities

### User
- **Attributes**: id, nome, email
- **Relationships**: possui UserRole, possui vinculos UserUnit

### UserRole
- **Attributes**: user_id, role_id
- **Relationships**: vincula User a Role (define permissoes)

### Role
- **Attributes**: id, name, is_global, department_id (opcional)
- **Relationships**: pertence a Department (quando aplicavel)

### Unit
- **Attributes**: id, name, code, city, region, status
- **Relationships**: possui vinculos UserUnit

### UserUnit
- **Attributes**: user_id, unit_id, is_coverage
- **Relationships**: vincula User a Unit; is_coverage indica cobertura de supervisor

### ChecklistExecution
- **Attributes**: id, unit_id, status, completed_at
- **Relationships**: pertence a Unit

## Validation Rules

- Para supervisor, somente unidades vinculadas via UserUnit com `is_coverage = true` sao elegiveis para `/unidades`.
- A permissao `supervision:read` define acesso ao submenu e a rota de supervisao.
- Quando o usuario nao possui vinculos de unidade, a lista deve ficar vazia.

## State Transitions

- N/A (nao ha fluxo de estados novo para esta feature).
