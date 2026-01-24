# TestSprite - Web - Chamados

## Summary
- Hub de chamados e fluxos por area
- Criacao, triagem, aprovacao e acompanhamento

## Scope
**In scope**
- Lista, filtros e paginacao do hub
- Criacao e detalhes de chamado
- Fluxos por area (comercial, compras, financeiro, manutencao, rh, sinistros)
- Acoes administrativas

**Out of scope**
- Integracoes externas nao habilitadas no ambiente

## Preconditions
- Usuario autenticado
- Permissoes por departamento configuradas
- Unidades ativas e categorias disponiveis

## Test data
- usuario_comercial, usuario_financeiro, usuario_compras, usuario_rh, usuario_sinistros
- unidade_padrao
- chamado_padrao_em_andamento

## Test cases
### WEB-CH-001 - Listar chamados no hub
**Steps**
1. Acessar modulo Chamados
2. Verificar lista e cards de status

**Expected result**
- Lista carregada com total e status
- Cards de estatistica exibidos

### WEB-CH-002 - Filtrar e paginar
**Steps**
1. Aplicar filtro por status e periodo
2. Navegar para a proxima pagina

**Expected result**
- Lista atualiza conforme filtros
- Paginacao mantem os filtros aplicados

### WEB-CH-003 - Criar novo chamado generico
**Steps**
1. Clicar em novo chamado
2. Preencher campos obrigatorios
3. Salvar

**Expected result**
- Chamado criado com status inicial
- Redireciona para detalhes

### WEB-CH-004 - Visualizar detalhes de chamado
**Steps**
1. Abrir um chamado existente

**Expected result**
- Informacoes do chamado exibidas
- Timeline e comentarios carregados

### WEB-CH-005 - Atualizar status do chamado
**Steps**
1. Abrir detalhes de chamado
2. Executar acao de mudanca de status

**Expected result**
- Status atualizado
- Timeline registra a alteracao

### WEB-CH-006 - Comentarios e anexos
**Steps**
1. Adicionar comentario
2. Anexar arquivo (quando permitido)

**Expected result**
- Comentario aparece na lista
- Anexo exibido no detalhe

### WEB-CH-007 - Fluxo Comercial - criar e validar campos
**Steps**
1. Acessar Chamados > Comercial
2. Criar chamado com campos especificos

**Expected result**
- Validacoes proprias do formulario aplicadas
- Chamado comercial criado

### WEB-CH-008 - Fluxo Compras - solicitacao e aprovacao
**Steps**
1. Acessar Chamados > Compras
2. Criar solicitacao com dados obrigatorios
3. Registrar aprovacao ou rejeicao

**Expected result**
- Solicitacao criada
- Status reflete a decisao

### WEB-CH-009 - Fluxo Financeiro - aprovacoes
**Steps**
1. Acessar Chamados > Financeiro
2. Abrir um chamado pendente
3. Registrar aprovacao ou rejeicao

**Expected result**
- Status reflete a decisao
- Registro de aprovacao visivel

### WEB-CH-010 - Fluxo Manutencao - triagem e execucao
**Steps**
1. Acessar Chamados > Manutencao
2. Executar triagem e registrar execucao

**Expected result**
- Acoes registradas na timeline
- Status atualiza conforme etapa

### WEB-CH-011 - Fluxo RH - entrega de uniforme
**Steps**
1. Acessar Chamados > RH
2. Abrir chamado de uniforme
3. Registrar entrega

**Expected result**
- Evento de entrega registrado
- Status do chamado atualizado

### WEB-CH-012 - Fluxo Sinistros - anexos e compras
**Steps**
1. Acessar Chamados > Sinistros
2. Adicionar anexos e registrar compras/cotacoes

**Expected result**
- Itens adicionados aparecem no detalhe
- Status acompanha o fluxo

### WEB-CH-013 - Acoes administrativas
**Steps**
1. Acessar Chamados > Admin
2. Executar remocao de chamado

**Expected result**
- Chamado removido/arquivado conforme regra
- Lista atualiza

### WEB-CH-014 - Restricao por permissao
**Steps**
1. Logar com usuario sem permissao da area
2. Tentar acessar fluxo da area

**Expected result**
- Acesso bloqueado ou oculto

## Assumptions
- Cada area possui regras de status definidas
- Campos obrigatorios variam por area

## Risks
- Fluxos com aprovacao podem depender de perfis especificos
