# TestSprite - Mobile - Auth

## Summary
- Login e recuperacao de senha no app mobile
- Persistencia de sessao

## Scope
**In scope**
- Login
- Recuperar senha
- Redefinir senha
- Logout

**Out of scope**
- Provedores externos nao configurados

## Preconditions
- App instalado
- Usuario ativo com credenciais validas

## Test data
- usuario_admin / senha_valida
- usuario_inativo / senha_valida
- email_valido_para_reset

## Test cases
### MOB-AUTH-001 - Login com credenciais validas
**Steps**
1. Abrir app
2. Informar email e senha
3. Confirmar login

**Expected result**
- Usuario autenticado
- Navega para home

### MOB-AUTH-002 - Login com senha invalida
**Steps**
1. Informar senha invalida
2. Confirmar login

**Expected result**
- Mensagem de erro exibida

### MOB-AUTH-003 - Recuperar senha
**Steps**
1. Acessar "esqueci minha senha"
2. Informar email valido

**Expected result**
- Confirmacao exibida
- Email enviado

### MOB-AUTH-004 - Redefinir senha
**Steps**
1. Abrir link de reset
2. Informar nova senha
3. Confirmar

**Expected result**
- Senha atualizada

### MOB-AUTH-005 - Logout
**Steps**
1. Realizar login
2. Executar logout

**Expected result**
- Sessao encerrada
- Retorna para login

### MOB-AUTH-006 - Persistencia de sessao
**Steps**
1. Logar
2. Fechar e abrir o app

**Expected result**
- Usuario permanece autenticado

## Assumptions
- Fluxo de email esta ativo no ambiente

## Risks
- Instabilidade do email pode afetar reset
