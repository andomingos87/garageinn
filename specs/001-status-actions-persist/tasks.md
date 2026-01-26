---

description: "Task list for status actions persistence"
---

# Tasks: Persistência de Ações de Status (Compras + Manutenção)

**Input**: Design documents from `/specs/001-status-actions-persist/`  
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md  
**Tests**: E2E Playwright para fluxo crítico (exigido pela constituição)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Alinhar entendimento e contexto do feature

- [x] T001 Revisar requisitos em `specs/001-status-actions-persist/spec.md`
- [x] T002 Revisar plano técnico em `specs/001-status-actions-persist/plan.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Permissões e base de persistência para o fluxo de Compras/Manutenção

- [x] T003 Criar migração RLS para permitir update de status por perfis autorizados em `supabase/migrations/20260126_ticket_status_update_rls.sql`
- [x] T004 Ajustar políticas de update de `tickets` no mesmo arquivo `supabase/migrations/20260126_ticket_status_update_rls.sql`

**Checkpoint**: Políticas RLS prontas para permitir persistência

---

## Phase 3: User Story 1 - Mudança de Status Persistente (Priority: P1) 🎯 MVP

**Goal**: Persistir mudanças de status válidas e refletir na UI

**Independent Test**: Alterar status em chamado de Compras/Manutenção e confirmar persistência após recarregar

### Implementation for User Story 1

- [x] T005 [US1] Atualizar `changeTicketStatus` para validar transição, rejeitar inválidas e confirmar update em `apps/web/src/app/(app)/chamados/compras/actions.ts`
- [x] T006 [US1] Forçar refresh da UI após sucesso em `apps/web/src/app/(app)/chamados/compras/[ticketId]/components/ticket-actions.tsx`

**Checkpoint**: Status persiste no banco e aparece após reload

---

## Phase 4: User Story 2 - Feedback Confiável ao Usuário (Priority: P1)

**Goal**: Mensagens de sucesso/erro refletem o resultado real

**Independent Test**: Forçar erro de update e validar que não há toast de sucesso

### Implementation for User Story 2

- [x] T007 [US2] Retornar erro explícito quando nenhuma linha for atualizada em `apps/web/src/app/(app)/chamados/compras/actions.ts`
- [x] T008 [US2] Ajustar toasts para refletir sucesso/erro real em `apps/web/src/app/(app)/chamados/compras/[ticketId]/components/ticket-actions.tsx`

**Checkpoint**: UI nunca mostra sucesso sem persistência

---

## Phase 5: User Story 3 - Negação com Registro de Motivo (Priority: P2)

**Goal**: Negação registra motivo e mantém rastreabilidade

**Independent Test**: Negar chamado com motivo e validar status + motivo visível

### Implementation for User Story 3

- [x] T009 [US3] Validar motivo obrigatório no backend em `apps/web/src/app/(app)/chamados/compras/actions.ts`
- [x] T010 [US3] Garantir exibição do motivo de negação em `apps/web/src/app/(app)/chamados/compras/[ticketId]/page.tsx`

**Checkpoint**: Motivo aparece no histórico e status negado persiste

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Testes, documentação e validação final

- [x] T011 [P] Criar teste E2E do fluxo de status em `apps/web/e2e/chamados-compras-status-actions.spec.ts`
- [x] T012 [P] Atualizar documentação do bug com resultados e notas de validação em `docs/chamados/execucao_de_compras/bug_acoes_status_nao_persistem.md`
- [x] T013 Implementar notificação de conflito de status no client em `apps/web/src/app/(app)/chamados/compras/[ticketId]/components/ticket-actions.tsx`
- [x] T014 Validar quickstart em `specs/001-status-actions-persist/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende de Setup
- **User Stories (Phase 3+)**: Dependem de Foundational
- **Polish (Phase 6)**: Depende das histórias implementadas

### User Story Dependencies

- **US1 (P1)**: Após Foundational, sem dependências
- **US2 (P1)**: Após US1 (compartilha o mesmo fluxo e arquivos)
- **US3 (P2)**: Após US1 (usa a mesma action e dados)

### Parallel Opportunities

- T011 e T012 podem rodar em paralelo (arquivos distintos)

---

## Parallel Example: User Story 1

```bash
Task: "Atualizar changeTicketStatus em apps/web/src/app/(app)/chamados/compras/actions.ts"
Task: "Forçar refresh da UI em apps/web/src/app/(app)/chamados/compras/[ticketId]/components/ticket-actions.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Setup
2. Foundational (RLS)
3. US1 (persistência + refresh)
4. Validar com quickstart

### Incremental Delivery

1. US1 (persistência)
2. US2 (feedback confiável)
3. US3 (negação com motivo)
4. Polish (E2E + docs)
