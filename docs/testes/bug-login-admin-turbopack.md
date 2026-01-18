# Bug: Erro Turbopack ao Testar Login Admin

## 📋 Resumo

O teste E2E de login do administrador não pode ser executado porque o servidor Next.js não consegue iniciar devido a um erro fatal do Turbopack ao compilar a rota de login.

## 🔍 Detalhes do Erro

### Erro Principal
```
FATAL: An unexpected Turbopack error occurred.
Error: Failed to write app endpoint /(auth)/login/page
```

### Contexto
- **Arquivo de teste criado**: `apps/web/e2e/login-admin.spec.ts`
- **Credenciais testadas**: 
  - Email: `admin@garageinn.com.br`
  - Senha: `Teste123!`
- **Comando executado**: `npx playwright test login-admin.spec.ts`
- **Ambiente**: Windows 10, Git Bash

### Logs do Erro

#### Aviso sobre lockfiles
```
⚠ Warning: Next.js inferred your workspace root, but it may not be correct.
We detected multiple lockfiles and selected the directory of 
C:\Users\asdom\OneDrive\Documentos\Projetos\garageinn-app\package-lock.json 
as the root directory.

Detected additional lockfiles: 
  * C:\Users\asdom\OneDrive\Documentos\Projetos\garageinn-app\apps\web\package-lock.json
```

#### Erro Fatal
O servidor Next.js não consegue iniciar porque o Turbopack falha ao tentar compilar a rota `/(auth)/login/page`. O erro se repete múltiplas vezes antes do timeout de 120 segundos.

### Arquivos Relacionados

1. **Rota de Login**: `apps/web/src/app/(auth)/login/page.tsx`
2. **Formulário de Login**: `apps/web/src/app/(auth)/components/login-form.tsx`
3. **Server Action**: `apps/web/src/app/(auth)/login/actions.ts`
4. **Configuração Next.js**: `apps/web/next.config.ts`
5. **Configuração Playwright**: `apps/web/playwright.config.ts`

## 🎯 Objetivo do Teste

O teste foi criado para:
1. Verificar se o formulário de login está acessível
2. Testar login com credenciais do admin (`admin@garageinn.com.br` / `Teste123!`)
3. Capturar erros durante o processo de login
4. Verificar redirecionamento após login bem-sucedido
5. Coletar logs de console e requisições de rede em caso de erro

## 🔧 Possíveis Causas

1. **Problema com Turbopack e rota de login**
   - O Turbopack pode estar tendo problemas ao compilar a rota `/(auth)/login/page`
   - Pode ser um bug conhecido do Turbopack com rotas agrupadas

2. **Problema com múltiplos lockfiles**
   - O Next.js detectou múltiplos `package-lock.json` (raiz e `apps/web/`)
   - Isso pode estar causando confusão no Turbopack sobre o workspace root

3. **Problema de permissões ou arquivos bloqueados**
   - O Turbopack pode não conseguir escrever arquivos temporários
   - Pode haver arquivos bloqueados por outro processo

4. **Problema com estrutura de diretórios**
   - A estrutura de monorepo pode estar causando problemas
   - O Turbopack pode não estar reconhecendo corretamente a estrutura do projeto

## 📝 Plano de Bug-Fix

### Fase 1: Diagnóstico

1. **Verificar estrutura da rota de login**
   - [ ] Verificar se `apps/web/src/app/(auth)/login/page.tsx` existe e está correto
   - [ ] Verificar se há erros de sintaxe ou imports quebrados
   - [ ] Verificar dependências da rota

2. **Verificar configuração do Next.js**
   - [ ] Verificar `next.config.ts` para configurações do Turbopack
   - [ ] Verificar se há configurações conflitantes
   - [ ] Adicionar `turbopack.root` conforme sugerido no aviso

3. **Verificar lockfiles**
   - [ ] Decidir se deve manter apenas um `package-lock.json`
   - [ ] Configurar `turbopack.root` no `next.config.ts` para resolver o aviso

4. **Verificar logs de panic**
   - [ ] Ler o arquivo de log de panic: `C:\Users\asdom\AppData\Local\Temp\next-panic-*.log`
   - [ ] Analisar stack trace completo

### Fase 2: Soluções Possíveis

#### Solução 1: Configurar Turbopack Root
```typescript
// apps/web/next.config.ts
const nextConfig: NextConfig = {
  experimental: {
    turbopack: {
      root: __dirname, // ou caminho absoluto para apps/web
    },
  },
  // ... resto da configuração
};
```

#### Solução 2: Desabilitar Turbopack (temporário)
```typescript
// apps/web/next.config.ts
const nextConfig: NextConfig = {
  // Usar webpack em vez de turbopack para desenvolvimento
  // Isso pode ser feito via variável de ambiente ou flag
};
```

#### Solução 3: Limpar cache e rebuild
```bash
cd apps/web
rm -rf .next
rm -rf node_modules/.cache
npm run build
```

#### Solução 4: Executar servidor manualmente
- Iniciar o servidor Next.js manualmente em um terminal separado
- Modificar `playwright.config.ts` para não iniciar o servidor automaticamente
- Executar testes contra servidor já rodando

### Fase 3: Teste Alternativo

Se o problema persistir, criar um teste que:
1. Assuma que o servidor já está rodando
2. Use `baseURL` configurado no Playwright
3. Não dependa do `webServer` do Playwright

### Fase 4: Validação

Após corrigir o problema:
1. Executar o teste de login novamente
2. Verificar se o login funciona corretamente
3. Documentar qualquer erro encontrado no processo de login
4. Criar plano de correção para erros de login (se houver)

## 🧪 Teste Criado

O arquivo `apps/web/e2e/login-admin.spec.ts` foi criado e está pronto para ser executado assim que o problema do Turbopack for resolvido.

### Características do Teste

- ✅ Testa login com credenciais do admin
- ✅ Captura mensagens de erro na UI
- ✅ Captura logs do console do navegador
- ✅ Captura requisições de rede
- ✅ Tira screenshot em caso de erro
- ✅ Testa cenário de credenciais inválidas

## 📊 Status

- [x] Teste criado
- [ ] Servidor Next.js inicia corretamente
- [ ] Teste executado com sucesso
- [ ] Erros de login identificados (se houver)
- [ ] Plano de correção de erros de login criado

## 🔗 Referências

- [Next.js Turbopack Documentation](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack)
- [Playwright Configuration](https://playwright.dev/docs/test-configuration)
- Log de panic: `C:\Users\asdom\AppData\Local\Temp\next-panic-*.log`

## 📅 Data

Criado em: 2026-01-17
