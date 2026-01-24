# Quickstart - Modulo de Chamados de TI

## Pre-requisitos

- Node.js >= 18
- Dependencias instaladas no monorepo

## Passos

1) Instale dependencias:

```bash
npm install
```

2) Aplique migrations e seeds do banco conforme o processo atual do projeto:

- Migracoes em `docs/database/migrations/`
- Seeds em `docs/database/seeds/` (inclui categorias de TI)

3) Inicie o app web:

```bash
npm run dev:web
```

4) Validacoes rapidas no app:

- Abrir a listagem de chamados de TI
- Criar um chamado com categoria e tipo de equipamento
- Acessar detalhe e validar visibilidade por perfil

5) Rodar testes E2E (quando disponiveis):

```bash
npm run test:e2e
```
