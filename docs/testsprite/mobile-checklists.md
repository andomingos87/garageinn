# TestSprite - Mobile - Checklists

## Summary
- Execucao de checklists no mobile
- Suporte a rascunho e fotos

## Scope
**In scope**
- Lista de checklists
- Execucao e respostas
- Rascunho
- Fotos anexas

**Out of scope**
- Supervisao (se nao existir no app)

## Preconditions
- Usuario autenticado
- Templates ativos vinculados a unidade

## Test data
- checklist_template_padrao
- unidade_padrao
- usuario_tecnico

## Test cases
### MOB-CK-001 - Listar checklists
**Steps**
1. Acessar modulo Checklists

**Expected result**
- Lista carregada

### MOB-CK-002 - Iniciar execucao
**Steps**
1. Selecionar checklist
2. Iniciar execucao

**Expected result**
- Execucao iniciada com progresso

### MOB-CK-003 - Responder perguntas
**Steps**
1. Preencher respostas de tipos diferentes
2. Avancar para proxima pergunta

**Expected result**
- Respostas registradas

### MOB-CK-004 - Salvar rascunho e retomar
**Steps**
1. Iniciar execucao
2. Sair antes de finalizar
3. Retomar execucao

**Expected result**
- Progresso preservado

### MOB-CK-005 - Anexar foto
**Steps**
1. Abrir pergunta com foto
2. Selecionar imagem

**Expected result**
- Foto anexada com preview

### MOB-CK-006 - Finalizar execucao
**Steps**
1. Responder todas as perguntas
2. Concluir

**Expected result**
- Execucao finalizada
- Status atualizado

### MOB-CK-007 - Execucao sem rede
**Steps**
1. Desativar rede
2. Iniciar e responder checklist
3. Salvar rascunho

**Expected result**
- Rascunho salvo localmente
- Sincroniza quando a rede voltar

### MOB-CK-008 - Restricao por permissao
**Steps**
1. Logar usuario sem permissao
2. Tentar acessar checklists

**Expected result**
- Acesso bloqueado

## Assumptions
- App possui modo offline basico para rascunho

## Risks
- Fotos podem falhar em dispositivos com permissao negada
