# Tasks: Correcao da visibilidade de chamados por perfil

**Input**: Design documents from `/specs/004-fix-visibilidade-chamados/`  
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Nao solicitado na especificacao.

**Organization**: Tasks agrupadas por user story para permitir implementacao e validacao independentes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependencia direta)
- **[Story]**: US1, US2
- Sempre incluir caminhos de arquivos nas descricoes

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Alinhar requisitos e mapear pontos de ajuste no codigo atual

- [x] T001 Revisar requisitos e criterios de sucesso em `specs/004-fix-visibilidade-chamados/spec.md` e `specs/004-fix-visibilidade-chamados/plan.md`
- [x] T002 [P] Mapear fluxo atual de listagem em `apps/web/src/app/(app)/chamados/compras/page.tsx` e `apps/web/src/app/(app)/chamados/compras/components/tickets-table.tsx`
- [x] T003 [P] Mapear fluxo atual de detalhe em `apps/web/src/app/(app)/chamados/compras/[ticketId]/page.tsx` e regras em `apps/web/src/app/(app)/chamados/compras/actions.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Funcoes base compartilhadas pelas duas user stories

**⚠️ CRITICAL**: Nenhuma user story deve iniciar antes desta fase concluir

- [x] T004 Criar helper de roles do usuario em `apps/web/src/app/(app)/chamados/compras/actions.ts` (ex.: `getUserRoles`)
- [x] T005 Criar helper de visibilidade por perfil/unidade em `apps/web/src/app/(app)/chamados/compras/actions.ts` (ex.: `buildPurchaseVisibilityFilter`)
- [x] T006 Consolidar constantes de status de aprovacao em `apps/web/src/app/(app)/chamados/compras/constants.ts`

**Checkpoint**: Base de visibilidade pronta para uso nas historias

---

## Phase 3: User Story 1 - Gerente visualiza chamados pendentes (Priority: P1) 🎯 MVP

**Goal**: Garantir que o gerente veja todos os chamados elegiveis (incluindo pendentes de aprovacao)

**Independent Test**: Login como gerente de operacoes e validar lista completa + detalhe de chamado pendente

### Implementation for User Story 1

- [x] T007 [US1] Ajustar `getPurchaseTickets` em `apps/web/src/app/(app)/chamados/compras/actions.ts` para aplicar regras de gerente (unidades acessiveis + incluir `awaiting_approval_gerente`)
- [x] T008 [P] [US1] Ajustar `getTicketDetails` em `apps/web/src/app/(app)/chamados/compras/actions.ts` para permitir gerente em chamados pendentes respeitando unidade
- [x] T009 [US1] Aplicar tratamento de acesso negado no detalhe em `apps/web/src/app/(app)/chamados/compras/[ticketId]/page.tsx` usando `apps/web/src/components/auth/access-denied.tsx`

**Checkpoint**: US1 completo e validado de forma independente

---

## Phase 4: User Story 2 - Assistente nao ve chamados pendentes do gerente (Priority: P2)

**Goal**: Impedir visibilidade de chamados pendentes de aprovacao para assistente de compras

**Independent Test**: Login como assistente e validar que chamados `awaiting_approval_gerente` nao aparecem nem no detalhe

### Implementation for User Story 2

- [x] T010 [US2] Aplicar filtro de exclusao de `awaiting_approval_gerente` para assistente em `getPurchaseTickets` (`apps/web/src/app/(app)/chamados/compras/actions.ts`)
- [x] T011 [US2] Bloquear acesso ao detalhe pendente para assistente em `getTicketDetails` e refletir no fluxo de `apps/web/src/app/(app)/chamados/compras/[ticketId]/page.tsx`

**Checkpoint**: US2 completo e validado de forma independente

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Ajustes finais e validacao cruzada

- [x] T012 [P] Atualizar notas de validacao em `specs/004-fix-visibilidade-chamados/quickstart.md` apos implementar as regras
- [x] T013 Revisar consistencia entre lista e detalhe e consolidar regras em `apps/web/src/app/(app)/chamados/compras/actions.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependencias
- **Foundational (Phase 2)**: depende do Setup, bloqueia todas as historias
- **User Stories (Phase 3+)**: dependem do Foundational
- **Polish (Phase 5)**: depois das historias desejadas

### User Story Dependencies

- **US1 (P1)**: inicia apos Phase 2, sem dependencia de outras historias
- **US2 (P2)**: inicia apos Phase 2, pode ser paralela a US1 mas compartilha `actions.ts`

### Parallel Opportunities

- T002 e T003 podem ocorrer em paralelo
- T004 e T006 podem ocorrer em paralelo
- Dentro de US1: T008 pode rodar em paralelo com ajustes de UI fora de `actions.ts`

---

## Parallel Example: User Story 1

```bash
Task: "Ajustar getTicketDetails em apps/web/src/app/(app)/chamados/compras/actions.ts"
Task: "Aplicar acesso negado em apps/web/src/app/(app)/chamados/compras/[ticketId]/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup
2. Phase 2: Foundational
3. Phase 3: US1
4. Validar US1 com o fluxo de gerente

### Incremental Delivery

1. Setup + Foundational
2. US1 (gerente)
3. US2 (assistente)
4. Polish

---

## Notes

- Tarefas marcadas [P] podem ser paralelizadas se nao conflitarem em arquivo
- Cada user story deve ser testavel de forma independente
- Evitar duplicidade de regra entre listagem e detalhe
