# Data Model: Correção de Bugs do Módulo de Compras

**Branch**: `006-fix-compras-bugs` | **Date**: 2026-01-25

## Entities Overview

Este documento descreve as entidades existentes que são afetadas pelos bug fixes, não novas entidades.

---

## 1. ticket_quotations (Cotações)

### Current Schema
```sql
CREATE TABLE ticket_quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id),
  supplier_name TEXT NOT NULL,
  supplier_cnpj TEXT,
  supplier_contact TEXT,
  unit_price DECIMAL(10,2),
  total_price DECIMAL(10,2) NOT NULL,
  payment_terms TEXT,
  delivery_deadline DATE,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  is_selected BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Field Validations (Frontend)

| Field | Type | Validation | Mask |
|-------|------|------------|------|
| supplier_cnpj | TEXT | Formato XX.XXX.XXX/XXXX-XX | `##.###.###/####-##` |
| supplier_contact | TEXT | Telefone ou Email | `(##) #####-####` ou `(##) ####-####` |
| total_price | DECIMAL | Mínimo R$ 0,01, positivo | `R$ #.###,##` |
| unit_price | DECIMAL | Opcional, positivo | `R$ #.###,##` |

### RLS Policy Changes

**Current Policies**:
- SELECT: Authenticated users can read
- DELETE/UPDATE: Only admin

**New Policy Required**:
```sql
-- Compradores podem inserir cotações
CREATE POLICY "compradores_can_insert_quotations"
ON ticket_quotations
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    JOIN departments d ON ur.department_id = d.id
    WHERE ur.user_id = auth.uid()
    AND d.name IN ('Compras', 'Manutenção')
  )
);

-- Compradores podem atualizar suas próprias cotações
CREATE POLICY "compradores_can_update_own_quotations"
ON ticket_quotations
FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Compradores podem deletar suas próprias cotações
CREATE POLICY "compradores_can_delete_own_quotations"
ON ticket_quotations
FOR DELETE
TO authenticated
USING (created_by = auth.uid());
```

---

## 2. tickets (Chamados)

### Status Values Relevantes

| Status | Descrição | Visível para Comprador |
|--------|-----------|------------------------|
| `draft` | Rascunho | ❌ |
| `awaiting_triage` | Aguardando triagem | ❌ |
| `awaiting_approval_*` | Aguardando aprovação | ❌ |
| `approved` | Aprovado | ✅ **Único visível** |
| `quoting` | Em cotação | ✅ (após iniciar) |
| `in_progress` | Em andamento | ✅ (após iniciar) |
| `rejected` | Negado | ✅ (se negou) |
| `resolved` | Resolvido | ❌ |
| `closed` | Fechado | ❌ |

### Status Transitions (Comprador)

```
approved → quoting       (Iniciar Cotação)
quoting → in_progress    (Iniciar Andamento)
approved → rejected      (Negar)
quoting → rejected       (Negar)
```

---

## 3. ticket_history (Histórico)

### Action Labels Mapping

| action (DB) | Label (PT-BR) |
|-------------|---------------|
| `status_change` | Status alterado |
| `status_changed` | Status alterado |
| `comment_added` | Comentário adicionado |
| `quotation_added` | Cotação adicionada |
| `quotation_selected` | Cotação selecionada |
| `quotation_deleted` | Cotação removida |
| `approval_requested` | Aprovação solicitada |
| `approval_granted` | Aprovação concedida |
| `approval_denied` | Aprovação negada |
| `created` | Chamado criado |
| `assigned` | Chamado atribuído |
| `updated` | Chamado atualizado |

---

## 4. departments (Departamentos)

### Visibility Rules by Role

| Role | Departamentos Visíveis no Filtro |
|------|----------------------------------|
| Comprador | Compras, Manutenção |
| Analista TI | TI |
| Gerente TI | TI |
| Analista RH | RH |
| Gerente RH | RH |
| Admin/Diretor | Todos |

---

## 5. user_roles (Roles de Usuário)

### Query para Determinar Perfil de Comprador

```sql
SELECT
  r.name as role_name,
  d.name as department_name
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
JOIN departments d ON ur.department_id = d.id
WHERE ur.user_id = :user_id
AND d.name IN ('Compras', 'Manutenção')
AND r.name IN ('Comprador', 'Supervisor', 'Gerente');
```

---

## State Transitions Diagram

```
[Fluxo do Comprador]

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌──────────┐     ┌──────────┐     ┌─────────────┐         │
│  │ Aprovado │────▶│ Em       │────▶│ Em          │         │
│  │          │     │ Cotação  │     │ Andamento   │         │
│  └────┬─────┘     └────┬─────┘     └─────────────┘         │
│       │                │                                    │
│       │                │                                    │
│       ▼                ▼                                    │
│  ┌──────────────────────┐                                   │
│  │       Negado         │                                   │
│  └──────────────────────┘                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Validation Rules Summary

### CNPJ
- Formato: `XX.XXX.XXX/XXXX-XX`
- Apenas dígitos após remoção de máscara: 14 caracteres
- Validação: Formato apenas (não verificação em base externa)
- Bloqueio: Frontend impede envio se formato inválido

### Telefone
- Formatos aceitos:
  - Fixo: `(XX) XXXX-XXXX` (10 dígitos)
  - Celular: `(XX) XXXXX-XXXX` (11 dígitos)
- Validação: Formato durante digitação

### Preço
- Formato: `R$ X.XXX,XX`
- Mínimo: R$ 0,01
- Máximo: Sem limite
- Validação: Valor > 0 antes de envio
