# TestSprite - Web - Configuracoes

## Summary
- Parametros do sistema e cadastros auxiliares
- Permissoes, fornecedores, departamentos, uniformes e sistema

## Scope
**In scope**
- Chamados (categorias)
- Departamentos e cargos
- Fornecedores
- Permissoes
- Sistema (email, geral, notificacoes, upload)
- Uniformes
- Unidades e checklists (acesso)

**Out of scope**
- Configuracoes de infraestrutura externa

## Preconditions
- Usuario admin
- Permissoes de configuracao habilitadas

## Test data
- usuario_admin
- fornecedor_padrao

## Test cases
### WEB-CFG-001 - Acessar pagina de configuracoes
**Steps**
1. Acessar Configuracoes
2. Navegar entre secoes

**Expected result**
- Secoes carregam sem erros

### WEB-CFG-002 - Gerenciar categorias de chamados
**Steps**
1. Abrir Configuracoes > Chamados
2. Criar e editar categoria

**Expected result**
- Categoria criada e listada

### WEB-CFG-003 - Criar departamento e cargo
**Steps**
1. Abrir Configuracoes > Departamentos
2. Criar departamento
3. Criar cargo dentro do departamento

**Expected result**
- Departamento e cargo salvos

### WEB-CFG-004 - Editar departamento
**Steps**
1. Abrir um departamento existente
2. Alterar dados e salvar

**Expected result**
- Alteracoes persistidas

### WEB-CFG-005 - Gerenciar fornecedores
**Steps**
1. Abrir Configuracoes > Fornecedores
2. Criar, editar e inativar fornecedor

**Expected result**
- Fornecedor atualizado na lista

### WEB-CFG-006 - Matriz de permissoes
**Steps**
1. Abrir Configuracoes > Permissoes
2. Alterar permissoes e salvar

**Expected result**
- Matriz salva com sucesso

### WEB-CFG-007 - Configuracoes do sistema
**Steps**
1. Abrir Configuracoes > Sistema
2. Ajustar email, geral, notificacoes e upload
3. Salvar

**Expected result**
- Configuracoes persistidas

### WEB-CFG-008 - Uniformes e estoque
**Steps**
1. Abrir Configuracoes > Uniformes
2. Criar uniforme e registrar ajuste de estoque

**Expected result**
- Item aparece na lista
- Transacao registrada

### WEB-CFG-009 - Acesso a paginas auxiliares
**Steps**
1. Acessar Configuracoes > Unidades e Checklists

**Expected result**
- Paginas carregam corretamente

### WEB-CFG-010 - Restricao por permissao
**Steps**
1. Logar com usuario sem permissao de configuracao
2. Tentar acessar Configuracoes

**Expected result**
- Acesso bloqueado ou oculto

## Assumptions
- Apenas admin pode editar configuracoes criticas

## Risks
- Mudancas de permissao podem impactar acessos do sistema
