# Plano de Implementacao - Epico 4.4: Notificacoes e Publicacao

**Status**: PENDENTE
**Prioridade**: Alta (bloqueador para lancamento)
**Estimativa de Complexidade**: Alta
**Dependencias**: Epicos 4.1, 4.2, 4.3 (Mobile base completo)

---

## Sumario Executivo

Este plano cobre a implementacao de Push Notifications via Firebase Cloud Messaging (FCM) e o processo de build/publicacao do app nas lojas (App Store e Google Play). O app mobile ja possui estrutura funcional mas carece de notificacoes reais e configuracao de build para producao.

### Estado Atual
- `expo-notifications`: NAO instalado
- `eas.json`: NAO existe
- Firebase: NAO configurado
- `NotificationsScreen.tsx`: Mockada com dados estaticos
- Tabela `user_push_tokens`: NAO existe no Supabase

---

## Tarefa 4.4.1: Push Notifications (FCM)

### Subtarefa 4.4.1.1: Configurar projeto Firebase

#### Descricao
Criar e configurar projeto Firebase Console com apps iOS e Android registrados, gerar arquivos de configuracao e instalar dependencias necessarias no projeto Expo.

#### Arquivos Envolvidos

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `apps/mobile/google-services.json` | CRIAR | Config Firebase Android |
| `apps/mobile/GoogleService-Info.plist` | CRIAR | Config Firebase iOS |
| `apps/mobile/app.json` | MODIFICAR | Adicionar plugins e config de notificacoes |
| `apps/mobile/package.json` | MODIFICAR | Adicionar expo-notifications e expo-device |
| `apps/mobile/.gitignore` | MODIFICAR | Adicionar arquivos Firebase (opcional) |

#### Criterios de Aceite (do Backlog)

1. **Projeto Firebase criado e configurado:**
   - [ ] Projeto Firebase criado no console (https://console.firebase.google.com)
   - [ ] Aplicativos iOS e Android registrados no projeto Firebase
   - [ ] Bundle ID iOS: `com.garageinn.gapp` (conforme `app.json`)
   - [ ] Package Name Android: `com.garageinn.gapp` (conforme `app.json`)

2. **Arquivos de configuracao presentes:**
   - [ ] `apps/mobile/google-services.json` (Android) existe e esta configurado corretamente
   - [ ] `apps/mobile/GoogleService-Info.plist` (iOS) existe e esta configurado corretamente
   - [ ] Arquivos adicionados ao `.gitignore` ou versionados com dados nao sensiveis

3. **Dependencias instaladas:**
   - [ ] `expo-notifications` instalado e configurado no `package.json`
   - [ ] `expo-device` instalado (necessario para verificar dispositivo fisico)
   - [ ] Versao compativel com Expo SDK 54
   - [ ] Plugin `expo-notifications` adicionado ao `app.json` na secao `plugins`

4. **Configuracao no app.json:**
   - [ ] Secao `expo.notifications` configurada com icone e cores apropriadas
   - [ ] Configuracao de Android e iOS presente
   - [ ] `android.googleServicesFile` apontando para `google-services.json`
   - [ ] `ios.googleServicesFile` apontando para `GoogleService-Info.plist`

5. **Permissoes configuradas:**
   - [ ] Permissoes de notificacao declaradas no `app.json` para Android
   - [ ] Info.plist iOS configurado com permissoes de notificacao

6. **Validacao tecnica:**
   - [ ] `npx expo-doctor` nao reporta erros relacionados a notificacoes
   - [ ] Build de desenvolvimento executa sem erros relacionados ao Firebase/FCM

#### Tipo de Teste
- **Manual**: Verificar instalacao e configuracao via `expo-doctor`
- **Integration**: Verificar que o app builda sem erros

#### Dependencias
- Nenhuma (primeira tarefa do epico)

#### Comandos de Implementacao

```bash
# 1. Instalar dependencias
cd apps/mobile
npx expo install expo-notifications expo-device

# 2. Configurar app.json (exemplo de config a adicionar)
# Ver secao de configuracao abaixo

# 3. Verificar configuracao
npx expo-doctor
```

#### Configuracao app.json (Referencia)

```json
{
  "expo": {
    "plugins": [
      "@sentry/react-native",
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#FF3D3D",
          "sounds": [],
          "enableBackgroundRemoteNotifications": true
        }
      ]
    ],
    "android": {
      "googleServicesFile": "./google-services.json"
    },
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    },
    "notification": {
      "icon": "./assets/notification-icon.png",
      "color": "#FF3D3D"
    }
  }
}
```

---

### Subtarefa 4.4.1.2: Integrar notificacoes no app

#### Descricao
Implementar modulo completo de notificacoes com registro de token, listeners, handlers e integracao com Supabase. Atualizar tela de notificacoes para exibir dados reais.

#### Arquivos Envolvidos

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `apps/mobile/src/lib/notifications/index.ts` | CRIAR | Barrel export do modulo |
| `apps/mobile/src/lib/notifications/service.ts` | CRIAR | Servico principal de notificacoes |
| `apps/mobile/src/lib/notifications/permissions.ts` | CRIAR | Gerenciamento de permissoes |
| `apps/mobile/src/lib/notifications/handlers.ts` | CRIAR | Handlers foreground/background |
| `apps/mobile/src/lib/notifications/types.ts` | CRIAR | Tipos TypeScript |
| `apps/mobile/src/lib/notifications/deepLinking.ts` | CRIAR | Navegacao via notificacao |
| `apps/mobile/src/modules/notifications/screens/NotificationsScreen.tsx` | MODIFICAR | Dados reais do Supabase |
| `apps/mobile/src/modules/notifications/screens/NotificationSettingsScreen.tsx` | CRIAR | Preferencias de notificacao |
| `apps/mobile/src/contexts/NotificationContext.tsx` | CRIAR | Context para estado global |
| `apps/mobile/src/hooks/useNotifications.ts` | CRIAR | Hook para consumir context |
| `apps/mobile/src/navigation/RootNavigator.tsx` | MODIFICAR | Integrar inicializacao |
| `supabase/migrations/XXXXXX_create_push_tokens.sql` | CRIAR | Tabela user_push_tokens |
| `supabase/migrations/XXXXXX_create_notification_preferences.sql` | CRIAR | Tabela user_notification_preferences |
| `supabase/migrations/XXXXXX_create_notifications_table.sql` | CRIAR | Tabela notifications |

#### Criterios de Aceite (do Backlog)

1. **Servico de notificacoes implementado:**
   - [ ] Modulo `apps/mobile/src/lib/notifications/` criado com:
     - [ ] Funcao para solicitar permissoes de notificacao
     - [ ] Funcao para registrar token FCM no Supabase (tabela `user_push_tokens`)
     - [ ] Funcao para inicializar listener de notificacoes
     - [ ] Handler para notificacoes recebidas em foreground
     - [ ] Handler para notificacoes recebidas em background
     - [ ] Handler para cliques em notificacoes (deep linking)

2. **Integracao com Supabase:**
   - [ ] Tabela `user_push_tokens` criada com campos:
     - `id` (uuid, primary key)
     - `user_id` (uuid, foreign key para `auth.users`)
     - `token` (text, unique)
     - `platform` (text: 'ios' | 'android')
     - `device_id` (text, opcional)
     - `created_at` (timestamp)
     - `updated_at` (timestamp)
   - [ ] RLS configurado: usuario so pode gerenciar seus proprios tokens
   - [ ] Tabela `notifications` para armazenar historico
   - [ ] Tabela `user_notification_preferences` para preferencias

3. **NotificationsScreen funcional:**
   - [ ] Tela atualizada para exibir notificacoes reais do Supabase
   - [ ] Lista ordenada por data (mais recentes primeiro)
   - [ ] Estados de loading, empty e error implementados
   - [ ] Pull-to-refresh funcional
   - [ ] Marcacao de notificacoes como lidas ao visualizar
   - [ ] Badge de contador de nao lidas no icone de notificacoes (tab bar)

4. **Fluxo completo de notificacoes:**
   - [ ] Ao abrir o app, solicita permissao de notificacao (primeira vez)
   - [ ] Ao receber token FCM, registra automaticamente no Supabase
   - [ ] Notificacoes recebidas sao exibidas no sistema operacional
   - [ ] Ao clicar em notificacao, navega para tela apropriada (deep linking)
   - [ ] Notificacoes em foreground sao exibidas via componente nativo

5. **Eventos que disparam notificacoes (MVP):**
   - [ ] Novo chamado atribuido ao usuario
   - [ ] Mudanca de status em chamado do usuario
   - [ ] Novo comentario em chamado do usuario
   - [ ] Checklist pendente (abertura diaria)
   - [ ] Aprovacao/negacao de chamado (quando aplicavel)

6. **Configuracoes de notificacao:**
   - [ ] Tela de configuracoes permite ativar/desativar notificacoes por tipo
   - [ ] Preferencias salvas no Supabase
   - [ ] Respeita preferencias do usuario ao enviar notificacoes

7. **Validacao tecnica:**
   - [ ] Notificacoes funcionam em iOS (simulador e dispositivo fisico)
   - [ ] Notificacoes funcionam em Android (emulador e dispositivo fisico)
   - [ ] Deep linking funciona corretamente
   - [ ] Token e atualizado quando necessario (refresh automatico)
   - [ ] Nao ha memory leaks nos listeners de notificacoes

8. **Tratamento de erros:**
   - [ ] Erro ao solicitar permissao exibe mensagem amigavel
   - [ ] Erro ao registrar token e logado mas nao quebra o app
   - [ ] Notificacoes falhadas sao logadas para debugging

#### Tipo de Teste
- **Unit**: Testar funcoes de formatacao e parsing
- **Integration**: Testar registro de token no Supabase
- **E2E (Playwright)**: NAO APLICAVEL (mobile)
- **Manual**: Testar notificacoes em dispositivos fisicos iOS e Android

#### Dependencias
- Subtarefa 4.4.1.1 (Firebase configurado)

#### Schema das Tabelas Supabase

```sql
-- Tabela user_push_tokens
CREATE TABLE user_push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  device_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: Usuario so gerencia seus proprios tokens
ALTER TABLE user_push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own tokens"
  ON user_push_tokens
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Tabela notifications (historico)
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  type TEXT NOT NULL, -- 'ticket_assigned', 'ticket_status', 'ticket_comment', 'checklist_pending', 'approval'
  reference_type TEXT, -- 'ticket', 'checklist', etc
  reference_id UUID,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own notifications"
  ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Tabela user_notification_preferences
CREATE TABLE user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  ticket_assigned BOOLEAN DEFAULT true,
  ticket_status_changed BOOLEAN DEFAULT true,
  ticket_comment BOOLEAN DEFAULT true,
  checklist_pending BOOLEAN DEFAULT true,
  approval_required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own preferences"
  ON user_notification_preferences
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

#### Estrutura do Modulo de Notificacoes

```
apps/mobile/src/lib/notifications/
├── index.ts              # Barrel export
├── service.ts            # NotificationService class
├── permissions.ts        # requestPermissions, checkPermissions
├── handlers.ts           # foreground, background, response handlers
├── types.ts              # NotificationPayload, NotificationType, etc
└── deepLinking.ts        # parseNotificationData, navigateToScreen
```

---

## Tarefa 4.4.2: Publicacao

### Subtarefa 4.4.2.1: Build iOS e Android

#### Descricao
Configurar EAS Build para criar builds de desenvolvimento, preview e producao. Preparar certificados e keystores para ambas as plataformas.

#### Arquivos Envolvidos

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `apps/mobile/eas.json` | CRIAR | Configuracao EAS Build |
| `apps/mobile/app.json` | MODIFICAR | Versoes e build numbers |
| `apps/mobile/assets/icon.png` | VERIFICAR | Icone 1024x1024 |
| `apps/mobile/assets/splash-icon.png` | VERIFICAR | Splash screen |
| `apps/mobile/assets/adaptive-icon.png` | VERIFICAR | Android adaptive icon |
| `apps/mobile/assets/notification-icon.png` | CRIAR | Icone para notificacoes |
| `.github/workflows/eas-build.yml` | CRIAR (opcional) | CI/CD para builds |

#### Criterios de Aceite (do Backlog)

1. **EAS Build configurado:**
   - [ ] Arquivo `apps/mobile/eas.json` criado
   - [ ] Configuracoes de build para `development`, `preview` e `production`
   - [ ] Perfis de build definidos

2. **Configuracao iOS:**
   - [ ] Apple Developer Account configurada
   - [ ] App ID criado no Apple Developer Portal: `com.garageinn.gapp`
   - [ ] Certificados de desenvolvimento e distribuicao configurados
   - [ ] Provisioning profiles criados
   - [ ] `app.json` contem:
     - `ios.bundleIdentifier`: `com.garageinn.gapp`
     - `ios.buildNumber`: incrementado para cada build
     - `ios.supportsTablet`: `true`
   - [ ] Build iOS executado com sucesso via `eas build --platform ios --profile production`

3. **Configuracao Android:**
   - [ ] Google Play Console configurado
   - [ ] App criado no Google Play Console
   - [ ] Keystore gerado e armazenado de forma segura (EAS Secrets)
   - [ ] `app.json` contem:
     - `android.package`: `com.garageinn.gapp`
     - `android.versionCode`: incrementado para cada build
     - `android.adaptiveIcon` configurado
   - [ ] Build Android executado com sucesso via `eas build --platform android --profile production`

4. **Assets e metadados:**
   - [ ] Icone do app (`assets/icon.png`) presente e no formato correto (1024x1024)
   - [ ] Splash screen configurada (`assets/splash-icon.png`)
   - [ ] Adaptive icon Android configurado (`assets/adaptive-icon.png`)
   - [ ] Icone de notificacao criado (`assets/notification-icon.png`)
   - [ ] Todas as imagens seguem Design System (cor primaria: `#FF3D3D`)

5. **Validacao de builds:**
   - [ ] Build de desenvolvimento instala e executa corretamente
   - [ ] Build de preview pode ser instalado via link de download
   - [ ] Build de producao esta pronto para submissao nas lojas
   - [ ] Versao do app incrementada corretamente
   - [ ] Changelog preparado para a versao

6. **Testes em dispositivos:**
   - [ ] Build iOS testado em dispositivo fisico iOS
   - [ ] Build Android testado em dispositivo fisico Android
   - [ ] Funcionalidades criticas validadas:
     - [ ] Autenticacao
     - [ ] Navegacao
     - [ ] Chamados
     - [ ] Checklists
     - [ ] Notificacoes

#### Tipo de Teste
- **Manual**: Testar builds em dispositivos fisicos
- **Smoke Test**: Verificar funcionalidades criticas apos build

#### Dependencias
- Subtarefa 4.4.1.2 (Notificacoes integradas)

#### Configuracao eas.json (Referencia)

```json
{
  "cli": {
    "version": ">= 15.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      },
      "android": {
        "buildType": "apk"
      },
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://your-dev-project.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-dev-anon-key"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      },
      "android": {
        "buildType": "apk"
      },
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://your-staging-project.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-staging-anon-key"
      }
    },
    "production": {
      "distribution": "store",
      "ios": {
        "simulator": false
      },
      "android": {
        "buildType": "app-bundle"
      },
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://your-prod-project.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-prod-anon-key"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "developer@garageinn.com.br",
        "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID",
        "appleTeamId": "YOUR_APPLE_TEAM_ID"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

---

### Subtarefa 4.4.2.2: Publicar nas lojas

#### Descricao
Submeter app para revisao nas lojas App Store e Google Play Store, preenchendo todos os metadados necessarios.

#### Arquivos Envolvidos

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `apps/mobile/store-assets/screenshots-ios/` | CRIAR | Screenshots iPhone |
| `apps/mobile/store-assets/screenshots-android/` | CRIAR | Screenshots Android |
| `apps/mobile/store-assets/feature-graphic.png` | CRIAR | Banner Play Store 1024x500 |
| `apps/mobile/store-assets/app-description-pt.md` | CRIAR | Descricao do app |
| `apps/mobile/store-assets/privacy-policy-url.txt` | CRIAR | URL politica de privacidade |
| `docs/STORE_SUBMISSION_CHECKLIST.md` | CRIAR | Checklist para futuras versoes |

#### Criterios de Aceite (do Backlog)

1. **Publicacao iOS (App Store):**
   - [ ] App submetido para revisao na App Store Connect
   - [ ] Informacoes preenchidas:
     - [ ] Nome: "Gapp"
     - [ ] Subtitulo (se aplicavel)
     - [ ] Descricao completa em portugues
     - [ ] Palavras-chave (keywords)
     - [ ] Categoria: Business ou Productivity
     - [ ] Classificacao etaria configurada
     - [ ] Screenshots para iPhone (varios tamanhos)
     - [ ] Screenshots para iPad (se `supportsTablet: true`)
     - [ ] Icone do app (1024x1024)
     - [ ] Politica de privacidade (URL)
   - [ ] Preco configurado (gratuito)
   - [ ] Informacoes de suporte (URL, email)
   - [ ] App aprovado e publicado na App Store
   - [ ] Link de download funcional

2. **Publicacao Android (Google Play Store):**
   - [ ] App submetido para revisao no Google Play Console
   - [ ] Informacoes preenchidas:
     - [ ] Nome: "Gapp"
     - [ ] Descricao curta (80 caracteres)
     - [ ] Descricao completa em portugues
     - [ ] Screenshots para telefones (minimo 2)
     - [ ] Screenshots para tablets (se suportado)
     - [ ] Icone do app (512x512)
     - [ ] Feature graphic (1024x500)
     - [ ] Politica de privacidade (URL)
     - [ ] Classificacao de conteudo
     - [ ] Categoria: Business ou Productivity
   - [ ] Preco configurado (gratuito)
   - [ ] Informacoes de contato do desenvolvedor
   - [ ] App aprovado e publicado na Google Play Store
   - [ ] Link de download funcional

3. **Documentacao de publicacao:**
   - [ ] Processo de publicacao documentado
   - [ ] Checklist de publicacao criado para futuras versoes
   - [ ] Credenciais e acessos documentados de forma segura
   - [ ] Versionamento e changelog documentados

4. **Pos-publicacao:**
   - [ ] App disponivel para download nas lojas
   - [ ] Usuarios podem instalar e usar o app
   - [ ] Monitoramento de crashes configurado (Sentry ja integrado)
   - [ ] Analytics basico configurado
   - [ ] Feedback inicial coletado e documentado

5. **Validacao final:**
   - [ ] App instalado via App Store funciona corretamente
   - [ ] App instalado via Play Store funciona corretamente
   - [ ] Autenticacao funciona em producao
   - [ ] Integracao com Supabase funciona em producao
   - [ ] Notificacoes funcionam em producao
   - [ ] Performance aceitavel em dispositivos reais

#### Tipo de Teste
- **Manual**: Testar apps instalados das lojas
- **Smoke Test**: Funcionalidades criticas em producao

#### Dependencias
- Subtarefa 4.4.2.1 (Builds prontos)

---

## Criterios de Aceite Gerais do Epico

| Area | Requisitos |
|------|-----------|
| **Documentacao** | README do mobile atualizado com instrucoes de build e publicacao |
| **Seguranca** | Credenciais do Firebase nao expostas no codigo |
| **Conformidade** | App segue politicas das lojas (App Store Guidelines e Google Play Policies) |
| **Qualidade** | App nao apresenta crashes criticos em producao |
| **Performance** | Tempo de abertura < 3s |
| **Acessibilidade** | Acessibilidade basica implementada |
| **LGPD** | Compliance conforme PRD secao 8.3 |

---

## Sequencia de Implementacao

```
4.4.1.1 Configurar Firebase
    |
    v
4.4.1.2 Integrar notificacoes
    |
    v
4.4.2.1 Configurar EAS Build
    |
    v
4.4.2.2 Publicar nas lojas
```

---

## Riscos e Mitigacoes

| Risco | Impacto | Mitigacao |
|-------|---------|-----------|
| Rejeicao na App Store | Alto | Seguir rigorosamente App Store Guidelines |
| Demora na aprovacao | Medio | Submeter com antecedencia |
| Problemas com certificados iOS | Medio | Usar EAS para gerenciar certificados |
| Notificacoes nao chegam | Alto | Testar em dispositivos reais antes do lancamento |
| Keystore perdido | Critico | Backup seguro via EAS Secrets |

---

## Ferramentas Recomendadas

- **Context7 MCP**: Documentacao atualizada Expo/Firebase
- **Supabase MCP**: Criar tabelas e RLS
- **Playwright MCP**: NAO APLICAVEL (mobile)
- **EAS CLI**: Build e submit

---

## Checklist Pre-Implementacao

- [ ] Apple Developer Account ativa ($99/ano)
- [ ] Google Play Console conta ativa ($25 one-time)
- [ ] Firebase Console acessivel
- [ ] Acesso ao repositorio com permissao de push
- [ ] Ambiente de desenvolvimento mobile configurado (Xcode, Android Studio)
- [ ] Dispositivos fisicos iOS e Android para testes

---

## Referencias

- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [EAS Submit Docs](https://docs.expo.dev/submit/introduction/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Developer Policy](https://play.google.com/about/developer-content-policy/)
