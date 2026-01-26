# Tasks: Correção de Bugs do Módulo de Compras

**Input**: Design documents from `/specs/006-fix-compras-bugs/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Não solicitado explicitamente - testes omitidos conforme template.

**Organization**: Tasks organizadas por User Story para implementação e teste independentes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: Qual user story a tarefa pertence (US1, US2, etc.)
- Paths incluem caminhos exatos dos arquivos

## Path Conventions

- **Monorepo**: `apps/web/src/` para código web, `supabase/migrations/` para SQL
- Base path: `apps/web/src/app/(app)/chamados/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparação do ambiente e validação de acesso

- [x] T001 Verificar acesso ao Supabase Dashboard para aplicar migrations
- [x] T002 [P] Verificar conta de teste comprador_compras_e_manutencao_teste@garageinn.com funciona
- [x] T003 [P] Criar branch de desenvolvimento local a partir de main

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: RLS Policy é bloqueante para US1 (cotações)

**⚠️ CRITICAL**: US1 não pode funcionar sem esta fase completa

- [x] T004 Criar migration SQL para RLS policies em supabase/migrations/YYYYMMDD_fix_compras_rls.sql usando conteúdo de contracts/rls-policies.sql
- [x] T005 Aplicar migration via Supabase Dashboard ou CLI (supabase db push) **[MANUAL - requer acesso ao Supabase]**
- [ ] T006 Verificar policies criadas com query: SELECT * FROM pg_policies WHERE tablename = 'ticket_quotations' **[MANUAL - após T005]**

**Checkpoint**: RLS corrigido - US1 pode começar

---

## Phase 3: User Story 1 - Comprador Salva Cotação (Priority: P1) 🎯 MVP

**Goal**: Compradores conseguem salvar cotações sem erro RLS

**Independent Test**: Login como comprador → acessar chamado → adicionar cotação → deve salvar sem erro

### Implementation for User Story 1

- [x] T007 [US1] Verificar server action addQuotation em apps/web/src/app/(app)/chamados/compras/actions.ts usa auth.uid() corretamente
- [ ] T008 [US1] Testar inserção de cotação como comprador e confirmar sucesso (SC-001) **[MANUAL - requer RLS aplicado]**
- [x] T009 [US1] Adicionar tratamento de erro específico para falha RLS em apps/web/src/app/(app)/chamados/compras/[ticketId]/components/ticket-quotations.tsx

**Checkpoint**: Cotações funcionam - fluxo principal desbloqueado

---

## Phase 4: User Story 2 - Interface Reflete Mudança de Status (Priority: P1)

**Goal**: UI atualiza imediatamente após mudança de status

**Independent Test**: Clicar "Iniciar Cotação" → status visual deve mudar sem refresh manual

### Implementation for User Story 2

- [x] T010 [US2] Adicionar import useRouter em apps/web/src/app/(app)/chamados/compras/[ticketId]/components/ticket-actions.tsx
- [x] T011 [US2] Implementar router.refresh() após changeTicketStatus bem-sucedido em ticket-actions.tsx
- [x] T012 [US2] Garantir revalidatePath está sendo chamado em apps/web/src/app/(app)/chamados/compras/actions.ts na função changeTicketStatus
- [x] T013 [US2] Implementar tratamento de erro com toast.error e manter estado anterior (FR-012) em ticket-actions.tsx
- [ ] T014 [US2] Testar transições: Aprovado→Em Cotação, Em Cotação→Em Andamento, Aprovado→Negado (SC-002) **[MANUAL]**

**Checkpoint**: Status atualiza em < 2 segundos

---

## Phase 5: User Story 3 - Filtro de Chamados para Comprador (Priority: P2)

**Goal**: Comprador vê apenas chamados com status "Aprovado"

**Independent Test**: Login como comprador → hub deve mostrar apenas chamados aprovados

### Implementation for User Story 3

- [x] T015 [US3] Identificar função de listagem de chamados em apps/web/src/app/(app)/chamados/actions.ts (getHubTickets ou equivalente)
- [x] T016 [US3] Criar helper isComprador(userRoles) para verificar se usuário é comprador em apps/web/src/app/(app)/chamados/actions.ts
- [x] T017 [US3] Adicionar filtro .eq('status', 'approved') quando isComprador for true na query de listagem
- [ ] T018 [US3] Testar que chamados em "Rascunho" ou "Aguardando Aprovação" não aparecem para comprador (SC-003) **[MANUAL]**

**Checkpoint**: Comprador vê apenas chamados relevantes

---

## Phase 6: User Story 4 - Filtro de Departamento Correto (Priority: P2)

**Goal**: Dropdown de departamento mostra apenas Compras e Manutenção para comprador

**Independent Test**: Login como comprador → abrir filtro departamento → deve ter apenas 2 opções

### Implementation for User Story 4

- [x] T019 [P] [US4] Localizar função getDepartments em apps/web/src/app/(app)/chamados/actions.ts
- [x] T020 [US4] Modificar getDepartments para filtrar por ['Compras', 'Manutenção'] quando usuário é comprador
- [x] T021 [US4] Atualizar componente apps/web/src/app/(app)/chamados/components/hub-filters.tsx se necessário para receber departamentos filtrados
- [ ] T022 [US4] Testar que dropdown mostra apenas "Compras" e "Manutenção" para comprador **[MANUAL]**

**Checkpoint**: Filtro de departamento funciona corretamente

---

## Phase 7: User Story 5 - Qualquer Usuário Pode Abrir Chamado TI (Priority: P2)

**Goal**: Remover bloqueio de criação de chamados TI para não-TI

**Independent Test**: Login como comprador → acessar /chamados/ti/novo → deve ver formulário

### Implementation for User Story 5

- [x] T023 [P] [US5] Criar função canCreateTiTicket() em apps/web/src/lib/auth/ti-access.ts que retorna true para todos autenticados
- [x] T024 [US5] Remover ou modificar gate de acesso em apps/web/src/app/(app)/chamados/ti/novo/page.tsx (remover bloco getTiAccessContext + AccessDenied)
- [x] T025 [US5] Manter canAccessTiArea() inalterado para continuar bloqueando execução de chamados TI
- [ ] T026 [US5] Testar que comprador consegue criar chamado TI mas não consegue acessar área de execução (SC-004) **[MANUAL]**

**Checkpoint**: Criação de chamados TI liberada para todos

---

## Phase 8: User Story 6 - Máscaras de Formatação (Priority: P3)

**Goal**: Campos CNPJ, telefone e preço têm máscaras de formatação

**Independent Test**: Modal de cotação → digitar valores → devem formatar automaticamente

### Implementation for User Story 6

- [x] T027 [P] [US6] Criar função formatCNPJ(value: string): string em apps/web/src/app/(app)/chamados/compras/[ticketId]/components/ticket-quotations.tsx
- [x] T028 [P] [US6] Criar função formatPhone(value: string): string (suporte 8 e 9 dígitos) em ticket-quotations.tsx
- [x] T029 [P] [US6] Criar função formatCurrency(value: string): string com Intl.NumberFormat pt-BR em ticket-quotations.tsx
- [x] T030 [US6] Criar função isValidCNPJ(cnpj: string): boolean para validação de formato (14 dígitos) em ticket-quotations.tsx
- [x] T031 [US6] Aplicar formatCNPJ no onChange do campo supplier_cnpj em ticket-quotations.tsx
- [x] T032 [US6] Aplicar formatPhone no onChange do campo supplier_contact em ticket-quotations.tsx
- [x] T033 [US6] Aplicar formatCurrency no onChange do campo total_price e unit_price em ticket-quotations.tsx
- [x] T034 [US6] Bloquear submit se CNPJ inválido com mensagem de erro (FR-007)
- [x] T035 [US6] Bloquear submit se preço < R$ 0,01 com mensagem de erro (FR-009)
- [ ] T036 [US6] Testar máscaras e validações no modal de cotação (SC-005) **[MANUAL]**

**Checkpoint**: Campos formatados e validados

---

## Phase 9: User Story 7 - Ctrl+Enter para Comentário (Priority: P3)

**Goal**: Atalho Ctrl+Enter envia comentário

**Independent Test**: Digitar comentário → Ctrl+Enter → comentário enviado

### Implementation for User Story 7

- [x] T037 [US7] Criar função handleKeyDown em apps/web/src/app/(app)/chamados/compras/[ticketId]/components/ticket-comments.tsx
- [x] T038 [US7] Implementar lógica: if (e.ctrlKey && e.key === 'Enter' && comment.trim()) handleSubmit()
- [x] T039 [US7] Adicionar onKeyDown={handleKeyDown} no Textarea de comentário
- [ ] T040 [US7] Testar que Ctrl+Enter envia comentário e que campo vazio não envia (FR-010) **[MANUAL]**

**Checkpoint**: Atalho de teclado funciona

---

## Phase 10: User Story 8 - Histórico em Português (Priority: P3)

**Goal**: Labels do histórico em PT-BR

**Independent Test**: Ver histórico de chamado → textos em português

### Implementation for User Story 8

- [x] T041 [US8] Criar objeto actionLabels com mapeamento de actions para PT-BR em apps/web/src/app/(app)/chamados/compras/[ticketId]/components/ticket-timeline.tsx
- [x] T042 [US8] Criar função getActionLabel(action: string): string que usa actionLabels com fallback
- [x] T043 [US8] Substituir exibição direta de action por getActionLabel(action) no render do timeline
- [ ] T044 [US8] Testar que "status_change" aparece como "Status alterado" no histórico (SC-006) **[MANUAL]**

**Checkpoint**: Histórico em português

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Validação final e documentação

- [ ] T045 [P] Executar todos os testes manuais do quickstart.md **[MANUAL]**
- [x] T046 [P] Atualizar docs/chamados/execucao_de_compras/bugs_comprador.md marcando bugs como resolvidos
- [x] T047 Revisar código com ESLint/Prettier (npm run lint)
- [ ] T048 Commit final com mensagem descritiva

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências - pode começar imediatamente
- **Foundational (Phase 2)**: Depende de Setup - BLOQUEIA US1
- **US1 (Phase 3)**: Depende de Foundational (RLS fix)
- **US2 (Phase 4)**: Independente após Foundational
- **US3-US5 (Phases 5-7)**: Independentes após Foundational
- **US6-US8 (Phases 8-10)**: Independentes após Foundational
- **Polish (Phase 11)**: Depende de todas as user stories desejadas

### User Story Dependencies

| Story | Depende de | Pode Paralelo com |
|-------|------------|-------------------|
| US1 (P1) | Foundational | - |
| US2 (P1) | Foundational | US1 |
| US3 (P2) | Foundational | US1, US2, US4, US5 |
| US4 (P2) | Foundational | US1, US2, US3, US5 |
| US5 (P2) | Foundational | US1, US2, US3, US4 |
| US6 (P3) | Foundational | US1-US5, US7, US8 |
| US7 (P3) | Foundational | US1-US6, US8 |
| US8 (P3) | Foundational | US1-US7 |

### Parallel Opportunities

- T002-T003 podem rodar em paralelo (Setup)
- T019, T023, T027-T029 podem rodar em paralelo (diferentes arquivos)
- Após Foundational: US1-US8 podem ser implementadas em paralelo por diferentes desenvolvedores

---

## Parallel Example: User Story 6 (Máscaras)

```bash
# Launch all format functions together (different parts of same file, but independent functions):
Task: "Criar função formatCNPJ em ticket-quotations.tsx"
Task: "Criar função formatPhone em ticket-quotations.tsx"
Task: "Criar função formatCurrency em ticket-quotations.tsx"

# Then apply them sequentially:
Task: "Aplicar formatCNPJ no onChange..."
Task: "Aplicar formatPhone no onChange..."
Task: "Aplicar formatCurrency no onChange..."
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (RLS fix) **CRITICAL**
3. Complete Phase 3: US1 - Cotações funcionam
4. Complete Phase 4: US2 - Status atualiza
5. **STOP and VALIDATE**: Fluxo crítico desbloqueado
6. Deploy/demo se necessário

### Incremental Delivery

1. Foundational → RLS fix → **Deploy**
2. US1 + US2 → Fluxo P1 completo → **Deploy** (MVP!)
3. US3 + US4 + US5 → Filtros e acesso TI → **Deploy**
4. US6 + US7 + US8 → UX improvements → **Deploy**
5. Polish → Documentação → **Final Deploy**

### Parallel Team Strategy

Com múltiplos desenvolvedores após Foundational:

- **Dev A**: US1 (RLS test) + US2 (status refresh)
- **Dev B**: US3 (filtro chamados) + US4 (filtro departamentos)
- **Dev C**: US5 (TI) + US6 (máscaras)
- **Dev D**: US7 (Ctrl+Enter) + US8 (PT-BR)

---

## Notes

- [P] tasks = arquivos diferentes, sem dependências
- [Story] label mapeia tarefa para user story específica
- Cada user story é independentemente testável
- Commit após cada tarefa ou grupo lógico
- Pare em qualquer checkpoint para validar story independentemente
- Arquivos principais afetados:
  - `supabase/migrations/` - RLS
  - `apps/web/src/app/(app)/chamados/actions.ts` - Filtros hub
  - `apps/web/src/app/(app)/chamados/compras/actions.ts` - Actions compras
  - `apps/web/src/app/(app)/chamados/compras/[ticketId]/components/` - UI components
  - `apps/web/src/app/(app)/chamados/ti/novo/page.tsx` - Gate TI
  - `apps/web/src/lib/auth/ti-access.ts` - Funções de acesso TI
