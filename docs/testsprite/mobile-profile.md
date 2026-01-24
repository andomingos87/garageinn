# TestSprite - Mobile - Profile

## Summary
- Visualizar e editar perfil no mobile
- Alteracao de senha

## Scope
**In scope**
- Ver perfil
- Editar perfil
- Alterar senha

**Out of scope**
- Integracao com avatar externo

## Preconditions
- Usuario autenticado

## Test data
- usuario_admin

## Test cases
### MOB-PRF-001 - Ver perfil
**Steps**
1. Acessar Profile

**Expected result**
- Dados do usuario exibidos

### MOB-PRF-002 - Editar perfil
**Steps**
1. Acessar Edit Profile
2. Alterar dados e salvar

**Expected result**
- Dados atualizados

### MOB-PRF-003 - Alterar senha
**Steps**
1. Acessar Change Password
2. Informar senha atual e nova

**Expected result**
- Senha atualizada

## Assumptions
- Campos editaveis variam por perfil

## Risks
- Falha de rede pode impedir salvar alteracoes
