# TestSprite - Web - API Exports

## Summary
- Endpoints de exportacao de relatorios e checklists
- Validacao de parametros e autorizacao

## Scope
**In scope**
- PDF de checklist por executionId
- PDF/Excel de relatorios de chamados
- PDF/Excel de relatorios de supervisao

**Out of scope**
- Endpoints nao expostos no app

## Preconditions
- Usuario autenticado com permissao de relatorios/checklists
- IDs validos para testes

## Test data
- executionId_valido
- filtros_relatorio_validos

## Test cases
### WEB-API-001 - Exportar PDF de checklist
**Steps**
1. Chamar `/api/checklists/{executionId}/pdf`

**Expected result**
- Resposta 200
- PDF retornado

### WEB-API-002 - Exportar PDF com executionId invalido
**Steps**
1. Chamar `/api/checklists/{executionId_invalido}/pdf`

**Expected result**
- Resposta 404 ou erro tratado

### WEB-API-003 - Exportar PDF de relatorio de chamados
**Steps**
1. Chamar `/api/relatorios/chamados/pdf` com filtros

**Expected result**
- PDF retornado

### WEB-API-004 - Exportar Excel de relatorio de chamados
**Steps**
1. Chamar `/api/relatorios/chamados/excel` com filtros

**Expected result**
- Excel retornado

### WEB-API-005 - Exportar PDF de relatorio de supervisao
**Steps**
1. Chamar `/api/relatorios/supervisao/pdf` com filtros

**Expected result**
- PDF retornado

### WEB-API-006 - Exportar Excel de relatorio de supervisao
**Steps**
1. Chamar `/api/relatorios/supervisao/excel` com filtros

**Expected result**
- Excel retornado

### WEB-API-007 - Acesso nao autorizado
**Steps**
1. Chamar endpoint sem token valido

**Expected result**
- Resposta 401/403

## Assumptions
- Endpoints exigem autenticacao

## Risks
- Exportacao pode ser lenta para volumes altos
