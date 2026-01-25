# Feature Specification: Visibilidade de unidades e checklists do supervisor

**Feature Branch**: `003-supervisor-unidades-checklists`  
**Created**: 2026-01-24  
**Status**: Draft  
**Input**: User description: "Supervisor so pode ver as unidades dele em /unidades; organizar menu de checklists em Checklists [abertura, supervisao]; so supervisor pode ver submenu supervisao."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver unidades permitidas (Priority: P1)

Como supervisor, quero ver somente as unidades vinculadas a mim em `/unidades` para evitar acesso indevido e reduzir confusao.

**Why this priority**: Evita exposicao de unidades nao autorizadas e corrige o fluxo principal de gestao de unidades.

**Independent Test**: Pode ser testado acessando `/unidades` com perfil de supervisor e verificando que apenas unidades vinculadas aparecem.

**Acceptance Scenarios**:

1. **Given** um supervisor com unidades A e B vinculadas, **When** acessa `/unidades`, **Then** somente A e B aparecem.
2. **Given** um supervisor sem unidades vinculadas, **When** acessa `/unidades`, **Then** a lista aparece vazia com mensagem informativa.

---

### User Story 2 - Menu de checklists organizado com visibilidade por perfil (Priority: P2)

Como usuario do app, quero ver o menu de Checklists organizado em Abertura e Supervisao, com o submenu Supervisao visivel apenas para supervisores.

**Why this priority**: Melhora a navegacao e evita que perfis nao autorizados vejam opcoes que nao podem usar.

**Independent Test**: Pode ser testado verificando a sidebar com perfis supervisor e nao-supervisor.

**Acceptance Scenarios**:

1. **Given** um usuario supervisor, **When** abre o menu Checklists na sidebar, **Then** ve os subitens Abertura e Supervisao.
2. **Given** um usuario nao-supervisor, **When** abre o menu Checklists na sidebar, **Then** ve apenas o subitem Abertura e nao ve Supervisao.
3. **Given** um usuario nao-supervisor com um link direto para Supervisao, **When** tenta acessar, **Then** o acesso e negado com mensagem de falta de permissao.

---

### Edge Cases

- O que acontece quando o supervisor perde o vinculo com todas as unidades durante a sessao?
- Como o sistema lida com perfis que alternam entre supervisor e nao-supervisor?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE listar em `/unidades` somente as unidades vinculadas ao usuario quando o perfil for supervisor.
- **FR-002**: O sistema DEVE manter o menu Checklists com subitens Abertura e Supervisao.
- **FR-003**: O sistema DEVE exibir o subitem Supervisao apenas para usuarios com perfil supervisor.
- **FR-004**: O sistema DEVE bloquear o acesso ao conteudo de Supervisao para usuarios nao-supervisor, mesmo com acesso direto por URL.
- **FR-005**: O sistema DEVE exibir uma mensagem clara quando a lista de unidades do supervisor estiver vazia.

### Key Entities *(include if feature involves data)*

- **Unidade**: Local/filial vinculada a um supervisor para acesso em `/unidades`.
- **Perfil de usuario**: Define se o usuario e supervisor ou nao.
- **Item de menu Checklists**: Entrada de navegacao com subitens Abertura e Supervisao.

## Assumptions

- Perfis nao-supervisor continuam com o comportamento atual de acesso a unidades, exceto pela restricao do submenu Supervisao.
- A organizacao do menu Checklists nao altera os fluxos existentes de Abertura.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos testes com perfil supervisor exibem apenas unidades vinculadas em `/unidades`.
- **SC-002**: 0 casos de visualizacao do submenu Supervisao por usuarios nao-supervisor em testes de permissao.
- **SC-003**: 95% dos usuarios de testes conseguem localizar o item correto de Checklists em ate 30 segundos.
- **SC-004**: 100% das tentativas de acesso direto ao conteudo de Supervisao por nao-supervisores resultam em bloqueio.
