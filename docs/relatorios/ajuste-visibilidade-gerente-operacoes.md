# Ajuste de visibilidade e aprovações — Gerente de Operações

## Contexto
Atualmente, a visibilidade de chamados na lista geral está alinhada ao departamento do chamado e às políticas RLS por unidade/atribuição. Isso faz com que o Gerente de Operações **não veja** chamados abertos por usuários do departamento de Operações quando o chamado pertence a outro departamento (ex.: Compras, RH, TI).

O requisito correto é: o Gerente de Operações deve ver **todos os chamados abertos por usuários do departamento de Operações** (manobristas, encarregados e supervisores), **independente do tipo/departamento do chamado**, e deve ser o **último nível de aprovação** desses chamados.

## Problema observado
- O gerente de operações enxerga apenas chamados que passam pelas regras atuais de visibilidade (ex.: criados por ele, atribuídos a ele, ou por unidade/department do ticket).
- Chamados abertos por manobristas/encarregados/supervisores de Operações, mas classificados em outros departamentos, **não aparecem**.
- O fluxo de aprovação não garante que o gerente seja o último nível para chamados criados por cargos do Operações.

## Requisito funcional (novo)
1. **Visibilidade por criador**: o gerente de operações deve ver todo chamado cujo `created_by` pertença ao departamento **Operações** e tenha cargo **Manobrista**, **Encarregado** ou **Supervisor**, mesmo que o chamado seja de Compras/RH/TI/etc.
2. **Cadeia de aprovação**: quando o chamado é aberto por usuário desses cargos, o gerente de operações deve ser o **último aprovador** na cadeia.
3. **Independência do departamento do chamado**: o critério de visibilidade é **quem abriu** (departamento e cargo), não o departamento do ticket.

## Escopo técnico afetado
- **RLS e/ou views de tickets** (ex.: `tickets_with_details`) precisam incorporar o critério do **criador**.
- **Lógica de aprovações** (ex.: geração de `ticket_approvals` ou transições de status) deve garantir que o gerente seja o último nível quando o criador for Operações (manobrista/encarregado/supervisor).
- **Listas e ações** no front devem refletir corretamente os chamados visíveis via RLS/queries.

## Estratégia proposta (alto nível)
### 1) Regra de visibilidade baseada no criador
Criar uma regra reutilizável para determinar se um ticket deve ser visível ao Gerente de Operações com base no perfil do `created_by`:
- `created_by` pertence ao departamento **Operações**.
- O cargo (role) do criador está em `{Manobrista, Encarregado, Supervisor}`.

Implementação possível:
- **Opção A (RLS)**: nova policy de `SELECT` em `tickets` que permita o acesso quando o usuário logado for Gerente de Operações e o `created_by` atender à regra acima.
- **Opção B (view)**: incluir no `tickets_with_details` um campo calculado (ex.: `created_by_is_ops_chain`) e filtrar a consulta de acordo com o perfil.

### 2) Cadeia de aprovação
Garantir que a trilha de aprovações respeite:
- Para chamados abertos por Operações (manobrista/encarregado/supervisor), a sequência termina com **Gerente de Operações**.
- Evitar depender do departamento do chamado para determinar o fluxo.

Implementação possível:
- Ajustar a função/trigger responsável por criar entradas em `ticket_approvals`.
- Se a criação de aprovações estiver no app, garantir a regra no `createTicket`/`getApprovals` equivalente.

## Considerações de dados
- Verificar se usuários de Operações têm **user_roles** corretos (departamento + cargo).
- Garantir que o `created_by` tenha vínculo com `profiles` e `user_roles` corretamente.
- Manter compatibilidade com chamados existentes (não quebrar consultas).

## Critérios de aceite
1. Um Gerente de Operações vê na lista geral todos os chamados criados por manobristas, encarregados e supervisores de Operações, mesmo que o chamado seja de outro departamento.
2. Chamados criados por Operações exibem o Gerente como **última etapa** de aprovação.
3. Chamados abertos por outros departamentos **não são expostos** ao gerente, a menos que outra regra de visibilidade permita.
4. Nenhum usuário fora do perfil Gerente de Operações ganha visibilidade indevida.

## Plano de verificação
- Teste com usuário `gerente_operacoes_teste@garageinn.com`:
  - Criar chamados em diferentes departamentos com criadores de Operações (manobrista/encarregado/supervisor).
  - Confirmar visibilidade imediata na lista geral.
  - Confirmar que a última aprovação é do gerente.
- Teste de regressão:
  - Usuários fora do gerente não devem ver chamados extra.
  - Chamados de outros departamentos sem criador de Operações não devem aparecer para o gerente.

## Impacto esperado
Melhora da governança operacional: o gerente passa a ter visão e controle final dos chamados originados da linha de Operações, independentemente do departamento alvo, alinhando o sistema ao processo real.
