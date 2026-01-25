# Data Model: Fluxo de aprovacao de chamados - Operacoes

## Entities

### Chamado

- **Fields**: id, departamento, criador_id, status, criado_em, atualizado_em
- **Relationships**: 1:N com Aprovacao de chamado
- **Validation Rules**:
  - Departamento define se a cadeia especial de Operacoes se aplica.
  - Status inicial depende do cargo do criador.

### Aprovacao de chamado

- **Fields**: id, chamado_id, nivel (1/2/3), papel_requerido, status (pendente/aprovado/recusado), aprovador_id, criado_em, atualizado_em
- **Relationships**: N:1 com Chamado
- **Validation Rules**:
  - Nivel e papel_requerido devem ser consistentes com a hierarquia de Operacoes.
  - Apenas um aprovador pode concluir cada aprovacao.

### Usuario

- **Fields**: id, nome, cargos_operacoes (lista), departamento_principal
- **Relationships**: 1:N com Chamado (criador), 1:N com Aprovacao de chamado (aprovador)
- **Validation Rules**:
  - Para Operacoes, o cargo de maior nivel define o primeiro aprovador.

## State Transitions

### Chamado

- **Criado por Manobrista**: status inicial "Aguardando aprovacao do encarregado" → "Aguardando aprovacao do supervisor" → "Aguardando aprovacao do gerente de operacoes" → "Aguardando triagem"
- **Criado por Encarregado**: status inicial "Aguardando aprovacao do supervisor" → "Aguardando aprovacao do gerente de operacoes" → "Aguardando triagem"
- **Criado por Supervisor**: status inicial "Aguardando aprovacao do gerente de operacoes" → "Aguardando triagem"
- **Criado por Gerente de Operacoes**: status inicial "Aguardando triagem" (sem aprovacoes)
