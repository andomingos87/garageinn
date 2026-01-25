# Quickstart - Visibilidade de chamados do Gerente de Operacoes

## Pre-requisitos

- Node.js 24.x
- Dependencias instaladas no monorepo
- Usuario gerente de operacoes de teste
- Usuarios de Operacoes (manobrista/encarregado/supervisor) para criacao de chamados

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

- Login como manobrista/encarregado/supervisor de Operacoes
  - Criar chamados em diferentes departamentos (ex.: Compras, RH, TI)
  - Anotar os IDs criados
- Login como gerente de operacoes
  - Acessar `/relatorios/chamados`
  - Confirmar que todos os chamados criados por Operacoes aparecem na lista geral
  - Abrir o detalhe de um chamado e validar que o gerente e a ultima etapa de aprovacao
- Login como usuario nao-gerente
  - Confirmar que chamados criados por Operacoes nao aparecem indevidamente

4) Rodar testes E2E (quando disponiveis):

```bash
npm run test:e2e
```
