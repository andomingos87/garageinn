# Feature Specification: Modulo de Chamados de TI

**Feature Branch**: `001-chamados-ti`  
**Created**: 2026-01-24  
**Status**: Draft  
**Input**: User description: "@docs/chamados/ti-task-structure.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Abrir chamado de TI (Priority: P1)

Como usuario autenticado de qualquer departamento, quero abrir um chamado de TI informando categoria e tipo de equipamento, para solicitar suporte de forma padronizada.

**Why this priority**: Sem a abertura de chamados, nao existe entrada de demanda para o time de TI.

**Independent Test**: Pode ser testado criando um chamado de TI com campos obrigatorios e confirmando que ele fica disponivel para acompanhamento.

**Acceptance Scenarios**:

1. **Given** um usuario autenticado, **When** ele envia um chamado de TI com titulo, descricao, categoria e tipo de equipamento, **Then** o chamado e criado com um status inicial valido.
2. **Given** um usuario autenticado, **When** ele tenta enviar um chamado de TI sem tipo de equipamento, **Then** o envio e bloqueado com uma mensagem clara do campo obrigatorio.

---

### User Story 2 - Consultar e filtrar chamados de TI (Priority: P2)

Como usuario com permissao de visualizar chamados de TI, quero listar e filtrar chamados por status, prioridade, categoria, unidade e busca, para encontrar rapidamente o que preciso.

**Why this priority**: A triagem e acompanhamento dependem da capacidade de localizar chamados relevantes.

**Independent Test**: Pode ser testado carregando a listagem e aplicando filtros para verificar que os resultados refletem os criterios.

**Acceptance Scenarios**:

1. **Given** um usuario autorizado, **When** ele aplica filtros de status e categoria, **Then** a lista exibe apenas chamados correspondentes.
2. **Given** um usuario autorizado, **When** ele navega entre paginas da listagem, **Then** os resultados mantem os filtros ativos e a pagina correta.

---

### User Story 3 - Acompanhar detalhes e aprovacoes (Priority: P3)

Como usuario autorizado, quero acessar o detalhe do chamado de TI para ver historico, comentarios, aprovacoes e anexos, de modo a acompanhar o andamento.

**Why this priority**: Transparencia e controle do fluxo dependem do acesso ao detalhe do chamado.

**Independent Test**: Pode ser testado abrindo o detalhe de um chamado existente e validando a visibilidade por perfil.

**Acceptance Scenarios**:

1. **Given** um usuario de TI ou perfil global, **When** ele acessa um chamado de TI, **Then** ele visualiza o detalhe completo do chamado.
2. **Given** um usuario comum, **When** ele acessa um chamado de TI que nao e seu, **Then** o acesso e negado.
3. **Given** um chamado que exige aprovacao, **When** uma aprovacao e registrada, **Then** o status do chamado e atualizado conforme a regra de aprovacao vigente.

---

### Edge Cases

- O que acontece quando a categoria selecionada esta inativa ou indisponivel no momento do envio?
- Como o sistema reage quando o usuario tenta acessar um chamado de TI sem permissao?
- O que acontece quando um chamado exige aprovacao mas nao ha responsavel elegivel?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir a abertura de chamados de TI por usuarios de qualquer departamento.
- **FR-002**: O sistema MUST exigir a selecao de uma categoria de TI dentre as opcoes pre-definidas (Equipamento, Rede, Internet, Outros).
- **FR-003**: O sistema MUST exigir o preenchimento do tipo de equipamento para todo chamado de TI.
- **FR-004**: O sistema MUST aplicar o fluxo de aprovacao padrao quando o chamado de TI exigir aprovacao.
- **FR-005**: O sistema MUST permitir que usuarios de TI (Analista/Gerente) e perfis globais vejam todos os chamados de TI.
- **FR-006**: O sistema MUST restringir usuarios comuns a visualizar apenas seus proprios chamados de TI.
- **FR-007**: O sistema MUST oferecer listagem de chamados de TI com filtros por status, prioridade, categoria, unidade e busca textual.
- **FR-008**: O sistema MUST apresentar no detalhe do chamado seu historico, comentarios, aprovacoes e anexos quando existirem.
- **FR-009**: O sistema MUST registrar e exibir os dados especificos de TI (categoria e tipo de equipamento) associados ao chamado.

### Key Entities *(include if feature involves data)*

- **Chamado de TI**: Registro de solicitacao com titulo, descricao, status, prioridade, solicitante e datas relevantes.
- **Detalhe de TI**: Informacoes especificas do chamado de TI, incluindo categoria e tipo de equipamento.
- **Categoria de TI**: Classificacao do chamado (Equipamento, Rede, Internet, Outros) usada para triagem e filtros.
- **Aprovacao**: Decisao registrada por responsaveis quando o chamado exige aprovacao.
- **Comentario**: Observacoes adicionadas pelos participantes para acompanhamento.
- **Historico**: Registro de mudancas de status e eventos do chamado.
- **Anexo**: Arquivo associado ao chamado para complementar informacoes.

### Assumptions

- O fluxo de aprovacao segue o padrao definido nas regras de aprovacao existentes do modulo de chamados.
- Existem perfis de usuario identificados como TI (Analista e Gerente) e perfis globais com visao completa.
- As categorias iniciais de TI sao Equipamento, Rede, Internet e Outros.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% dos usuarios conseguem abrir um chamado de TI completo em ate 3 minutos.
- **SC-002**: 100% dos chamados de TI registrados possuem categoria e tipo de equipamento preenchidos.
- **SC-003**: 90% das buscas de chamados de TI com filtros retornam o chamado desejado em ate 10 segundos.
- **SC-004**: 99% dos fluxos de aprovacao de chamados de TI registram a decisao correta sem retrabalho manual.
