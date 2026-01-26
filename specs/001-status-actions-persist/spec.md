# Feature Specification: Persistência de Ações de Status (Compras)

**Feature Branch**: `001-status-actions-persist`  
**Created**: 2026-01-25  
**Status**: Draft  
**Input**: User description: "@docs/chamados/execucao_de_compras/bug_acoes_status_nao_persistem.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mudança de Status Persistente (Priority: P1)

Como comprador, ao clicar em ações de status do chamado (ex.: iniciar andamento ou iniciar cotação), preciso que a mudança seja efetivamente salva e refletida na tela, para ter confiança de que o fluxo avançou.

**Why this priority**: O bug bloqueia o fluxo e cria retrabalho; sem persistência não há execução.

**Independent Test**: Pode ser testado ao clicar em uma ação de status e validar que o status atualizado aparece na tela e permanece após recarregar.

**Acceptance Scenarios**:

1. **Given** um chamado em status permitido para avançar, **When** o comprador clica em uma ação de status, **Then** o novo status deve aparecer imediatamente na tela e permanecer após atualizar a página.
2. **Given** uma ação de status concluída com sucesso, **When** o usuário revisita o chamado, **Then** o status exibido deve corresponder ao estado persistido.

---

### User Story 2 - Feedback Confiável ao Usuário (Priority: P1)

Como comprador, preciso receber mensagens de sucesso ou erro que correspondam ao resultado real da operação, para não ser induzido ao erro.

**Why this priority**: O feedback atual é enganoso e causa perda de tempo.

**Independent Test**: Pode ser testado forçando uma tentativa de mudança inválida e verificando que o sistema não exibe mensagem de sucesso.

**Acceptance Scenarios**:

1. **Given** uma tentativa de mudança de status que falha, **When** o usuário realiza a ação, **Then** o sistema deve exibir mensagem de erro e manter o status anterior.
2. **Given** uma mudança de status bem-sucedida, **When** o sistema confirma a operação, **Then** a mensagem de sucesso deve corresponder ao status persistido.

---

### User Story 3 - Negação com Registro de Motivo (Priority: P2)

Como comprador, ao negar um chamado, preciso informar o motivo e ter a negação registrada no histórico do chamado, para garantir rastreabilidade.

**Why this priority**: A negação é uma decisão crítica e deve ser auditável.

**Independent Test**: Pode ser testado ao negar um chamado com motivo e validar o status e o registro do motivo.

**Acceptance Scenarios**:

1. **Given** um chamado elegível para negação, **When** o comprador informa o motivo e confirma, **Then** o status muda para negado e o motivo fica registrado e visível.

---

### Edge Cases

- Mudança de status tentada sem permissão adequada.
- Conflito de atualização quando dois usuários tentam mudar o status simultaneamente (última gravação prevalece com notificação ao usuário impactado).
- Falha temporária de rede durante a confirmação.
- Tentativa de transição para status não permitido pelo fluxo.

## Clarifications

### Session 2026-01-25

- Q: Quais perfis devem ser contemplados pela persistência e feedback correto das ações de status? → A: Todos os perfis com permissão no fluxo (inclui Admin)
- Q: Quando dois usuários tentam mudar o status quase ao mesmo tempo, qual deve ser a regra de conflito? → A: Last write wins + notificação
- Q: O escopo da correção deve cobrir apenas o fluxo de Compras ou todos os tipos de chamados? → A: Compras + Manutenção somente

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE persistir mudanças de status válidas feitas por todos os perfis com permissão no fluxo, incluindo Admin.
- **FR-002**: O sistema DEVE refletir imediatamente na interface o novo status persistido.
- **FR-003**: O sistema NÃO DEVE exibir mensagem de sucesso quando a mudança de status não for persistida.
- **FR-004**: O sistema DEVE exibir mensagem de erro quando a mudança falhar e manter o status anterior.
- **FR-005**: O sistema DEVE impedir transições não permitidas pelo fluxo do chamado.
- **FR-006**: O sistema DEVE registrar o motivo quando um chamado for negado e exibir essa informação.
- **FR-007**: Em conflito de atualização, o sistema DEVE aplicar a última gravação e notificar o usuário impactado.
- **FR-008**: A correção DEVE se aplicar aos chamados de Compras e Manutenção.

### Key Entities *(include if feature involves data)*

- **Chamado**: Solicitação com status que representa a etapa do fluxo de compras.
- **Transição de Status**: Mudança controlada do estado do chamado.
- **Motivo de Negação**: Justificativa registrada ao negar um chamado.
- **Usuário Autorizado**: Qualquer perfil com permissão no fluxo (inclui Admin).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das mudanças de status válidas ficam persistidas e visíveis após recarregar.
- **SC-002**: A interface reflete o novo status em até 2 segundos após a ação.
- **SC-003**: 0% de mensagens de sucesso quando a persistência falha.
- **SC-004**: Redução de 90% nas ocorrências reportadas de “status não mudou”.

## Assumptions

- As regras de transição de status já estão definidas pelo fluxo de compras atual.
- Usuários autorizados (inclui Admin) têm permissão para executar as ações nos chamados atribuídos ao seu escopo.
- O status do chamado é a fonte de verdade para a etapa do fluxo.

## Dependencies

- Consistência entre regras de transição aplicadas na interface e no backend.
- Disponibilidade do armazenamento de dados para persistir as mudanças de status.
