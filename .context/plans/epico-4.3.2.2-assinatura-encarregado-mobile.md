---
status: completed
generated: 2026-01-18
completed: 2026-01-18
epic: "4.3"
task: "4.3.2"
subtask: "4.3.2.2"
title: "Assinatura do Encarregado - Checklist de Supervisão (Mobile)"
priority: medium
agents:
  - type: "mobile-specialist"
    role: "Implementar componente de assinatura digital e integração no fluxo de supervisão"
  - type: "backend-specialist"
    role: "Criar serviço para finalizar execução de supervisão com assinaturas"
  - type: "test-writer"
    role: "Criar testes unitários e de integração para assinatura"
docs:
  - "project-overview.md"
  - "architecture.md"
  - "data-flow.md"
phases:
  - id: "phase-1"
    name: "Instalação de Dependências"
    prevc: "P"
    status: "completed"
  - id: "phase-2"
    name: "Componente de Assinatura"
    prevc: "E"
    status: "completed"
  - id: "phase-3"
    name: "Serviço de Finalização com Assinaturas"
    prevc: "E"
    status: "completed"
  - id: "phase-4"
    name: "Integração no Fluxo de Supervisão"
    prevc: "E"
    status: "completed"
  - id: "phase-5"
    name: "Validação e Testes"
    prevc: "V"
    status: "completed"
  - id: "phase-6"
    name: "Documentação"
    prevc: "C"
    status: "completed"
---

# Plano: Épico 4.3.2.2 - Assinatura do Encarregado (Mobile)

> Implementação da captura de assinaturas digitais (supervisor e encarregado) ao finalizar checklist de supervisão no aplicativo mobile.

## Visão Geral

### Objetivo Principal

Implementar a funcionalidade de assinatura digital no mobile para checklists de supervisão, permitindo que:
- Supervisor capture sua própria assinatura
- Encarregado capture sua assinatura (com nome obrigatório)
- Assinaturas sejam salvas como base64 no banco de dados
- Validação impeça finalização sem assinaturas completas

### Status Atual (Verificado em 2026-01-18)

| Componente | Status | Observação |
|------------|--------|------------|
| Estrutura de dados no banco | ✅ Pronto | Campos `supervisor_signature`, `attendant_signature`, `attendant_name` existem |
| Permissões RBAC | ✅ Pronto | `checklist:execute_supervision` configurado |
| Fluxo de checklist de supervisão | ⚠️ Parcial | Estrutura existe, falta componente de assinatura |
| Componente de assinatura | ❌ Não existe | Precisa ser criado |
| Serviço de finalização | ⚠️ Parcial | `completeExecution` existe mas não suporta assinaturas |
| Integração no resumo | ❌ Não existe | `ChecklistSummary` não tem seção de assinaturas |

### Referência de Implementação (Web)

A implementação web em `apps/web/src/components/ui/signature-pad.tsx` serve como referência:
- Usa `react-signature-canvas` para captura
- Exporta assinatura como base64 (PNG)
- Componente `InlineSignaturePad` para uso em formulários
- Validação de assinatura obrigatória

### Dependências

- ✅ Banco de dados: Campos de assinatura já existem em `checklist_executions`
- ✅ Permissões: RBAC configurado para supervisão
- ✅ Fluxo base: Estrutura de execução de checklist existe
- ⚠️ Biblioteca: Precisa instalar biblioteca de assinatura para React Native

---

## Fase 1 - Instalação de Dependências

### Tarefa 1.1: Pesquisar e escolher biblioteca de assinatura

**Responsável:** mobile-specialist  
**Arquivo:** `apps/mobile/package.json` (modificar)  
**Dependências:** Nenhuma

**Descrição:**
Pesquisar bibliotecas disponíveis para captura de assinatura em React Native e escolher a mais adequada.

**Opções a avaliar:**
- `react-native-signature-canvas` - Baseado em WebView, compatível com Expo
- `@react-native-community/signature-canvas` - Alternativa nativa
- `react-native-signature-pad` - Outra opção baseada em WebView

**Critérios de escolha:**
- Compatibilidade com Expo (sem necessidade de native modules)
- Suporte a touch gestures
- Exportação para base64
- Manutenção ativa do projeto
- Tamanho do bundle

**Critérios de Aceite:**
- [ ] Biblioteca escolhida é compatível com Expo SDK 54
- [ ] Biblioteca suporta exportação para base64 (PNG)
- [ ] Biblioteca funciona em iOS e Android
- [ ] Documentação da biblioteca foi revisada

**Tipo de Teste:** Nenhum (pesquisa)

---

### Tarefa 1.2: Instalar biblioteca escolhida

**Responsável:** mobile-specialist  
**Arquivo:** `apps/mobile/package.json` (modificar)  
**Dependências:** Tarefa 1.1

**Descrição:**
Instalar a biblioteca escolhida e suas dependências (se houver).

**Comando exemplo:**
```bash
cd apps/mobile
npm install react-native-signature-canvas
# ou
npm install @react-native-community/signature-canvas
```

**Critérios de Aceite:**
- [ ] Biblioteca instalada sem erros
- [ ] `package.json` atualizado com nova dependência
- [ ] `package-lock.json` atualizado
- [ ] Sem conflitos de versão com outras dependências

**Tipo de Teste:** Nenhum (instalação)

---

## Fase 2 - Componente de Assinatura

### Tarefa 2.1: Criar tipos TypeScript para assinatura

**Responsável:** mobile-specialist  
**Arquivo:** `apps/mobile/src/modules/checklists/types/checklist.types.ts` (modificar)  
**Dependências:** Nenhuma

**Descrição:**
Adicionar tipos TypeScript relacionados a assinaturas no arquivo de tipos de checklist.

**Tipos a adicionar:**
```typescript
export interface SupervisionSignatureData {
  supervisorSignature: string; // base64 PNG
  attendantSignature: string; // base64 PNG
  attendantName: string;
}

export interface ChecklistExecution {
  // ... campos existentes
  supervisorSignature?: string | null;
  attendantSignature?: string | null;
  attendantName?: string | null;
}
```

**Critérios de Aceite:**
- [ ] Tipo `SupervisionSignatureData` definido
- [ ] Campos de assinatura adicionados a `ChecklistExecution`
- [ ] Tipos exportados corretamente
- [ ] Sem erros de TypeScript

**Tipo de Teste:** Unit (type checking via `tsc`)

---

### Tarefa 2.2: Criar componente SignaturePad

**Responsável:** mobile-specialist  
**Arquivo:** `apps/mobile/src/components/ui/SignaturePad.tsx` (criar)  
**Dependências:** Tarefa 1.2, Tarefa 2.1

**Descrição:**
Criar componente reutilizável para captura de assinatura digital, similar ao componente web mas adaptado para React Native.

**Funcionalidades:**
- Canvas para desenhar assinatura com touch
- Botão para limpar assinatura
- Exportação para base64 (PNG)
- Indicador visual de assinatura capturada
- Suporte a carregar assinatura existente (para edição)

**Props do componente:**
```typescript
interface SignaturePadProps {
  label: string;
  value?: string | null; // base64 da assinatura existente
  onChange: (dataUrl: string | null) => void;
  height?: number;
  disabled?: boolean;
  required?: boolean;
  onClear?: () => void;
}
```

**Critérios de Aceite:**
- [ ] Componente renderiza canvas para assinatura
- [ ] Usuário pode desenhar assinatura com touch/gestos
- [ ] Botão "Limpar" remove assinatura
- [ ] Assinatura é exportada como base64 PNG ao desenhar
- [ ] Callback `onChange` é chamado com base64 quando assinatura é capturada
- [ ] Componente carrega assinatura existente se `value` for fornecido
- [ ] Indicador visual mostra se assinatura foi capturada
- [ ] Componente é responsivo e funciona em diferentes tamanhos de tela
- [ ] Funciona corretamente em iOS e Android

**Tipo de Teste:** Unit (componente isolado) + Integration (teste manual em dispositivo)

**Arquivos relacionados:**
- `apps/mobile/src/components/ui/index.ts` (exportar componente)

---

### Tarefa 2.3: Criar componente SupervisionSummary

**Responsável:** mobile-specialist  
**Arquivo:** `apps/mobile/src/modules/checklists/components/SupervisionSummary.tsx` (criar)  
**Dependências:** Tarefa 2.2

**Descrição:**
Criar componente específico para resumo de checklist de supervisão, baseado em `ChecklistSummary` mas com seção de assinaturas.

**Funcionalidades:**
- Exibir resumo de perguntas e respostas (reutilizar lógica de `ChecklistSummary`)
- Campo de texto para nome do encarregado (obrigatório)
- Dois componentes `SignaturePad`: encarregado e supervisor
- Validação: requer nome + 2 assinaturas para finalizar
- Botões: "Voltar" e "Finalizar"

**Props:**
```typescript
interface SupervisionSummaryProps {
  templateName: string;
  unitName: string;
  questions: ChecklistQuestion[];
  answers: Record<string, ChecklistAnswer>;
  generalObservations: string;
  onObservationsChange: (text: string) => void;
  onSubmit: (signatureData: SupervisionSignatureData) => void;
  onBack: () => void;
  isSubmitting: boolean;
  isValid: boolean; // validação de perguntas
}
```

**Critérios de Aceite:**
- [ ] Componente exibe resumo de perguntas e respostas
- [ ] Campo de texto para nome do encarregado está presente
- [ ] Dois componentes de assinatura são exibidos (encarregado e supervisor)
- [ ] Validação impede submissão sem nome do encarregado
- [ ] Validação impede submissão sem assinatura do encarregado
- [ ] Validação impede submissão sem assinatura do supervisor
- [ ] Botão "Finalizar" está desabilitado quando validação falha
- [ ] Botão "Finalizar" chama `onSubmit` com dados de assinatura
- [ ] Layout é responsivo e legível
- [ ] Segue design system do app (cores, tipografia, espaçamento)

**Tipo de Teste:** Unit (componente isolado) + Integration (teste manual)

**Arquivos relacionados:**
- `apps/mobile/src/modules/checklists/components/index.ts` (exportar)

---

## Fase 3 - Serviço de Finalização com Assinaturas

### Tarefa 3.1: Criar função completeSupervisionExecution no serviço

**Responsável:** backend-specialist  
**Arquivo:** `apps/mobile/src/modules/checklists/services/checklistService.ts` (modificar)  
**Dependências:** Tarefa 2.1

**Descrição:**
Criar função específica para finalizar execução de checklist de supervisão com assinaturas, similar à implementação web.

**Função:**
```typescript
export async function completeSupervisionExecution(
  executionId: string,
  signatureData: SupervisionSignatureData,
  generalObservations?: string | null
): Promise<ChecklistExecution>
```

**Lógica:**
1. Validar que execução existe e está em `in_progress`
2. Validar que template é do tipo `supervision`
3. Validar assinaturas (todas obrigatórias)
4. Validar respostas obrigatórias
5. Calcular `has_non_conformities`
6. Atualizar execução com assinaturas e status `completed`

**Critérios de Aceite:**
- [ ] Função valida que execução existe
- [ ] Função valida que execução está em `in_progress`
- [ ] Função valida que template é do tipo `supervision`
- [ ] Função valida que assinatura do supervisor está presente
- [ ] Função valida que assinatura do encarregado está presente
- [ ] Função valida que nome do encarregado está presente e não vazio
- [ ] Função valida respostas obrigatórias antes de finalizar
- [ ] Função calcula `has_non_conformities` corretamente
- [ ] Função atualiza execução com assinaturas (base64) no banco
- [ ] Função atualiza status para `completed`
- [ ] Função retorna execução atualizada
- [ ] Erros são tratados e retornados como `ChecklistError`

**Tipo de Teste:** Integration (teste com Supabase local/remoto)

**Arquivos relacionados:**
- `apps/mobile/src/modules/checklists/types/checklist.types.ts` (tipos)

---

### Tarefa 3.2: Atualizar hook useChecklistExecution para supervisão

**Responsável:** backend-specialist  
**Arquivo:** `apps/mobile/src/modules/checklists/hooks/useChecklistExecution.ts` (modificar)  
**Dependências:** Tarefa 3.1

**Descrição:**
Adicionar suporte a assinaturas no hook de execução de checklist, criando método específico para finalizar supervisão.

**Mudanças:**
- Adicionar estado para assinaturas:
  ```typescript
  const [supervisorSignature, setSupervisorSignature] = useState<string | null>(null);
  const [attendantSignature, setAttendantSignature] = useState<string | null>(null);
  const [attendantName, setAttendantName] = useState('');
  ```
- Criar método `submitSupervision()` que usa `completeSupervisionExecution()`
- Atualizar validação para incluir assinaturas quando tipo é `supervision`

**Critérios de Aceite:**
- [ ] Estado de assinaturas é gerenciado no hook
- [ ] Método `setSupervisorSignature` está disponível
- [ ] Método `setAttendantSignature` está disponível
- [ ] Método `setAttendantName` está disponível
- [ ] Método `submitSupervision()` chama `completeSupervisionExecution()`
- [ ] Validação inclui assinaturas quando template é do tipo `supervision`
- [ ] Hook detecta automaticamente tipo de template (opening vs supervision)
- [ ] Método `submit()` existente continua funcionando para checklists de abertura

**Tipo de Teste:** Unit (hook isolado) + Integration (teste com serviço)

---

## Fase 4 - Integração no Fluxo de Supervisão

### Tarefa 4.1: Atualizar ChecklistExecutionScreen para supervisão

**Responsável:** mobile-specialist  
**Arquivo:** `apps/mobile/src/modules/checklists/screens/ChecklistExecutionScreen.tsx` (modificar)  
**Dependências:** Tarefa 2.3, Tarefa 3.2

**Descrição:**
Modificar a tela de execução para detectar tipo de checklist e usar `SupervisionSummary` quando for supervisão.

**Mudanças:**
- Detectar tipo de template (`opening` vs `supervision`)
- Renderizar `SupervisionSummary` quando tipo é `supervision`
- Renderizar `ChecklistSummary` quando tipo é `opening`
- Passar handlers de assinatura para `SupervisionSummary`
- Usar `submitSupervision()` quando for supervisão

**Critérios de Aceite:**
- [ ] Tela detecta tipo de template corretamente
- [ ] `SupervisionSummary` é renderizado para checklists de supervisão
- [ ] `ChecklistSummary` é renderizado para checklists de abertura
- [ ] Handlers de assinatura são passados corretamente
- [ ] `submitSupervision()` é chamado ao finalizar supervisão
- [ ] Fluxo de navegação funciona corretamente
- [ ] Validação de assinaturas impede finalização incompleta

**Tipo de Teste:** Integration (teste manual em dispositivo) + E2E (se aplicável)

---

### Tarefa 4.2: Atualizar serviço para carregar template de supervisão

**Responsável:** backend-specialist  
**Arquivo:** `apps/mobile/src/modules/checklists/services/checklistService.ts` (modificar)  
**Dependências:** Nenhuma

**Descrição:**
Adicionar função para buscar template de supervisão por unidade, similar a `fetchOpeningTemplateForUnit`.

**Função:**
```typescript
export async function fetchSupervisionTemplateForUnit(
  unitId: string
): Promise<ChecklistTemplate | null>
```

**Lógica:**
- Buscar template do tipo `supervision` vinculado à unidade
- Considerar templates globais se não houver específico da unidade

**Critérios de Aceite:**
- [ ] Função busca template de supervisão para a unidade
- [ ] Função retorna `null` se não encontrar template
- [ ] Função trata erros corretamente
- [ ] Template retornado tem `type: 'supervision'`

**Tipo de Teste:** Integration (teste com Supabase)

---

### Tarefa 4.3: Atualizar hook para carregar template de supervisão

**Responsável:** backend-specialist  
**Arquivo:** `apps/mobile/src/modules/checklists/hooks/useChecklistExecution.ts` (modificar)  
**Dependências:** Tarefa 4.2

**Descrição:**
Modificar `loadTemplate()` para detectar tipo de checklist e usar função apropriada.

**Mudanças:**
- Detectar se checklist é de abertura ou supervisão (via parâmetro ou contexto)
- Chamar `fetchOpeningTemplateForUnit()` ou `fetchSupervisionTemplateForUnit()` conforme tipo

**Critérios de Aceite:**
- [ ] Hook detecta tipo de checklist corretamente
- [ ] Função apropriada é chamada para cada tipo
- [ ] Template carregado tem tipo correto
- [ ] Erros são tratados adequadamente

**Tipo de Teste:** Unit (hook isolado)

---

## Fase 5 - Validação e Testes

### Tarefa 5.1: Testes unitários do componente SignaturePad

**Responsável:** test-writer  
**Arquivo:** `apps/mobile/src/components/ui/__tests__/SignaturePad.test.tsx` (criar)  
**Dependências:** Tarefa 2.2

**Descrição:**
Criar testes unitários para o componente de assinatura.

**Testes a implementar:**
- Renderização do componente
- Captura de assinatura (mock de touch events)
- Limpeza de assinatura
- Exportação para base64
- Carregamento de assinatura existente
- Validação de props obrigatórias

**Critérios de Aceite:**
- [ ] Testes cobrem renderização básica
- [ ] Testes cobrem interação de touch
- [ ] Testes cobrem limpeza
- [ ] Testes cobrem exportação base64
- [ ] Cobertura de código >= 80%

**Tipo de Teste:** Unit

---

### Tarefa 5.2: Testes de integração do serviço

**Responsável:** test-writer  
**Arquivo:** `apps/mobile/src/modules/checklists/services/__tests__/checklistService.supervision.test.ts` (criar)  
**Dependências:** Tarefa 3.1

**Descrição:**
Criar testes de integração para `completeSupervisionExecution`.

**Testes a implementar:**
- Finalização bem-sucedida com assinaturas válidas
- Validação de assinaturas obrigatórias
- Validação de nome do encarregado
- Validação de tipo de template
- Tratamento de erros

**Critérios de Aceite:**
- [ ] Testes cobrem fluxo completo de finalização
- [ ] Testes cobrem validações
- [ ] Testes cobrem casos de erro
- [ ] Testes usam Supabase local ou mock

**Tipo de Teste:** Integration

---

### Tarefa 5.3: Teste manual completo do fluxo

**Responsável:** mobile-specialist  
**Arquivo:** N/A (teste manual)  
**Dependências:** Todas as tarefas anteriores

**Descrição:**
Realizar teste manual completo do fluxo de assinatura em dispositivo real.

**Cenários a testar:**
1. Iniciar checklist de supervisão
2. Responder todas as perguntas
3. Ir para resumo
4. Preencher nome do encarregado
5. Capturar assinatura do encarregado
6. Capturar assinatura do supervisor
7. Finalizar checklist
8. Verificar que assinaturas foram salvas no banco
9. Verificar relatório de supervisão exibe assinaturas

**Critérios de Aceite:**
- [ ] Fluxo completo funciona sem erros
- [ ] Assinaturas são capturadas corretamente
- [ ] Validações impedem finalização incompleta
- [ ] Assinaturas são salvas no banco de dados
- [ ] Assinaturas aparecem no relatório (web)
- [ ] Funciona em iOS e Android

**Tipo de Teste:** Manual (dispositivo real)

---

## Fase 6 - Documentação

### Tarefa 6.1: Atualizar documentação do componente

**Responsável:** documentation-writer  
**Arquivo:** `apps/mobile/src/components/ui/SignaturePad.tsx` (adicionar JSDoc)  
**Dependências:** Tarefa 2.2

**Descrição:**
Adicionar documentação JSDoc completa ao componente SignaturePad.

**Critérios de Aceite:**
- [ ] JSDoc descreve props do componente
- [ ] JSDoc descreve comportamento do componente
- [ ] Exemplos de uso estão documentados
- [ ] Notas sobre limitações (se houver)

**Tipo de Teste:** Nenhum (documentação)

---

### Tarefa 6.2: Atualizar BACKLOG.md

**Responsável:** documentation-writer  
**Arquivo:** `docs/BACKLOG.md` (modificar)  
**Dependências:** Todas as tarefas anteriores

**Descrição:**
Atualizar status da subtarefa 4.3.2.2 no backlog.

**Mudanças:**
```markdown
- [x] Subtarefa: Assinatura do encarregado ✅ IMPLEMENTADO
```

**Critérios de Aceite:**
- [ ] Subtarefa marcada como concluída
- [ ] Data de conclusão adicionada
- [ ] Observações sobre implementação adicionadas (se necessário)

**Tipo de Teste:** Nenhum (documentação)

---

## Resumo de Arquivos

### Arquivos a Criar
- `apps/mobile/src/components/ui/SignaturePad.tsx`
- `apps/mobile/src/modules/checklists/components/SupervisionSummary.tsx`
- `apps/mobile/src/components/ui/__tests__/SignaturePad.test.tsx`
- `apps/mobile/src/modules/checklists/services/__tests__/checklistService.supervision.test.ts`

### Arquivos a Modificar
- `apps/mobile/package.json` (adicionar dependência)
- `apps/mobile/src/modules/checklists/types/checklist.types.ts` (adicionar tipos)
- `apps/mobile/src/modules/checklists/services/checklistService.ts` (adicionar funções)
- `apps/mobile/src/modules/checklists/hooks/useChecklistExecution.ts` (adicionar suporte a assinaturas)
- `apps/mobile/src/modules/checklists/screens/ChecklistExecutionScreen.tsx` (integrar SupervisionSummary)
- `apps/mobile/src/components/ui/index.ts` (exportar SignaturePad)
- `apps/mobile/src/modules/checklists/components/index.ts` (exportar SupervisionSummary)
- `docs/BACKLOG.md` (atualizar status)

---

## Dependências entre Tarefas

```
Fase 1 (Dependências)
  └─> Fase 2 (Componente)
      └─> Fase 3 (Serviço)
          └─> Fase 4 (Integração)
              └─> Fase 5 (Testes)
                  └─> Fase 6 (Documentação)
```

**Ordem sugerida de execução:**
1. Fase 1 completa (dependências)
2. Fase 2 completa (componente)
3. Fase 3 completa (serviço)
4. Fase 4 completa (integração)
5. Fase 5 completa (testes)
6. Fase 6 completa (documentação)

---

## Notas de Implementação

### Biblioteca de Assinatura Recomendada

Após pesquisa, recomenda-se `react-native-signature-canvas` porque:
- Compatível com Expo (usa WebView)
- Suporte a touch gestures
- Exportação para base64
- Manutenção ativa
- Documentação clara

### Considerações de Performance

- Assinaturas em base64 podem ser grandes (~50-200KB)
- Considerar compressão se necessário no futuro
- Armazenamento atual em PostgreSQL é suficiente para MVP

### Compatibilidade

- iOS: ✅ Suportado
- Android: ✅ Suportado
- Expo SDK 54: ✅ Compatível

### Validações Importantes

1. **Nome do encarregado**: Não pode estar vazio ou apenas espaços
2. **Assinatura do encarregado**: Obrigatória, não pode ser null
3. **Assinatura do supervisor**: Obrigatória, não pode ser null
4. **Tipo de template**: Deve ser `supervision`
5. **Status da execução**: Deve ser `in_progress`

---

## Critérios de Aceite Globais (Extraídos do BACKLOG)

Conforme `docs/BACKLOG.md` linha 771:
- [ ] Subtarefa: Assinatura do encarregado ✅ IMPLEMENTADO

**Funcionalidade esperada:**
- Captura de assinatura do encarregado (obrigatória)
- Captura de assinatura do supervisor (obrigatória)
- Campo de nome do encarregado (obrigatório)
- Validação impede finalização sem assinaturas
- Assinaturas salvas no banco de dados
- Assinaturas aparecem no relatório de supervisão

---

## Referências

- Implementação Web: `apps/web/src/components/ui/signature-pad.tsx`
- Action Web: `apps/web/src/app/(app)/checklists/executar/actions.ts` (linha 580)
- Componente Web: `apps/web/src/app/(app)/checklists/supervisao/executar/components/supervision-summary.tsx`
- Plano de Supervisão Web: `.context/plans/epico-2-3-checklist-supervisao.md`
