# TestSprite - Mobile - Infra

## Summary
- Infra basica do app mobile
- Supabase e observabilidade

## Scope
**In scope**
- Conexao e sessao Supabase
- Tratamento de erros de rede
- Observabilidade (logs/erros)

**Out of scope**
- Configuracoes de Sentry externas

## Preconditions
- App com configuracao do Supabase
- Usuario autenticado

## Test data
- usuario_admin

## Test cases
### MOB-INF-001 - Sessao Supabase ativa
**Steps**
1. Logar no app
2. Reabrir o app

**Expected result**
- Sessao restaurada

### MOB-INF-002 - Falha de rede
**Steps**
1. Desativar rede
2. Executar uma chamada que use Supabase

**Expected result**
- Erro tratado sem crash

### MOB-INF-003 - Registro de erro
**Steps**
1. Forcar erro controlado
2. Verificar log de erro (quando possivel)

**Expected result**
- Erro registrado na camada de observabilidade

### MOB-INF-004 - Protecao de tela
**Steps**
1. Tentar acessar tela protegida sem sessao

**Expected result**
- Redireciona para login

## Assumptions
- Observabilidade esta habilitada no ambiente

## Risks
- Logs podem nao estar disponiveis em ambientes locais
