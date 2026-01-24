# TestSprite - Mobile - Settings

## Summary
- Preferencias e configuracoes do app

## Scope
**In scope**
- Acessar tela de Settings
- Alterar opcoes disponiveis
- Sair da conta (se disponivel)

**Out of scope**
- Configuracoes do SO do dispositivo

## Preconditions
- Usuario autenticado

## Test data
- usuario_admin

## Test cases
### MOB-SET-001 - Abrir Settings
**Steps**
1. Acessar Settings no app

**Expected result**
- Tela carrega sem erros

### MOB-SET-002 - Alterar opcao
**Steps**
1. Alterar uma opcao disponivel
2. Salvar ou retornar

**Expected result**
- Opcao persistida

### MOB-SET-003 - Logout a partir de Settings
**Steps**
1. Acionar logout (se disponivel)

**Expected result**
- Sessao encerrada

## Assumptions
- Existe ao menos uma opcao configuravel

## Risks
- Opcoes podem variar por ambiente
