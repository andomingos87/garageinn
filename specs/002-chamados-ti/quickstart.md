# Quickstart - Modulo de Chamados de TI - Fluxo Basico

## Pre-requisitos

- Node.js 24.x
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

- Abrir a tela de chamados de TI
- Criar um chamado com categoria
- Forcar um chamado sem aprovacao e validar status "pronto para execucao"
- Validar que a lista de prontos aparece apenas para equipe de TI/perfis globais
- Verificar anexos opcionais no detalhe (quando enviados)

5) Rodar testes E2E (quando disponiveis):

```bash
npm run test:e2e
```
