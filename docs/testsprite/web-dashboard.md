# TestSprite - Web - Dashboard

## Summary
- Visao geral com indicadores e atalhos
- Navegacao rapida para modulos principais

## Scope
**In scope**
- Carregamento do dashboard
- Cards de indicadores
- Navegacao por atalhos

**Out of scope**
- Calculos internos de BI fora do sistema

## Preconditions
- Usuario autenticado
- Permissoes para visualizar o dashboard

## Test data
- Usuario com perfil de gestor
- Dados com chamados e checklists no periodo

## Test cases
### WEB-DB-001 - Carregar dashboard
**Steps**
1. Acessar a rota de dashboard

**Expected result**
- Pagina carrega sem erros
- Cards exibidos

### WEB-DB-002 - Estado vazio sem dados
**Steps**
1. Usar usuario sem dados no periodo
2. Acessar dashboard

**Expected result**
- Mensagens de vazio exibidas
- Sem erros na pagina

### WEB-DB-003 - Atalhos para modulos
**Steps**
1. Clicar em card ou atalho de Chamados

**Expected result**
- Navega para o modulo correto

### WEB-DB-004 - Permissao restrita
**Steps**
1. Logar com usuario de permissao limitada
2. Acessar dashboard

**Expected result**
- Somente indicadores permitidos sao exibidos

### WEB-DB-005 - Erro de API
**Steps**
1. Simular falha de API de indicadores
2. Recarregar dashboard

**Expected result**
- Mensagem de erro exibida
- Pagina permanece utilizavel

## Assumptions
- Indicadores sao carregados via API unica

## Risks
- Falhas na API podem impactar toda a visao do dashboard
