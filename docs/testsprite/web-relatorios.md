# TestSprite - Web - Relatorios

## Summary
- Relatorios de chamados e supervisao
- Filtros, estatisticas e exportacao

## Scope
**In scope**
- Relatorio de chamados
- Relatorio de supervisao
- Exportacao PDF/Excel

**Out of scope**
- BI externo

## Preconditions
- Usuario autenticado com permissao de relatorios
- Dados disponiveis no periodo

## Test data
- chamados_finalizados
- execucoes_supervisao

## Test cases
### WEB-REP-001 - Relatorio de chamados com filtros
**Steps**
1. Acessar Relatorios > Chamados
2. Aplicar filtros (periodo, status, unidade)

**Expected result**
- Tabela e estatisticas atualizadas

### WEB-REP-002 - Exportar PDF de chamados
**Steps**
1. Gerar relatorio com filtros
2. Exportar em PDF

**Expected result**
- Arquivo PDF baixado

### WEB-REP-003 - Exportar Excel de chamados
**Steps**
1. Gerar relatorio com filtros
2. Exportar em Excel

**Expected result**
- Arquivo Excel baixado

### WEB-REP-004 - Relatorio de supervisao com filtros
**Steps**
1. Acessar Relatorios > Supervisao
2. Aplicar filtros

**Expected result**
- Dados e estatisticas atualizados

### WEB-REP-005 - Exportar PDF/Excel de supervisao
**Steps**
1. Gerar relatorio de supervisao
2. Exportar PDF e Excel

**Expected result**
- Arquivos gerados com sucesso

### WEB-REP-006 - Restricao por permissao
**Steps**
1. Logar com usuario sem permissao
2. Tentar acessar relatorios

**Expected result**
- Acesso bloqueado

## Assumptions
- Filtros suportam combinacoes de periodo e unidade

## Risks
- Relatorios grandes podem ter tempo de resposta alto
