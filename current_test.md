# TestSprite - Documentacao de Testes

## Summary
- Validar fluxo de aprovacao de chamado de compras com tres niveis
- Ambiente alvo: staging

## Scope
**In scope**
- Criacao de chamado por manobrista
- Aprovacao por encarregado e supervisor
- Atualizacao de status e exibicao nas listas
- Comentarios durante o fluxo de aprovacao

**Out of scope**
- Regras de notificacao por email/push
- Integracoes externas (ERP, financeiro)
- Desempenho e carga

## Preconditions
- Usuarios ativos com perfis: manobrista, encarregado e supervisor
- Permissoes configuradas para criar e aprovar chamados de compras
- Categoria "Compras" disponivel no formulario de chamado

## Test data
- Usuario manobrista: credenciais validas
- Usuario encarregado: credenciais validas
- Usuario supervisor: credenciais validas
- Dados do chamado: titulo, descricao, valor, centro de custo, anexos (se obrigatorio)

## Test cases
### TC-001 - Criacao de chamado de compras pelo manobrista
**Steps**
1. Fazer login como manobrista.
2. Abrir o formulario de novo chamado de compras.
3. Preencher todos os campos obrigatorios.
4. Enviar o chamado.
5. Acessar a lista geral de chamados.

**Expected result**
- Chamado criado com status "aguardando encarregado".
- Chamado exibido na lista geral com dados corretos.

### TC-002 - Aprovacao pelo encarregado
**Steps**
1. Fazer logout do manobrista.
2. Fazer login como encarregado.
3. Localizar o chamado criado.
4. Adicionar um comentario no chamado.
5. Aprovar o chamado.
6. Acessar a lista geral de chamados.

**Expected result**
- Comentario registrado no chamado.
- Status atualizado para "aguardando supervisor".
- Chamado exibido na lista geral com status atualizado.

### TC-003 - Aprovacao pelo supervisor
**Steps**
1. Fazer logout do encarregado.
2. Fazer login como supervisor.
3. Localizar o chamado em questao.
4. Adicionar um comentario no chamado.
5. Aprovar o chamado.
6. Verificar a lista geral de chamados.
7. Aguardar 5 segundos.
8. Fazer logout.

**Expected result**
- Comentario registrado no chamado.
- Status atualizado para o proximo estado aprovado.
- Lista geral mostra o status atualizado.

## Assumptions
- O status final apos aprovacao do supervisor e exibido no sistema.
- O tempo de 5 segundos permite sincronizacao da lista.

## Risks
- Latencia no backend pode atrasar atualizacao de status.
- Permissoes incorretas podem bloquear aprovacao.