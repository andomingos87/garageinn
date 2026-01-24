# TestSprite - Web - Perfil

## Summary
- Atualizacao de dados do usuario
- Upload de avatar e senha

## Scope
**In scope**
- Visualizar perfil
- Atualizar dados basicos
- Upload de avatar
- Alterar senha

**Out of scope**
- Integracao com provedores externos de avatar

## Preconditions
- Usuario autenticado

## Test data
- usuario_admin
- imagem_avatar_valida

## Test cases
### WEB-PRF-001 - Carregar dados do perfil
**Steps**
1. Acessar Perfil

**Expected result**
- Dados exibidos corretamente

### WEB-PRF-002 - Atualizar dados basicos
**Steps**
1. Editar nome/telefone (se disponivel)
2. Salvar

**Expected result**
- Dados atualizados no perfil

### WEB-PRF-003 - Upload de avatar
**Steps**
1. Selecionar imagem
2. Fazer upload

**Expected result**
- Avatar atualizado

### WEB-PRF-004 - Alterar senha
**Steps**
1. Informar senha atual e nova senha
2. Salvar

**Expected result**
- Senha alterada com sucesso

### WEB-PRF-005 - Validacao de campos obrigatorios
**Steps**
1. Remover dados obrigatorios
2. Salvar

**Expected result**
- Validacoes exibidas

## Assumptions
- Campos editaveis variam por perfil

## Risks
- Upload de avatar pode depender de storage externo
