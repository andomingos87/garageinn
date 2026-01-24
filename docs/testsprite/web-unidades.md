# TestSprite - Web - Unidades

## Summary
- Cadastro, edicao e detalhe de unidades
- Importacao por CSV e vinculo de supervisores

## Scope
**In scope**
- Lista e filtros
- Criar e editar unidade
- Detalhe e historico
- Importacao CSV
- Vincular supervisores

**Out of scope**
- Integracoes externas de cadastro

## Preconditions
- Usuario com permissao de unidades
- CSV de exemplo disponivel

## Test data
- unidade_padrao
- csv_unidades_valido

## Test cases
### WEB-UNI-001 - Listar unidades
**Steps**
1. Acessar Unidades
2. Aplicar filtros

**Expected result**
- Lista atualiza conforme filtros

### WEB-UNI-002 - Criar nova unidade
**Steps**
1. Clicar em "Nova unidade"
2. Preencher campos obrigatorios
3. Salvar

**Expected result**
- Unidade criada e visivel na lista

### WEB-UNI-003 - Editar unidade
**Steps**
1. Abrir unidade existente
2. Editar dados
3. Salvar

**Expected result**
- Alteracoes persistidas

### WEB-UNI-004 - Ver detalhe e historico
**Steps**
1. Abrir pagina de detalhe

**Expected result**
- Historico e metricas exibidas

### WEB-UNI-005 - Importar CSV
**Steps**
1. Acessar Importar
2. Enviar CSV valido
3. Revisar preview e confirmar

**Expected result**
- Importacao concluida
- Relatorio de importacao exibido

### WEB-UNI-006 - Vincular supervisores
**Steps**
1. Acessar Vincular supervisores
2. Selecionar supervisores e salvar

**Expected result**
- Supervisores associados a unidade

### WEB-UNI-007 - Acoes de status
**Steps**
1. Abrir unidade
2. Alterar status (ativo/inativo)

**Expected result**
- Status atualizado

### WEB-UNI-008 - Restricao por permissao
**Steps**
1. Logar sem permissao
2. Tentar acessar Unidades

**Expected result**
- Acesso bloqueado

## Assumptions
- CSV segue o template esperado

## Risks
- Erros de importacao podem gerar dados inconsistentes
