# Feature Specification: RBAC Operacoes

**Feature Branch**: `002-rbac-operacoes`  
**Created**: 2026-01-23  
**Status**: Draft  
**Input**: User description: "Definir permissoes RBAC para o Departamento Operacoes (Manobrista, Encarregado, Supervisor, Gerente) com acessos e restricoes por secao."

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Acesso basico de Operacoes (Priority: P1)

Como Manobrista ou Encarregado do Departamento Operacoes, quero acessar apenas Chamados, Checklists e Meu perfil, para executar minhas rotinas sem expor areas restritas.

**Why this priority**: Esta e a necessidade minima para os cargos operacionais e garante seguranca desde o primeiro acesso.

**Independent Test**: Pode ser testado criando um usuario Manobrista/Encarregado e validando navegação e bloqueios para secoes nao permitidas.

**Acceptance Scenarios**:

1. **Given** um usuario com cargo Manobrista, **When** acessa o aplicativo, **Then** visualiza apenas Chamados, Checklists e Meu perfil na navegacao.
2. **Given** um usuario com cargo Encarregado, **When** tenta acessar Financeiro, Supervisao, Unidades, Usuarios, Configuracoes ou Relatorios, **Then** o acesso e negado e nenhum conteudo e exibido.

---

### User Story 2 - Acesso avancado de Operacoes (Priority: P2)

Como Supervisor ou Gerente do Departamento Operacoes, quero acessar Chamados, Checklists, Meu perfil, Supervisao e Unidades, para acompanhar a operacao sem acesso a areas financeiras ou administrativas.

**Why this priority**: Esses cargos precisam de visao ampliada da operacao, mas ainda requerem restricoes claras.

**Independent Test**: Pode ser testado criando um usuario Supervisor/Gerente e validando menus e bloqueios para secoes nao permitidas.

**Acceptance Scenarios**:

1. **Given** um usuario com cargo Supervisor, **When** acessa o aplicativo, **Then** visualiza Chamados, Checklists, Meu perfil, Supervisao e Unidades na navegacao.
2. **Given** um usuario com cargo Gerente, **When** tenta acessar Financeiro, Usuarios, Configuracoes ou Relatorios, **Then** o acesso e negado e nenhum conteudo e exibido.

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

- Usuario do Departamento Operacoes sem cargo definido nao deve ter acesso a secoes operacionais.
- Cargo desconhecido ou fora da lista Operacoes deve resultar em acesso negado.
- Usuario tenta acessar secoes proibidas por link direto ou favorito.

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: O sistema DEVE aplicar a matriz de permissoes do Departamento Operacoes para os cargos Manobrista, Encarregado, Supervisor e Gerente.
- **FR-002**: Manobrista e Encarregado DEVEM poder acessar Chamados, Checklists e Meu perfil.
- **FR-003**: Supervisor e Gerente DEVEM poder acessar Chamados, Checklists, Meu perfil, Supervisao e Unidades.
- **FR-004**: Manobrista e Encarregado NAO DEVEM acessar Financeiro, Supervisao, Unidades, Usuarios, Configuracoes e Relatorios.
- **FR-005**: Supervisor e Gerente NAO DEVEM acessar Financeiro, Usuarios, Configuracoes e Relatorios.
- **FR-006**: O sistema DEVE bloquear acesso a secoes nao permitidas, mesmo por tentativa direta, exibindo mensagem de acesso negado.
- **FR-007**: A navegacao visivel DEVE refletir exatamente as permissoes do cargo do usuario.

### Key Entities *(include if feature involves data)*

- **Departamento**: area organizacional, com foco em Operacoes.
- **Cargo**: Manobrista, Encarregado, Supervisor, Gerente.
- **Secao/Modulo**: Chamados, Checklists, Meu perfil, Supervisao, Unidades, Financeiro, Usuarios, Configuracoes, Relatorios.
- **Permissao de acesso**: relacao entre Cargo e Secao/Modulo.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: 100% dos testes de permissao por cargo passam conforme a matriz definida (permitido/negado).
- **SC-002**: 0 secoes nao permitidas aparecem na navegacao de cada cargo em testes de validacao.
- **SC-003**: 95% dos usuarios de Operacoes acessam uma secao permitida em ate 2 cliques apos login.
- **SC-004**: Reduzir a zero os incidentes reportados de acesso indevido a secoes restritas no mes seguinte ao rollout.

## Assumptions

- As secoes listadas ja existem e fazem parte da navegacao principal.
- Usuarios de outros departamentos nao estao no escopo deste ajuste.
- Usuario de Operacoes sem cargo definido tem acesso somente a Meu perfil e nao acessa secoes operacionais.

## Dependencies

- Cadastro de cargos do Departamento Operacoes e vinculo de usuario a cargo.
- Mapeamento das secoes/modulos listados para controle de acesso.
