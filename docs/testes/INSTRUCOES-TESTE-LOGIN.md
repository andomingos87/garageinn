# Instruções para Executar Teste de Login Admin

## ⚠️ Problema Atual

O servidor Next.js não está conseguindo iniciar automaticamente devido a um erro do Turbopack. Veja `bug-login-admin-turbopack.md` para detalhes.

## 🔧 Solução Temporária: Executar Servidor Manualmente

### Passo 1: Iniciar o Servidor Next.js Manualmente

Abra um terminal e execute:

```bash
cd apps/web
npm run dev
```

Aguarde até ver a mensagem:
```
✓ Ready in X seconds
○ Local:        http://localhost:3000
```

### Passo 2: Executar o Teste Playwright

Em outro terminal, execute:

```bash
cd apps/web
npx playwright test login-admin.spec.ts --project=chromium
```

**Importante**: O Playwright está configurado para reutilizar um servidor existente se ele já estiver rodando na porta 3000.

## 📋 O que o Teste Faz

1. Navega para `/login`
2. Preenche o formulário com:
   - Email: `admin@garageinn.com.br`
   - Senha: `Teste123!`
3. Clica no botão de submit
4. Captura:
   - Mensagens de erro na UI
   - Logs do console do navegador
   - Requisições de rede
   - Screenshot em caso de erro
5. Verifica se houve redirecionamento após login

## 📊 Resultados Esperados

### Cenário 1: Login Bem-Sucedido
- O teste deve passar
- O usuário deve ser redirecionado para `/dashboard`, `/checklists`, `/usuarios` ou `/unidades`
- Nenhuma mensagem de erro deve aparecer

### Cenário 2: Login com Erro
- O teste pode falhar ou passar (dependendo do erro)
- Uma mensagem de erro deve aparecer na UI
- Screenshot será salvo em `playwright-report/login-error.png`
- Logs detalhados serão exibidos no console

## 🐛 Se o Teste Falhar

1. **Verificar Screenshot**: 
   - Abra `playwright-report/login-error.png` para ver o estado da página

2. **Verificar Logs**:
   - Os logs do console e requisições de rede serão exibidos no terminal
   - Procure por mensagens de erro do Supabase ou Next.js

3. **Verificar Credenciais**:
   - Confirme que o usuário `admin@garageinn.com.br` existe no banco
   - Confirme que a senha está correta
   - Verifique se o usuário está ativo

4. **Verificar Servidor**:
   - Confirme que o servidor Next.js está rodando
   - Verifique se não há erros no terminal do servidor
   - Confirme que a URL `http://localhost:3000/login` está acessível

## 📝 Documentar Erros

Se encontrar erros durante o login, documente:

1. **Mensagem de erro exibida na UI**
2. **Logs do console do navegador**
3. **Requisições HTTP** (URL, método, status, resposta)
4. **Screenshot** (já capturado automaticamente)
5. **Logs do servidor Next.js**
6. **Passos para reproduzir**

Use essas informações para criar um plano de bug-fix específico para o erro de login.

## 🔄 Próximos Passos

Após resolver o problema do Turbopack (ver `bug-login-admin-turbopack.md`), o teste poderá ser executado automaticamente sem precisar iniciar o servidor manualmente.
