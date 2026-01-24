---
title: Erros do build local
project: garageinn-app
created: 2026-01-24
source: terminal 24.txt
---

# Erros encontrados no build local

## Resumo do teste
- Comando executado: `npm run build` (workspace `apps/web`)
- Fase do erro: `Collecting page data using 11 workers`

## Erros (exatos do log)
1) **Erro de leitura no Node.js (fs)**
   - Mensagem:
     - `Error: UNKNOWN: unknown error, read`
   - Detalhes:
     - `errno: -4094`
     - `code: 'UNKNOWN'`
     - `syscall: 'read'`
   - Stack (trecho):
     - `at Object.readFileSync (node:fs:440:20)`
     - `at defaultLoadImpl (node:internal/modules/cjs/loader:1139:17)`

2) **Falha ao ler arquivo do Next.js**
   - Mensagem:
     - `Error: Next.js ERROR: Failed to read file .../node_modules/next/dist/client/components/builtin/global-not-found.js:`
     - `UNKNOWN: unknown error, read`
   - Arquivo:
     - `apps/web/node_modules/next/dist/client/components/builtin/global-not-found.js`

## Impacto no build
- O build falhou com:
  - `npm error Lifecycle script 'build' failed`
  - `Command "npm run build" exited with 1`
