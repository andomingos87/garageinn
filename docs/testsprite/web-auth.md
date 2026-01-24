# TestSprite - Web - Auth

## Usuário Teste Admin
usuario: admin@garageinn.com.br
senha: Teste123!

## Summary
- Login, recuperacao e redefinicao de senha no web app
- Validacao de sessao e acesso protegido

## Scope
**In scope**
- Login
- Recuperar senha
- Redefinir senha
- Callback de autenticacao

**Out of scope**
- Provedores externos nao configurados no ambiente

## Preconditions
- Ambiente disponivel (staging ou local)
- Usuario ativo com credenciais validas
- Email configurado para fluxo de reset

## Test data
- usuario_admin / senha_valida
- usuario_inativo / senha_valida
- email_valido_para_reset

## Test cases
### WEB-AUTH-001 - Login com credenciais validas
**Steps**
1. Acessar a pagina de login
2. Informar email e senha validos
3. Confirmar login

**Expected result**
- Usuario autenticado
- Redireciona para a area logada

### WEB-AUTH-002 - Login com senha invalida
**Steps**
1. Informar email valido e senha invalida
2. Confirmar login

**Expected result**
- Mensagem de erro exibida
- Usuario nao autenticado

### WEB-AUTH-003 - Login com usuario inativo
**Steps**
1. Informar credenciais de usuario inativo
2. Confirmar login

**Expected result**
- Bloqueio de acesso
- Mensagem indicando usuario inativo ou sem permissao

### WEB-AUTH-004 - Solicitar recuperacao de senha
**Steps**
1. Acessar "recuperar senha"
2. Informar email valido
3. Confirmar solicitacao

**Expected result**
- Mensagem de confirmacao exibida
- Email de reset disparado

### WEB-AUTH-005 - Redefinir senha com token valido
**Steps**
1. Abrir link de redefinicao
2. Informar nova senha
3. Confirmar

**Expected result**
- Senha atualizada
- Usuario consegue logar com a nova senha

### WEB-AUTH-006 - Redefinir senha com token invalido
**Steps**
1. Abrir link com token invalido/expirado
2. Tentar redefinir senha

**Expected result**
- Erro exibido
- Senha nao alterada

### WEB-AUTH-007 - Persistencia de sessao
**Steps**
1. Realizar login
2. Recarregar a pagina

**Expected result**
- Sessao mantida
- Usuario continua autenticado

## Assumptions
- Fluxo de email esta habilitado no ambiente
- Callback de auth esta configurado

## Risks
- Instabilidade no provedor de email pode afetar o reset
