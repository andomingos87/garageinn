---

description: "Task list for feature implementation"
---

# Tasks: Visibilidade de unidades e checklists do supervisor

**Input**: Design documents from `/specs/003-supervisor-unidades-checklists/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/  
**Tests**: Nao solicitados na especificacao (nao incluir tarefas de teste)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Garantir contexto e base de implementacao

- [x] T001 Revisar requisitos e prioridades em `specs/003-supervisor-unidades-checklists/spec.md`
- [x] T002 Revisar estrutura tecnica e paths alvo em `specs/003-supervisor-unidades-checklists/plan.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Pre-requisitos que bloqueiam as historias

- [x] T003 Criar helper para listar unidades acessiveis via RPC em `apps/web/src/lib/units/index.ts`

**Checkpoint**: Foundation pronta - historias podem iniciar

---

## Phase 3: User Story 1 - Ver unidades permitidas (Priority: P1) 🎯 MVP

**Goal**: Supervisor ve apenas unidades vinculadas em `/unidades`

**Independent Test**: Acessar `/unidades` com supervisor e confirmar que apenas unidades vinculadas aparecem; supervisor sem unidades ve lista vazia com mensagem.

### Implementation for User Story 1

- [x] T004 [US1] Aplicar filtro por unidades acessiveis em `apps/web/src/app/(app)/unidades/actions.ts`
- [x] T005 [P] [US1] Exibir mensagem de lista vazia para supervisor sem unidades em `apps/web/src/app/(app)/unidades/components/units-grid.tsx`

**Checkpoint**: US1 funcional e testavel de forma independente

---

## Phase 4: User Story 2 - Menu de checklists organizado com visibilidade por perfil (Priority: P2)

**Goal**: Menu de Checklists com subitens Abertura e Supervisao, e acesso a Supervisao restrito

**Independent Test**: Sidebar mostra subitens corretos por perfil; acesso direto a `/checklists/supervisao` bloqueado para nao-supervisor.

### Implementation for User Story 2

- [x] T006 [US2] Reorganizar menu de Checklists com submenu e permissao em `apps/web/src/components/layout/app-sidebar.tsx`
- [x] T007 [P] [US2] Garantir guard de permissao supervision em `apps/web/src/app/(app)/checklists/executar/actions.ts`
- [x] T008 [US2] Validar bloqueio server-side na rota em `apps/web/src/app/(app)/checklists/supervisao/page.tsx`

**Checkpoint**: US2 funcional e testavel de forma independente

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Ajustes finais e validacoes

- [x] T009 [P] Atualizar passos de validacao em `specs/003-supervisor-unidades-checklists/quickstart.md`
- [x] T010 Atualizar checklist de qualidade (se necessario) em `specs/003-supervisor-unidades-checklists/checklists/requirements.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependencias
- **Foundational (Phase 2)**: Depende do Setup
- **User Stories (Phase 3+)**: Dependem da fase Foundational
- **Polish (Phase 5)**: Depende das historias desejadas concluirem

### User Story Dependencies

- **US1 (P1)**: Pode iniciar apos Foundational, sem dependencia de outras historias
- **US2 (P2)**: Pode iniciar apos Foundational, independente de US1

### Parallel Opportunities

- T005 pode rodar em paralelo com T004 (arquivos diferentes)
- T007 pode rodar em paralelo com T006 (arquivos diferentes)
- US1 e US2 podem ser paralelas apos T003

---

## Parallel Example: User Story 1

```bash
Task: "Aplicar filtro por unidades acessiveis em apps/web/src/app/(app)/unidades/actions.ts"
Task: "Exibir mensagem de lista vazia em apps/web/src/app/(app)/unidades/components/units-grid.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Concluir Phase 1 e Phase 2
2. Concluir US1
3. Validar o fluxo de `/unidades` com supervisor

### Incremental Delivery

1. Foundation pronta
2. Entregar US1 (MVP)
3. Entregar US2 (menu + acesso)
4. Finalizar Polish
