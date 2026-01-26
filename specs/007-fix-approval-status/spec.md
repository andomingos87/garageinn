# Feature Specification: Correção de Status de Aprovação para Supervisor/Operações

**Feature Branch**: `007-fix-approval-status`
**Created**: 2026-01-25
**Status**: Implemented
**Input**: Bug report: Supervisor no departamento Operações cria chamado de compras que recebe status `awaiting_approval_encarregado` ao invés do esperado `awaiting_approval_gerente`

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Supervisor Cria Chamado com Status Correto (Priority: P1)

Como Supervisor do departamento de Operações, quando crio um chamado de compras, o sistema deve definir o status inicial como `awaiting_approval_gerente`, pulando as aprovações de níveis hierárquicos inferiores (Encarregado e outro Supervisor), pois não faz sentido um Supervisor aguardar aprovação de um Encarregado.

**Why this priority**: Este bug impede o fluxo correto de aprovação, causando bloqueios operacionais e inconsistência entre os registros de aprovação e o status do chamado.

**Independent Test**: Pode ser testado criando um chamado como Supervisor/Operações e verificando se o status inicial é `awaiting_approval_gerente` e se existe apenas um registro de aprovação pendente (Gerente).

**Acceptance Scenarios**:

1. **Given** um usuário logado com papel Supervisor no departamento Operações, **When** ele cria um novo chamado de compras, **Then** o status do chamado deve ser `awaiting_approval_gerente`.
2. **Given** um usuário logado com papel Supervisor no departamento Operações, **When** ele cria um novo chamado de compras, **Then** deve existir apenas 1 registro na tabela de aprovações pendentes (aprovação do Gerente).
3. **Given** um chamado criado por Supervisor com status `awaiting_approval_gerente`, **When** o Gerente aprova o chamado, **Then** o chamado deve avançar diretamente para o próximo status do fluxo (triagem ou execução).

---

### User Story 2 - Encarregado Cria Chamado com Status Correto (Priority: P1)

Como Encarregado do departamento de Operações, quando crio um chamado de compras, o sistema deve definir o status inicial como `awaiting_approval_supervisor`, pulando a aprovação de outro Encarregado.

**Why this priority**: Garante consistência da regra de negócio de hierarquia para todos os níveis.

**Independent Test**: Pode ser testado criando um chamado como Encarregado/Operações e verificando se o status inicial é `awaiting_approval_supervisor`.

**Acceptance Scenarios**:

1. **Given** um usuário logado com papel Encarregado no departamento Operações, **When** ele cria um novo chamado de compras, **Then** o status do chamado deve ser `awaiting_approval_supervisor`.
2. **Given** um usuário logado com papel Encarregado no departamento Operações, **When** ele cria um novo chamado de compras, **Then** devem existir 2 registros na tabela de aprovações pendentes (Supervisor e Gerente).

---

### User Story 3 - Manobrista Cria Chamado com Status Correto (Priority: P2)

Como Manobrista do departamento de Operações, quando crio um chamado de compras, o sistema deve definir o status inicial como `awaiting_approval_encarregado`, exigindo aprovação da cadeia completa (Encarregado → Supervisor → Gerente).

**Why this priority**: Valida que o nível mais baixo continua funcionando corretamente após a correção.

**Independent Test**: Pode ser testado criando um chamado como Manobrista/Operações e verificando se o status inicial é `awaiting_approval_encarregado`.

**Acceptance Scenarios**:

1. **Given** um usuário logado com papel Manobrista no departamento Operações, **When** ele cria um novo chamado de compras, **Then** o status do chamado deve ser `awaiting_approval_encarregado`.
2. **Given** um usuário logado com papel Manobrista no departamento Operações, **When** ele cria um novo chamado de compras, **Then** devem existir 3 registros na tabela de aprovações pendentes (Encarregado, Supervisor e Gerente).

---

### User Story 4 - Gerente Cria Chamado Auto-Aprovado (Priority: P2)

Como Gerente do departamento de Operações, quando crio um chamado de compras, o sistema deve definir o status inicial como `awaiting_triage`, pois Gerentes não precisam de aprovação hierárquica.

**Why this priority**: Garante que o fluxo simplificado para Gerentes permanece funcional.

**Independent Test**: Pode ser testado criando um chamado como Gerente/Operações e verificando se o status inicial é `awaiting_triage`.

**Acceptance Scenarios**:

1. **Given** um usuário logado com papel Gerente no departamento Operações, **When** ele cria um novo chamado de compras, **Then** o status do chamado deve ser `awaiting_triage`.
2. **Given** um usuário logado com papel Gerente no departamento Operações, **When** ele cria um novo chamado de compras, **Then** não devem existir registros na tabela de aprovações pendentes.

---

### Edge Cases

- **Usuário com múltiplos papéis**: Se um usuário possui papel de Encarregado e Supervisor simultaneamente no departamento Operações, o sistema deve considerar o papel de nível mais alto (Supervisor) para determinar o status inicial.
- **Usuário sem papel em Operações**: Se um usuário não possui nenhum papel no departamento Operações mas cria um chamado de compras, o sistema deve tratar como nível mais baixo (Manobrista) e exigir toda a cadeia de aprovação.
- **Função RPC retorna null**: Se a função `get_initial_approval_status` retornar null por erro de execução, o sistema deve registrar o erro e usar um fallback seguro que não comprometa a integridade do fluxo.
- **Inconsistência entre status e registros**: O sistema deve garantir que o status do chamado sempre corresponda ao primeiro aprovador pendente na tabela de aprovações.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistema DEVE determinar o nível hierárquico mais alto do usuário criador no departamento Operações antes de definir o status inicial do chamado.
- **FR-002**: Sistema DEVE definir o status inicial do chamado baseado no nível hierárquico do criador conforme a tabela:
  | Nível do Criador | Status Inicial |
  |------------------|----------------|
  | Manobrista (1)   | `awaiting_approval_encarregado` |
  | Encarregado (2)  | `awaiting_approval_supervisor` |
  | Supervisor (3)   | `awaiting_approval_gerente` |
  | Gerente (4)      | `awaiting_triage` |
- **FR-003**: Sistema DEVE criar registros de aprovação apenas para os níveis hierárquicos acima do criador (não deve haver aprovação de nível igual ou inferior).
- **FR-004**: Sistema DEVE garantir consistência entre o status do chamado e os registros de aprovação pendentes.
- **FR-005**: Sistema DEVE utilizar o valor retornado pela função de cálculo de status inicial, sem sobrescrever com valores hardcoded ou default incorretos.
- **FR-006**: Sistema DEVE registrar erro no log caso a função de cálculo de status inicial falhe, e aplicar um fallback que exija a cadeia completa de aprovação (comportamento mais seguro).
- **FR-007**: Para usuários com múltiplos papéis em Operações, sistema DEVE usar o papel de nível hierárquico mais alto para determinar o status inicial.

### Key Entities

- **Ticket (Chamado)**: Solicitação de compra que passa por fluxo de aprovação hierárquica. Possui status que indica qual aprovador é esperado.
- **Ticket Approval (Aprovação de Chamado)**: Registro de aprovação pendente ou concluída. Vincula um ticket a um nível de aprovador.
- **User Role (Papel do Usuário)**: Papel que um usuário possui em um departamento específico. Define o nível hierárquico do usuário.
- **Hierarchical Level (Nível Hierárquico)**: Posição na cadeia de aprovação. Manobrista=1, Encarregado=2, Supervisor=3, Gerente=4.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos chamados criados por Supervisores de Operações recebem status inicial `awaiting_approval_gerente`.
- **SC-002**: 100% dos chamados criados têm consistência entre status e registros de aprovação (status corresponde ao primeiro aprovador pendente).
- **SC-003**: Tempo de criação de chamado não aumenta mais que 500ms após a correção.
- **SC-004**: Zero chamados criados por Supervisores ficam bloqueados aguardando aprovação de Encarregado.
- **SC-005**: Fluxo de aprovação completo (da criação à aprovação final) funciona corretamente para todos os 4 níveis hierárquicos.

## Assumptions

- A função SQL `get_initial_approval_status` já retorna o valor correto quando testada diretamente no banco de dados (conforme investigação prévia).
- O problema está na camada de aplicação (server action) que não está utilizando corretamente o retorno da função RPC.
- A função SQL `get_highest_operacoes_role` funciona corretamente para determinar o nível hierárquico do usuário.
- A função SQL `create_ticket_approvals` funciona corretamente para criar os registros de aprovação necessários.
- O código suspeito está localizado em `apps/web/src/app/(app)/chamados/compras/actions.ts` nas linhas que chamam o RPC e definem o status inicial.
