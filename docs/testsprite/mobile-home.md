# TestSprite - Mobile - Home

## Summary
- Home com visao de unidades e atalhos
- Navegacao para detalhes

## Scope
**In scope**
- Carregamento da Home
- Lista de unidades
- Detalhe de unidade

**Out of scope**
- Indicadores externos

## Preconditions
- Usuario autenticado
- Usuario com unidades vinculadas

## Test data
- usuario_supervisor
- unidade_padrao

## Test cases
### MOB-HOME-001 - Carregar home
**Steps**
1. Abrir app logado

**Expected result**
- Home carrega sem erros

### MOB-HOME-002 - Listar unidades
**Steps**
1. Verificar lista de unidades na home

**Expected result**
- Unidades exibidas corretamente

### MOB-HOME-003 - Detalhe de unidade
**Steps**
1. Selecionar uma unidade

**Expected result**
- Abre tela de detalhes

### MOB-HOME-004 - Estado vazio
**Steps**
1. Logar usuario sem unidades

**Expected result**
- Mensagem de vazio exibida

### MOB-HOME-005 - Atualizacao por pull-to-refresh
**Steps**
1. Puxar para atualizar a lista

**Expected result**
- Dados recarregados

## Assumptions
- Usuario pode ter mais de uma unidade

## Risks
- Falhas de rede podem bloquear carregamento inicial
