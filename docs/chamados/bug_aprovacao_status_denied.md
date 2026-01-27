# Mapeamento: falha ao negar aprovacao

Data: 2026-01-26

## Erro observado

- Mensagem: "Aprovacao registrada, mas falha ao atualizar status do chamado".
- Contexto reportado: gerente de operacoes negou o chamado #51 (Compras).
- Efeito: a linha de aprovacao e gravada, mas o status do chamado nao muda.

## Escopo afetado (fluxo comum)

O mesmo padrao de aprovacao existe em varios modulos e reaproveita a mesma
logica de RLS e constraints do banco:

- TI: `apps/web/src/app/(app)/chamados/ti/actions.ts`
- Compras: `apps/web/src/app/(app)/chamados/compras/actions.ts`
- Manutencao: `apps/web/src/app/(app)/chamados/manutencao/actions.ts`
- RH: `apps/web/src/app/(app)/chamados/rh/actions.ts`
- Sinistros: `apps/web/src/app/(app)/chamados/sinistros/[ticketId]/actions.ts`
- Financeiro: `apps/web/src/app/(app)/chamados/financeiro/actions.ts`

## Fluxo logico (alto nivel)

1. UI de aprovacao chama a action server-side.
2. A action atualiza `ticket_approvals.status` com a decisao.
3. Se a decisao for negativa, tenta atualizar `tickets.status = 'denied'`.
4. A segunda atualizacao falha (RLS/constraint), gerando a mensagem de erro.

## Banco de dados (status e regras)

### Constraints (estado atual)

- `ticket_approvals.status` permite: `pending`, `approved`, `denied`
  - Fonte: `docs/database/migrations/001_create_tables.sql` (tabela base)
- `tickets.status` permite: inclui `denied` e **nao inclui** `rejected`
  - Fonte: `supabase/migrations/20260126170000_update_tickets_status_check.sql`

### Policy RLS relevante (ponto de conflito)

O policy `tickets_update_approver` ainda valida o status negativo como
`rejected`, que nao existe no constraint atual de `tickets.status`:

```sql
-- supabase/migrations/20260125203030_fix_rls_approval_policies.sql
WITH CHECK (
  is_admin()
  OR (
    can_approve_ticket(id, auth.uid())
    AND status IN (
      'awaiting_approval_supervisor',
      'awaiting_approval_gerente',
      'awaiting_triage',
      'rejected'
    )
  )
);
```

Resultado: quando a action tenta gravar `tickets.status = 'denied'`, a policy
nega o update. Se a action tentasse gravar `rejected`, o update falharia por
constraint. Ou seja: o fluxo fica bloqueado em ambos os casos.

## Codigo (camadas que usam `denied`)

As actions de aprovacao nos modulos acima gravam `ticket_approvals.status` e,
em decisao negativa, definem `tickets.status = 'denied'`. Exemplo:

```ts
// apps/web/src/app/(app)/chamados/ti/actions.ts
if (decision === "denied") {
  await supabase.from("tickets").update({ status: "denied", ... });
}
```

As telas de aprovacao (UI) tambem exibem o status negativo como `denied`.

## Outros usos de `rejected` (nao ticket.status)

`rejected` aparece em outros contextos e nao deve ser confundido com
`tickets.status`:

- Compras internas de sinistros: `apps/web/src/app/(app)/chamados/sinistros/constants.ts`
- Cotações de compras internas: `apps/web/src/app/(app)/chamados/sinistros/[ticketId]/components/claim-purchases.tsx`
- Resolucao comercial: `apps/web/src/app/(app)/chamados/comercial/constants.ts`
- Cotações (schema antigo): `docs/database/migrations/001_create_tables.sql`

Esses usos sao validos para **outras entidades**, mas aumentam o risco de
misturar nomenclaturas no fluxo de tickets.

## Hipotese central do bug

Existe uma divergencia estrutural entre:

- **Banco (constraints)**: `denied`
- **Policies RLS de aprovacao**: ainda usam `rejected`
- **Codigo (actions/UI)**: usa `denied`

Essa divergencia causa falha sistematica em qualquer negacao de aprovacao,
independente do modulo.

## Proposta de correcao global (sem implementar)

1. **Padronizar `denied`** como termo canonico para `tickets.status` e
   `ticket_approvals.status`.
2. **Atualizar as policies RLS** para permitir `denied` em
   `tickets_update_approver` (e remover `rejected`).
3. **Auditar todo o codigo** para remover usos de `rejected` relacionados a
   tickets/aprovacoes (manter apenas em entidades que realmente usem isso).
4. **Centralizar a definicao de status** (constantes + tipos gerados do schema)
   para evitar drift entre UI, actions e banco.
5. **Revisar documentacao** (`docs/statuses.md`, `docs/database/schema.md`)
   para alinhar o termo usado.

## Risco de regressao

- Alterar RLS pode abrir ou restringir updates em `tickets` para perfis
  aprovadores; exige teste com perfis reais (encarregado, supervisor, gerente).
- Mudancas em nomenclatura podem quebrar relatorios, filtros e badges se
  alguma tela ainda esperar `rejected`.
- Qualquer workflow que use `rejected` fora do contexto de tickets deve ser
  preservado para evitar regressao semantica.

## Fontes consultadas

- `supabase/migrations/20260125203030_fix_rls_approval_policies.sql`
- `supabase/migrations/20260126170000_update_tickets_status_check.sql`
- `docs/database/migrations/001_create_tables.sql`
- `docs/database/schema.md`
- `docs/statuses.md`
- Actions de aprovacao em `apps/web/src/app/(app)/chamados/*/actions.ts`
