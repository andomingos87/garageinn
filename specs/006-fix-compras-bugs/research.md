# Research: Correção de Bugs do Módulo de Compras

**Branch**: `006-fix-compras-bugs` | **Date**: 2026-01-25

## 1. RLS Policy para ticket_quotations (BUG-COMP-05)

### Decision
Criar nova RLS policy para permitir INSERT por usuários com role de Comprador nos departamentos Compras e Manutenção.

### Rationale
- A tabela `ticket_quotations` atualmente só tem policies de SELECT e ADMIN
- Compradores precisam poder inserir cotações para executar seu trabalho
- A validação de permissão já existe no server action `addQuotation()`
- RLS deve complementar (não substituir) a validação server-side

### Alternatives Considered
1. **Usar service_role no backend**: Rejeitado - bypassa RLS completamente, reduz segurança
2. **Trigger function**: Rejeitado - complexidade desnecessária para caso simples
3. **RLS policy com check de role**: Escolhido - padrão Supabase, mantém segurança em camadas

### Implementation
```sql
CREATE POLICY "compradores_can_insert_quotations" ON ticket_quotations
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    JOIN departments d ON ur.department_id = d.id
    WHERE ur.user_id = auth.uid()
    AND d.name IN ('Compras', 'Manutenção')
    AND r.name IN ('Comprador', 'Gerente', 'Supervisor')
  )
);
```

---

## 2. Atualização de UI após mudança de status (BUG-COMP-08)

### Decision
Usar `router.refresh()` do Next.js App Router após mudança de status bem-sucedida, combinado com `revalidatePath()` no server action.

### Rationale
- Next.js 16 App Router usa React Server Components
- `revalidatePath()` invalida o cache do servidor
- `router.refresh()` força re-fetch dos dados no cliente
- Toast já existe, só precisa adicionar refresh

### Alternatives Considered
1. **useState local**: Rejeitado - cria divergência entre server e client state
2. **SWR/React Query**: Rejeitado - projeto já usa Server Components
3. **revalidatePath + router.refresh**: Escolhido - padrão Next.js, sem libs extras

### Implementation Pattern
```typescript
// Server Action (compras/actions.ts)
'use server'
export async function changeTicketStatus(ticketId: string, newStatus: string) {
  // ... update logic
  revalidatePath(`/chamados/compras/${ticketId}`);
  return { success: true };
}

// Client Component (ticket-actions.tsx)
const router = useRouter();
async function handleStatusChange(newStatus: string) {
  const result = await changeTicketStatus(ticketId, newStatus);
  if (result.success) {
    toast.success(`Status alterado para: ${newStatus}`);
    router.refresh(); // Force re-fetch
  }
}
```

---

## 3. Filtro de chamados para Comprador (BUG-COMP-01)

### Decision
Modificar `getHubTickets()` em `chamados/actions.ts` para filtrar por status "Aprovado" quando usuário é Comprador.

### Rationale
- Compradores só devem ver chamados prontos para execução
- Status "Aprovado" indica aprovação pelo Gerente de Operações
- Filtro deve ser aplicado no nível da query, não no frontend

### Alternatives Considered
1. **Filtro no frontend**: Rejeitado - expõe dados desnecessários, problemas de performance
2. **View materializada**: Rejeitado - complexidade para caso simples
3. **Filtro condicional na query**: Escolhido - simples, eficiente

### Implementation
```typescript
async function getHubTickets(userId: string, userRoles: RoleInfo[]) {
  let query = supabase.from('tickets_with_details').select('*');

  const isComprador = userRoles.some(r =>
    r.roleName === 'Comprador' &&
    ['Compras', 'Manutenção'].includes(r.departmentName)
  );

  if (isComprador) {
    query = query.eq('status', 'approved');
  }

  return query;
}
```

---

## 4. Filtro de departamentos por role (BUG-COMP-02)

### Decision
Modificar `getDepartments()` para retornar apenas departamentos relevantes ao role do usuário.

### Rationale
- Compradores atuam em Compras e Manutenção
- Mostrar RH e TI é irrelevante e confuso
- Filtro deve ser dinâmico baseado no role

### Implementation
```typescript
async function getDepartments(userRoles: RoleInfo[]) {
  const isComprador = userRoles.some(r => r.roleName === 'Comprador');

  if (isComprador) {
    return supabase
      .from('departments')
      .select('id, name')
      .in('name', ['Compras', 'Manutenção']);
  }

  // Outros roles veem todos departamentos
  return supabase.from('departments').select('id, name');
}
```

---

## 5. Criação de chamados TI para todos (BUG-COMP-03)

### Decision
Separar `canCreateTiTicket()` de `canAccessTiArea()` no módulo `ti-access.ts`. Remover gate de acesso na página `/chamados/ti/novo`.

### Rationale
- Qualquer funcionário pode solicitar suporte de TI
- Restrição é apenas para executar chamados (área TI)
- Página de criação não deve usar `getTiAccessContext()`

### Alternatives Considered
1. **Flag no contexto**: Rejeitado - complica lógica existente
2. **Funções separadas**: Escolhido - clareza, single responsibility

### Implementation
```typescript
// ti-access.ts
export function canCreateTiTicket(): boolean {
  return true; // Todos usuários autenticados podem criar
}

export function canAccessTiArea({ isAdmin, roles }: TiAccessParams): boolean {
  if (isAdmin) return true;
  return hasDepartmentRole(roles, TI_DEPARTMENT_NAME);
}

// ti/novo/page.tsx - REMOVER este bloco:
// const access = await getTiAccessContext();
// if (!access.canAccess) return <AccessDenied />;
```

---

## 6. Máscaras de formatação (BUG-COMP-04)

### Decision
Usar biblioteca `react-input-mask` ou implementação manual com regex para máscaras de CNPJ, telefone e preço.

### Rationale
- Projeto usa shadcn/ui que não inclui máscaras nativas
- CNPJ tem formato fixo, telefone tem variação (8/9 dígitos)
- Preço usa formato brasileiro (R$ X.XXX,XX)

### Implementation Pattern
```typescript
// CNPJ: XX.XXX.XXX/XXXX-XX
function formatCNPJ(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18);
}

// Telefone: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 10) {
    return digits.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  }
  return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
}

// Preço: R$ X.XXX,XX
function formatCurrency(value: string): string {
  const number = parseFloat(value.replace(/\D/g, '')) / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(number);
}
```

---

## 7. Ctrl+Enter para comentários (BUG-COMP-06)

### Decision
Adicionar event listener `onKeyDown` no Textarea de comentários.

### Implementation
```typescript
function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
  if (e.ctrlKey && e.key === 'Enter') {
    e.preventDefault();
    if (comment.trim()) {
      handleSubmit();
    }
  }
}

<Textarea
  value={comment}
  onChange={(e) => setComment(e.target.value)}
  onKeyDown={handleKeyDown}
  placeholder="Digite seu comentário..."
/>
```

---

## 8. Labels de histórico em PT-BR (BUG-COMP-07)

### Decision
Criar mapa de tradução para actions do histórico em `ticket-timeline.tsx`.

### Implementation
```typescript
const actionLabels: Record<string, string> = {
  'status_change': 'Status alterado',
  'status_changed': 'Status alterado',
  'comment_added': 'Comentário adicionado',
  'quotation_added': 'Cotação adicionada',
  'quotation_selected': 'Cotação selecionada',
  'quotation_deleted': 'Cotação removida',
  'approval_requested': 'Aprovação solicitada',
  'approval_granted': 'Aprovação concedida',
  'approval_denied': 'Aprovação negada',
  'created': 'Chamado criado',
  'assigned': 'Chamado atribuído',
};

function getActionLabel(action: string): string {
  return actionLabels[action] || action;
}
```

---

## Dependencies & Patterns Summary

| Area | Pattern | Notes |
|------|---------|-------|
| RLS | Supabase Policy | Standard WITH CHECK clause |
| UI Refresh | Next.js App Router | revalidatePath + router.refresh |
| Input Masks | Manual regex | No external lib needed |
| i18n | Static map | No i18n lib, PT-BR only |
| Access Control | Function separation | canCreate vs canAccess |
