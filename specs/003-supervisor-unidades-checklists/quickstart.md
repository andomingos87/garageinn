# Quickstart - Visibilidade de unidades e checklists do supervisor

## Pre-requisitos

- Node.js 24.x
- Dependencias instaladas no monorepo
- Usuarios de teste: supervisor com unidades vinculadas, supervisor sem unidades, nao-supervisor, admin

## Passos

1) Instale dependencias:

```bash
npm install
```

2) Inicie o app web:

```bash
npm run dev:web
```

3) Validacoes rapidas no app:

- Login com supervisor com unidades vinculadas
  - `/unidades` lista apenas as unidades vinculadas
  - Menu Checklists mostra "Abertura" e "Supervisao"
- Login com supervisor sem unidades vinculadas
  - `/unidades` aparece vazio com mensagem informativa
- Login com usuario nao-supervisor
  - Menu Checklists mostra apenas "Abertura"
  - Acesso direto a `/checklists/supervisao` resulta em bloqueio
- Login com admin/gerente
  - `/unidades` continua exibindo todas as unidades permitidas pelo perfil

4) Rodar testes E2E (quando disponiveis):

```bash
npm run test:e2e
```
