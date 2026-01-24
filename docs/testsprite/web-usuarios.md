# TestSprite - Web - Usuarios

## Summary
- Gestao de usuarios, convites e status
- Filtros, paginacao e impersonate

## Scope
**In scope**
- Listagem e filtros
- Criar usuario e enviar convite
- Editar usuario
- Reenviar convite
- Impersonate
- Alterar status

**Out of scope**
- Provedores externos de identidade

## Preconditions
- Usuario admin
- Email configurado para convites

## Test data
- usuario_admin
- usuario_novo_email

## Test cases
### WEB-USR-001 - Listar usuarios com filtros
**Steps**
1. Acessar Usuarios
2. Aplicar filtros e paginar

**Expected result**
- Lista atualizada
- Paginacao funcional

### WEB-USR-002 - Criar novo usuario
**Steps**
1. Clicar em "Novo usuario"
2. Preencher dados e salvar

**Expected result**
- Usuario criado
- Convite enviado

### WEB-USR-003 - Reenviar convite
**Steps**
1. Abrir usuario com convite pendente
2. Reenviar convite

**Expected result**
- Convite reenviado com sucesso

### WEB-USR-004 - Editar usuario
**Steps**
1. Abrir usuario existente
2. Editar dados e unidade
3. Salvar

**Expected result**
- Alteracoes persistidas

### WEB-USR-005 - Editar email do usuario
**Steps**
1. Abrir dialogo de editar email
2. Informar novo email e salvar

**Expected result**
- Email atualizado

### WEB-USR-006 - Impersonate
**Steps**
1. Selecionar usuario
2. Iniciar impersonate

**Expected result**
- Sessao assume o usuario alvo

### WEB-USR-007 - Alterar status (ativo/inativo)
**Steps**
1. Abrir usuario
2. Alterar status

**Expected result**
- Status atualizado na lista

### WEB-USR-008 - Restricao por permissao
**Steps**
1. Logar sem permissao
2. Tentar acessar Usuarios

**Expected result**
- Acesso bloqueado

## Assumptions
- Email valido e dominio permitido

## Risks
- Convites dependem de infraestrutura de email
