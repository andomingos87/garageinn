# Bug Report: Aprovacao do Supervisor Falha Silenciosamente

**Data:** 2026-01-25
**Ticket de Referencia:** #42
**Severidade:** CRITICA
**Status:** RESOLVIDO

## Resolucao

**Data da Correcao:** 2026-01-25
**Branch:** `008-fix-rls-approval`
**Migration:** `20260125203030_fix_rls_approval_policies.sql`

### Correcoes Aplicadas

1. **Banco de Dados (RLS)**:
   - Criada funcao `get_user_operacoes_role_name()` - retorna o cargo do usuario em Operacoes
   - Criada funcao `can_approve_ticket()` - verifica se usuario pode aprovar baseado em `approval_role`
   - Criada politica `ticket_approvals_update_approver` - permite UPDATE em aprovacoes
   - Criada politica `tickets_update_approver` - permite UPDATE em tickets para aprovadores

2. **Aplicacao (Server Actions)**:
   - Modificado `handleApproval()` para verificar se UPDATE afetou linhas
   - Adicionada mensagem de erro especifica quando RLS bloqueia silenciosamente

### Validacao

Todos os 7 cenarios de aprovacao devem funcionar apos a correcao:
- Manobrista -> Encarregado -> Supervisor -> Gerente
- Encarregado -> Supervisor -> Gerente
- Supervisor -> Gerente
- Gerente -> direto para triagem

---

---

## Resumo Executivo

Ao aprovar um chamado de compras como Supervisor de Operacoes, o sistema exibe mensagem de sucesso ("toast success"), porem o banco de dados **NAO e atualizado**. O status do ticket permanece inalterado e o botao de aprovar continua disponivel.

---

## Sintomas Observados

1. Supervisor clica em "Aprovar" no chamado #42
2. Dialog de confirmacao aparece corretamente
3. Ao confirmar, toast exibe "Chamado aprovado" (sucesso)
4. **POREM:** Status continua `awaiting_approval_supervisor`
5. **POREM:** Botao "Aprovar" permanece disponivel
6. **POREM:** Registro de aprovacao no banco continua `pending`

---

## Evidencias do Banco de Dados

### Estado do Ticket #42

| Campo | Valor |
|-------|-------|
| ticket_number | 42 |
| status | `awaiting_approval_supervisor` |
| created_by | Teste Encarregado - Operacoes |
| creator_ops_level | 2 (Encarregado) |
| updated_at | Igual a created_at (nunca atualizado) |

### Estado das Aprovacoes

| approval_level | approval_role | status | approved_by | decision_at |
|----------------|---------------|--------|-------------|-------------|
| 1 | Supervisor | `pending` | NULL | NULL |
| 2 | Gerente | `pending` | NULL | NULL |

**Observacao Critica:** Ambas aprovacoes ainda estao `pending` com `approved_by = NULL`, confirmando que o UPDATE **nunca foi executado** no banco.

---

## Analise da Causa Raiz

### O Problema: Inconsistencia entre `approval_level` e Mapeamento de Status

O sistema possui uma inconsistencia fundamental entre dois conceitos:

1. **`approval_level`** (posicao relativa): Indica a ordem sequencial das aprovacoes
   - Para tickets criados por Encarregado: Supervisor = 1, Gerente = 2
   - Para tickets criados por Manobrista: Encarregado = 1, Supervisor = 2, Gerente = 3

2. **Mapeamento nas politicas RLS** (hierarquia absoluta): Assume nivel fixo por cargo
   - Level 1 = Encarregado
   - Level 2 = Supervisor
   - Level 3 = Gerente

### Funcao `can_approve_ticket` - O Ponto de Falha

```sql
-- Trecho da funcao can_approve_ticket (RLS Policy)
v_expected_status := CASE v_approval_level
  WHEN 1 THEN 'awaiting_approval_encarregado'
  WHEN 2 THEN 'awaiting_approval_supervisor'
  WHEN 3 THEN 'awaiting_approval_gerente'
  ELSE 'unknown'
END;

IF v_ticket_status <> v_expected_status THEN
  RETURN FALSE;  -- BLOQUEIA A APROVACAO
END IF;
```

### Demonstracao do Bug com Dados Reais

Para o chamado #42 (criado por Encarregado):

| approval_level | approval_role | ticket_status | expected_status_by_level | MATCH? |
|----------------|---------------|---------------|--------------------------|--------|
| 1 | Supervisor | `awaiting_approval_supervisor` | `awaiting_approval_encarregado` | **FALSE** |
| 2 | Gerente | `awaiting_approval_supervisor` | `awaiting_approval_supervisor` | TRUE |

**Resultado:** A funcao `can_approve_ticket` retorna `FALSE` para o Supervisor porque:
- `approval_level = 1` mapeia para `awaiting_approval_encarregado`
- Mas o ticket esta em `awaiting_approval_supervisor`
- O check `v_ticket_status <> v_expected_status` falha

### Por que o Toast Mostra Sucesso?

O fluxo da aplicacao:

```
1. Frontend chama handleApproval()
2. handleApproval() executa:

   const { error } = await supabase
     .from("ticket_approvals")
     .update({...})
     .eq("id", approvalId);

3. Supabase com RLS:
   - Avalia politica ticket_approvals_update
   - Chama can_approve_ticket() -> retorna FALSE
   - UPDATE afeta 0 linhas (RLS silenciosamente bloqueia)
   - NAO retorna erro (comportamento padrao do PostgreSQL/Supabase)

4. Como error = null, codigo assume sucesso
5. Toast exibe "Chamado aprovado"
```

**Comportamento do Supabase/PostgreSQL:** Quando RLS bloqueia um UPDATE, ele simplesmente nao atualiza nenhuma linha, mas NAO gera erro. O cliente recebe sucesso com 0 linhas afetadas.

---

## Politica RLS Afetada

### `tickets_update_approver`

```sql
(EXISTS ( SELECT 1
   FROM ticket_approvals ta
  WHERE ((ta.ticket_id = tickets.id) AND (ta.approval_level =
        CASE tickets.status
            WHEN 'awaiting_approval_encarregado'::text THEN 1
            WHEN 'awaiting_approval_supervisor'::text THEN 2
            WHEN 'awaiting_approval_gerente'::text THEN 3
            ELSE NULL::integer
        END) AND ...)))
```

**Mesmo problema:** A politica mapeia `awaiting_approval_supervisor` para `approval_level = 2`, mas para tickets de Encarregado, o Supervisor tem `approval_level = 1`.

---

## Escopo do Impacto

### Cenarios Afetados

| Criador | Aprovador | approval_level | ticket_status | Funciona? |
|---------|-----------|----------------|---------------|-----------|
| Manobrista | Encarregado | 1 | `awaiting_approval_encarregado` | SIM |
| Manobrista | Supervisor | 2 | `awaiting_approval_supervisor` | SIM |
| Manobrista | Gerente | 3 | `awaiting_approval_gerente` | SIM |
| **Encarregado** | **Supervisor** | **1** | `awaiting_approval_supervisor` | **NAO** |
| **Encarregado** | **Gerente** | **2** | `awaiting_approval_gerente` | **NAO** |
| **Supervisor** | **Gerente** | **1** | `awaiting_approval_gerente` | **NAO** |

**Conclusao:** O bug afeta TODOS os tickets criados por usuarios com cargo acima de Manobrista.

---

## Arquivos e Componentes Envolvidos

### Banco de Dados (Supabase)

1. **Funcao `can_approve_ticket`**
   - Usa `approval_level` para calcular status esperado
   - Mapeamento incorreto para aprovacoes de cargos superiores

2. **Politica RLS `tickets_update_approver`**
   - Mesmo mapeamento incorreto de `approval_level` para status

3. **Politica RLS `ticket_approvals_update`**
   - Depende de `can_approve_ticket`

### Aplicacao (Next.js)

4. **`actions.ts` - `handleApproval`**
   - Nao verifica se o UPDATE afetou linhas
   - Assume sucesso quando `error = null`

---

## Correcoes Ja Aplicadas (Parciais)

As seguintes correcoes foram aplicadas na camada de aplicacao, mas o problema persiste na camada de banco:

1. **`ticket-approvals.tsx`**: `canApproveLevel` agora usa `approval_role` em vez de `approval_level`
2. **`handleApproval`**: `nextStatusByRole` agora usa `approval_role` em vez de `approval_level`
3. **`page.tsx`**: `getUserRole` agora filtra por departamento Operacoes

**Estas correcoes nao resolvem o problema porque a camada RLS do banco ainda bloqueia o UPDATE.**

---

## Solucao Proposta

### Opcao 1: Corrigir Funcoes RLS para usar `approval_role`

Modificar `can_approve_ticket` e politicas para comparar `approval_role` com o status do ticket:

```sql
-- Em vez de mapear approval_level
v_expected_role := CASE v_ticket_status
  WHEN 'awaiting_approval_encarregado' THEN 'Encarregado'
  WHEN 'awaiting_approval_supervisor' THEN 'Supervisor'
  WHEN 'awaiting_approval_gerente' THEN 'Gerente'
  ELSE NULL
END;

IF v_approval_role <> v_expected_role THEN
  RETURN FALSE;
END IF;
```

### Opcao 2: Verificar linhas afetadas na aplicacao

Adicionar verificacao no `handleApproval`:

```typescript
const { error, count } = await supabase
  .from("ticket_approvals")
  .update({...})
  .eq("id", approvalId)
  .select('id', { count: 'exact', head: true });

if (count === 0) {
  return { error: "Nao foi possivel processar a aprovacao. Verifique suas permissoes." };
}
```

### Recomendacao

**Aplicar ambas as opcoes:**
- Opcao 1 corrige a causa raiz
- Opcao 2 adiciona defesa em profundidade para futuros problemas de RLS

---

## Testes de Validacao Necessarios

Apos correcao, validar os seguintes cenarios:

1. [ ] Manobrista cria ticket -> Encarregado aprova -> status muda para `awaiting_approval_supervisor`
2. [ ] Manobrista cria ticket -> Supervisor aprova -> status muda para `awaiting_approval_gerente`
3. [ ] Manobrista cria ticket -> Gerente aprova -> status muda para `awaiting_triage`
4. [ ] **Encarregado cria ticket -> Supervisor aprova -> status muda para `awaiting_approval_gerente`**
5. [ ] **Encarregado cria ticket -> Gerente aprova -> status muda para `awaiting_triage`**
6. [ ] **Supervisor cria ticket -> Gerente aprova -> status muda para `awaiting_triage`**
7. [ ] Gerente cria ticket -> vai direto para `awaiting_triage` (sem aprovacoes)

---

## Conclusao

O bug e causado por uma inconsistencia fundamental no design do sistema de aprovacoes hierarquicas. O campo `approval_level` foi concebido como posicao relativa na cadeia de aprovacao, mas as politicas RLS e funcoes de autorizacao o tratam como hierarquia absoluta de cargos.

A correcao requer alteracao nas funcoes e politicas RLS do banco de dados para usar `approval_role` (nome do cargo) em vez de `approval_level` (posicao numerica) ao determinar se uma aprovacao e permitida.
