# Quickstart: Correção de Bugs do Módulo de Compras

**Branch**: `006-fix-compras-bugs` | **Date**: 2026-01-25

## Overview

Este documento fornece um guia rápido para implementar as correções de bugs do módulo de compras.

---

## Pré-requisitos

- Node.js 24.x
- Acesso ao Supabase Dashboard (para migrations)
- Conta de teste: `comprador_compras_e_manutencao_teste@garageinn.com` / `Teste123!`

---

## Arquivos a Modificar

### 1. RLS Policy (Supabase)

**Arquivo**: Nova migration em `supabase/migrations/`
**Conteúdo**: Ver `contracts/rls-policies.sql`

```bash
# Aplicar migration via Supabase CLI
supabase migration new fix_compras_rls
# Copiar conteúdo de contracts/rls-policies.sql
supabase db push
```

---

### 2. Status Refresh (P1)

**Arquivo**: `apps/web/src/app/(app)/chamados/compras/[ticketId]/components/ticket-actions.tsx`

```typescript
// Adicionar import
import { useRouter } from 'next/navigation';

// No componente
const router = useRouter();

// Após changeTicketStatus bem-sucedido
router.refresh();
```

---

### 3. Filtro de Chamados para Comprador (P2)

**Arquivo**: `apps/web/src/app/(app)/chamados/actions.ts`

```typescript
// Em getHubTickets ou função equivalente
const isComprador = userRoles.some(r =>
  r.roleName === 'Comprador' &&
  ['Compras', 'Manutenção'].includes(r.departmentName)
);

if (isComprador) {
  query = query.eq('status', 'approved');
}
```

---

### 4. Filtro de Departamentos (P2)

**Arquivo**: `apps/web/src/app/(app)/chamados/actions.ts`

```typescript
// Em getDepartments
if (isComprador) {
  return supabase
    .from('departments')
    .select('id, name')
    .in('name', ['Compras', 'Manutenção']);
}
```

---

### 5. Criação de Chamados TI (P2)

**Arquivo**: `apps/web/src/app/(app)/chamados/ti/novo/page.tsx`

```typescript
// REMOVER este bloco:
const access = await getTiAccessContext();
if (!access.canAccess) {
  return <AccessDenied />;
}
```

---

### 6. Máscaras de Input (P3)

**Arquivo**: `apps/web/src/app/(app)/chamados/compras/[ticketId]/components/ticket-quotations.tsx`

```typescript
// Funções de formatação
function formatCNPJ(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18);
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 10) {
    return digits.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  }
  return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
}

function formatCurrency(value: string): string {
  const number = parseFloat(value.replace(/\D/g, '')) / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(number || 0);
}

// Validação CNPJ
function isValidCNPJ(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, '');
  return digits.length === 14;
}
```

---

### 7. Ctrl+Enter Comentários (P3)

**Arquivo**: `apps/web/src/app/(app)/chamados/compras/[ticketId]/components/ticket-comments.tsx`

```typescript
function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
  if (e.ctrlKey && e.key === 'Enter') {
    e.preventDefault();
    if (comment.trim()) {
      handleSubmit();
    }
  }
}

// No Textarea
<Textarea onKeyDown={handleKeyDown} ... />
```

---

### 8. Labels PT-BR no Histórico (P3)

**Arquivo**: `apps/web/src/app/(app)/chamados/compras/[ticketId]/components/ticket-timeline.tsx`

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

// Usar no render
<span>{actionLabels[item.action] || item.action}</span>
```

---

## Ordem de Implementação Recomendada

1. **RLS Policy** (desbloqueia fluxo de cotações)
2. **Status Refresh** (feedback visual imediato)
3. **Filtro de Chamados** + **Filtro Departamentos** (podem ser feitos juntos)
4. **Criação TI** (independente)
5. **Máscaras** + **Ctrl+Enter** + **Labels PT-BR** (UX improvements)

---

## Testes Manuais

### Teste 1: Cotação
1. Login como comprador
2. Acessar chamado aprovado
3. Adicionar cotação → deve salvar sem erro RLS

### Teste 2: Status
1. Clicar "Iniciar Cotação"
2. Status deve mudar na UI sem refresh manual

### Teste 3: Filtro
1. Login como comprador
2. Hub deve mostrar apenas chamados "Aprovado"
3. Filtro departamento deve ter apenas "Compras" e "Manutenção"

### Teste 4: TI
1. Login como comprador
2. Acessar `/chamados/ti/novo`
3. Deve conseguir criar chamado

### Teste 5: Máscaras
1. Digitar CNPJ → deve formatar automaticamente
2. Digitar telefone → deve formatar automaticamente
3. Digitar preço → deve formatar como R$

### Teste 6: Comentário
1. Digitar comentário
2. Pressionar Ctrl+Enter → deve enviar

### Teste 7: Histórico
1. Alterar status de chamado
2. Ver histórico → deve mostrar "Status alterado" (não "status_change")
