# Feature Specification: Visibilidade de TI na sidebar

**Feature Branch**: `001-fix-ti-sidebar`  
**Created**: 2026-01-24  
**Status**: Draft  
**Input**: User description: "Usuarios de Operacoes veem a aba de TI na sidebar e conseguem acessar a pagina de chamados de TI, que deve ser exclusiva do setor de TI."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Bloquear acesso para nao-TI (Priority: P1)

Como usuario fora do setor de TI, nao quero ver nem acessar a area de TI para evitar confusao e acesso indevido a chamados.

**Why this priority**: Evita acesso indevido e garante clareza de fluxo para a maioria dos usuarios.

**Independent Test**: Pode ser testado com um usuario de Operacoes acessando o menu e tentando abrir URLs de TI.

**Acceptance Scenarios**:

1. **Given** um usuario nao-TI autenticado, **When** acessa a aplicacao, **Then** o item "TI" nao aparece na sidebar.
2. **Given** um usuario nao-TI autenticado, **When** acessa diretamente `/chamados/ti`, **Then** recebe bloqueio de acesso e nenhum dado de TI e exibido.

---

### User Story 2 - Permitir acesso para usuarios de TI (Priority: P2)

Como usuario do setor de TI, quero ver e acessar a area de chamados de TI para executar meu trabalho.

**Why this priority**: Garante que o publico correto mantenha o acesso necessario ao fluxo de TI.

**Independent Test**: Pode ser testado com um usuario de TI acessando menu, lista e detalhes.

**Acceptance Scenarios**:

1. **Given** um usuario do setor de TI autenticado, **When** acessa a aplicacao, **Then** o item "TI" aparece na sidebar.
2. **Given** um usuario do setor de TI autenticado, **When** acessa `/chamados/ti` e `/chamados/ti/[ticketId]`, **Then** a pagina carrega normalmente.

---

### User Story 3 - Manter acesso para perfis globais/admin (Priority: P3)

Como usuario com acesso global, quero continuar acessando a area de TI sem regressao.

**Why this priority**: Evita regressao para perfis administrativos e suporte.

**Independent Test**: Pode ser testado com um usuario global/admin acessando menu e rotas de TI.

**Acceptance Scenarios**:

1. **Given** um usuario com acesso global/admin, **When** acessa o menu e rotas de TI, **Then** o acesso continua permitido.

---

### Edge Cases

- Usuario com multiplos cargos, incluindo TI, deve ser tratado como elegivel.
- Usuario sem cargo/departamento nao deve ver a aba de TI nem acessar rotas.
- Usuario com cargo TI sem unidade vinculada ainda deve acessar a area.
- Usuario com sessao ativa e permissao alterada deve ter a visibilidade corrigida no proximo acesso.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST ocultar o item "TI" do menu para usuarios nao-TI.
- **FR-002**: O sistema MUST bloquear acesso a todas as rotas de TI para usuarios nao-TI.
- **FR-003**: O sistema MUST permitir acesso as rotas de TI para usuarios do setor de TI.
- **FR-004**: O sistema MUST mostrar uma mensagem de acesso negado quando um nao-TI tentar acessar TI por URL direta.
- **FR-005**: O controle de acesso MUST ser consistente entre menu e rotas (mesma regra de elegibilidade).
- **FR-006**: Usuarios nao-TI MUST nao visualizar dados de chamados de TI em listas ou detalhes.

### Key Entities *(include if feature involves data)*

- **Usuario**: Pessoa autenticada com um ou mais cargos.
- **Departamento**: Area organizacional associada ao cargo (ex.: TI, Operacoes).
- **Cargo**: Define o perfil de acesso do usuario.
- **Area de TI**: Conjunto de paginas de chamados de TI (lista, novo, detalhe).

## Assumptions

- Perfis globais/admin continuam com acesso a area de TI.
- A restricao se aplica a visibilidade e acesso da area de TI, nao define regras de abertura de chamados fora dessa area.

## Dependencies

- Nenhuma dependencia adicional alem dos dados de perfil, cargos e departamentos ja existentes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos usuarios nao-TI em testes nao veem o item "TI" na sidebar.
- **SC-002**: 100% das tentativas de acesso direto a rotas de TI por nao-TI resultam em bloqueio de acesso.
- **SC-003**: 100% dos usuarios de TI em testes conseguem acessar lista, novo e detalhe de TI sem erro.
- **SC-004**: Zero relatos de acesso indevido a area de TI em ate 2 semanas apos o deploy.
