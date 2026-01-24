# Feature Specification: Modulo de Chamados de TI - Fluxo Basico

**Feature Branch**: `002-chamados-ti`  
**Created**: 2026-01-24  
**Status**: Draft  
**Input**: User description: "Precisamos de um modulo de TI, todo mundo vai poder abrir chamado de TI sobre manutencao de computadores, rede, internet; fluxo de aprovacao padrao; quando chegar no fim do fluxo e chamado pronto para ser executado, deve aparecer na lista de chamados de TI. Enfim, o basico."

## Clarifications

### Session 2026-01-24

- Q: Quando um chamado de TI deve passar por aprovacao no fluxo padrao? -> A: Conforme as regras ja existentes do fluxo padrao.
- Q: Quem pode acessar a lista de chamados de TI prontos para execucao? -> A: Apenas equipe de TI e perfis globais.
- Q: Quando um chamado de TI e rejeitado no fluxo de aprovacao, o que acontece com ele? -> A: Segue a regra padrao ja existente.
- Q: Quando um chamado de TI nao exige aprovacao, qual status ele recebe? -> A: Vai direto para pronto para execucao.
- Q: Anexos sao obrigatorios ao abrir chamado de TI? -> A: Nao, opcionais.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Abrir chamado de TI (Priority: P1)

Como usuario autenticado de qualquer departamento, quero abrir um chamado de TI selecionando uma categoria (computador, rede, internet, outros) e descrevendo o problema, para solicitar suporte.

**Why this priority**: Sem abertura de chamados, o time de TI nao recebe a demanda.

**Independent Test**: Pode ser testado criando um chamado de TI com os campos obrigatorios e confirmando o registro do chamado.

**Acceptance Scenarios**:

1. **Given** um usuario autenticado, **When** ele cria um chamado de TI com titulo, descricao e categoria, **Then** o chamado e registrado com status inicial valido.
2. **Given** um usuario autenticado, **When** ele tenta criar um chamado de TI sem categoria, **Then** o envio e bloqueado com mensagem clara do campo obrigatorio.
3. **Given** um usuario solicitante, **When** ele acessa seus chamados de TI, **Then** ele visualiza o status atual do proprio chamado.

---

### User Story 2 - Aprovar chamado de TI (Priority: P2)

Como aprovador, quero registrar aprovacao ou rejeicao conforme o fluxo padrao, para liberar ou bloquear a execucao do chamado.

**Why this priority**: O fluxo de aprovacao garante controle antes da execucao dos chamados de TI.

**Independent Test**: Pode ser testado com um chamado que exige aprovacao, registrando uma decisao no fluxo padrao.

**Acceptance Scenarios**:

1. **Given** um chamado de TI que exige aprovacao, **When** o ultimo aprovador registra aprovacao, **Then** o chamado muda para status pronto para execucao.
2. **Given** um chamado de TI que exige aprovacao, **When** um aprovador registra rejeicao, **Then** o chamado nao avanca para pronto para execucao.

---

### User Story 3 - Ver chamados de TI prontos para execucao (Priority: P3)

Como membro do time de TI, quero ver uma lista de chamados de TI prontos para execucao, para iniciar o atendimento.

**Why this priority**: A execucao depende de identificar rapidamente os chamados liberados pelo fluxo.

**Independent Test**: Pode ser testado criando ou ajustando um chamado para status pronto para execucao e verificando sua exibicao na lista.

**Acceptance Scenarios**:

1. **Given** um chamado de TI com aprovacao concluida, **When** o time de TI acessa a lista de chamados de TI, **Then** o chamado aparece na lista de prontos para execucao.
2. **Given** um chamado de TI ainda em aprovacao, **When** o time de TI acessa a lista de chamados de TI, **Then** o chamado nao aparece como pronto para execucao.

---

### Edge Cases

- O que acontece quando nao ha aprovador elegivel para o chamado de TI?
- Como o sistema lida com tentativa de criar chamado sem categoria valida?
- O que ocorre quando um chamado muda para pronto para execucao mas e cancelado em seguida?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir a abertura de chamados de TI por usuarios de qualquer departamento.
- **FR-002**: O sistema MUST exigir a selecao de uma categoria de TI pre-definida (computador, rede, internet, outros).
- **FR-003**: O sistema MUST registrar titulo, descricao, solicitante e datas relevantes do chamado de TI.
- **FR-004**: O sistema MUST aplicar o fluxo de aprovacao padrao conforme as regras ja existentes (quando aplicavel).
- **FR-005**: O sistema MUST permitir o registro de aprovacao ou rejeicao por aprovadores definidos no fluxo padrao.
- **FR-006**: O sistema MUST atualizar o status do chamado para pronto para execucao ao final do fluxo de aprovacao aprovado.
- **FR-007**: O sistema MUST exibir na lista de chamados de TI os chamados com status pronto para execucao, com acesso restrito a equipe de TI e perfis globais.
- **FR-008**: O sistema MUST permitir que o solicitante acompanhe o status do proprio chamado de TI.
- **FR-009**: O sistema MUST aplicar o tratamento de rejeicao conforme a regra padrao ja existente.
- **FR-010**: O sistema MUST marcar o chamado como pronto para execucao quando ele nao exigir aprovacao.
- **FR-011**: O sistema MUST permitir anexos opcionais no chamado de TI.

### Key Entities *(include if feature involves data)*

- **Chamado de TI**: Registro de solicitacao com titulo, descricao, status, solicitante e datas.
- **Categoria de TI**: Classificacao do chamado (computador, rede, internet, outros) usada para triagem.
- **Aprovacao**: Decisao registrada por aprovadores no fluxo padrao.
- **Status do Chamado**: Indicador do estado do chamado (ex.: em aprovacao, pronto para execucao, rejeitado).
- **Lista de Chamados de TI**: Conjunto de chamados exibidos ao time de TI para execucao.

### Assumptions

- O fluxo de aprovacao padrao ja existe e sera reutilizado para chamados de TI.
- Perfis de equipe de TI e perfis globais ja existem no sistema.
- As categorias iniciais de TI sao computador, rede, internet e outros.
- A regra padrao de rejeicao do fluxo existente se aplica aos chamados de TI.
- Chamados de TI sem aprovacao exigida entram diretamente em pronto para execucao.
- Anexos sao opcionais na abertura do chamado de TI.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% dos usuarios conseguem abrir um chamado de TI completo em ate 3 minutos.
- **SC-002**: 100% dos chamados de TI registrados possuem categoria preenchida.
- **SC-003**: 90% dos chamados de TI aprovados aparecem na lista de prontos para execucao em ate 1 minuto.
- **SC-004**: 98% dos chamados de TI que concluem aprovacao avancam para pronto para execucao sem intervencao manual.
