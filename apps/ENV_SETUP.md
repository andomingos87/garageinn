# 🔐 Configuração de Variáveis de Ambiente

Este projeto possui **dois aplicativos separados** (web e mobile), cada um com seu próprio arquivo de variáveis de ambiente.

## 📁 Estrutura de Arquivos .env

```
garageinn-app/
├── apps/
│   ├── web/
│   │   └── .env.local          ← Arquivo para o projeto Web
│   └── mobile/
│       └── .env                ← Arquivo para o projeto Mobile
```

## 🌐 Web (Next.js)

**Localização**: `apps/web/.env.local`

**Prefixo das variáveis**: `NEXT_PUBLIC_*`

### Variáveis Obrigatórias

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### Variáveis Opcionais

```env
# URL base da aplicação (para links de email, redirects, etc.)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Service Role Key (apenas para operações administrativas no servidor)
# ⚠️ NUNCA exponha esta chave no cliente!
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
```

### Como Configurar

1. Navegue até a pasta do projeto web:
   ```bash
   cd apps/web
   ```

2. Crie o arquivo `.env.local`:
   ```bash
   # No Windows
   type nul > .env.local
   
   # No Linux/Mac
   touch .env.local
   ```

3. Adicione as variáveis acima com suas credenciais do Supabase

4. Obtenha as credenciais em: https://app.supabase.com/project/_/settings/api

## 📱 Mobile (Expo)

**Localização**: `apps/mobile/.env`

**Prefixo das variáveis**: `EXPO_PUBLIC_*`

### Variáveis Obrigatórias

```env
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### Variáveis Opcionais

```env
# Sentry DSN (para observabilidade)
EXPO_PUBLIC_SENTRY_DSN=sua-sentry-dsn-aqui
```

### Como Configurar

1. Navegue até a pasta do projeto mobile:
   ```bash
   cd apps/mobile
   ```

2. Crie o arquivo `.env`:
   ```bash
   # No Windows
   type nul > .env
   
   # No Linux/Mac
   touch .env
   ```

3. Adicione as variáveis acima com suas credenciais do Supabase

4. **Importante**: No Expo, variáveis com prefixo `EXPO_PUBLIC_*` são expostas no bundle do app. Use apenas para valores públicos (URL e anon key são seguros).

## 🔑 Obtendo Credenciais do Supabase

1. Acesse o [Dashboard do Supabase](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL** → `*_SUPABASE_URL`
   - **anon public** → `*_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (apenas se necessário)

## ⚠️ Importante

- **Nunca commite arquivos `.env` ou `.env.local`** no Git (já estão no `.gitignore`)
- As variáveis `NEXT_PUBLIC_*` e `EXPO_PUBLIC_*` são **expostas no bundle** do cliente
- Use apenas valores públicos nessas variáveis (URL e anon key são seguros)
- A `SERVICE_ROLE_KEY` deve ser usada **apenas no servidor** e nunca exposta no cliente

## 🔄 Diferenças entre Web e Mobile

| Aspecto | Web (Next.js) | Mobile (Expo) |
|---------|---------------|---------------|
| **Arquivo** | `.env.local` | `.env` |
| **Prefixo** | `NEXT_PUBLIC_*` | `EXPO_PUBLIC_*` |
| **Carregamento** | Automático pelo Next.js | Via `expo-constants` |
| **Localização** | `apps/web/` | `apps/mobile/` |

## 📝 Exemplo Completo

### `apps/web/.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### `apps/mobile/.env`
```env
EXPO_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🚀 Próximos Passos

Após configurar os arquivos `.env`:

1. **Web**: Execute `npm run dev` em `apps/web/`
2. **Mobile**: Execute `npm start` em `apps/mobile/`
