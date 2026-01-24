# Data Model - Modulo de Chamados de TI - Fluxo Basico

## Entities

### Chamado de TI (Ticket)

**Descricao**: Registro principal da solicitacao de TI.  
**Campos relevantes**:
- id
- title
- description
- status
- category_id
- requester_id
- created_at, updated_at

**Relacionamentos**:
- N:1 com **Categoria de TI**
- 1:N com **Aprovacoes**
- 1:N com **Anexos** (opcional)

**Regras/validacoes**:
- status inicial definido pela regra de aprovacao
- category_id obrigatorio

### Categoria de TI

**Descricao**: Classificacao do chamado para triagem.  
**Campos**:
- id
- name
- status (ativa/inativa)

**Regras/validacoes**:
- categoria deve estar ativa para selecao

### Aprovacao

**Descricao**: Registro de decisao quando o chamado exige aprovacao.  
**Campos**:
- id
- ticket_id
- approver_id
- level
- decision
- decided_at

### Anexo

**Descricao**: Arquivo associado ao chamado (opcional).  
**Campos**:
- id
- ticket_id
- file_name
- file_url
- uploaded_at

## Views

### tickets_it_ready

**Descricao**: View de leitura para listagem de chamados prontos para execucao.  
**Campos principais**:
- ticket fields
- category_name

## State Transitions (alto nivel)

- **Criacao**: status inicial definido pela regra de aprovacao (ex.: pronto para execucao quando nao exigir aprovacao).
- **Aprovacao**: status avanca para pronto para execucao quando aprovado.
- **Rejeicao**: segue a regra padrao existente.
