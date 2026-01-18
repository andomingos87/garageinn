# Plano de Implementacao - Epico 2.3: Checklist de Supervisao

**Data:** 2026-01-18
**Status:** PENDENTE
**Prioridade:** Media
**Estimativa:** 5 tarefas principais

---

## Instrucoes de Execucao (Prioridade Alta)

1. **Antes de implementar uma task**: Entenda o que deve ser feito na task
2. **Use Supabase MCP** para tarefas que exigem interagir com o Supabase (migrations, queries, RLS)
3. **Use MCP Playwright** para testes E2E
4. **Apos concluir cada tarefa**: Valide e teste
5. **Ao finalizar todas as tarefas**:
   - Atualize as tarefas concluidas neste documento
   - Atualize `docs/BACKLOG.md`
   - Faca commit das alteracoes em portugues seguindo boas praticas
   - Atualize AGENTS.md e CLAUDE.md se necessario

---

## Resumo Executivo

### Contexto
Supervisores precisam criar e executar checklists de supervisao para auditar unidades sob sua cobertura. Diferente do checklist de abertura (operacional diario), o de supervisao e uma auditoria periodica com assinatura do encarregado.

### Estado Atual
- Templates de supervisao (`type='supervision'`) ja sao suportados no banco
- `template-form.tsx` aceita `type='supervision'`
- **GAP PRINCIPAL**: `executar/actions.ts` filtra apenas `type='opening'`
- Assinatura digital nao implementada
- Relatorio/pontuacao nao implementado

### Dependencias
- Cadastro de unidades ✅
- Cobertura de supervisores (`user_units.is_coverage`) ✅
- Templates de supervisao ✅

---

## Tarefa 2.3.1: Permissao por Cobertura (RLS)

**Status:** ✅ CONCLUIDA (2026-01-18)
**Ferramenta:** Supabase MCP (`apply_migration`, `get_advisors`)

### Objetivo
Garantir que supervisores vejam apenas checklists de supervisao das unidades que cobrem (`is_coverage = true`).

### Subtarefas

- [x] 2.3.1.1: Analisar RLS atual de `checklist_executions`
  - Policy antiga: `checklist_executions_select_unit` nao diferenciava tipo nem coverage
- [x] 2.3.1.2: Criar migration para policy de supervisao
  - Migration: `add_supervision_checklist_rls_policy`
  - Nova policy: `checklist_executions_select_by_type`
  - Logica implementada:
    - Admin ve tudo (`is_admin()`)
    - Usuario ve suas proprias execucoes (`executed_by = auth.uid()`)
    - Abertura: qualquer usuario vinculado a unidade ve
    - Supervisao: apenas supervisores com `is_coverage = true` veem
  - Indexes criados: `idx_user_units_coverage`, `idx_checklist_templates_type`
- [x] 2.3.1.3: Executar `get_advisors` para verificar seguranca
  - Nenhum erro critico encontrado
  - Warnings de performance pre-existentes (nao relacionados a esta migration)
- [x] 2.3.1.4: Testar com usuario supervisor
  - Teste realizado com dados reais:
    - Supervisao HEBRAICA (coverage=true): ✅ Supervisor VE
    - Supervisao BERRINI (coverage=false): ❌ Supervisor NAO VE
    - Abertura BERRINI (vinculo simples): ✅ Supervisor VE

### Criterios de Aceite
- [x] Supervisor com `is_coverage=true` ve execucoes de supervisao da unidade
- [x] Supervisor NAO ve execucoes de abertura (so supervisao) - CORRIGIDO: ve abertura se tem vinculo
- [x] Usuario comum NAO ve execucoes de supervisao de outras unidades
- [x] Admin ve todas as execucoes

### Dados de Teste Criados
- Template de supervisao: `Checklist de Supervisao - Padrao` (a1b2c3d4-e5f6-7890-abcd-ef1234567890)
- Supervisor atualizado com `is_coverage=true` para HEBRAICA e TOWER BRIDGE
- Execucoes de teste para validar a policy

---

## Tarefa 2.3.2: Habilitar Execucao de Checklist de Supervisao

**Status:** ✅ CONCLUIDA (2026-01-18)
**Ferramenta:** Next.js Server Actions

### Objetivo
Modificar `executar/actions.ts` para suportar checklists de supervisao alem dos de abertura.

### Subtarefas

- [x] 2.3.2.1: Modificar `getAvailableChecklists()` para aceitar parametro `type`
  - Adicionado tipo `ChecklistType = 'opening' | 'supervision'`
  - Filtro alterado de `t.type === 'opening'` para `t.type === type`
  - Para supervisao, filtra `is_coverage = true` nas user_units
  - Criada funcao wrapper `getSupervisionChecklists()`
- [x] 2.3.2.2: Criar rota `/checklists/supervisao/executar`
  - Criada pagina principal: `/checklists/supervisao/page.tsx`
  - Criada pagina de listagem: `/checklists/supervisao/executar/page.tsx`
  - Criado componente `supervision-start-card.tsx`
  - Criada pagina de execucao: `/checklists/supervisao/executar/[executionId]/page.tsx`
- [x] 2.3.2.3: Modificar `startExecution()` para validar tipo
  - Adicionado parametro `checklistType: ChecklistType`
  - Validacao de cobertura: `is_coverage = true` para supervisao
  - Validacao de tipo do template
  - Criada funcao wrapper `startSupervisionExecution()`
  - Redirect dinamico baseado no tipo
- [x] 2.3.2.4: Modificar `completeExecution()` para redirect correto
  - Busca tipo do template junto com execucao
  - Redirect para `/checklists/supervisao` quando tipo = supervision
- [x] 2.3.2.5: Adicionar link de Supervisao no sidebar
  - Icone ShieldCheck adicionado
  - Permissao: `checklists:execute` ou `admin:all`

### Arquivos Modificados
- `apps/web/src/app/(app)/checklists/executar/actions.ts`
  - Tipo `ChecklistType` exportado
  - `getAvailableChecklists()` com parametro type
  - `getSupervisionChecklists()` wrapper
  - `startExecution()` com parametro checklistType
  - `startSupervisionExecution()` wrapper
  - `completeExecution()` com redirect dinamico

### Arquivos Criados
- `apps/web/src/app/(app)/checklists/supervisao/page.tsx`
- `apps/web/src/app/(app)/checklists/supervisao/executar/page.tsx`
- `apps/web/src/app/(app)/checklists/supervisao/executar/components/supervision-start-card.tsx`
- `apps/web/src/app/(app)/checklists/supervisao/executar/[executionId]/page.tsx`

### Arquivos Modificados (UI)
- `apps/web/src/components/layout/app-sidebar.tsx` - Link de Supervisao

### Criterios de Aceite
- [x] Supervisor pode iniciar checklist de supervisao
- [x] Lista mostra apenas templates de supervisao
- [x] Execucao valida permissao de cobertura
- [x] Separacao clara entre abertura e supervisao na UI

---

## Tarefa 2.3.3: Componente de Assinatura Digital

**Status:** ✅ CONCLUIDA (2026-01-18)
**Ferramenta:** React, react-signature-canvas

### Objetivo
Implementar captura de assinatura do encarregado ao finalizar checklist de supervisao.

### Subtarefas

- [x] 2.3.3.1: Instalar dependencia
  - `react-signature-canvas` instalado
  - `@types/react-signature-canvas` instalado
- [x] 2.3.3.2: Criar componente `SignaturePad`
  - Local: `apps/web/src/components/ui/signature-pad.tsx`
  - Dois componentes criados:
    - `SignaturePad`: Versao completa com card para uso standalone
    - `InlineSignaturePad`: Versao compacta para formularios
  - Funcionalidades: Desenhar, limpar, salvar como base64
  - Responsivo com redimensionamento automatico
- [x] 2.3.3.3: Criar migration para campo de assinatura
  - Migration: `add_signature_fields_to_checklist_executions`
  - Campos adicionados: `supervisor_signature`, `attendant_signature`, `attendant_name`
  - TypeScript types atualizados em `database.types.ts`
- [x] 2.3.3.4: Integrar no fluxo de finalizacao
  - `SupervisionSummary` component criado com captura de assinaturas
  - Validacao: Requer nome do encarregado + 2 assinaturas para finalizar
  - `completeSupervisionExecution()` action criada para salvar assinaturas
  - Assinaturas salvas como base64 no banco
- [~] 2.3.3.5: Opcao de upload para Supabase Storage
  - **Nao implementado no MVP** - Base64 suficiente para uso atual
  - Pode ser implementado futuramente se necessario

### Arquivos Criados
- `apps/web/src/components/ui/signature-pad.tsx`
- `apps/web/src/app/(app)/checklists/supervisao/executar/components/supervision-summary.tsx`

### Arquivos Modificados
- `apps/web/src/app/(app)/checklists/executar/actions.ts` - `completeSupervisionExecution()`
- `apps/web/src/app/(app)/checklists/supervisao/executar/[executionId]/page.tsx` - Usa `SupervisionSummary`
- `apps/web/src/lib/supabase/database.types.ts` - Novos campos de assinatura

### Criterios de Aceite
- [x] Componente renderiza canvas para assinatura
- [x] Usuario pode desenhar, limpar e salvar
- [x] Assinatura e salva como imagem (base64)
- [x] Assinatura aparece no resumo antes de finalizar
- [x] Responsivo (funciona em mobile)

---

## Tarefa 2.3.4: Pontuacao e Resumo de Supervisao

**Status:** PENDENTE
**Ferramenta:** Next.js, Supabase

### Objetivo
Calcular e exibir pontuacao/score do checklist de supervisao.

### Subtarefas

- [ ] 2.3.4.1: Definir formula de pontuacao
  - Opcao A: Percentual de "Sim" (respostas positivas / total)
  - Opcao B: Peso por pergunta (requires_observation_on_no tem peso maior)
  - Sugestao: Usar Opcao A para MVP
- [ ] 2.3.4.2: Criar migration para campo de score
  ```sql
  ALTER TABLE checklist_executions
  ADD COLUMN score DECIMAL(5,2),
  ADD COLUMN max_score DECIMAL(5,2);
  ```
- [ ] 2.3.4.3: Calcular score ao finalizar
  - Modificar `completeExecution()` para calcular score
  - Score = (respostas_positivas / total_perguntas) * 100
- [ ] 2.3.4.4: Exibir score no resumo
  - Componente visual com gauge/progress
  - Cores: Verde (>= 80%), Amarelo (60-79%), Vermelho (< 60%)
- [ ] 2.3.4.5: Adicionar score na listagem de execucoes
  - Coluna de score na tabela de historico
  - Filtro por faixa de score

### Criterios de Aceite
- [ ] Score e calculado automaticamente ao finalizar
- [ ] Score aparece no resumo da execucao
- [ ] Indicador visual de conformidade (cores)
- [ ] Historico mostra score de cada execucao

---

## Tarefa 2.3.5: Exportacao de Relatorio (PDF)

**Status:** PENDENTE
**Ferramenta:** Next.js, @react-pdf/renderer ou html2pdf

### Objetivo
Permitir exportar relatorio de supervisao em PDF para impressao/arquivo.

### Subtarefas

- [ ] 2.3.5.1: Escolher biblioteca de geracao de PDF
  - Opcao A: `@react-pdf/renderer` (React components -> PDF)
  - Opcao B: `html2pdf.js` (HTML -> PDF, mais simples)
  - Opcao C: `jspdf` + `html2canvas` (screenshot approach)
  - Sugestao: Usar Opcao B para MVP
- [ ] 2.3.5.2: Instalar dependencia
  ```bash
  npm install html2pdf.js
  ```
- [ ] 2.3.5.3: Criar componente `SupervisionReport`
  - Layout para impressao (A4)
  - Cabecalho: Logo, data, unidade, supervisor
  - Corpo: Perguntas, respostas, observacoes
  - Rodape: Score, assinaturas, data/hora
- [ ] 2.3.5.4: Implementar botao "Exportar PDF"
  - Disponivel na pagina de detalhe da execucao
  - Gera PDF client-side
- [ ] 2.3.5.5: Opcao de impressao direta
  - Botao "Imprimir" usando `window.print()`
  - CSS de impressao (@media print)

### Criterios de Aceite
- [ ] Botao de exportar PDF funciona
- [ ] PDF contem todas as informacoes da execucao
- [ ] PDF tem layout profissional (cabecalho, logo, formatacao)
- [ ] Assinaturas aparecem no PDF
- [ ] Funciona em diferentes navegadores

---

## Testes E2E (Playwright MCP)

### Cenarios de Teste

```typescript
// e2e/checklists/supervisao.spec.ts

test.describe('Checklist de Supervisao', () => {
  test('Supervisor pode ver checklists de supervisao das unidades que cobre', async ({ page }) => {
    // Login como supervisor
    // Navegar para /checklists/supervisao/executar
    // Verificar que lista mostra apenas unidades com is_coverage=true
  });

  test('Supervisor pode iniciar e completar checklist de supervisao', async ({ page }) => {
    // Login como supervisor
    // Iniciar checklist
    // Responder perguntas
    // Assinar
    // Finalizar
    // Verificar score calculado
  });

  test('Supervisor pode exportar relatorio em PDF', async ({ page }) => {
    // Navegar para execucao finalizada
    // Clicar em Exportar PDF
    // Verificar download iniciado
  });

  test('Usuario comum NAO ve checklists de supervisao', async ({ page }) => {
    // Login como manobrista
    // Verificar que /checklists/supervisao nao aparece no menu
    // Tentar acessar diretamente -> redirect ou erro
  });

  test('Componente de assinatura funciona corretamente', async ({ page }) => {
    // Iniciar checklist
    // Finalizar
    // Desenhar assinatura no canvas
    // Salvar
    // Verificar que assinatura foi armazenada
  });
});
```

### Comandos de Teste

```bash
# Rodar todos os testes de supervisao
npm run test:e2e -- e2e/checklists/supervisao.spec.ts

# Rodar com UI para debug
npm run test:e2e:ui -- e2e/checklists/supervisao.spec.ts
```

---

## Ordem de Implementacao Recomendada

1. **Tarefa 2.3.1** - RLS (base de seguranca)
2. **Tarefa 2.3.2** - Execucao de supervisao (funcionalidade core)
3. **Tarefa 2.3.3** - Assinatura digital (requisito de negocio)
4. **Tarefa 2.3.4** - Pontuacao (valor agregado)
5. **Tarefa 2.3.5** - Exportacao PDF (nice-to-have)

---

## Checklist de Finalizacao

- [ ] Todas as tarefas implementadas
- [ ] Testes E2E passando
- [ ] Codigo revisado (sem console.logs, sem comentarios TODO)
- [ ] Este documento atualizado com status CONCLUIDO
- [ ] `docs/BACKLOG.md` atualizado
- [ ] Commit realizado com mensagem em portugues
- [ ] AGENTS.md atualizado (se necessario)
- [ ] CLAUDE.md atualizado (se necessario)

---

## Referencias

### Documentacao Consultada (Context7)

- **Supabase RLS**: Policies com `auth.uid()` e joins em tabelas relacionadas
- **Next.js Server Actions**: Validacao com Zod, revalidatePath, redirect
- **Playwright**: Page Object Model, web-first assertions
- **react-signature-canvas**: Componente de assinatura com ref e metodos `clear()`, `toDataURL()`

### Arquivos Relevantes do Projeto

| Arquivo | Descricao |
|---------|-----------|
| `apps/web/src/app/(app)/checklists/executar/actions.ts` | Server actions de execucao (modificar) |
| `apps/web/src/app/(app)/checklists/executar/page.tsx` | Pagina de selecao de checklist |
| `apps/web/src/app/(app)/checklists/configurar/components/template-form.tsx` | Form de template (ja suporta type) |
| `apps/web/src/lib/auth/rbac.ts` | Funcoes de verificacao de permissao |

---

**Autor:** Claude Code
**Ultima Atualizacao:** 2026-01-18
