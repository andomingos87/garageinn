# Data Model - Modulo de Chamados de TI

## Entities

### Chamado (Ticket)

**Descricao**: Registro principal de solicitacao de TI.  
**Campos relevantes**:
- id
- title
- description
- status
- priority
- requester_id
- department_id (TI)
- unit_id (opcional)
- perceived_urgency (opcional)
- created_at, updated_at

**Relacionamentos**:
- 1:1 com **Detalhe de TI**
- 1:N com **Comentarios**
- 1:N com **Historico**
- 1:N com **Aprovacoes**
- 1:N com **Anexos**
- N:1 com **Categoria de TI**

**Regras/validacoes**:
- status inicial deve ser valido conforme regra de aprovacao
- department_id deve identificar o departamento de TI

### Detalhe de TI

**Descricao**: Dados especificos do chamado de TI.  
**Campos**:
- ticket_id (FK do chamado)
- equipment_type (obrigatorio)

**Regras/validacoes**:
- equipment_type e obrigatorio
- existe apenas um detalhe por chamado

### Categoria de TI

**Descricao**: Classificacao do chamado para triagem e filtros.  
**Campos**:
- id
- name
- department_id (TI)
- status (ativa/inativa)

**Regras/validacoes**:
- categoria deve estar ativa para ser selecionada

### Aprovacao

**Descricao**: Registro de decisao quando o chamado requer aprovacao.  
**Campos**:
- id
- ticket_id
- approver_id
- level
- decision
- decided_at

### Comentario

**Descricao**: Observacoes de acompanhamento do chamado.  
**Campos**:
- id
- ticket_id
- author_id
- content
- created_at

### Historico

**Descricao**: Registro de mudancas relevantes do chamado.  
**Campos**:
- id
- ticket_id
- event_type
- from_status
- to_status
- created_at

### Anexo

**Descricao**: Arquivo associado ao chamado.  
**Campos**:
- id
- ticket_id
- file_name
- file_url
- uploaded_at

## Views

### tickets_it_with_details

**Descricao**: View de leitura para listagem, combinando ticket + categoria + detalhes de TI.  
**Campos principais**:
- ticket fields
- category_name
- equipment_type

## State Transitions (alto nivel)

- **Criacao**: status inicial definido pela regra de aprovacao (ex.: aguardando aprovacao ou triagem).
- **Aprovacao**: status avanca conforme nivel aprovado.
