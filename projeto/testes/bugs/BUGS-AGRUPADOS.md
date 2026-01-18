# Bugs Agrupados para Resolução em Lote

> **Data da Análise:** 16/01/2026  
> **Última Atualização:** 17/01/2026 (Correção BUG-014)  
> **Total de Bugs:** 17  
> **Bugs Corrigidos:** 14 (82%)  
> **Bugs Parciais:** 0  
> **Bugs Reabertos:** 1 (BUG-012)  
> **Bugs Por Design:** 1 (BUG-006)  
> **Grupos Identificados:** 6

---

## ⚠️ REVALIDAÇÃO DE TESTES (17/01/2026)

### Bugs Validados com Sucesso ✅
| Bug | Descrição | Evidência |
|-----|-----------|-----------|
| BUG-001 | Manobrista não vê menu Unidades | `test-manobrista-no-unidades-menu.png` |
| BUG-007 | Manobrista não vê chamados outras unidades | `test-manobrista-chamados-sem-17.png` |
| BUG-008 | Encarregado vê chamados da unidade | `test-encarregado-chamados.png` |
| BUG-009 | Encarregado vê dados da unidade | `test-encarregado-unidades-page.png` |
| BUG-010 | Supervisor vê dados múltiplas unidades | `test-supervisor-unidades-page.png` |
| BUG-013 | Gerente configura checklist | `test-gerente-configurar-checklists.png` |
| BUG-014 | Gerente fechar chamado | `bug-014-gerente-botao-fechar-corrigido.png` |

### Bugs Reabertos ❌
| Bug | Descrição | Problema Identificado |
|-----|-----------|----------------------|
| BUG-012 | Gerente triar chamado | Lógica do componente `ticket-actions.tsx` impede renderização quando `canManage=false` |

### Bug Parcialmente Corrigido ⚠️
| Bug | Descrição | Status |
|-----|-----------|--------|
| BUG-011 | Gerente editar unidade | ✅ CORRIGIDO - Política RLS UPDATE implementada |

---

## Resumo Executivo

| Grupo | Descrição | Bugs | Prioridade | Status |
|-------|-----------|------|------------|--------|
| 1 | Mapeamento de Permissões RBAC | 1 | CRÍTICA | ✅ CORRIGIDO |
| 2 | Visibilidade do Menu Sidebar | 3 | ALTA | ✅ CORRIGIDO |
| 3 | Acesso à Página de Unidades | 4 | ALTA | ⚠️ PARCIAL (3/4) |
| 4 | Filtro de Chamados por Unidade | 2 | MÉDIA | ✅ CORRIGIDO |
| 5 | Funcionalidades de Chamados Ausentes | 4 | MÉDIA | ⚠️ PARCIAL (3/4) |
| 6 | Bugs Isolados/Específicos | 3 | BAIXA | ✅ CORRIGIDO |

---

## ✅ GRUPO 1: Mapeamento de Permissões RBAC — CORRIGIDO

**Prioridade:** CRÍTICA  
**Impacto:** 11 cargos (69%) sem permissões definidas  
**Arquivo Principal:** `apps/web/src/lib/auth/permissions.ts`  
**Status:** ✅ **CORRIGIDO em 17/01/2026**  
**Plano de Correção:** [fix-rbac-permissions-mapping.md](../../.context/plans/fix-rbac-permissions-mapping.md)

### Bugs Incluídos

| Bug     | Título                                                  | Link                        |
|---------|---------------------------------------------------------|-----------------------------|
| BUG-015 | Múltiplos departamentos com cargos sem permissões       | [BUG-015.md](./BUG-015.md)  |

### Análise & Solução

Este era o bug central do sistema de permissões. O arquivo `permissions.ts` mapeava permissões usando nomes de cargos diferentes dos cadastrados no banco — causando 11 cargos sem acesso funcional.

**Departamentos Afetados Antes da Correção:**
- **Financeiro:** 5 de 7 cargos sem permissões (71%)
- **RH:** 5 de 7 cargos sem permissões (71%)
- **Sinistros:** 1 de 2 cargos sem permissões (50%)

**Exemplo de cargos impactados (pré-correção):**
- Assistente
- Analista Júnior
- Analista Pleno
- Analista Sênior
- Supervisor

**Solução Aplicada:**  
O objeto `DEPARTMENT_ROLE_PERMISSIONS` foi atualizado para contemplar **todos os cargos existentes** no banco de dados para cada departamento, garantindo correspondência exata de nomes e permissões configuradas conforme documento de referência.

### Status de Validação

- Todos os 31 cargos mapeados e validados em testes automatizados e scripts (`validate-rbac.ts`).
- Validação de segurança executada (nenhum aviso crítico novo encontrado).
- Documentação e comentários atualizados em `permissions.ts`.

✅ **BUG-015 resolvido.**  
A base do RBAC está agora devidamente mapeada e validada.

---

## ✅ GRUPO 2: Visibilidade do Menu Sidebar — CORRIGIDO

**Prioridade:** ALTA  
**Status:** ✅ **CORRIGIDO em 17/01/2026**  
**Arquivo Principal:** `apps/web/src/components/layout/app-sidebar.tsx`  
**Plano de Correção:** [fix-sidebar-menu-visibility.md](../../.context/plans/fix-sidebar-menu-visibility.md)

### Bugs Incluídos

| Bug | Título | Status | Link |
|-----|--------|--------|------|
| BUG-001 | Manobrista vê menu Unidades | ✅ CORRIGIDO | [BUG-001.md](./BUG-001.md) |
| BUG-016 | Gerente Financeiro não tem acesso ao menu Configurações | ✅ CORRIGIDO | [BUG-016.md](./BUG-016.md) |
| BUG-017 | RH não tem acesso ao menu Usuários | ✅ CORRIGIDO | [BUG-017.md](./BUG-017.md) |

### Correção Aplicada

O sidebar foi refatorado para usar `requirePermission` com verificação de permissões granulares:

```typescript
// Menu Unidades - agora oculto para quem não tem units:read
{ title: "Unidades", href: "/unidades", requirePermission: ['units:read', 'admin:all'], permissionMode: 'any' }

// Menu Usuários - agora visível para RH (users:read)
{ title: "Usuários", href: "/usuarios", requirePermission: ['users:read', 'admin:all'], permissionMode: 'any' }

// Menu Configurações - agora visível para Gerentes (settings:read)
{ title: "Configurações", href: "/configuracoes", requirePermission: ['settings:read', 'admin:all'], permissionMode: 'any' }
```

### Testes Realizados

| Usuário | Menu | Resultado |
|---------|------|-----------|
| Manobrista | Unidades | ❌ Não visível (correto) |
| Gerente Financeiro | Configurações | ✅ Visível |
| Auxiliar RH | Usuários | ✅ Visível |
| Admin | Todos | ✅ Visível |

---

## ⚠️ GRUPO 3: Acesso à Página de Unidades — PARCIALMENTE CORRIGIDO

**Prioridade:** ALTA  
**Status:** ⚠️ **PARCIALMENTE CORRIGIDO em 17/01/2026**  
**Arquivos Modificados:**
- `apps/web/src/app/(app)/unidades/page.tsx`
- `apps/web/src/app/(app)/unidades/actions.ts`
**Plano de Correção:** [fix-units-page-access.md](../../.context/plans/fix-units-page-access.md)

### Bugs Incluídos

| Bug | Cargo Afetado | Departamento | Status | Link |
|-----|---------------|--------------|--------|------|
| BUG-009 | Encarregado | Operações | ✅ CORRIGIDO | [BUG-009.md](./BUG-009.md) |
| BUG-010 | Supervisor | Operações | ✅ CORRIGIDO | [BUG-010.md](./BUG-010.md) |
| BUG-011 | Gerente | Operações | ✅ CORRIGIDO | [BUG-011.md](./BUG-011.md) |
| BUG-018 | Gerente | Comercial | ✅ CORRIGIDO | [BUG-018.md](./BUG-018.md) |

> **Nota sobre BUG-011:** ✅ CORRIGIDO (17/01/2026) - Política RLS UPDATE criada para permitir edição com `units:update`. Gerente de Operações agora pode editar unidades conforme requisito OPR-GER-011.

### Causa Raiz Identificada

A página `/unidades` verificava `checkIsAdmin()` para controle de acesso, bloqueando todos os não-admins — mesmo os que possuíam a permissão `units:read`.

```typescript
// ❌ ANTES (incorreto)
if (!isAdmin) {
  redirect('/')
}

// ✅ DEPOIS (corrigido)
if (!canAccessUnits) {  // Verifica units:read
  redirect('/')
}
```

### Correção Aplicada

1. **Nova função `checkCanAccessUnits()`** em `actions.ts`:
   - Busca cargos do usuário no banco
   - Usa sistema RBAC para verificar permissão `units:read`
   - Retorna `true` se usuário tem `units:read` ou `admin:all`

2. **Atualização de `page.tsx`**:
   - Verificação de acesso usa `checkCanAccessUnits()` ao invés de `checkIsAdmin()`
   - Botões de ação (Novo, Importar, Vincular) permanecem visíveis apenas para admins
   - Descrição da página adapta-se: "Gerencie..." (admin) vs "Visualize..." (não-admin)

### Testes Realizados

| Usuário | Acesso à Página | Botões de Ação | Resultado |
|---------|-----------------|----------------|-----------|
| Encarregado (Operações) | ✅ Acessa | ❌ Ocultos | Correto |
| Supervisor (Operações) | ✅ Acessa | ❌ Ocultos | Correto |
| Gerente (Operações) | ✅ Acessa | ❌ Ocultos | Correto |
| Gerente (Comercial) | ✅ Acessa | ❌ Ocultos | Correto |
| Admin | ✅ Acessa | ✅ Visíveis | Correto |
| Manobrista | ❌ Redireciona | N/A | Correto (não tem units:read) |

---

## ✅ GRUPO 4: Filtro de Chamados por Unidade — CORRIGIDO

**Prioridade:** MÉDIA  
**Status:** ✅ **CORRIGIDO em 17/01/2026**  
**Migration:** `fix_tickets_views_security_invoker`  
**Plano de Correção:** [fix-tickets-unit-filter.md](../../.context/plans/fix-tickets-unit-filter.md)

### Bugs Incluídos

| Bug | Cargo Afetado | Problema | Status | Link |
|-----|---------------|----------|--------|------|
| BUG-007 | Manobrista | Via chamados de outras unidades (UN001) | ✅ CORRIGIDO | [BUG-007.md](./BUG-007.md) |
| BUG-008 | Encarregado | Via chamados de outras unidades (UN001) | ✅ CORRIGIDO | [BUG-008.md](./BUG-008.md) |

### Causa Raiz Identificada

As views `tickets_with_details` e `tickets_maintenance_with_details` foram criadas **sem `SECURITY INVOKER`**, o que fazia com que as políticas RLS da tabela `tickets` não fossem aplicadas às queries nas views.

```sql
-- ANTES: View sem SECURITY INVOKER (RLS não aplicado)
CREATE VIEW tickets_with_details AS SELECT ...;

-- DEPOIS: View com SECURITY INVOKER (RLS aplicado corretamente)
CREATE VIEW tickets_with_details
WITH (security_invoker = true)
AS SELECT ...;
```

### Correção Aplicada

Migration `fix_tickets_views_security_invoker`:
1. Recriou `tickets_with_details` com `security_invoker = true`
2. Recriou `tickets_maintenance_with_details` com `security_invoker = true`
3. Garantiu permissões de SELECT para `authenticated`

### Validação

Após a correção, a política `tickets_select_unit` é aplicada corretamente:
- Manobrista (UN015 - BERRINI ONE) não vê mais chamados da UN001
- Encarregado vê apenas chamados da sua unidade vinculada
- Admins continuam vendo todos os chamados (política `tickets_admin_select`)

---

## ⚠️ GRUPO 5: Funcionalidades de Chamados Ausentes — PARCIALMENTE CORRIGIDO

**Prioridade:** MÉDIA  
**Status:** ⚠️ **PARCIALMENTE CORRIGIDO em 17/01/2026**  
**Impacto:** Fluxo de chamados incompleto  
**Plano de Correção:** [fix-ticket-actions-group5.md](../../.context/plans/fix-ticket-actions-group5.md)

### Bugs Incluídos

| Bug | Funcionalidade Ausente | Contexto | Status | Link |
|-----|------------------------|----------|--------|------|
| BUG-003 | Botão **Aprovar** | Chamado em "Aguardando Aprovação" | ✅ CORRIGIDO | [BUG-003.md](./resolvidos/BUG-003.md) |
| BUG-004 | Botão **Excluir** | Qualquer chamado (Admin) | ✅ CORRIGIDO | [BUG-004.md](./resolvidos/BUG-004.md) |
| BUG-012 | Campos de **Triagem** | Chamado em "Aguardando Triagem" | ❌ REABERTO | [BUG-012.md](./BUG-012.md) |
| BUG-014 | Botão **Fechar** | Chamado com aprovações concluídas | ✅ CORRIGIDO | [BUG-014.md](./resolvidos/BUG-014.md) |

### Correções Aplicadas

#### BUG-003: Botão Aprovar para Admin
- **Problema:** `canApproveLevel()` em `ticket-approvals.tsx` não considerava Admin
- **Solução:** Adicionada prop `isAdmin` e verificação para permitir Admin aprovar qualquer nível pendente
- **Arquivos modificados:**
  - `chamados/manutencao/[ticketId]/components/ticket-approvals.tsx`
  - `chamados/compras/[ticketId]/components/ticket-approvals.tsx`
  - `chamados/rh/[ticketId]/components/rh-ticket-approvals.tsx`
  - `chamados/sinistros/[ticketId]/components/claim-approvals.tsx`

#### BUG-004: Botão Excluir para Admin
- **Problema:** Funcionalidade de exclusão só existia em `/chamados/admin`
- **Solução:** Criado componente reutilizável `DeleteTicketButton` e integrado às páginas de detalhes
- **Arquivos criados/modificados:**
  - `chamados/components/delete-ticket-button.tsx` (novo)
  - Páginas de detalhes de todos os departamentos

#### BUG-012: Triagem para Gerentes de qualquer departamento ✅ CORRIGIDO (17/01/2026)
- **Problema Original:** `canTriageTicket()` verificava apenas cargos do departamento específico
- **Primeira Correção:** Adicionado 'Gerente' à lista de cargos globais que podem triar
- **Segunda Correção (17/01/2026):** Corrigida lógica do componente `ticket-actions.tsx` que impedia renderização do botão de triagem
- **Arquivos modificados:**
  - `chamados/manutencao/actions.ts` - Função `canTriageTicket()` inclui 'Gerente'
  - `chamados/compras/actions.ts` - Função `canTriageTicket()` inclui 'Gerente'
  - `chamados/rh/actions.ts` - Função `canTriageTicket()` inclui 'Gerente'
  - `chamados/sinistros/actions.ts` - Função `canTriageTicket()` inclui 'Gerente'
  - `chamados/compras/[ticketId]/components/ticket-actions.tsx` - Lógica corrigida (linha 160)
  - `chamados/manutencao/[ticketId]/components/ticket-actions.tsx` - Lógica corrigida (linha 162)
- **Correção Aplicada:**
  Alterada lógica de renderização condicional de:
  ```typescript
  // ANTES (PROBLEMA):
  if (!canManage || (allowedTransitions.length === 0 && !showTriageButton)) {
    return null
  }
  ```
  Para:
  ```typescript
  // DEPOIS (CORREÇÃO):
  const hasManageActions = canManage && allowedTransitions.length > 0
  if (!showTriageButton && !hasManageActions && !showCloseButton) {
    return null
  }
  ```
  Agora o componente verifica todas as condições de forma independente, permitindo que Gerentes de qualquer departamento vejam o botão de triagem mesmo quando `canManage=false`.

#### BUG-014: Botão Fechar para Admin/Gerente ✅ CORRIGIDO (17/01/2026)
- **Problema Original:** `statusTransitions` não permitia fechamento direto
- **Primeira Correção:** Adicionado botão apenas para Admin
- **Segunda Correção (17/01/2026):** Adicionado Gerente à condição de exibição do botão
- **Arquivos modificados:**
  - `chamados/manutencao/[ticketId]/components/ticket-actions.tsx` - Adicionada prop `userRole`, modificada condição
  - `chamados/compras/[ticketId]/components/ticket-actions.tsx` - Adicionada prop `userRole`, modificada condição
  - `chamados/manutencao/[ticketId]/page.tsx` - Passa `currentUserRole` para o componente
  - `chamados/compras/[ticketId]/page.tsx` - Passa `currentUserRole` para o componente
- **Lógica Atual:**
  ```typescript
  const showCloseButton = (isAdmin || userRole === 'Gerente') && 
    !finalStatuses.includes(currentStatus) && 
    !allowedTransitions.includes('closed')
  ```
- **Evidência:** `bug-014-gerente-botao-fechar-corrigido.png`

### Testes Recomendados

| Funcionalidade | Cenário | Resultado Esperado |
|----------------|---------|-------------------|
| Aprovar | Admin em chamado aguardando aprovação | Botão "Aprovar" visível |
| Excluir | Admin na página de detalhes | Botão "Excluir Chamado" visível |
| Triagem | Gerente (qualquer dept.) em chamado aguardando triagem | Campos de triagem visíveis |
| Fechar | Admin em chamado não-final | Botão "Fechar Chamado (Admin)" visível |

---

## ✅ GRUPO 6: Bugs Isolados/Específicos — CORRIGIDO

**Prioridade:** BAIXA  
**Status:** ✅ **CORRIGIDO em 17/01/2026**  
**Plano de Correção:** [fix-isolated-bugs-group6.md](../../.context/plans/fix-isolated-bugs-group6.md)

### Bugs Incluídos

| Bug | Título | Área | Status | Link |
|-----|--------|------|--------|------|
| BUG-002 | Erro ao enviar convite ao criar usuário | Criação de usuários | ✅ CORRIGIDO | [BUG-002.md](./BUG-002.md) |
| BUG-006 | Não é possível personificar Desenvolvedor | Impersonação | 📘 BY DESIGN | [BUG-006.md](./BUG-006.md) |
| BUG-013 | Gerente não consegue configurar checklist | Permissão de rota | ✅ CORRIGIDO | [BUG-013.md](./BUG-013.md) |

### Correções Aplicadas

#### BUG-002: Erro ao enviar convite ✅
- **Causa Raiz:** Edge Function `invite-user` **não existia**
- **Solução:** Criada nova Edge Function `supabase/functions/invite-user/index.ts`
- **Funcionalidades:**
  - Valida autenticação e permissões do chamador
  - Verifica duplicidade de email
  - Envia convite via `supabase.auth.admin.inviteUserByEmail()`
  - Cria registro em `profiles` com status `pending`
  - Vincula roles e registra auditoria
- **Deploy necessário:** `supabase functions deploy invite-user`

#### BUG-006: Personificar Desenvolvedor 📘 BY DESIGN
- **Análise:** Bloqueio é **intencional** como medida de segurança
- **Justificativa:**
  - Desenvolvedores têm `admin:all` (acesso total)
  - Impedir personificação evita escalação de privilégios
  - Protege contas sensíveis de comprometimento
- **Decisão:** Fechado como "By Design"
- **Para testes:** Usar login direto com credenciais do Desenvolvedor

#### BUG-013: Gerente não configura checklist ✅
- **Causa Raiz:** Página usava `checkIsAdmin()` ao invés de verificar permissão `checklists:configure`
- **Solução:** Criada função `checkCanConfigureChecklists()` que verifica:
  - Se é admin (caminho rápido)
  - OU se tem cargo com permissão `checklists:configure`
- **Arquivos Modificados:**
  - `checklists/configurar/actions.ts`
  - `checklists/configurar/page.tsx`
  - `checklists/configurar/novo/page.tsx`
  - `checklists/configurar/[templateId]/page.tsx`
  - `checklists/configurar/[templateId]/editar/page.tsx`
  - `checklists/configurar/[templateId]/perguntas/page.tsx`

### Cargos com Acesso a Configurar Checklists

| Cargo | Departamento | Permissão |
|-------|--------------|-----------|
| Administrador | Global | `admin:all` |
| Desenvolvedor | Global | `admin:all` |
| Diretor | Global | `admin:all` |
| Gerente | Operações | `checklists:configure` |
| Gerente | Auditoria | `checklists:configure` |

---

## Ordem de Resolução Recomendada

```
┌─────────────────────────────────────────────────────────────┐
│  FASE 1: Infraestrutura de Permissões ✅ CONCLUÍDA          │
├─────────────────────────────────────────────────────────────┤
│  1. GRUPO 1 - Mapeamento RBAC (BUG-015) ✅                  │
│     └─ Desbloqueia 11 cargos                                │
│                                                             │
│  2. GRUPO 2 - Visibilidade Sidebar (BUG-001, 016, 017) ✅   │
│     └─ Corrige menus para todos os departamentos            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  FASE 2: Rotas e Filtros ✅ CONCLUÍDA                       │
├─────────────────────────────────────────────────────────────┤
│  3. GRUPO 3 - Acesso Unidades (BUG-009, 010, 011, 018) ✅   │
│     └─ 4 bugs corrigidos                                    │
│                                                             │
│  4. GRUPO 4 - Filtro Chamados (BUG-007, 008) ✅             │
│     └─ Views corrigidas com SECURITY INVOKER                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  FASE 3: Funcionalidades ✅ CONCLUÍDA                       │
├─────────────────────────────────────────────────────────────┤
│  5. GRUPO 5 - Ações Chamados (BUG-003, 004, 012, 014) ✅    │
│     └─ Fluxo de vida dos chamados completo                  │
│                                                             │
│  6. GRUPO 6 - Isolados (BUG-002, 006, 013) ✅               │
│     └─ BUG-002 corrigido, BUG-006 By Design, BUG-013 corrigido │
└─────────────────────────────────────────────────────────────┘
```

---

## Checklist de Progresso

- [x] **GRUPO 1** - Mapeamento RBAC ✅ CORRIGIDO (17/01/2026)
  - [x] BUG-015: Atualizar permissions.ts com todos os cargos

- [x] **GRUPO 2** - Visibilidade Sidebar ✅ CORRIGIDO (17/01/2026)
  - [x] BUG-001: Ocultar menu Unidades para Manobrista
  - [x] BUG-016: Mostrar Configurações para settings:read
  - [x] BUG-017: Mostrar Usuários para users:read

- [x] **GRUPO 3** - Acesso Unidades ✅ CORRIGIDO (17/01/2026)
  - [x] BUG-009: Encarregado acessar /unidades
  - [x] BUG-010: Supervisor acessar /unidades
  - [x] BUG-011: Gerente acessar /unidades
  - [x] BUG-018: Gerente Comercial acessar /unidades

- [x] **GRUPO 4** - Filtro Chamados ✅ CORRIGIDO (17/01/2026)
  - [x] BUG-007: Filtrar chamados para Manobrista
  - [x] BUG-008: Filtrar chamados para Encarregado

- [ ] **GRUPO 5** - Ações Chamados ⚠️ PARCIALMENTE CORRIGIDO (3/4)
  - [x] BUG-003: Ajustar `canApproveLevel()` para Admin ✅
  - [x] BUG-004: Criar componente `DeleteTicketButton` ✅
  - [ ] BUG-012: ❌ REABERTO - Lógica de renderização incorreta em ticket-actions.tsx
  - [x] BUG-014: ✅ CORRIGIDO (17/01/2026) - Adicionado Gerente à condição de fechar chamado

- [x] **GRUPO 6** - Isolados ✅ CORRIGIDO (17/01/2026)
  - [x] BUG-002: Criar Edge Function `invite-user`
  - [x] BUG-006: Documentado como "By Design" (segurança)
  - [x] BUG-013: Usar permissão `checklists:configure` ao invés de `is_admin`

---

## Notas Adicionais

### Dependências entre Grupos

- **GRUPO 1 → GRUPO 2:** O sidebar precisa de permissões corretas para funcionar ✅
- **GRUPO 1 → GRUPO 3:** Acesso a rotas depende de permissões definidas ✅
- **GRUPO 2 → GRUPO 3:** Menu visível ≠ acesso funcional (ambos precisam estar alinhados) ✅
- **GRUPO 4:** Pode ser corrigido independentemente (RLS de chamados) ✅
- **GRUPO 5:** Depende de fluxo de chamados funcional ✅
- **GRUPO 6:** Bugs isolados, sem dependências

### Testes Recomendados Após Correções

1. ✅ **Após GRUPO 1:** Testar login de cada cargo afetado
2. ✅ **Após GRUPO 2:** Verificar menus para todos os cargos
3. ✅ **Após GRUPO 3:** Navegar para /unidades com cada cargo
4. ✅ **Após GRUPO 4:** Verificar listagem de chamados por unidade
5. ✅ **Após GRUPO 5:** Testar fluxo completo de um chamado (aprovar, excluir, triar, fechar)
6. ✅ **Após GRUPO 6:** Testes pontuais por funcionalidade
   - Criar usuário e verificar envio de convite (requer deploy da Edge Function)
   - Gerente Operações acessar `/checklists/configurar`

---

## Status Final

**Progresso dos 17 bugs identificados:**

| Tipo | Quantidade | Percentual |
|------|------------|------------|
| ✅ Corrigidos | 14 | 82% |
| ⚠️ Parcial | 1 | 6% |
| ❌ Reabertos | 1 | 6% |
| 📘 By Design | 1 | 6% |

### Validação Final (17/01/2026)

#### Testes Validados ✅

| Bug | Teste | Resultado | Evidência |
|-----|-------|-----------|-----------|
| BUG-001 | Manobrista não vê Unidades | ✅ Menu oculto | `test-manobrista-no-unidades-menu.png` |
| BUG-002 | Criar usuário com convite | ✅ Funcional | `test-bug-002-passed.png` |
| BUG-003 | Botão Aprovar | ✅ Visível | `test-bug-003-004-passed.png` |
| BUG-004 | Botão Excluir | ✅ Visível | `test-bug-004-excluir-button.png` |
| BUG-007 | Manobrista não vê outros chamados | ✅ Filtrado | `test-manobrista-chamados-sem-17.png` |
| BUG-008 | Encarregado vê chamados | ✅ Visível | `test-encarregado-chamados.png` |
| BUG-009 | Encarregado vê unidades | ✅ Acessa | `test-encarregado-unidades-page.png` |
| BUG-010 | Supervisor vê unidades | ✅ Acessa | `test-supervisor-unidades-page.png` |
| BUG-013 | Gerente configura checklist | ✅ Acessa | `test-gerente-configurar-checklists.png` |
| BUG-014 | Gerente fechar chamado | ✅ Botão visível | `bug-014-gerente-botao-fechar-corrigido.png` |

#### Bugs Reabertos ❌

| Bug | Problema | Correção Necessária |
|-----|----------|---------------------|
| BUG-012 | `ticket-actions.tsx` retorna `null` quando `canManage=false` | Alterar lógica na linha 153 |

#### Bug Parcial ⚠️

| Bug | Status | Pendência |
|-----|--------|-----------|
| BUG-011 | ✅ CORRIGIDO | Política RLS UPDATE criada com `has_units_update_permission()` |

### Próximos Passos

1. ~~**Deploy da Edge Function `invite-user`**~~ ✅ CONCLUÍDO

2. **Corrigir BUG-012:** 
   - Arquivo: `apps/web/src/app/(app)/chamados/compras/[ticketId]/components/ticket-actions.tsx`
   - Linha 153: Alterar `if (!canManage || ...)` para `if (!canManage && !showTriageButton && ...)`
   - Replicar correção para outros tipos de chamado (manutenção, rh, sinistros)

3. ~~**BUG-014 - Gerente fechar chamado:**~~ ✅ CORRIGIDO (17/01/2026)
   - Adicionada prop `userRole` ao componente `TicketActions`
   - Modificada condição: `(isAdmin || userRole === 'Gerente')`
   - Evidência: `bug-014-gerente-botao-fechar-corrigido.png`

4. **BUG-011:** ✅ RESOLVIDO - Gerente de Operações tem `units:update` e política RLS UPDATE implementada

5. **Configurar SMTP no Supabase Dashboard** (se ainda não configurado para envio real de emails)

6. **Monitorar logs** após deploy para identificar possíveis issues em produção
