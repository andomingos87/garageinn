# Feature Specification: Correção da visibilidade de chamados por perfil

**Feature Branch**: `004-fix-visibilidade-chamados`  
**Created**: 2026-01-24  
**Status**: Draft  
**Input**: User description: "- Gerente operações ta vendo quais chamados? Porque só esta aparecendo o chamado #21 (85a49397-61ca-4d15-bcc8-6b0797d431ca); - Gerente de operações não aprovou, e assist de compras está vendo o chamado com status \"Aguardando aprovação (gerente)\";"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Gerente visualiza chamados pendentes (Priority: P1)

Como gerente de operações, quero ver todos os chamados da minha responsabilidade, incluindo os que aguardam minha aprovação, para que eu consiga agir sem perder demandas.

**Why this priority**: Sem essa visibilidade, o gerente não consegue cumprir o fluxo de aprovação, bloqueando o andamento dos chamados.

**Independent Test**: Pode ser testado acessando a lista de chamados como gerente de operações com chamados pendentes e não pendentes, validando a presença de todos os chamados elegíveis.

**Acceptance Scenarios**:

1. **Given** um gerente de operações com mais de um chamado elegível na sua unidade, **When** acessa a lista de chamados, **Then** todos os chamados elegíveis aparecem, não apenas um único chamado.
2. **Given** um chamado com status "Aguardando aprovação (gerente)" da unidade do gerente, **When** o gerente acessa a lista, **Then** o chamado aparece para ele.

---

### User Story 2 - Assistente não vê chamados pendentes do gerente (Priority: P2)

Como assistente de compras, quero ver apenas os chamados liberados para minha etapa, para evitar trabalhar em demandas que ainda precisam de aprovação do gerente.

**Why this priority**: Evita avanço indevido no fluxo e reduz retrabalho por chamados ainda não aprovados.

**Independent Test**: Pode ser testado acessando a lista de chamados como assistente de compras com chamados pendentes de aprovação do gerente e chamados aprovados.

**Acceptance Scenarios**:

1. **Given** um chamado com status "Aguardando aprovação (gerente)", **When** o assistente de compras acessa a lista de chamados, **Then** esse chamado não aparece.
2. **Given** um chamado já aprovado pelo gerente, **When** o assistente de compras acessa a lista de chamados, **Then** o chamado aparece para ele.

---

### Edge Cases

- Chamado aguardando aprovação, mas o gerente não está vinculado à unidade do chamado.
- Usuário com múltiplos perfis (gerente e assistente) acessando a lista.
- Chamado sem responsável de aprovação definido no momento da criação.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE listar para o gerente de operações todos os chamados elegíveis das unidades sob sua responsabilidade.
- **FR-002**: O sistema DEVE incluir na lista do gerente os chamados com status "Aguardando aprovação (gerente)".
- **FR-003**: O sistema NÃO DEVE exibir para o assistente de compras chamados com status "Aguardando aprovação (gerente)".
- **FR-004**: O sistema DEVE permitir que o assistente de compras visualize chamados somente quando o status não exigir aprovação do gerente.
- **FR-005**: O sistema DEVE manter consistência entre a lista e o acesso ao detalhe do chamado conforme permissões do perfil.

### Key Entities *(include if feature involves data)*

- **Chamado**: Demanda registrada, com identificador, unidade, status e etapa do fluxo.
- **Perfil de usuário**: Papel do usuário (gerente de operações, assistente de compras) que define visibilidade.
- **Unidade**: Contexto organizacional que delimita quais chamados são elegíveis ao gerente.
- **Etapa de aprovação**: Estado do fluxo que indica quem deve aprovar e em qual momento.

### Assumptions

- Existem regras de responsabilidade que ligam gerentes de operações às unidades.
- O status "Aguardando aprovação (gerente)" é a etapa imediatamente anterior à atuação do assistente de compras.
- A visibilidade de chamados depende de perfil e unidade, e não de ações manuais do usuário.

### Dependências

- Regras atuais de perfil e unidade já configuradas para os usuários envolvidos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em testes de aceitação, 100% dos chamados elegíveis aparecem para o gerente responsável.
- **SC-002**: Em testes de aceitação, 0 chamados com status "Aguardando aprovação (gerente)" aparecem para assistentes de compras.
- **SC-003**: Em testes de aceitação, 0 inconsistências entre lista e detalhe são observadas para cada perfil.
- **SC-004**: Pelo menos 90% dos gerentes conseguem localizar chamados pendentes em até 1 minuto durante testes guiados.
