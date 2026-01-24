---
name: vercel-deploy
description: Guia deploy na Vercel com checklist e troubleshooting. Use quando o usuario pedir deploy, Vercel, build/producao/preview, variaveis de ambiente, root directory ou dominio.
---

# Deploy na Vercel

## Escopo
Skill para orientar deploy na Vercel com foco em monorepo/Next.js, incluindo checklist operacional e troubleshooting. Inclui ajustes especificos deste projeto.

## Quick start
Use a saida mista:
1) Checklist operacional
2) Template com secoes curtas (Resumo, Passos, Verificacao, Problemas comuns)

## Checklist operacional (base)
- Confirmar app alvo e ambiente (preview ou production)
- Definir Root Directory do projeto (se monorepo)
- Validar Build Command, Output Directory e Node version
- Configurar variaveis de ambiente
- Disparar deploy e verificar URL
- Validar dominio e redirects (se aplicavel)

## Template de resposta (misto)
Use este formato:

```markdown
Resumo rapido:
- [1-2 bullets do que sera feito]

Checklist:
- [ ] Item 1
- [ ] Item 2
- [ ] Item 3

Passos:
1) ...
2) ...
3) ...

Verificacao:
- [ ] Build ok
- [ ] App respondeu na URL
- [ ] Logs sem erros

Problemas comuns:
- <erro> -> <causa/proxima acao>
```

## Instrucoes especificas do projeto (Garageinn App)
Use estas configuracoes como padrao:
- Monorepo com app web em `apps/web`
- Root Directory: `apps/web`
- Framework: Next.js (auto)
- Build Command: `npm run build` (no root definido como `apps/web`)
- Output Directory: `.next` (padrao Next.js)
- Node version: `18.18.0` (via `.nvmrc`)
- Variaveis de ambiente (web):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_SITE_URL` (opcional)
  - `SUPABASE_SERVICE_ROLE_KEY` (somente server-side)

## Notas da documentacao Vercel (Context7)
- Root Directory restringe acesso a arquivos fora do diretorio configurado
- Output Directory costuma ser detectado automaticamente pelo framework
- Mudancas de Root Directory/Output Directory aplicam no proximo deploy

## Troubleshooting rapido
- Build falha por dependencias: conferir Node version e install command
- 404 apos deploy: confirmar Root Directory e Output Directory
- Variaveis nao aplicadas: verificar ambiente correto (Preview/Production)
- URL incorreta: conferir `NEXT_PUBLIC_SITE_URL` e auto-detect via `NEXT_PUBLIC_VERCEL_URL`

## Referencias internas
- `apps/ENV_SETUP.md`
- `apps/web/next.config.ts`
- `apps/web/src/lib/utils.ts`
