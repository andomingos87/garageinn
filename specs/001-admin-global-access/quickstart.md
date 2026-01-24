# Quickstart - Acesso a Usuarios e Configuracoes

## Pre-requisitos

- Node.js >= 18
- Variaveis de ambiente configuradas (ver `apps/ENV_SETUP.md`)
- Usuarios de teste com perfil admin e global (ver `docs/user_test-admin.md` e seeds em `docs/seeds/`)

## Rodar o app web

```bash
npm install
npm run dev:web
```

## Validacao manual

1. Entrar com usuario admin e verificar:
   - Itens "Usuarios" e "Configuracoes" aparecem na sidebar.
   - Rotas `/usuarios` e `/configuracoes` sao acessiveis.
2. Entrar com usuario global e repetir os mesmos passos.
3. Entrar com usuario sem perfil admin/global:
   - Itens nao aparecem na sidebar.
   - Acesso direto a `/usuarios` e `/configuracoes` e negado com mensagem clara.

## Testes E2E

```bash
npm run test:e2e --workspace=apps/web
```
