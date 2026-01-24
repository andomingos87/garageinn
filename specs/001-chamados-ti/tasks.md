# Tasks: Modulo de Chamados de TI

**Input**: Design documents from `/specs/001-chamados-ti/`  
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Inclui tarefas de E2E por exigencia do Constitution.

**Organization**: Tarefas agrupadas por user story para entrega independente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependencias)
- **[Story]**: US1, US2, US3
- Inclui caminhos de arquivos

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar estrutura base do modulo de TI

- [x] T001 Criar estrutura e arquivos base em `apps/web/src/app/(app)/chamados/ti/`, incluindo `actions.ts`, `page.tsx`, `novo/page.tsx`, `[ticketId]/page.tsx`, `components/ti-ticket-form.tsx`, `components/ti-filters.tsx`, `components/ti-stats-cards.tsx`, `types.ts`
- [x] T002 [P] Adicionar item de menu TI na sidebar em `apps/web/src/components/layout/app-sidebar.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Estrutura de dados e regras comuns antes das user stories

- [x] T003 Criar migration da tabela de detalhes em `docs/database/migrations/*_ticket_it_details.sql` com RLS para `ticket_it_details`
- [x] T004 Criar migration da view de leitura em `docs/database/migrations/*_tickets_it_with_details.sql`
- [x] T005 Atualizar seeds de categorias de TI em `docs/database/seeds/003_ticket_categories.sql`
- [x] T006 Ajustar regra de aprovacao e documentacao em `docs/database/functions.md` e `docs/database/migrations/*_ticket_needs_approval.sql` (se necessario)

**Checkpoint**: Base de dados pronta para o modulo de TI

---

## Phase 3: User Story 1 - Abrir chamado de TI (Priority: P1) 🎯 MVP

**Goal**: Criar chamados de TI com categoria e tipo de equipamento obrigatorios

**Independent Test**: Criar um chamado de TI e ver o status inicial correto com campos obrigatorios validados

### Implementation for User Story 1

- [x] T007 [P] [US1] Implementar `createTiTicket` em `apps/web/src/app/(app)/chamados/ti/actions.ts`
- [x] T008 [P] [US1] Implementar formulario em `apps/web/src/app/(app)/chamados/ti/components/ti-ticket-form.tsx`
- [x] T009 [US1] Implementar pagina de criacao em `apps/web/src/app/(app)/chamados/ti/novo/page.tsx`
- [x] T010 [US1] Validar obrigatoriedade e mensagens do formulario em `apps/web/src/app/(app)/chamados/ti/components/ti-ticket-form.tsx`
- [x] T011 [P] [US1] Criar teste E2E de criacao em `apps/web/e2e/ti-ticket-create.spec.ts`

**Checkpoint**: US1 funcional e testavel de forma independente

---

## Phase 4: User Story 2 - Consultar e filtrar chamados de TI (Priority: P2)

**Goal**: Listar e filtrar chamados de TI com paginacao

**Independent Test**: Aplicar filtros e navegar paginas garantindo resultados consistentes

### Implementation for User Story 2

- [x] T012 [P] [US2] Implementar `getTiTickets` em `apps/web/src/app/(app)/chamados/ti/actions.ts`
- [x] T013 [P] [US2] Implementar filtros em `apps/web/src/app/(app)/chamados/ti/components/ti-filters.tsx`
- [x] T014 [P] [US2] Implementar cards de status em `apps/web/src/app/(app)/chamados/ti/components/ti-stats-cards.tsx`
- [x] T015 [US2] Implementar listagem e paginacao em `apps/web/src/app/(app)/chamados/ti/page.tsx`
- [x] T016 [P] [US2] Criar teste E2E de listagem/filtros em `apps/web/e2e/ti-ticket-list.spec.ts`

**Checkpoint**: US2 funcional e testavel de forma independente

---

## Phase 5: User Story 3 - Acompanhar detalhes e aprovacoes (Priority: P3)

**Goal**: Exibir detalhe completo com historico, comentarios, aprovacoes e anexos

**Independent Test**: Abrir detalhe e validar visibilidade por perfil e conteudo

### Implementation for User Story 3

- [x] T017 [P] [US3] Implementar `getTiTicketDetail` em `apps/web/src/app/(app)/chamados/ti/actions.ts`
- [x] T018 [US3] Implementar pagina de detalhe em `apps/web/src/app/(app)/chamados/ti/[ticketId]/page.tsx`
- [x] T019 [US3] Integrar componentes de timeline/comentarios/aprovacoes/anexos em `apps/web/src/app/(app)/chamados/ti/[ticketId]/page.tsx`
- [x] T020 [P] [US3] Criar teste E2E de detalhe e permissao em `apps/web/e2e/ti-ticket-detail.spec.ts`

**Checkpoint**: US3 funcional e testavel de forma independente

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Ajustes gerais e validacao final

- [x] T021 [P] Criar documentacao do modulo em `docs/chamados/ti.md`
- [x] T022 Validar passos do quickstart em `specs/001-chamados-ti/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependencias
- **Foundational (Phase 2)**: Depende do Setup
- **User Stories (Phase 3+)**: Dependem do Foundational
- **Polish (Phase 6)**: Depende das user stories desejadas concluirem

### User Story Dependencies

- **US1 (P1)**: Sem dependencia de outras historias
- **US2 (P2)**: Pode iniciar apos Foundational e integrar com US1 na listagem
- **US3 (P3)**: Pode iniciar apos Foundational e reutiliza dados de US1/US2

### Parallel Opportunities

- Tarefas marcadas com [P] dentro da mesma fase podem rodar em paralelo
- US2 e US3 podem iniciar em paralelo apos a base (Phase 2)

---

## Parallel Example: User Story 1

```bash
Task: "Implementar createTiTicket em apps/web/src/app/(app)/chamados/ti/actions.ts"
Task: "Implementar formulario em apps/web/src/app/(app)/chamados/ti/components/ti-ticket-form.tsx"
Task: "Criar teste E2E de criacao em apps/web/e2e/ti-ticket-create.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Concluir Setup + Foundational
2. Concluir US1
3. Validar criacao de chamado e permissao basica

### Incremental Delivery

1. US1 (MVP) → validar
2. US2 → validar
3. US3 → validar

---

## Notes

- Tarefas seguem formato de checklist com ID sequencial
- Cada user story e independente e testavel
- Tests E2E incluidos por exigencia do Constitution
