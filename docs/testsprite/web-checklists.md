# TestSprite - Web - Checklists

## Summary
- Configuracao e execucao de checklists
- Supervisao e exportacao de resultados

## Scope
**In scope**
- Listagem de execucoes
- Configurar templates e perguntas
- Executar checklist
- Supervisao
- Exportacao PDF

**Out of scope**
- Integracoes externas nao configuradas

## Preconditions
- Usuario autenticado com permissao de checklist
- Unidades ativas
- Template disponivel

## Test data
- checklist_template_padrao
- unidade_padrao
- usuario_supervisor

## Test cases
### WEB-CK-001 - Listar execucoes
**Steps**
1. Acessar Checklists
2. Aplicar filtros e paginar

**Expected result**
- Lista atualiza com filtros
- Paginacao funcional

### WEB-CK-002 - Criar template de checklist
**Steps**
1. Acessar Checklists > Configurar
2. Criar novo template com perguntas

**Expected result**
- Template criado e listado

### WEB-CK-003 - Editar template e perguntas
**Steps**
1. Abrir template existente
2. Editar perguntas e salvar

**Expected result**
- Alteracoes persistidas

### WEB-CK-004 - Vincular unidades ao template
**Steps**
1. Abrir template
2. Atribuir unidades

**Expected result**
- Unidades vinculadas exibidas

### WEB-CK-005 - Iniciar execucao
**Steps**
1. Acessar Checklists > Executar
2. Selecionar unidade e iniciar

**Expected result**
- Execucao iniciada com progresso

### WEB-CK-006 - Responder perguntas e finalizar
**Steps**
1. Preencher respostas
2. Concluir checklist

**Expected result**
- Execucao finalizada
- Resultado aparece na lista

### WEB-CK-007 - Supervisao de execucao
**Steps**
1. Acessar Checklists > Supervisao
2. Iniciar supervisao

**Expected result**
- Execucao de supervisao registrada

### WEB-CK-008 - Exportar PDF
**Steps**
1. Abrir execucao finalizada
2. Clicar em exportar PDF

**Expected result**
- PDF gerado e baixado

### WEB-CK-009 - Permissao de acesso
**Steps**
1. Logar com usuario sem permissao
2. Tentar acessar Checklists

**Expected result**
- Acesso bloqueado

## Assumptions
- Perguntas podem ter tipos variados (texto, opcao, foto)

## Risks
- Exportacao pode falhar se dados incompletos
