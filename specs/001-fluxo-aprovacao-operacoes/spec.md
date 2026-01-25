# Feature Specification: Fluxo de aprovacao de chamados - Operacoes

**Feature Branch**: `001-fluxo-aprovacao-operacoes`  
**Created**: 2026-01-25  
**Status**: Draft  
**Input**: User description: "A fluxo de aprovação de chamados no departamento 'Operações' deve seguir a hierarquia determinada: manobrista -> encarregado -> supervisor -> gerente operações. Se o encarregado abre, o próximo a aprovar é o supervisor; Se o supervisor abre, o próximo a aprovar é o gerente operações; Se o gerente operações abre, o chamado ja nasce aprovado no fim da cadeia."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Encarregado nao aprova o proprio chamado (Priority: P1)

Como encarregado de operacoes, quero que o meu chamado avance direto para aprovacao do supervisor, para respeitar a hierarquia e evitar autoaprovacao.

**Why this priority**: O fluxo atual viola a regra de aprovacao e gera risco de aprovacao indevida.

**Independent Test**: Pode ser testado criando um chamado como encarregado e validando o status inicial e as aprovacoes pendentes do supervisor.

**Acceptance Scenarios**:

1. **Given** um encarregado de operacoes, **When** cria um chamado, **Then** o status inicial e "Aguardando aprovacao do supervisor".
2. **Given** um chamado criado por encarregado, **When** o encarregado acessa aprovacoes pendentes, **Then** ele nao ve aprovacao pendente desse chamado.

---

### User Story 2 - Supervisor aprova antes do gerente (Priority: P1)

Como supervisor de operacoes, quero que meus chamados avancem direto para aprovacao do gerente de operacoes, para evitar duplicidade de aprovacao.

**Why this priority**: Garante que a cadeia de aprovacao respeite a hierarquia e reduz etapas desnecessarias.

**Independent Test**: Pode ser testado criando um chamado como supervisor e validando que apenas o gerente de operacoes tem aprovacao pendente.

**Acceptance Scenarios**:

1. **Given** um supervisor de operacoes, **When** cria um chamado, **Then** o status inicial e "Aguardando aprovacao do gerente de operacoes".
2. **Given** um chamado criado por supervisor, **When** o gerente de operacoes acessa aprovacoes pendentes, **Then** ele ve esse chamado como pendente.

---

### User Story 3 - Gerente de operacoes cria chamado ja aprovado (Priority: P2)

Como gerente de operacoes, quero que meus chamados nao precisem de aprovacao, para agilizar o fluxo quando eu sou o responsavel final.

**Why this priority**: Evita etapas redundantes e reduz tempo de ciclo.

**Independent Test**: Pode ser testado criando um chamado como gerente de operacoes e validando que nao ha aprovacoes pendentes.

**Acceptance Scenarios**:

1. **Given** um gerente de operacoes, **When** cria um chamado, **Then** o status inicial e "Aguardando triagem".
2. **Given** um chamado criado por gerente de operacoes, **When** qualquer usuario acessa aprovacoes pendentes, **Then** nao existe aprovacao pendente para esse chamado.

---

### User Story 4 - Manobrista segue fluxo completo (Priority: P2)

Como manobrista, quero que meus chamados sigam a cadeia completa de aprovacao, para garantir validacao pelos niveis superiores.

**Why this priority**: Mantem a regra original e evita regressao para o perfil mais basico.

**Independent Test**: Pode ser testado criando um chamado como manobrista e validando aprovacoes nos tres niveis.

**Acceptance Scenarios**:

1. **Given** um manobrista, **When** cria um chamado, **Then** o status inicial e "Aguardando aprovacao do encarregado".
2. **Given** um chamado criado por manobrista, **When** o encarregado aprova, **Then** o status muda para "Aguardando aprovacao do supervisor".
3. **Given** um chamado criado por manobrista com aprovacao do supervisor, **When** o supervisor aprova, **Then** o status muda para "Aguardando aprovacao do gerente de operacoes".

---

### Edge Cases

- Usuario com multiplos papeis em Operacoes (ex: encarregado e supervisor) deve usar o papel de maior nivel para definir o primeiro aprovador.
- Usuario de Operacoes sem papel reconhecido segue o fluxo atual padrao.
- Usuario fora de Operacoes segue o fluxo atual sem alteracoes.
- Chamados existentes nao alteram sua cadeia de aprovacao retroativamente.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE determinar o primeiro nivel de aprovacao com base no papel de maior nivel do criador em Operacoes.
- **FR-002**: Se o criador for Manobrista, o chamado DEVE iniciar em "Aguardando aprovacao do encarregado" e criar aprovacoes para Encarregado, Supervisor e Gerente de Operacoes.
- **FR-003**: Se o criador for Encarregado, o chamado DEVE iniciar em "Aguardando aprovacao do supervisor" e criar aprovacoes para Supervisor e Gerente de Operacoes.
- **FR-004**: Se o criador for Supervisor, o chamado DEVE iniciar em "Aguardando aprovacao do gerente de operacoes" e criar aprovacao apenas para o Gerente de Operacoes.
- **FR-005**: Se o criador for Gerente de Operacoes, o chamado DEVE iniciar em "Aguardando triagem" e NAO deve criar aprovacoes pendentes.
- **FR-006**: A aprovacao final dos chamados do departamento de Operacoes DEVE ser realizada pelo Gerente de Operacoes.
- **FR-007**: A regra de aprovacao DEVE ser aplicada a todos os tipos de chamados (compras, manutencao, TI, RH, financeiro, sinistros, comercial).

### Key Entities *(include if feature involves data)*

- **Chamado**: Registro do ticket, com status e criador.
- **Aprovacao de chamado**: Registro de aprovacao pendente/concluida por nivel.
- **Papel do usuario**: Cargo em Operacoes que define o nivel na hierarquia.
- **Departamento**: Origem do criador que define se o fluxo especial se aplica.

### Assumptions

- Os nomes de cargos e departamentos seguem o cadastro atual.
- Os status exibidos no sistema permanecem disponiveis para uso.

### Dependencies

- A hierarquia de cargos de Operacoes esta configurada corretamente.
- O cadastro do usuario informa pelo menos um cargo valido em Operacoes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos chamados criados por encarregado iniciam em "Aguardando aprovacao do supervisor" e nao aparecem como pendentes para o criador.
- **SC-002**: 100% dos chamados criados por supervisor iniciam em "Aguardando aprovacao do gerente de operacoes" e possuem apenas uma aprovacao pendente.
- **SC-003**: 100% dos chamados criados por gerente de operacoes iniciam em "Aguardando triagem" sem aprovacoes pendentes.
- **SC-004**: 100% dos chamados criados por manobrista seguem tres etapas de aprovacao (encarregado, supervisor, gerente de operacoes).
