# Quickstart - Visibilidade de TI na sidebar

## Pre-requisitos

- Node.js 24.x
- Dependencias instaladas no monorepo
- Usuarios de teste criados (manobrista, encarregado, analista TI, admin)

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

- Login com usuario nao-TI (ex.: manobrista/encarregado)
  - Confirmar que o item "TI" nao aparece na sidebar
  - Acessar `/chamados/ti` direto e validar acesso negado
- Login com usuario de TI
  - Confirmar que o item "TI" aparece na sidebar
  - Acessar lista, novo e detalhe de chamados de TI
- Login com perfil global/admin
  - Confirmar acesso normal a area de TI

4) Rodar testes E2E (quando disponiveis):

```bash
npm run test:e2e
```
