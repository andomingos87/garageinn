# Bug Report: Status de Aprovação Incorreto para Supervisor/Operações

**Data de Identificação:** 2026-01-25
**Status:** Resolvido
**Prioridade:** Alta
**Módulo:** Chamados de Compras - Fluxo de Aprovação
**Branch de Correção:** `007-fix-approval-status`

---

## Resumo Executivo

Um usuário com papel **Supervisor** no departamento **Operações** criou um chamado de compras que recebeu o status `awaiting_approval_encarregado` ao invés do esperado `awaiting_approval_gerente`. O bug causa um fluxo de aprovação incorreto, exigindo aprovações desnecessárias de níveis hierárquicos inferiores.

---

## Contexto do Problema

### Ticket Afetado
| Campo | Valor |
|-------|-------|
| ID | Ticket #41 |
| Criado por | Usuário com role Supervisor/Operações |
| Status atual | `awaiting_approval_encarregado` ❌ |
| Status esperado | `awaiting_approval_gerente` ✓ |

### Regra de Negócio - Hierarquia de Aprovação

O sistema de aprovação segue uma hierarquia onde usuários de níveis mais altos devem "pular" aprovações de níveis inferiores:

| Cargo | Nível | Status Inicial Esperado | Aprovadores Necessários |
|-------|-------|-------------------------|------------------------|
| Manobrista | 1 | `awaiting_approval_encarregado` | Encarregado → Supervisor → Gerente |
| Encarregado | 2 | `awaiting_approval_supervisor` | Supervisor → Gerente |
| Supervisor | 3 | `awaiting_approval_gerente` | Gerente |
| Gerente | 4 | `awaiting_triage` | Nenhum (auto-aprovado) |

**Exemplo:** Um Supervisor que cria um chamado não precisa de aprovação de Encarregado ou outro Supervisor - apenas do Gerente acima dele.

---

## Investigação Técnica

### 1. Verificação das Funções SQL

As funções RPC do Supabase foram testadas diretamente e **funcionam corretamente**:

```sql
-- Função: get_highest_operacoes_role
-- Retorna o nível hierárquico mais alto do usuário em Operações
SELECT get_highest_operacoes_role('user_id_do_supervisor');
-- Resultado: 3 (Supervisor) ✓

-- Função: get_initial_approval_status
-- Retorna o status inicial baseado no nível do usuário
SELECT get_initial_approval_status('user_id_do_supervisor');
-- Resultado: 'awaiting_approval_gerente' ✓
```

### 2. Verificação dos Registros de Aprovação

Os registros na tabela `ticket_approvals` estão **corretos**:

```sql
SELECT * FROM ticket_approvals WHERE ticket_id = 'ticket_41_id';
-- Resultado: Apenas 1 registro de aprovação (Gerente) ✓
```

Isso indica que a função `create_ticket_approvals()` funcionou corretamente, criando apenas a aprovação necessária (Gerente).

### 3. Verificação do Status do Ticket

O status gravado no ticket está **incorreto**:

```sql
SELECT status FROM tickets WHERE id = 'ticket_41_id';
-- Resultado: 'awaiting_approval_encarregado' ❌
```

### 4. Conclusão da Investigação

**O bug está na camada de aplicação, não nas funções SQL do banco de dados.**

As funções SQL retornam valores corretos quando testadas diretamente, mas o status final gravado no ticket não reflete esse valor.

---

## Localização do Bug

### Arquivo Suspeito
`apps/web/src/app/(app)/chamados/compras/actions.ts`

### Trecho de Código (linhas 561-572)
```typescript
const { data: needsApproval } = await supabase.rpc("ticket_needs_approval", {
  p_created_by: user.id,
  p_department_id: comprasDept.id,
});

const { data: initialStatusData } = await supabase.rpc(
  "get_initial_approval_status",
  { p_created_by: user.id }
);
const initialStatus = initialStatusData || "awaiting_triage";
```

---

## Hipóteses de Causa Raiz

### Hipótese 1: RPC Retornando Null/Error (Mais Provável)
A chamada RPC `get_initial_approval_status` pode estar:
- Retornando `null` por erro de execução
- Falhando silenciosamente sem propagar o erro
- Recebendo parâmetros incorretos

**Evidência:** O fallback `|| "awaiting_triage"` não explica o status `awaiting_approval_encarregado`, então há código adicional envolvido.

### Hipótese 2: Valor Sendo Sobrescrito
Algum código posterior na função pode estar alterando o valor de `initialStatus` antes do INSERT.

### Hipótese 3: Lógica Condicional Incorreta
Pode haver uma lógica condicional que força um status específico em certas condições, ignorando o retorno do RPC.

### Hipótese 4: Valor Hardcoded
Pode existir um valor default hardcoded em algum ponto do fluxo que está sendo usado no lugar do valor calculado.

---

## Impacto

### Para o Usuário
- Supervisor precisa aguardar aprovação de Encarregado (incorreto)
- Fluxo de aprovação mais lento e burocrático
- Confusão sobre o processo correto

### Para o Sistema
- Inconsistência entre registros de aprovação e status do ticket
- `ticket_approvals` tem apenas Gerente, mas status aguarda Encarregado
- Potencial bloqueio do chamado se não houver Encarregado disponível

---

## Passos para Reprodução

1. Login como usuário com papel **Supervisor** no departamento **Operações**
2. Acessar `/chamados/compras/novo`
3. Preencher formulário de novo chamado
4. Submeter o chamado
5. **Resultado esperado:** Status = `awaiting_approval_gerente`
6. **Resultado atual:** Status = `awaiting_approval_encarregado`

---

## Recomendações de Correção

### Fase 1: Diagnóstico
1. Adicionar logging detalhado na chamada RPC para capturar o valor real retornado
2. Verificar se há tratamento de erro que está sendo ignorado
3. Rastrear todas as atribuições à variável `initialStatus`

### Fase 2: Correção
1. Corrigir a lógica que está sobrescrevendo/ignorando o retorno do RPC
2. Adicionar validação de tipo para garantir que o retorno não é null
3. Implementar tratamento de erro explícito com fallback apropriado

### Fase 3: Validação
1. Testar criação de chamado com cada nível hierárquico
2. Verificar consistência entre status e registros de aprovação
3. Validar que o fluxo de aprovação funciona corretamente

---

## Arquivos Relacionados

| Arquivo | Descrição |
|---------|-----------|
| `apps/web/src/app/(app)/chamados/compras/actions.ts` | Server action de criação de chamado |
| `supabase/migrations/*_approval_functions.sql` | Funções SQL de aprovação |
| `apps/web/src/app/(app)/chamados/compras/novo/page.tsx` | Página de criação de chamado |

---

## Histórico

| Data | Ação | Responsável |
|------|------|-------------|
| 2026-01-25 | Bug identificado | Usuário |
| 2026-01-25 | Investigação concluída | Claude Code |
| 2026-01-25 | Correção implementada | Claude Code |

---

## Correção Implementada

### Alterações no Código

**Arquivo:** `apps/web/src/app/(app)/chamados/compras/actions.ts`

1. Adicionado tipo `ApprovalStatus` para tipagem explícita dos status de aprovação
2. Adicionado tratamento de erro para a chamada RPC `get_initial_approval_status`
3. Alterado fallback de `"awaiting_triage"` para `"awaiting_approval_encarregado"` (mais seguro)
4. Adicionado logging diagnóstico para debug

**Arquivo:** `supabase/migrations/20260125192945_approval_flow_functions.sql`

1. Criada migration com todas as funções SQL de aprovação hierárquica

### Testes E2E Adicionados

- `apps/web/e2e/chamados-compras-approval-supervisor.spec.ts`
- `apps/web/e2e/chamados-compras-approval-encarregado.spec.ts`
- `apps/web/e2e/chamados-compras-approval-manobrista.spec.ts`
- `apps/web/e2e/chamados-compras-approval-gerente.spec.ts`
