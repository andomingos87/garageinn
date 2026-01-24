# TestSprite - Web - Personificacao de Usuarios

## Summary
- Permite admin ou role com permissao `users:impersonate` entrar como outro usuario
- Usa magic link para iniciar sessao do usuario alvo
- Exibe banner e opcao de sair da visualizacao

## Navegacao
1. Acessar `Usuarios`
2. Abrir o menu de acoes (tres pontos) do usuario alvo
3. Selecionar "Personificar"
4. Confirmar no dialogo
5. Aguardar redirecionamento e acesso como usuario alvo

## Scope
**In scope**
- Disponibilidade da acao "Personificar"
- Dialogo de confirmacao
- Inicio de sessao por magic link
- Banner de personificacao
- Encerrar personificacao

**Out of scope**
- Auditoria externa de acessos
- Integracoes externas de identity provider

## Preconditions
- Usuario admin ou com permissao `users:impersonate`
- Usuario alvo ativo e diferente do usuario atual
- Supabase configurado e Edge Function `impersonate-user` disponivel
- Browser com localStorage habilitado

## Test data
- usuario_admin_com_permissao_impersonar
- usuario_sem_permissao_impersonar
- usuario_alvo_ativo
- usuario_alvo_inativo
- usuario_alvo_com_permissoes_restritas

## Como funciona (resumo tecnico)
1. A acao chama a Edge Function `impersonate-user` com o token atual
2. O sistema salva o ID do admin e o ID/nome do usuario alvo no localStorage
3. O browser redireciona para o magic link retornado
4. O callback de auth processa tokens no hash e estabelece a sessao do usuario alvo
5. Um banner indica que a sessao esta em modo de personificacao
6. Encerrar personificacao limpa o estado e faz sign-out, redirecionando para `/login`

## Test cases
### WEB-IMP-001 - Exibir acao apenas para quem pode personificar
**Steps**
1. Logar com usuario sem permissao
2. Acessar `Usuarios`
3. Abrir menu de acoes de um usuario

**Expected result**
- Opcao "Personificar" nao aparece

### WEB-IMP-002 - Admin ve opcao de personificar
**Steps**
1. Logar como admin
2. Acessar `Usuarios`
3. Abrir menu de acoes de um usuario ativo

**Expected result**
- Opcao "Personificar" aparece no menu

### WEB-IMP-003 - Nao permitir personificar a si mesmo
**Steps**
1. Logar como admin
2. Abrir menu de acoes do proprio usuario

**Expected result**
- Opcao "Personificar" nao aparece

### WEB-IMP-004 - Nao permitir personificar usuario inativo
**Steps**
1. Logar como admin
2. Abrir menu de acoes de usuario inativo

**Expected result**
- Opcao "Personificar" nao aparece

### WEB-IMP-005 - Dialogo de confirmacao
**Steps**
1. Selecionar "Personificar"
2. Verificar nome e email no dialogo

**Expected result**
- Dialogo exibido com dados do usuario alvo
- Mensagem de atencao sobre modo de visualizacao

### WEB-IMP-006 - Iniciar personificacao com sucesso
**Steps**
1. Confirmar no dialogo
2. Aguardar redirecionamento

**Expected result**
- Sessao autenticada como usuario alvo
- Banner de personificacao visivel no topo

### WEB-IMP-007 - RBAC durante personificacao
**Steps**
1. Personificar usuario com permissoes limitadas
2. Tentar acessar modulo sem permissao

**Expected result**
- Acesso bloqueado ou itens ocultos conforme RBAC

### WEB-IMP-008 - Encerrar personificacao pelo banner
**Steps**
1. Com banner ativo, clicar em "Encerrar"

**Expected result**
- Estado de personificacao limpo
- Redireciona para `/login`

### WEB-IMP-009 - Encerrar personificacao pelo menu do usuario
**Steps**
1. Abrir menu do usuario
2. Clicar em "Sair da visualizacao"

**Expected result**
- Estado de personificacao limpo
- Redireciona para `/login`

### WEB-IMP-010 - Erro na Edge Function
**Steps**
1. Simular falha na Edge Function
2. Confirmar personificacao

**Expected result**
- Mensagem de erro exibida
- Sessao permanece inalterada

### WEB-IMP-011 - Token invalido no callback
**Steps**
1. Abrir magic link invalido/expirado

**Expected result**
- Erro exibido na tela de callback
- Sem sessao estabelecida

### WEB-IMP-012 - Estado orfao de personificacao
**Steps**
1. Limpar localStorage ou logar com outro usuario
2. Recarregar o app

**Expected result**
- Banner nao aparece
- Estado de personificacao descartado

## Assumptions
- O callback de auth processa tokens no hash (implicit flow)
- A Edge Function retorna magic link valido

## Risks
- Falhas na Edge Function impedem personificacao
- LocalStorage bloqueado pode quebrar a indicacao de modo
