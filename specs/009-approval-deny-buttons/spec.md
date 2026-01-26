# Feature Specification: Botões de Aprovar/Negar por Perfil

**Feature Branch**: `009-approval-deny-buttons`  
**Created**: 2026-01-26  
**Status**: Draft  
**Input**: User description: "@docs/chamados/execucao_de_compras/bug_botoes_aprovar_negar_comprador.md"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Aprovação restrita ao gerente (Priority: P1)

Como comprador, ao iniciar a cotação, não devo ver ações de aprovação, pois essa decisão é exclusiva do gerente de compras.

**Why this priority**: O bug expõe ações críticas a perfis indevidos e quebra a regra de negócio.

**Independent Test**: Logar como comprador, iniciar cotação e verificar que “Aprovar/Negar” não aparecem.

**Acceptance Scenarios**:

1. **Given** um comprador em chamado com status “Em Cotação”, **When** a tela de ações é exibida, **Then** os botões “Aprovar” e “Negar” não devem aparecer.
2. **Given** um gerente no mesmo status, **When** a tela de ações é exibida, **Then** os botões “Aprovar” e “Negar” devem estar disponíveis.

---

### User Story 2 - Consistência entre UI e permissões (Priority: P2)

Como responsável pelo fluxo, preciso que as permissões de aprovação estejam consistentes entre UI e backend para evitar ações indevidas.

**Why this priority**: Reduz risco de inconsistência e garante governança do fluxo.

**Independent Test**: Tentar executar aprovação com comprador e confirmar bloqueio.

**Acceptance Scenarios**:

1. **Given** um comprador tenta aprovar via UI ou ação direta, **When** a operação é enviada, **Then** o sistema deve bloquear a transição.

---

### User Story 3 - Coerência entre módulos (Priority: P3)

Como time de operações, preciso que a regra de aprovação por perfil seja consistente nos módulos que usam o mesmo fluxo de status.

**Why this priority**: Evita repetição do bug em outros módulos.

**Independent Test**: Validar comportamento semelhante em Manutenção/Financeiro/Comercial quando aplicável.

**Acceptance Scenarios**:

1. **Given** módulos que usam transições com aprovação, **When** um perfil executor acessa a tela, **Then** não deve ver botões de aprovação.

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

- Usuário sem permissão acessa o chamado via URL direta.
- Diferença entre permissões do frontend e backend.
- Mudança de papel do usuário durante a sessão.

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: O sistema DEVE exibir botões de aprovação apenas para perfis autorizados (gerente de compras).
- **FR-002**: O sistema NÃO DEVE permitir aprovação/negação por comprador, mesmo que a ação seja forçada.
- **FR-003**: As regras de visibilidade devem ser consistentes entre UI e backend.
- **FR-004**: A regra deve se aplicar aos fluxos com aprovação em Compras e Manutenção, e quando aplicável em outros módulos.

### Key Entities *(include if feature involves data)*

- **Chamado**: Registro principal com status e transições.
- **Perfil/Permissão**: Define quem pode aprovar ou negar.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: 100% dos compradores não veem botões de aprovação quando em “Em Cotação”.
- **SC-002**: 0% de aprovações registradas por perfis sem permissão.
- **SC-003**: Redução de 90% dos relatos de confusão sobre botões de aprovação.

## Assumptions

- Gerente de compras é o único perfil autorizado a aprovar/negAR nesse fluxo.
- A regra vale para Compras e Manutenção, e deve ser verificada em módulos similares.

## Dependencies

- Alinhamento entre RBAC frontend e backend.
