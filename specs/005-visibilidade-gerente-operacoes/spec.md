# Feature Specification: Visibilidade de chamados do Gerente de Operações

**Feature Branch**: `005-visibilidade-gerente-operacoes`  
**Created**: 2026-01-25  
**Status**: Draft  
**Input**: User description: "@docs/relatorios/ajuste-visibilidade-gerente-operacoes.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Gerente visualiza chamados criados por Operações (Priority: P1)

Como gerente de operações, quero ver na lista geral todos os chamados criados por manobristas, encarregados e supervisores de Operações, mesmo quando o chamado pertence a outros departamentos, para manter controle completo das demandas da linha de Operações.

**Why this priority**: Sem essa visibilidade, o gerente perde demandas críticas e o processo operacional fica desalinhado do fluxo real.

**Independent Test**: Pode ser testado acessando a lista geral como gerente de operações com chamados criados por Operações em diferentes departamentos e verificando a presença de todos eles.

**Acceptance Scenarios**:

1. **Given** chamados criados por usuários de Operações (manobrista/encarregado/supervisor) em departamentos diversos, **When** o gerente de operações acessa a lista geral, **Then** todos esses chamados aparecem para ele.
2. **Given** um chamado criado por Operações cujo departamento do chamado é diferente do departamento de Operações, **When** o gerente acessa a lista geral, **Then** o chamado aparece para ele.

---

### User Story 2 - Gerente é último aprovador dos chamados de Operações (Priority: P2)

Como gerente de operações, quero ser o último aprovador dos chamados criados por cargos da linha de Operações, para garantir que a decisão final esteja alinhada à governança operacional.

**Why this priority**: A aprovação final pelo gerente é requisito de governança e evita encerramentos sem validação operacional.

**Independent Test**: Pode ser testado criando um chamado por usuário de Operações e validando que a última etapa de aprovação seja do gerente.

**Acceptance Scenarios**:

1. **Given** um chamado criado por manobrista/encarregado/supervisor de Operações, **When** a cadeia de aprovação é definida, **Then** o gerente de operações aparece como última etapa.
2. **Given** um chamado criado por usuários fora desses cargos, **When** a cadeia de aprovação é definida, **Then** o gerente não é incluído por essa regra específica.

---

### Edge Cases

- Criador do chamado muda de cargo ou departamento após a criação.
- Chamado criado por usuário de Operações sem cargo definido no perfil.
- Chamado já em andamento com cadeia de aprovação parcial quando a regra é aplicada.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE permitir que o gerente de operações visualize qualquer chamado cujo criador pertença ao departamento Operações e tenha cargo Manobrista, Encarregado ou Supervisor, independentemente do departamento do chamado.
- **FR-002**: O sistema NÃO DEVE conceder visibilidade adicional ao gerente para chamados cujo criador não atenda ao critério de Operações, salvo regras já existentes.
- **FR-003**: O sistema DEVE garantir que chamados criados por esses cargos tenham o gerente de operações como última etapa de aprovação.
- **FR-004**: O sistema DEVE manter consistência entre lista e detalhe do chamado conforme as regras de visibilidade aplicáveis.
- **FR-005**: O sistema DEVE preservar o comportamento atual de visibilidade e aprovação para chamados criados por outros departamentos e cargos.
- **FR-006**: O sistema DEVE aplicar apenas as regras gerais quando o criador não possui cargo/departamento elegível registrado.

### Key Entities *(include if feature involves data)*

- **Chamado**: Demanda registrada com criador, departamento do chamado e histórico de aprovação.
- **Perfil de usuário**: Identifica departamento e cargo do criador e do visualizador.
- **Departamento**: Classificação organizacional que define o grupo Operações e outros departamentos.
- **Cargo**: Função do criador usada para determinar elegibilidade (manobrista, encarregado, supervisor).
- **Etapa de aprovação**: Sequência de aprovações associada ao chamado.

### Assumptions

- Departamento e cargo do criador são dados confiáveis e obrigatórios no momento da criação do chamado.
- A cadeia de aprovação suporta identificar claramente a última etapa.
- Chamados existentes mantêm o criador original para avaliação de visibilidade e aprovação.

### Dependências

- Cadastros de cargos e departamentos de Operações atualizados para todos os usuários envolvidos.
- Perfil de gerente de operações ativo e corretamente associado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em testes de aceitação, 100% dos chamados criados por manobrista/encarregado/supervisor de Operações aparecem para o gerente, independentemente do departamento do chamado.
- **SC-002**: Em testes de aceitação, 100% desses chamados têm o gerente de operações como última etapa de aprovação.
- **SC-003**: Em testes de regressão, 0 chamados de criadores fora do critério aparecem para o gerente além das regras existentes.
- **SC-004**: Em testes de regressão, 0 usuários não-gerentes ganham visibilidade adicional de chamados.
