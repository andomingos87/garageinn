# Guia de Configuração do Firebase — Épico 4.4

Este documento fornece um passo a passo detalhado para configurar o Firebase Cloud Messaging (FCM) no projeto Gapp Mobile, conforme os critérios de aceite do Épico 4.4.

## 📋 Pré-requisitos

- Conta Google (para acessar Firebase Console)
- Apple Developer Account (para iOS - se ainda não tiver, será necessário criar)
- Acesso ao projeto mobile: `apps/mobile/`
- Informações do app:
  - **Bundle ID iOS**: `com.garageinn.gapp`
  - **Package Name Android**: `com.garageinn.gapp`

---

## 1. Criar Projeto Firebase

### Passo 1.1: Acessar Firebase Console

1. Acesse: https://console.firebase.google.com
2. Faça login com sua conta Google
3. Se você já tem projetos Firebase, clique em **"Adicionar projeto"** ou **"Create a project"**

### Passo 1.2: Criar Novo Projeto

1. **Nome do Projeto**: Digite `Gapp` ou `Garageinn App` (ou outro nome de sua escolha)
2. Clique em **"Continuar"** (Continue)
3. **Google Analytics** (opcional):
   - Recomendado: **Habilitar** Google Analytics para melhor monitoramento
   - Se habilitar, selecione uma conta existente ou crie uma nova
   - Se não habilitar, pode desabilitar (não é obrigatório para FCM)
4. Clique em **"Criar projeto"** (Create project)
5. Aguarde a criação do projeto (pode levar alguns segundos)
6. Clique em **"Continuar"** quando a criação estiver completa

### Passo 1.3: Verificar Projeto Criado

- Você será redirecionado para o **Overview** do projeto
- Anote o **Project ID** (aparece no topo da página ou em Configurações do Projeto)
- O Project ID será usado posteriormente

---

## 2. Registrar Aplicativo Android

### Passo 2.1: Iniciar Registro do App Android

1. Na página **Overview** do Firebase, clique no ícone **Android** (🟢) ou em **"Adicionar app"** → **Android**
2. Se for a primeira vez, você verá um formulário de registro

### Passo 2.2: Preencher Informações do Android

1. **Android package name**: Digite `com.garageinn.gapp`
   - ⚠️ **IMPORTANTE**: Deve ser exatamente igual ao `android.package` no `app.json`
2. **App nickname** (opcional): `Gapp Android` ou deixe em branco
3. **Debug signing certificate SHA-1** (opcional): Pode pular por enquanto
   - Será necessário mais tarde para funcionalidades como Dynamic Links
4. Clique em **"Registrar app"** (Register app)

### Passo 2.3: Baixar google-services.json

1. Após registrar, você verá instruções para baixar o arquivo `google-services.json`
2. Clique em **"Baixar google-services.json"** (Download google-services.json)
3. **IMPORTANTE**: Salve este arquivo em:
   ```
   apps/mobile/google-services.json
   ```
4. ⚠️ **Atenção**: Este arquivo contém informações sensíveis. Decida se vai versioná-lo no Git ou adicionar ao `.gitignore`
   - Se versionar: certifique-se de que não há credenciais de produção expostas
   - Se não versionar: adicione `apps/mobile/google-services.json` ao `.gitignore`

### Passo 2.4: Configurar no Projeto (Será feito depois)

- Por enquanto, apenas salve o arquivo. A configuração no código será feita na etapa de integração.

### Passo 2.5: Pular Instruções Adicionais

1. Na tela de instruções, você pode **pular** as etapas de adicionar SDK ao projeto (Expo gerencia isso)
2. Clique em **"Próxima"** (Next) até chegar na tela de conclusão
3. Clique em **"Continuar no console"** (Continue to console)

---

## 3. Registrar Aplicativo iOS

### Passo 3.1: Iniciar Registro do App iOS

1. Na página **Overview** do Firebase, clique no ícone **iOS** (🍎) ou em **"Adicionar app"** → **iOS**
2. Se for a primeira vez, você verá um formulário de registro

### Passo 3.2: Preencher Informações do iOS

1. **iOS bundle ID**: Digite `com.garageinn.gapp`
   - ⚠️ **IMPORTANTE**: Deve ser exatamente igual ao `ios.bundleIdentifier` no `app.json`
2. **App nickname** (opcional): `Gapp iOS` ou deixe em branco
3. **App Store ID** (opcional): Pode pular por enquanto (será necessário apenas quando publicar na App Store)
4. Clique em **"Registrar app"** (Register app)

### Passo 3.3: Baixar GoogleService-Info.plist

1. Após registrar, você verá instruções para baixar o arquivo `GoogleService-Info.plist`
2. Clique em **"Baixar GoogleService-Info.plist"** (Download GoogleService-Info.plist)
3. **IMPORTANTE**: Salve este arquivo em:
   ```
   apps/mobile/GoogleService-Info.plist
   ```
4. ⚠️ **Atenção**: Este arquivo contém informações sensíveis. Decida se vai versioná-lo no Git ou adicionar ao `.gitignore`
   - Se versionar: certifique-se de que não há credenciais de produção expostas
   - Se não versionar: adicione `apps/mobile/GoogleService-Info.plist` ao `.gitignore`

### Passo 3.4: Configurar no Projeto (Será feito depois)

- Por enquanto, apenas salve o arquivo. A configuração no código será feita na etapa de integração.

### Passo 3.5: Pular Instruções Adicionais

1. Na tela de instruções, você pode **pular** as etapas de adicionar SDK ao projeto (Expo gerencia isso)
2. Clique em **"Próxima"** (Next) até chegar na tela de conclusão
3. Clique em **"Continuar no console"** (Continue to console)

---

## 4. Configurar Cloud Messaging (FCM)

### Passo 4.1: Acessar Cloud Messaging

1. No menu lateral do Firebase Console, vá em **"Build"** → **"Cloud Messaging"** (ou **"Messaging"**)
2. Se for a primeira vez, você verá uma tela de boas-vindas

### Passo 4.2: Habilitar Cloud Messaging

1. Cloud Messaging geralmente já está habilitado automaticamente
2. Se não estiver, siga as instruções na tela para habilitar

### Passo 4.3: Configurar Credenciais iOS (APNs)

⚠️ **IMPORTANTE**: Para iOS, você precisa configurar as credenciais do Apple Push Notification service (APNs).

#### Opção A: Usar APNs Authentication Key (Recomendado)

1. **No Firebase Console**:
   - Vá em **Cloud Messaging** → **Apple app configuration**
   - Clique em **"Upload"** ao lado de **APNs Authentication Key**

2. **No Apple Developer Portal**:
   - Acesse: https://developer.apple.com/account/resources/authkeys/list
   - Faça login com sua Apple Developer Account
   - Clique no botão **"+"** para criar uma nova chave
   - **Key Name**: `Gapp Push Notifications` (ou outro nome)
   - Marque a opção **"Apple Push Notifications service (APNs)"**
   - Clique em **"Continuar"** → **"Registrar"**
   - **IMPORTANTE**: Baixe o arquivo `.p8` imediatamente (você só pode baixar uma vez!)
   - Anote o **Key ID** (aparece na lista de chaves)

3. **Voltar ao Firebase Console**:
   - **Key ID**: Cole o Key ID anotado
   - **Team ID**: Encontre no canto superior direito do Apple Developer Portal (ou em Membership)
   - **Upload**: Faça upload do arquivo `.p8` baixado
   - Clique em **"Upload"**

#### Opção B: Usar APNs Certificate (Alternativa)

1. Se preferir usar certificado (menos recomendado):
   - No Apple Developer Portal, crie um certificado APNs
   - Faça upload do certificado no Firebase Console

### Passo 4.4: Verificar Configuração Android

1. Para Android, o FCM geralmente funciona automaticamente após baixar o `google-services.json`
2. Verifique se não há erros na seção **"Android app configuration"** do Cloud Messaging

### Passo 4.5: Obter Server Key (Opcional - para envio manual)

1. No Firebase Console, vá em **Configurações do projeto** (ícone de engrenagem) → **Cloud Messaging**
2. Na seção **"Cloud Messaging API (Legacy)"**, você verá a **Server Key**
   - ⚠️ **IMPORTANTE**: Esta chave é sensível. Não exponha em código público
   - Você precisará desta chave se for enviar notificações diretamente via API HTTP
   - Para Expo, geralmente não é necessária (Expo gerencia o envio)

---

## 5. Verificar Configuração

### Passo 5.1: Verificar Apps Registrados

1. No Firebase Console, vá em **Configurações do projeto** (ícone de engrenagem) → **Geral**
2. Na seção **"Seus apps"**, você deve ver:
   - ✅ App Android: `com.garageinn.gapp`
   - ✅ App iOS: `com.garageinn.gapp`

### Passo 5.2: Verificar Arquivos Baixados

Verifique se os arquivos estão nos locais corretos:

```bash
# No diretório apps/mobile/
apps/mobile/google-services.json          # Android
apps/mobile/GoogleService-Info.plist      # iOS
```

### Passo 5.3: Verificar Cloud Messaging

1. No Firebase Console, vá em **Cloud Messaging**
2. Verifique se:
   - ✅ Cloud Messaging está habilitado
   - ✅ iOS: APNs Authentication Key ou Certificate está configurado
   - ✅ Android: Sem erros de configuração

---

## 6. Configurações Adicionais (Opcional)

### Passo 6.1: Configurar Notificações no app.json

⚠️ **NOTA**: Esta etapa será feita durante a integração do código, mas você pode preparar:

1. O `app.json` precisará incluir:
   ```json
   {
     "expo": {
       "plugins": [
         "@sentry/react-native",
         "expo-notifications"
       ],
       "notification": {
         "icon": "./assets/notification-icon.png",
         "color": "#FF3D3D",
         "iosDisplayInForeground": true,
         "androidMode": "default",
         "androidCollapsedTitle": "Novas notificações"
       },
       "ios": {
         "infoPlist": {
           "UIBackgroundModes": ["remote-notification"]
         }
       },
       "android": {
         "permissions": [
           "RECEIVE_BOOT_COMPLETED"
         ]
       }
     }
   }
   ```

### Passo 6.2: Preparar Ícone de Notificação (Android)

1. Crie um ícone de notificação branco e transparente (PNG)
2. Tamanho recomendado: 96x96 pixels (ou múltiplos tamanhos para diferentes densidades)
3. Salve em: `apps/mobile/assets/notification-icon.png`
4. Este ícone será exibido na barra de notificações do Android

---

## 7. Checklist de Validação

Use este checklist para garantir que tudo está configurado:

### ✅ Projeto Firebase
- [ ] Projeto Firebase criado
- [ ] Project ID anotado
- [ ] Google Analytics configurado (opcional)

### ✅ App Android
- [ ] App Android registrado no Firebase
- [ ] Package name: `com.garageinn.gapp`
- [ ] Arquivo `google-services.json` baixado
- [ ] Arquivo salvo em `apps/mobile/google-services.json`

### ✅ App iOS
- [ ] App iOS registrado no Firebase
- [ ] Bundle ID: `com.garageinn.gapp`
- [ ] Arquivo `GoogleService-Info.plist` baixado
- [ ] Arquivo salvo em `apps/mobile/GoogleService-Info.plist`
- [ ] APNs Authentication Key ou Certificate configurado no Firebase

### ✅ Cloud Messaging
- [ ] Cloud Messaging habilitado
- [ ] iOS: Credenciais APNs configuradas
- [ ] Android: Sem erros de configuração
- [ ] Server Key anotada (se necessário para envio manual)

### ✅ Arquivos e Segurança
- [ ] Arquivos de configuração salvos nos locais corretos
- [ ] Decisão tomada sobre versionamento no Git
- [ ] Se não versionar: arquivos adicionados ao `.gitignore`

---

## 8. Próximos Passos

Após completar esta configuração do Firebase, você precisará:

1. **Instalar dependências**: `expo-notifications` no projeto mobile
2. **Configurar app.json**: Adicionar plugin e configurações de notificação
3. **Implementar código**: Criar serviço de notificações no app
4. **Integrar com Supabase**: Criar tabela para armazenar tokens FCM
5. **Testar**: Validar notificações em dispositivos físicos

Consulte a documentação do Épico 4.4 no `docs/BACKLOG.md` para os critérios de aceite completos da integração.

---

## 9. Troubleshooting

### Problema: Não consigo baixar google-services.json

**Solução**: 
- Verifique se o app Android foi registrado corretamente
- Tente acessar: Firebase Console → Configurações do projeto → Geral → Seus apps → Android app → Configuração

### Problema: Erro ao configurar APNs no Firebase

**Solução**:
- Verifique se a Apple Developer Account está ativa
- Certifique-se de que o Key ID e Team ID estão corretos
- Verifique se o arquivo `.p8` não está corrompido
- Tente criar uma nova chave APNs se necessário

### Problema: Arquivos de configuração não aparecem no projeto

**Solução**:
- Verifique o caminho: devem estar em `apps/mobile/` (raiz do projeto mobile)
- Certifique-se de que os arquivos não foram movidos acidentalmente
- Verifique permissões de arquivo

### Problema: Cloud Messaging não está habilitado

**Solução**:
- Vá em Firebase Console → Cloud Messaging
- Siga as instruções para habilitar o serviço
- Verifique se há algum erro na configuração do projeto

---

## 10. Referências

- [Firebase Console](https://console.firebase.google.com)
- [Documentação Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Documentação Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Apple Developer Portal](https://developer.apple.com/account)
- [Guia de Push Notifications do Expo](https://docs.expo.dev/push-notifications/push-notifications-setup/)

---

**Última atualização**: 2026-01-18  
**Versão**: 1.0  
**Autor**: Equipe de Desenvolvimento Gapp
