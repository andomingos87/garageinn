# Data Model: Botões de Aprovar/Negar por Perfil

## Entities

### Chamado (Ticket)
- **Core fields**: `id`, `status`, `department_id`
- **Status control**: transições de status devem respeitar permissões por perfil

### Perfil/Permissão
- **Perfil**: conjunto de permissões atribuídas ao usuário
- **Permissão**: ações permitidas no fluxo (ex.: aprovar, negar, executar)

## Relationships
- Um usuário possui um ou mais perfis/roles.
- Um perfil define permissões aplicáveis às transições de status.

## Validation Rules
- Transição de status deve ser permitida e autorizada para o perfil do usuário.
- Ações de aprovação/negação só podem ser executadas por perfis autorizados.
