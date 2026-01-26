# Feature Specification: Correção de Bugs do Módulo de Compras

**Feature Branch**: `006-fix-compras-bugs`
**Created**: 2026-01-25
**Status**: Draft
**Input**: User description: "Corrigir bugs do módulo de execução de compras para o perfil comprador"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Comprador Salva Cotação com Sucesso (Priority: P1)

Como comprador, preciso conseguir salvar cotações no sistema para dar continuidade ao fluxo de compras. Atualmente, ao tentar salvar uma cotação, o sistema bloqueia a operação com erro de política de segurança.

**Why this priority**: Este bug bloqueia completamente o fluxo de cotações. Sem poder salvar cotações, o comprador não consegue executar sua função principal.

**Independent Test**: Pode ser testado logando como comprador, acessando um chamado de compras e tentando adicionar uma cotação. A cotação deve ser salva com sucesso.

**Acceptance Scenarios**:

1. **Given** um comprador logado visualizando um chamado de compras, **When** ele preenche os dados da cotação e clica em salvar, **Then** a cotação deve ser persistida e exibida na lista de cotações do chamado.
2. **Given** um comprador com cotação salva, **When** ele visualiza o chamado novamente, **Then** a cotação deve estar visível com todos os dados informados.

---

### User Story 2 - Interface Reflete Mudança de Status Corretamente (Priority: P1)

Como comprador, ao alterar o status de um chamado (iniciar cotação, iniciar andamento, negar), preciso ver a mudança refletida na interface imediatamente para saber que minha ação foi efetivada.

**Why this priority**: Atualmente o toast indica sucesso mas a interface não atualiza, causando confusão e retrabalho. O comprador não sabe se a ação funcionou.

**Independent Test**: Pode ser testado clicando em "Iniciar Cotação" e verificando se o status visual e os botões disponíveis mudam de acordo.

**Acceptance Scenarios**:

1. **Given** um chamado no status "Aguardando", **When** o comprador clica em "Iniciar Cotação", **Then** o status deve mudar visualmente para "Em Cotação" e o botão "Iniciar Cotação" deve desaparecer ou ser desabilitado.
2. **Given** um chamado no status "Em Cotação", **When** o comprador clica em "Iniciar Andamento", **Then** o status deve mudar visualmente para "Em Andamento" e os botões devem refletir o novo estado.
3. **Given** um chamado aguardando, **When** o comprador clica em "Negar", **Then** o status deve mudar para "Negado" e as ações de progresso devem ser desabilitadas.

---

### User Story 3 - Comprador Visualiza Apenas Chamados Prontos para Execução (Priority: P2)

Como comprador, ao acessar o hub de chamados, devo ver apenas os chamados que estão prontos para eu executar, não todos os chamados do sistema.

**Why this priority**: A visualização incorreta dificulta o trabalho do comprador que precisa filtrar manualmente os chamados relevantes.

**Independent Test**: Pode ser testado logando como comprador e verificando se a lista exibe apenas chamados com status apropriado para execução.

**Acceptance Scenarios**:

1. **Given** um comprador logado, **When** ele acessa o hub de chamados, **Then** deve ver apenas chamados com status "Aprovado".
2. **Given** um comprador logado, **When** existem chamados em status "Rascunho" ou "Aguardando Aprovação", **Then** estes chamados não devem aparecer na lista do comprador.

---

### User Story 4 - Filtro de Departamento Exibe Opções Corretas (Priority: P2)

Como comprador, o filtro de departamento deve listar apenas Compras e Manutenção, que são os departamentos que o setor de compras atende.

**Why this priority**: O filtro atual mostra RH e TI, que não são relevantes para o comprador, tornando o filtro inútil.

**Independent Test**: Pode ser testado verificando as opções do dropdown de departamento na tela de chamados.

**Acceptance Scenarios**:

1. **Given** um comprador logado no hub de chamados, **When** ele abre o dropdown de filtro por departamento, **Then** deve ver apenas as opções "Compras" e "Manutenção".
2. **Given** um comprador logado, **When** ele filtra por "Compras", **Then** deve ver apenas chamados do departamento de Compras.

---

### User Story 5 - Qualquer Usuário Pode Abrir Chamado de TI (Priority: P2)

Como comprador (ou qualquer funcionário), preciso poder abrir chamados de TI para solicitar suporte técnico. A restrição de TI deve ser apenas para executar chamados, não para abri-los.

**Why this priority**: Bloqueia funcionários de solicitar suporte de TI, gerando gargalos operacionais.

**Independent Test**: Pode ser testado logando como comprador e tentando criar um novo chamado de TI.

**Acceptance Scenarios**:

1. **Given** um comprador logado, **When** ele acessa a tela de novo chamado de TI, **Then** deve conseguir visualizar o formulário e criar o chamado.
2. **Given** um comprador logado, **When** ele tenta acessar a área de execução de chamados de TI, **Then** deve ser bloqueado (esta restrição permanece).

---

### User Story 6 - Máscaras de Formatação nos Campos de Cotação (Priority: P3)

Como comprador, ao preencher uma cotação, os campos CNPJ, contato e preço devem ter formatação adequada para facilitar o preenchimento e evitar erros.

**Why this priority**: Melhoria de usabilidade que reduz erros de digitação, mas não bloqueia o fluxo.

**Independent Test**: Pode ser testado abrindo o modal de cotação e verificando se os campos aplicam máscaras durante a digitação.

**Acceptance Scenarios**:

1. **Given** o modal de adicionar cotação aberto, **When** o comprador digita um CNPJ, **Then** o campo deve formatar automaticamente (XX.XXX.XXX/XXXX-XX).
2. **Given** o modal de adicionar cotação aberto, **When** o comprador digita um telefone no campo contato, **Then** o campo deve formatar automaticamente ((XX) XXXXX-XXXX).
3. **Given** o modal de adicionar cotação aberto, **When** o comprador digita um valor no campo preço, **Then** o campo deve formatar como moeda brasileira (R$ X.XXX,XX).

---

### User Story 7 - Enviar Comentário com Ctrl+Enter (Priority: P3)

Como comprador, quero poder enviar comentários usando o atalho Ctrl+Enter para maior agilidade.

**Why this priority**: Melhoria de produtividade, mas existe alternativa (botão Enviar).

**Independent Test**: Pode ser testado digitando um comentário e pressionando Ctrl+Enter.

**Acceptance Scenarios**:

1. **Given** o campo de comentário preenchido, **When** o comprador pressiona Ctrl+Enter, **Then** o comentário deve ser enviado.
2. **Given** o campo de comentário vazio, **When** o comprador pressiona Ctrl+Enter, **Then** nada deve acontecer (validação de campo obrigatório).

---

### User Story 8 - Histórico em Português (Priority: P3)

Como comprador brasileiro, o histórico do chamado deve exibir labels em português, não em inglês.

**Why this priority**: Melhoria de experiência do usuário, não afeta funcionalidade.

**Independent Test**: Pode ser testado alterando o status de um chamado e verificando o texto no histórico.

**Acceptance Scenarios**:

1. **Given** uma mudança de status registrada no histórico, **When** o comprador visualiza o histórico, **Then** deve ver "Status alterado" ao invés de "status_change".

---

### Edge Cases

- CNPJ inválido: Sistema bloqueia envio no frontend com mensagem de erro antes de submeter.
- Falha na atualização de status: Sistema exibe mensagem de erro e mantém estado anterior; usuário pode tentar novamente.
- Concorrência: Last write wins - última alteração prevalece; usuário que teve dados sobrescritos recebe notificação ao recarregar.
- Limites de preço: Valor mínimo R$ 0,01; sem limite máximo. Valores zero ou negativos são bloqueados.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistema DEVE permitir que compradores insiram cotações na tabela de cotações do chamado.
- **FR-002**: Sistema DEVE atualizar a interface imediatamente após mudança de status de um chamado (sem necessidade de refresh manual).
- **FR-003**: Sistema DEVE exibir para compradores apenas chamados com status "Aprovado" (aprovados pelo gerente de operações).
- **FR-004**: Sistema DEVE filtrar as opções de departamento baseado no perfil do usuário (comprador vê apenas Compras e Manutenção).
- **FR-005**: Sistema DEVE permitir que qualquer usuário autenticado crie chamados de TI, independente do departamento.
- **FR-006**: Sistema DEVE manter restrição de acesso à área de execução de TI apenas para usuários do departamento de TI.
- **FR-007**: Sistema DEVE aplicar máscara de formatação no campo CNPJ (formato XX.XXX.XXX/XXXX-XX) e bloquear envio se formato inválido (validação no frontend).
- **FR-008**: Sistema DEVE aplicar máscara de formatação no campo telefone (formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX).
- **FR-009**: Sistema DEVE aplicar máscara de formatação no campo preço (formato monetário brasileiro R$ X.XXX,XX) com valor mínimo de R$ 0,01.
- **FR-010**: Sistema DEVE permitir envio de comentário através do atalho Ctrl+Enter.
- **FR-011**: Sistema DEVE exibir textos do histórico em português brasileiro (ex: "Status alterado" ao invés de "status_change").
- **FR-012**: Sistema DEVE exibir mensagem de erro e manter estado anterior quando uma operação de mudança de status falhar no servidor.

### Key Entities

- **Chamado (Ticket)**: Solicitação de compra ou serviço. Possui status que indica sua fase no fluxo.
- **Cotação (Quotation)**: Proposta de fornecedor para um chamado. Contém CNPJ do fornecedor, contato, preço e observações.
- **Histórico (History)**: Registro de eventos e mudanças de um chamado. Contém tipo de ação, data e usuário responsável.
- **Comprador**: Usuário responsável por executar chamados de compras, criar cotações e dar andamento ao fluxo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das cotações criadas por compradores autorizados são salvas com sucesso (zero erros de permissão).
- **SC-002**: Interface reflete mudanças de status em menos de 2 segundos após a ação do usuário.
- **SC-003**: Compradores visualizam apenas chamados relevantes ao seu trabalho (redução de 80% nos chamados listados comparado ao cenário atual).
- **SC-004**: Usuários conseguem criar chamados de TI independente do seu departamento em 100% das tentativas.
- **SC-005**: Taxa de erros de digitação em campos formatados (CNPJ, telefone, preço) reduz em 90% após aplicação das máscaras.
- **SC-006**: 100% dos textos de histórico são exibidos em português brasileiro.

## Clarifications

### Session 2026-01-25

- Q: Ao tentar salvar cotação com CNPJ inválido, qual o comportamento? → A: Bloquear envio no frontend (validação antes de submeter)
- Q: Se atualização de status falhar no servidor, como o sistema deve se comportar? → A: Exibir erro e manter estado anterior (usuário clica de novo)
- Q: Se dois compradores atualizarem o mesmo chamado simultaneamente, qual o comportamento? → A: Last write wins - último salva, primeiro perde (com notificação)
- Q: Para o campo preço da cotação, devem existir limites de valor? → A: Mínimo R$ 0,01, sem máximo
- Q: Qual status define um chamado como "pronto para execução" para o comprador? → A: Status "Aprovado" (após aprovação do gerente de operações)

## Assumptions

- O status "Aprovado" é o indicador de que o chamado está pronto para execução pelo comprador.
- O formato de telefone aceita tanto celular (9 dígitos) quanto fixo (8 dígitos).
- A validação de CNPJ será apenas de formato, não verificação em base externa.
- O campo de email no contato não requer máscara, apenas o telefone.
- As políticas RLS atuais precisam ser ajustadas para permitir INSERT por compradores na tabela de cotações.
