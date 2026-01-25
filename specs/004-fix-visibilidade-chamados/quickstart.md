# Quickstart - Visibilidade de chamados por perfil

## Pre-requisitos

- Node.js 24.x
- Dependencias instaladas no monorepo
- Usuarios de teste: gerente de operacoes e assistente de compras
- Chamados de compras em diferentes status (incluindo "awaiting_approval_gerente")

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

- Login como gerente de operacoes
  - Acessar `/chamados/compras`
  - Confirmar que todos os chamados elegiveis aparecem (incluindo os pendentes de aprovacao)
  - Abrir detalhe de um chamado pendente e validar acesso permitido
- Login como assistente de compras
  - Acessar `/chamados/compras`
  - Confirmar que chamados com status "awaiting_approval_gerente" nao aparecem
  - Tentar abrir diretamente o detalhe de um chamado pendente e validar acesso negado
  - Confirmar exibicao da tela "Acesso negado"

4) Rodar testes E2E (quando disponiveis):

```bash
npm run test:e2e
```
