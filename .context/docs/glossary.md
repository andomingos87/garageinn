# Glossário (Domínio e Termos Técnicos)

Este glossário padroniza os principais termos de negócio e conceitos técnicos usados no **Garageinn** (Web e Mobile). Use-o como referência ao navegar pelo código, nomear entidades/tabelas, escrever UI/copy e implementar regras de acesso.

---

## Termos de domínio (negócio)

### **Chamado**
Solicitação de trabalho/ticket aberto por um usuário e encaminhado para um fluxo de atendimento de um **Departamento** específico.

- Exemplos de categorias/áreas (módulos): **Compras**, **Manutenção**, **RH**, **TI**, **Financeiro**, **Comercial**, **Sinistros**.
- Tipicamente envolve: criação → triagem → execução/atendimento → comentários/anexos → conclusão.
- Onde aparece:
  - Web: `apps/web/src/app/(app)/chamados/**`
  - Mobile: `apps/mobile/src/modules/tickets/**` (conceito equivalente a “Ticket”)

**Relacionado:** [Ticket](#ticket), [Departamento](#departamento), [Aprovação](#aprovação)

---

### **Ticket**
Termo usado principalmente no **Mobile** para representar um **Chamado**.

- Tipos e status são modelados em: `apps/mobile/src/modules/tickets/types/tickets.types.ts`
- Serviços de acesso: `apps/mobile/src/modules/tickets/services/ticketsService.ts`

**Relacionado:** [Chamado](#chamado), [Status do ticket](#status-do-ticket)

---

### **Checklist**
Lista de verificação operacional aplicada a **Unidades**, composta por um conjunto de perguntas/itens. Pode ser configurada (template) e executada (execution).

- Conceitos comuns:
  - **Template**: modelo configurável (perguntas, estrutura, regras).
  - **Execution**: execução/registro preenchido por uma unidade em um momento.
- Onde aparece:
  - Web (configuração/execução/supervisão): `apps/web/src/app/(app)/checklists/**`
  - Mobile (execução/listagem): `apps/mobile/src/modules/checklists/**`

**Relacionado:** [Supervisão](#supervisão), [Unidade](#unidade)

---

### **Unidade**
Uma garagem/unidade operacional atendida pelo sistema. É a principal dimensão para segmentação de dados (checklists, chamados, usuários).

- Tipos no Web: `apps/web/src/lib/supabase/custom-types.ts` (ex.: `Unit`, `UnitStatus`)
- Gestão (Web): `apps/web/src/app/(app)/unidades/**`

**Relacionado:** [Vínculo de unidade](#vínculo-de-unidade), [RLS](#rls-row-level-security)

---

### **Perfil**
Conjunto de informações do usuário logado: identidade, papéis (roles), departamentos e vínculos com unidades.

- Web (hook): `apps/web/src/hooks/use-profile.ts`
- Mobile (tipos): `apps/mobile/src/modules/user/types/userProfile.types.ts`

**Relacionado:** [RBAC](#rbac-role-based-access-control), [Permissão](#permissão)

---

### **Departamento**
Área funcional que define fluxos, telas e permissões típicas (ex.: Operações, Compras, Financeiro, TI, RH, Comercial, Auditoria, Sinistros).

- Na prática, departamentos:
  - orientam a categorização de chamados,
  - influenciam permissões,
  - e estruturam relatórios e configurações.

**Relacionado:** [Chamado](#chamado), [Permissão](#permissão)

---

### **Aprovação**
Fluxo em que determinadas ações (principalmente em **Compras** e **Sinistros**) dependem de validação/aceite formal antes de seguir adiante.

- Exemplo comum:
  - criar itens/cotações → submeter → aprovar/reprovar → prosseguir com compra/indenização.
- No Web, costuma estar embutido nas actions de cada módulo de chamado.

**Relacionado:** [Chamado](#chamado), [Sinistros](#sinistros)

---

### **Sinistros**
Fluxo específico de chamados relacionado a incidentes/avarias (geralmente com cotações, itens, comunicação e aprovações).

- Web: `apps/web/src/app/(app)/chamados/sinistros/**`
- Frequentemente inclui:
  - comunicação do sinistro,
  - itens de compra,
  - cotações,
  - aprovações.

**Relacionado:** [Aprovação](#aprovação), [Chamado](#chamado)

---

### **Relatórios**
Exportação e visualização de dados operacionais (checklists, chamados etc.), normalmente com saída em **PDF** e **Excel**.

- Endpoints (Web/API):
  - `apps/web/src/app/api/relatorios/**`
  - exemplos: `.../pdf`, `.../excel`

**Relacionado:** [Supervisão](#supervisão)

---

### **Supervisão**
Conjunto de fluxos/telas para acompanhamento (por supervisores/gestores) de:
- execuções de checklists (completude, pendências, evidências),
- andamento de chamados,
- visão consolidada por unidade/período.

- Web: `apps/web/src/app/(app)/checklists/supervisao/**` e `apps/web/src/app/(app)/relatorios/supervisao/**`

**Relacionado:** [Checklist](#checklist), [Relatórios](#relatórios)

---

### **Vínculo de unidade**
Relação entre usuário e unidade(s) que determina o escopo de acesso aos dados (visualizar/criar/atuar). Pode ser parte do perfil e é usado em filtros e regras de segurança.

- Tipos no Web: `apps/web/src/lib/units/index.ts` (ex.: `UserUnit`)
- Tipos/joins: `apps/web/src/lib/supabase/custom-types.ts` (ex.: `UserUnitInfo`)

**Relacionado:** [RLS](#rls-row-level-security), [Perfil](#perfil)

---

## Conceitos de segurança e acesso

### **RBAC (Role-Based Access Control)**
Controle de acesso baseado em papéis (roles). Define **o que** um usuário pode fazer (permissões), em nível de aplicação.

- Onde aparece:
  - Web (RBAC e permissões): `apps/web/src/lib/auth/**`
  - Script de validação: `apps/web/scripts/validate-rbac.ts`
  - Hooks: `apps/web/src/hooks/use-permissions.ts`

**Relacionado:** [Permissão](#permissão), [Role](#role-papel), [RLS](#rls-row-level-security)

---

### **RLS (Row Level Security)**
Políticas do Postgres (via Supabase) que definem **quais linhas** (dados) um usuário pode ler/escrever. Funciona como camada de segurança no banco.

- Regra prática: mesmo que a UI “oculte” dados, a RLS deve impedir acesso indevido no backend.
- Invariantes importantes do projeto:
  - acesso passa por RBAC (app) **e** RLS (DB),
  - **service role** do Supabase nunca deve ir para o client.

**Relacionado:** [Supabase](#supabase), [Service Role](#service-role)

---

### **Permissão**
Unidade mínima de autorização (“pode fazer X”). No Web, é tipicamente representada por um tipo `Permission`.

- Web: `apps/web/src/lib/auth/permissions.ts` (`Permission` exportado)
- Mobile: `apps/mobile/src/modules/user/types/permissions.types.ts` (`Permission`, mapas e checkers)

**Relacionado:** [RBAC](#rbac-role-based-access-control), [Role (papel)](#role-papel)

---

### **Role (papel)**
Agrupamento de permissões associado a um usuário. Pode carregar contexto (ex.: departamento, escopo).

- Tipos no Web:
  - `apps/web/src/lib/auth/rbac.ts` (`UserRole`)
  - `apps/web/src/lib/auth/ti-access.ts` (`RoleWithDepartment`)
- Tipos associados:
  - `UserRoleInfo` / `UserWithRoles`: `apps/web/src/lib/supabase/custom-types.ts`

**Relacionado:** [RBAC](#rbac-role-based-access-control), [Perfil](#perfil)

---

### **Impersonação**
Acesso temporário a uma conta de outro usuário para suporte/diagnóstico (normalmente por admins), sem compartilhar senha.

- Implementação (edge function): `supabase/functions/impersonate-user/index.ts`
- Serviço no Web: `apps/web/src/lib/services/impersonation-service.ts`
- Estado no Web: `apps/web/src/lib/auth/impersonation.ts` (`ImpersonationState`)

**Relacionado:** [Auditoria](#auditoria), [Supabase Edge Function](#supabase-edge-function)

---

### **Auditoria**
Registro de eventos relevantes (criação/alteração, ações administrativas, etc.) para rastreabilidade.

- Tipo no Web: `AuditLog` em `apps/web/src/lib/supabase/custom-types.ts`

**Relacionado:** [Impersonação](#impersonação)

---

## Termos técnicos e de infraestrutura

### **Supabase**
Plataforma usada como backend (Postgres + Auth + Storage + Edge Functions). No projeto:
- **Web** e **Mobile** consomem dados via client Supabase,
- segurança é reforçada com **RLS**,
- ações privilegiadas usam **Edge Functions**.

**Relacionado:** [RLS](#rls-row-level-security), [Supabase Edge Function](#supabase-edge-function)

---

### **Supabase Edge Function**
Função server-side executada na infraestrutura do Supabase, usada para operações privilegiadas (ex.: convites, impersonação).

- Exemplo: convite de usuário
  - `supabase/functions/invite-user/index.ts`
- Exemplo: impersonação
  - `supabase/functions/impersonate-user/index.ts`

**Relacionado:** [Service Role](#service-role)

---

### **Service Role**
Chave/credencial privilegiada do Supabase (bypass em RLS). **Nunca** deve estar no client (Web/Mobile). Deve ser restrita a execução server-side (Edge Functions/ambientes seguros).

**Relacionado:** [RLS](#rls-row-level-security), [Supabase Edge Function](#supabase-edge-function)

---

### **E2E (End-to-End)**
Testes de ponta a ponta que automatizam fluxos completos (login, navegação, CRUD, permissões). No Web ficam em:

- `apps/web/e2e/**`

---

## Estados e enums comuns

### **Status do ticket**
Representa a fase do ciclo de vida do ticket/chamado no Mobile.

- Enum/Type: `TicketStatus` em `apps/mobile/src/modules/tickets/types/tickets.types.ts`

---

### **Prioridade do ticket**
Classificação de prioridade e/ou urgência percebida.

- `TicketPriority` e `PerceivedUrgency` em `apps/mobile/src/modules/tickets/types/tickets.types.ts`

---

### **Status de usuário / unidade**
Representa estados cadastrais/operacionais.

- Web: `UserStatus`, `UnitStatus` em `apps/web/src/lib/supabase/custom-types.ts`

---

## Referências rápidas (arquivos úteis)

- Visão geral do projeto: `docs/project-overview.md`
- Permissões (Web): `apps/web/src/lib/auth/permissions.ts`
- RBAC (Web): `apps/web/src/lib/auth/rbac.ts`
- Tipos Supabase (Web): `apps/web/src/lib/supabase/custom-types.ts` e `apps/web/src/lib/supabase/database.types.ts`
- Tipos de tickets (Mobile): `apps/mobile/src/modules/tickets/types/tickets.types.ts`
- Tipos de usuário/perfil (Mobile): `apps/mobile/src/modules/user/types/userProfile.types.ts`

---

## Convenções de linguagem (PT/EN)

- UI e rotas no Web frequentemente usam português (`/chamados`, `/unidades`, `/relatorios`).
- No Mobile, o módulo “chamados” aparece como “tickets” (`modules/tickets`).
- Documentação e tipos podem alternar entre PT/EN; ao criar novos termos, prefira:
  - **Domínio** em PT-BR (ex.: “Chamado”, “Unidade”)
  - **Estruturas técnicas** em EN (ex.: `TicketStatus`, `PermissionChecker`)
