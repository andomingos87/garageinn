# Análise sistêmica: Acesso negado após gerente de operações aprovar chamado

**Contexto:** Gerente de Operações aprova chamado TI (ou outro tipo com fluxo de aprovação Operações) e, após a aprovação, a página de detalhe exibe "Acesso Negado" (página de bloqueio).

**Comando:** Entenda o erro de forma sistêmica — escopo completo, fluxo, outros pontos afetados, correção global/estrutural, risco de regressão. **Não aplicar correção.**

---

## 1. Mapeamento do escopo completo afetado

### 1.1 Onde o bloqueio acontece

| Área | Arquivo / função | Como o acesso é decidido |
|------|------------------|---------------------------|
| **TI** | `apps/web/src/app/(app)/chamados/ti/actions.ts` → `canAccessTiTicketDetail(ticketId)` | **Status-dependente:** usuário sem acesso à área TI só vê o detalhe se for criador OU se for aprovador de Operações **e** o status do chamado estiver em `awaiting_approval_encarregado`, `awaiting_approval_supervisor` ou `awaiting_approval_gerente`. Foi adicionada exceção para `awaiting_triage` quando o nível do aprovador é 3 (Gerente). |
| **TI** | `apps/web/src/app/(app)/chamados/ti/[ticketId]/page.tsx` | Chama `canAccessTiTicketDetail`; se `false` → renderiza `<AccessDenied />`. Em seguida chama `getTiTicketDetail` (que repete o mesmo `canAccess` e retorna `null` se sem acesso). |
| **Compras** | `apps/web/src/app/(app)/chamados/compras/actions.ts` → `getTicketDetails` + `buildPurchaseVisibilityFilter()` | Acesso não é por status do chamado para aprovador Operações; é por **unidades** (`allowedUnitIds`). Se o usuário for de Operações com papel restrito a unidades e tiver `allowedUnitIds = []` (ex.: Gerente sem unidades), recebe `accessDenied: true` antes mesmo de considerar status. `excludedStatuses` só afeta Assistente de Compras. |
| **Manutenção** | `getTicketDetails` | Não há checagem explícita de acesso no app; depende de RLS. Se RLS permitir (ex.: política por criador/departamento), o ticket é retornado. Não há lógica “perde acesso quando status muda”. |
| **RH / Sinistros / Financeiro / Comercial** | Respectivos `getTicketDetails` ou páginas de detalhe | Acesso à área (ex.: `checkCanAccessFinanceiro`) ou RLS. Nenhum ponto encontrado que revogue acesso ao detalhe quando o status muda após aprovação. |

Conclusão de escopo: o **comportamento “aprova e cai na página de bloqueio”** está implementado de forma explícita e status-dependente **apenas em TI**, na função `canAccessTiTicketDetail`. Em Compras o bloqueio pode ocorrer por outro motivo (filtro por unidade para Operações), não por transição de status.

### 1.2 Por que o mesmo erro pode “reaparecer” com outro ticket

- **Código em produção:** Se a correção (permitir `awaiting_triage` para nível 3) não estiver deployada em `garageinn.vercel.app`, qualquer novo ticket TI aprovado pelo gerente de operações continuará caindo em "Acesso Negado".
- **Resolução de cargo/nível:** Se em algum ambiente ou caso `getOperacoesApproverRole()` ou `getApprovalLevelForRole()` não retornar "Gerente" / 3 (ex.: nome do cargo diferente, múltiplos papéis, join departamento errado), a exceção `approverLevel === 3` não se aplica e o acesso continua negado após `awaiting_triage`.
- **Cache / revalidação:** Se a página for servida em cache ou a revalidação após a action de aprovação não rodar no mesmo request que renderiza o detalhe, o usuário pode ainda ver a decisão antiga (sem acesso).

---

## 2. Análise lógica do fluxo completo relacionado ao bug

### 2.1 Fluxo de aprovação Operações em chamados TI

1. Chamado TI é criado por usuário de Operações (Manobrista, Encarregado, Supervisor) → status inicia em um dos `awaiting_approval_*` conforme hierarquia.
2. Encarregado/Supervisor/Gerente de Operações acessa o detalhe do chamado TI porque `canAccessTiTicketDetail` retorna `true`: status está em `statusToLevel` e `ticketLevel >= approverLevel`.
3. Gerente clica em Aprovar e confirma → Server Action atualiza `ticket_approvals` e o status do `tickets` para `awaiting_triage`.
4. A página é re-renderizada (ou o usuário permanece na mesma URL). Na renderização, `canAccessTiTicketDetail` é chamado de novo.
5. Agora `ticket.status === 'awaiting_triage'`. No código original não havia regra para isso → `ticketLevel` fica `undefined` → a condição `ticketLevel && ticketLevel >= approverLevel` falha → retorno `false` → **Acesso Negado**.

A correção pontual foi: além dos status de aprovação, permitir acesso quando `ticket.status === 'awaiting_triage'` e `approverLevel === 3`. Isso cobre apenas o Gerente e apenas o estado imediatamente após a última aprovação.

### 2.2 Consistência com a camada de dados (RLS)

- Política `tickets_select_operacoes_creator`: o gerente de Operações pode fazer SELECT em `tickets` onde `is_operacoes_gerente()` e `is_operacoes_creator(created_by)`. **Não há condição sobre status.**
- Ou seja: no banco, o gerente **não** perde acesso ao ticket quando o status muda para `awaiting_triage`. Quem revoga o acesso é **somente** a regra de aplicação em `canAccessTiTicketDetail`, baseada em status.

Isso mostra uma **inconsistência de modelo**: RLS trata acesso por “criador do chamado (linha Operações) + papel do usuário (Gerente Operações)”; a aplicação trata acesso por “status atual do chamado”. Qualquer novo status futuro (ex.: em triagem, em execução, fechado) exigiria novo “if” se continuarmos com a abordagem status-dependente.

---

## 3. Outros pontos do código com o mesmo tipo de problema

### 3.1 Acesso ao detalhe baseado em status (padrão de risco)

- **Único ponto identificado com “perde acesso quando status sai de um conjunto”:** `canAccessTiTicketDetail` para aprovadores de Operações (status `awaiting_approval_*` + exceção `awaiting_triage` para nível 3).
- **Compras:** O bloqueio para Operações vem de `buildPurchaseVisibilityFilter()` (unidades), não de status. Porém, se no futuro alguém adicionar `excludedStatuses` para perfis de Operações (ex.: “Assistente Operações não vê awaiting_triage”), o mesmo padrão “status = bloqueio” apareceria.
- **Listas de chamados:** Em TI, a lista é filtrada por `ensureTiAccess()`; aprovadores de Operações não têm acesso à lista, só ao detalhe quando o chamado está no fluxo de aprovação. Ou seja, a “janela de acesso” já é status-dependente também na lista (indiretamente, pois o detalhe é que é status-dependente).

### 3.2 Duplicação de regras status → nível

O mapeamento `status → nível de aprovação` aparece em vários arquivos, sempre com o mesmo conjunto de status:

- `chamados/ti/actions.ts` (canAccessTiTicketDetail e lógica de aprovação)
- `chamados/ti/components/ti-ticket-status.tsx`
- `chamados/rh/[ticketId]/components/rh-ticket-approvals.tsx`
- `chamados/sinistros/[ticketId]/components/claim-approvals.tsx`
- `chamados/manutencao/[ticketId]/components/ticket-approvals.tsx`
- etc.

Qualquer mudança de fluxo (novo status, novo nível) exige atualizar vários arquivos e aumenta o risco de esquecer a regra de **acesso ao detalhe** em TI.

### 3.3 Possível bug análogo em Compras (por unidade, não por status)

Para Gerente de Operações **sem** unidades vinculadas, `buildPurchaseVisibilityFilter()` pode retornar `allowedUnitIds = []` (por ter papel “restrito a unidades” mas lista vazia). Aí `getTicketDetails` retorna `{ accessDenied: true }` mesmo para chamados que o gerente acabou de aprovar. É outro cenário de “aprova e depois não vê”, mas a causa é **unidade**, não status.

---

## 4. Proposta de correção global/estrutural (não patch local)

### 4.1 Princípio: acesso por participação, não por status

- **Regra desejada:** Quem pode ver o detalhe do chamado é quem **participa** dele: criador, responsável (assigned_to), aprovador (presente em `ticket_approvals` como aprovador em qualquer nível) ou quem tem acesso à área do departamento do chamado (ex.: TI, Compras). O acesso **não** deve ser revogado quando o status muda (ex.: de `awaiting_approval_gerente` para `awaiting_triage`).
- **Alinhamento com RLS:** A política `tickets_select_operacoes_creator` já segue esse espírito (gerente vê tickets cujo criador é de linha Operações), sem olhar status. A aplicação deve seguir o mesmo critério para evitar “aprova e bloqueia”.

### 4.2 Opções de desenho (sem implementar)

**Opção A – Acesso por “criador + papel” (espelho do RLS)**  
- Para aprovador de Operações: permitir acesso ao detalhe do chamado TI (e, se aplicável, outros tipos) quando `is_operacoes_creator(ticket.created_by)` for verdadeiro, **independentemente do status**.  
- Remove a dependência de status em `canAccessTiTicketDetail` para Operações; pode-se manter checagem de departamento (ex.: só TI) se a regra de negócio for “Operações aprova apenas chamados TI (ou TI + outros)”.

**Opção B – Acesso por “participação em aprovações”**  
- Permitir acesso ao detalhe se o usuário atual constar em `ticket_approvals` para esse `ticket_id` (como `approved_by` ou como aprovador do nível correspondente ao seu papel), **independentemente do status**.  
- Reflete “quem aprovou ou pode aprovar continua podendo ver”.

**Opção C – Unificar em um único “can access ticket detail” por tipo**  
- Criar uma função (ou módulo) por tipo de chamado (TI, Compras, etc.) que centralize: criador, assigned_to, aprovador em `ticket_approvals`, acesso à área por departamento e, se necessário, unidade. Status não entra como critério de revogação de acesso ao detalhe.  
- Reduz duplicação e evita novos “ifs” por status.

Recomendação conceitual: **Opção A ou B**, com evolução para **Opção C** para não repetir o mesmo padrão em outros tipos (Compras, Manutenção, etc.).

### 4.3 O que evitar

- **Não** continuar com “mais um if” para cada novo status (ex.: “se status = in_progress e era aprovador, deixa ver”). Isso mantém o bug latente para qualquer novo status ou tipo de chamado.
- **Não** tratar só o Gerente e `awaiting_triage`: Encarregado e Supervisor também podem aprovar e em seguida o status muda; se no futuro eles ganharem acesso a outros tipos além de TI, o mesmo problema pode aparecer.

---

## 5. Avaliação de risco de regressão

### 5.1 Se corrigirmos só em TI com “awaiting_triage + nível 3”

- **Risco:** Baixo para o cenário “Gerente aprova TI e continua vendo”.  
- **Limitação:** Qualquer outro status pós-aprovação (ex.: triagem, em execução) ou outro nível de aprovador (Encarregado/Supervisor) em outro tipo de chamado pode exigir novo patch.  
- **Regressão:** Pouco provável que usuários que hoje não veem o ticket passem a ver indevidamente, pois a condição é restrita (Operações + nível 3 + status específico).

### 5.2 Se mudarmos para “acesso por participação” (Opção A ou B)

- **Risco:** Médio. Gerente de Operações passaria a ver **todos** os chamados TI cujo criador é de linha Operações, em **qualquer** status (triagem, em andamento, fechado), não só durante e logo após a aprovação.  
- **Produto:** Precisa ser validado se “gerente de Operações pode ver histórico de chamados TI que aprovou (ou cujo criador é de Operações)” é desejado.  
- **Regressão:** Possível ampliação de visibilidade; não redução. RLS já permite esse SELECT; a aplicação hoje restringe mais do que o banco.

### 5.3 Compras (Gerente Operações sem unidades)

- Qualquer mudança em `buildPurchaseVisibilityFilter()` ou em `getTicketDetails` para tratar “aprovador Operações sem unidades” pode alterar quem vê lista/detalhe de chamados de Compras. Recomenda-se tratar em conjunto com a regra de negócio “aprovador de Operações vê chamados de Compras que aprovou ou que estão no fluxo de aprovação”, e testar com usuário Gerente Operações sem unidades.

---

## 6. Resumo

| Item | Conclusão |
|------|-----------|
| **Escopo do bug** | Acesso ao detalhe do chamado TI revogado após o gerente de Operações aprovar, por regra **status-dependente** em `canAccessTiTicketDetail`. Compras pode bloquear por **unidade** (allowedUnitIds vazio), não por status. |
| **Fluxo** | Aprovação → status vira `awaiting_triage` → re-render chama `canAccessTiTicketDetail` → regra antiga não contempla esse status → retorno false → AccessDenied. RLS não revoga acesso. |
| **Outros pontos** | Mesmo padrão “acesso atado a status”: só TI (canAccessTiTicketDetail). Duplicação de status→nível em vários componentes. Compras: risco de bloqueio por unidade para Gerente Operações. |
| **Correção estrutural** | Definir acesso ao detalhe por **participação** (criador, aprovador, responsável, acesso à área), não por status; alinhar app ao RLS e centralizar regras (por tipo) para evitar novos “ifs” por status. |
| **Risco de regressão** | Patch “awaiting_triage + nível 3”: baixo. Mudança para “sempre que criador for Operações linha”: médio (mais visibilidade); validar com produto. |

**Próximos passos sugeridos (fora do escopo desta análise):**  
1) Confirmar se a correção atual (awaiting_triage + approverLevel === 3) está em produção; 2) Validar com produto a regra “gerente de Operações vê todos os chamados TI cujo criador é de Operações, em qualquer status”; 3) Se aprovado, implementar Opção A (ou B) e evoluir para Opção C; 4) Revisar Compras para Gerente Operações sem unidades.
