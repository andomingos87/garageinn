---
title: Relatorio de deploy Vercel
project: garageinn-app
created: 2026-01-24
---

# Relatorio de deploy na Vercel

## Tentativa 1 (CLI)
- Comando: `vercel --prod --yes`
- Resultado: falha ao recuperar configuracoes do projeto
- Erro:
  - `Could not retrieve Project Settings. To link your Project, remove the .vercel directory and deploy again.`
  - Referencia: https://vercel.link/cannot-load-project-settings

## Tentativa 2 (CLI)
- Comando: `vercel deploy`
- Resultado: build falhou
- Erros:
  - `Failed to collect configuration for /chamados/comercial/[ticketId]`
  - `A "use server" file can only export async functions, found object.`
  - `Command "npm run build" exited with 1`
- Avisos:
  - `engines.node >=18.0.0` pode atualizar automaticamente para nova major
  - Pacotes deprecated (rimraf@2.7.1, inflight@1.0.6, lodash.isequal@4.5.0, glob@7.2.3, fstream@1.0.12)

## Tentativa 3 (CLI)
- Comando: `vercel --prod --yes`
- Resultado: build falhou
- Erros:
  - `Failed to collect configuration for /chamados/financeiro/[ticketId]`
  - `A "use server" file can only export async functions, found object.`
  - `Command "npm run build" exited with 1`
- Avisos:
  - `engines.node >=18.0.0` pode atualizar automaticamente para nova major
  - Pacotes deprecated (rimraf@2.7.1, inflight@1.0.6, lodash.isequal@4.5.0, glob@7.2.3, fstream@1.0.12)

## Tentativa 4 (CLI)
- Comando: `vercel --prod --yes`
- Resultado: deploy com sucesso
- URLs:
  - Production: `https://garageinn-o6xdo5b0n-andomingos87s-projects.vercel.app`
  - Alias: `https://garageinn-app.vercel.app`
- Avisos:
  - `engines.node >=18.0.0` pode atualizar automaticamente para nova major
  - Pacotes deprecated (rimraf@2.7.1, inflight@1.0.6, lodash.isequal@4.5.0, glob@7.2.3, fstream@1.0.12)
