# TestSprite - Mobile - Notifications

## Summary
- Listagem e leitura de notificacoes
- Navegacao a partir de notificacao

## Scope
**In scope**
- Lista de notificacoes
- Marcar como lida
- Navegar ao tocar notificacao

**Out of scope**
- Configuracao de push externo

## Preconditions
- Usuario autenticado
- Notificacoes geradas no sistema

## Test data
- notificacao_nao_lida

## Test cases
### MOB-NOT-001 - Listar notificacoes
**Steps**
1. Acessar modulo Notifications

**Expected result**
- Lista exibida

### MOB-NOT-002 - Marcar como lida
**Steps**
1. Abrir notificacao nao lida

**Expected result**
- Status muda para lida

### MOB-NOT-003 - Navegar a partir da notificacao
**Steps**
1. Tocar em uma notificacao com link

**Expected result**
- Abre o detalhe relacionado

## Assumptions
- Notificacoes possuem deeplink para entidades

## Risks
- Falhas de sincronizacao podem duplicar notificacoes
