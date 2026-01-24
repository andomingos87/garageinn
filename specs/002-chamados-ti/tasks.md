# Tasks: Modulo de Chamados de TI - Fluxo Basico

**Input**: Design documents from `/specs/002-chamados-ti/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Incluir testes E2E Playwright por US1/US2/US3 (exigencia da constituicao).

**Organization**: Tasks por user story para permitir entrega e validacao independente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependencias)
- **[Story]**: US1, US2, US3 conforme a spec
- Cada tarefa inclui caminhos de arquivo

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar navegacao e exports do modulo

- [x] T001 Atualizar menu para Chamados de TI em `apps/web/src/components/layout/app-sidebar.tsx`
- [x] T002 Ajustar exports do modulo em `apps/web/src/app/(app)/chamados/ti/components/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Base de dados, seeds e tipos compartilhados (bloqueia todas as historias)

- [x] T003 Criar migration de TI (tabelas/view) em `docs/database/migrations/007_create_tickets_it.sql`
- [x] T004 Atualizar seeds de categorias TI em `docs/database/seeds/003_ticket_categories.sql`
- [x] T005 Criar policies/RLS para TI em `docs/database/migrations/008_create_tickets_it_rls.sql`
- [x] T006 Atualizar tipos do modulo em `apps/web/src/app/(app)/chamados/ti/types.ts`

**Checkpoint**: Fundacao pronta - historias podem iniciar

---

## Phase 3: User Story 1 - Abrir chamado de TI (Priority: P1) 🎯 MVP

**Goal**: Permitir criacao de chamado com categoria, descricao e anexos opcionais

**Independent Test**: Criar chamado com categoria valida e ver status na listagem do solicitante

### Tests for User Story 1 (Playwright)

- [x] T007 [P] [US1] Criar teste E2E de abertura de chamado em `apps/web/e2e/chamados-ti-us1.spec.ts`

### Implementation for User Story 1

- [x] T008 [P] [US1] Implementar action de criacao em `apps/web/src/app/(app)/chamados/ti/actions.ts`
- [x] T009 [P] [US1] Ajustar formulario com categorias/anexos em `apps/web/src/app/(app)/chamados/ti/components/ti-ticket-form.tsx`
- [x] T010 [US1] Integrar formulario na pagina nova em `apps/web/src/app/(app)/chamados/ti/novo/page.tsx`
- [x] T011 [P] [US1] Implementar action para listar chamados do solicitante em `apps/web/src/app/(app)/chamados/ti/actions.ts`
- [x] T012 [P] [US1] Ajustar tabela de listagem do solicitante em `apps/web/src/app/(app)/chamados/ti/components/ti-table.tsx`
- [x] T013 [US1] Exibir listagem e status do solicitante em `apps/web/src/app/(app)/chamados/ti/page.tsx`

**Checkpoint**: US1 funcional e validavel

---

## Phase 4: User Story 2 - Aprovar chamado de TI (Priority: P2)

**Goal**: Registrar aprovacao/rejeicao conforme fluxo padrao

**Independent Test**: Aprovar/rejeitar um chamado e confirmar atualizacao de status

### Tests for User Story 2 (Playwright)

- [x] T014 [P] [US2] Criar teste E2E de aprovacao/rejeicao em `apps/web/e2e/chamados-ti-us2.spec.ts`

### Implementation for User Story 2

- [x] T015 [US2] Implementar actions de aprovacao/rejeicao em `apps/web/src/app/(app)/chamados/ti/actions.ts`
- [x] T016 [US2] Exibir controles de aprovacao no detalhe em `apps/web/src/app/(app)/chamados/ti/[ticketId]/page.tsx`
- [x] T017 [P] [US2] Atualizar exibicao de status/aprovacoes em `apps/web/src/app/(app)/chamados/ti/components/ti-ticket-status.tsx`

**Checkpoint**: US2 funcional e validavel

---

## Phase 5: User Story 3 - Ver chamados prontos para execucao (Priority: P3)

**Goal**: Listar chamados prontos para execucao apenas para equipe TI/perfis globais

**Independent Test**: Usuario TI/global ve lista de prontos; usuario comum nao ve

### Tests for User Story 3 (Playwright)

- [x] T018 [P] [US3] Criar teste E2E de lista pronta por perfil em `apps/web/e2e/chamados-ti-us3.spec.ts`

### Implementation for User Story 3

- [x] T019 [US3] Implementar action de listagem "pronto para execucao" com RBAC em `apps/web/src/app/(app)/chamados/ti/actions.ts`
- [x] T020 [P] [US3] Ajustar filtros para status pronto em `apps/web/src/app/(app)/chamados/ti/components/ti-filters.tsx`
- [x] T021 [P] [US3] Atualizar cards de estatistica para prontos em `apps/web/src/app/(app)/chamados/ti/components/ti-stats-cards.tsx`
- [x] T022 [US3] Renderizar lista de prontos por perfil em `apps/web/src/app/(app)/chamados/ti/page.tsx`

**Checkpoint**: US3 funcional e validavel

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentacao e alinhamento final

- [x] T023 [P] Atualizar documentacao do fluxo basico em `docs/chamados/ti.md`
- [x] T024 Revisar contrato para refletir endpoints finais em `specs/002-chamados-ti/contracts/tickets-ti.openapi.yaml`
- [x] T025 Validar quickstart e ajustar notas em `specs/002-chamados-ti/quickstart.md`
- [x] T026 Executar lint/typecheck conforme `package.json`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependencias
- **Foundational (Phase 2)**: Depende de Setup - bloqueia todas as historias
- **User Stories (Phase 3+)**: Dependem da Fundacao
- **Polish (Phase 6)**: Depende das historias desejadas completas

### User Story Dependencies

- **US1 (P1)**: Pode iniciar apos Fundacao - sem dependencia de outras historias
- **US2 (P2)**: Pode iniciar apos Fundacao - integra com US1 para aprovacao
- **US3 (P3)**: Pode iniciar apos Fundacao - usa mesma base de listagem

### Parallel Opportunities

- T008 e T009 em paralelo
- T011 e T012 em paralelo
- T015 e T017 em paralelo
- T020 e T021 em paralelo
- T023 e T024 em paralelo

---

## Parallel Example: User Story 1

```bash
Task: "Implementar action de criacao em apps/web/src/app/(app)/chamados/ti/actions.ts"
Task: "Ajustar formulario em apps/web/src/app/(app)/chamados/ti/components/ti-ticket-form.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Concluir Phase 1 + Phase 2
2. Concluir US1 (Phase 3)
3. Validar listagem do solicitante e criacao do chamado

### Incremental Delivery

1. US1 (criacao + status) -> validar
2. US2 (aprovacao/rejeicao) -> validar
3. US3 (lista prontos por perfil) -> validar
