# TestSprite - Mobile - Tickets

## Summary
- Criacao e acompanhamento de chamados no mobile
- Comentarios e anexos

## Scope
**In scope**
- Listagem de chamados
- Detalhe do chamado
- Criar chamado
- Comentarios e anexos

**Out of scope**
- Fluxos administrativos exclusivos do web

## Preconditions
- Usuario autenticado
- Permissoes de chamados configuradas

## Test data
- usuario_comercial
- chamado_padrao_em_andamento
- imagem_anexo_valida

## Test cases
### MOB-TCK-001 - Listar chamados
**Steps**
1. Acessar modulo Tickets

**Expected result**
- Lista carregada

### MOB-TCK-002 - Abrir detalhes do chamado
**Steps**
1. Selecionar um chamado na lista

**Expected result**
- Tela de detalhes exibida

### MOB-TCK-003 - Criar novo chamado
**Steps**
1. Iniciar novo chamado
2. Preencher dados obrigatorios
3. Salvar

**Expected result**
- Chamado criado
- Aparece na lista

### MOB-TCK-004 - Adicionar comentario
**Steps**
1. Abrir detalhes
2. Adicionar comentario

**Expected result**
- Comentario exibido na timeline

### MOB-TCK-005 - Anexar foto ou arquivo
**Steps**
1. Abrir detalhes
2. Adicionar anexo

**Expected result**
- Anexo salvo e exibido

### MOB-TCK-006 - Status e badges
**Steps**
1. Abrir detalhes de chamado
2. Verificar badge de status

**Expected result**
- Status exibido corretamente

### MOB-TCK-007 - Falha de API
**Steps**
1. Simular falha de rede
2. Acessar lista de tickets

**Expected result**
- Mensagem de erro exibida
- Sem crash

## Assumptions
- Mobile permite criar chamados basicos

## Risks
- Upload de anexos pode falhar em redes instaveis
