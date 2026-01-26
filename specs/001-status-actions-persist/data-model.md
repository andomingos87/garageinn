# Data Model: Persistência de Ações de Status (Compras + Manutenção)

## Entities

### Chamado (Ticket)
- **Core fields**: `id`, `ticket_number`, `status`, `department_id`, `assigned_to`, `created_by`, `updated_at`
- **Status control**: `status` representa a etapa do fluxo; transições devem respeitar o fluxo permitido
- **Negação**: `denial_reason` deve existir quando status = negado
- **Encerramento**: `closed_at` quando status = fechado (quando aplicável)

### Transição de Status (Status Transition)
- **Logical event** (registro em histórico existente)
- **Fields (logical)**: `ticket_id`, `from_status`, `to_status`, `changed_by`, `changed_at`, `reason` (quando negado)
- **Rule**: apenas transições válidas conforme fluxo de Compras/Manutenção

### Usuário Autorizado
- Perfil com permissão para executar ações do fluxo (inclui Admin)

## Relationships
- Um Chamado possui múltiplas Transições de Status.
- Um Usuário Autorizado pode registrar Transições de Status em Chamados dentro do seu escopo.

## Validation Rules
- Transição deve estar na lista de transições permitidas para o status atual.
- Negação exige motivo obrigatório.
- Atualização inválida deve retornar erro e não persistir mudança.
