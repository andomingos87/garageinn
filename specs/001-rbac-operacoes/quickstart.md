# Quickstart: RBAC Operacoes

## Setup

1. `npm install`
2. `npm run dev:web`

## Manual Validation

1. Autentique com um usuario do Departamento Operacoes (Manobrista, Encarregado, Supervisor, Gerente).
2. Verifique menus visiveis e acessos diretos para cada cargo.
3. Confirme que secoes proibidas exibem "acesso negado" e nao mostram conteudo.

## E2E

- `npm run test:e2e --workspace=apps/web`

## Notas

- Se necessario, use usuarios de teste definidos em `docs/seeds/usuarios_teste.md`.
