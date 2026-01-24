# TestSprite - Mobile - User Permissions

## Summary
- Permissoes e controle de acesso no mobile
- Comportamento de telas protegidas

## Scope
**In scope**
- Bloqueio de funcionalidades sem permissao
- Exibicao condicional de elementos

**Out of scope**
- Alteracao de permissoes (web)

## Preconditions
- Usuarios com perfis diferentes
- Permissoes configuradas no sistema

## Test data
- usuario_sem_permissao_checklist
- usuario_com_permissao_checklist

## Test cases
### MOB-PERM-001 - Bloqueio de acesso
**Steps**
1. Logar com usuario sem permissao
2. Tentar acessar modulo bloqueado

**Expected result**
- Modulo oculto ou acesso negado

### MOB-PERM-002 - Acesso permitido
**Steps**
1. Logar com usuario com permissao
2. Acessar modulo

**Expected result**
- Modulo acessivel

### MOB-PERM-003 - Guard de tela protegida
**Steps**
1. Acessar diretamente uma rota protegida

**Expected result**
- Redireciona para tela permitida ou mostra bloqueio

## Assumptions
- Guards de permissao estao ativos no app

## Risks
- Cache de permissao pode exibir tela errada apos mudanca de perfil
