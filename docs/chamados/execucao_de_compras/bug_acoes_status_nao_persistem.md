---
title: Bug - Ações de status não persistem (Compras)
created_at: 2026-01-25
status: draft
related_ticket: "#43"
page: /chamados/compras/cce5d845-0b55-4848-9df7-2dfe5aa1ecec
actor: comprador_compras_e_manutencao_teste@garageinn.com
---

# Resumo do problema
No chamado de compras `#43`, as ações **Iniciar Andamento** e **Iniciar Cotação** disparam toast de sucesso na interface, mas **não alteram o status do chamado** nem na UI nem no banco de dados. A ação **Negar** abre o modal corretamente, porém a mudança de status também não ocorre sem confirmação.

Este comportamento compromete o fluxo de execução de compras, pois o usuário recebe feedback positivo sem a efetiva transição de estado.

# Evidências do teste (Playwright + MCP Supabase)
- Login com usuário comprador e acesso ao chamado foi concluído com sucesso.
- Clique em **Iniciar Andamento** exibiu toast: “Status alterado para: Em Andamento”.
- O status visual permaneceu como **Aguardando Triagem**.
- Clique em **Iniciar Cotação** não refletiu mudança de status na UI.
- Consulta via MCP Supabase após os cliques:
  - `tickets.status` permaneceu `awaiting_triage`.
  - `ticket_number = 43`, `id = cce5d845-0b55-4848-9df7-2dfe5aa1ecec`.

# Passo a passo para reproduzir
1. Fazer login com:
   - email: `comprador_compras_e_manutencao_teste@garageinn.com`
   - senha: `Teste123!`
2. Acessar o chamado:
   - `http://localhost:3000/chamados/compras/cce5d845-0b55-4848-9df7-2dfe5aa1ecec`
3. Clicar em **Iniciar Andamento**.
4. Verificar status visual e transições disponíveis.
5. Clicar em **Iniciar Cotação**.
6. Confirmar o status no banco:
   - `select status from public.tickets where id = 'cce5d845-0b55-4848-9df7-2dfe5aa1ecec';`

# Resultado observado
- Toast indica sucesso, mas o status não muda.
- Botões disponíveis permanecem os mesmos.
- Banco de dados mantém status anterior.

# Resultado esperado
- O status do chamado deve ser atualizado no banco.
- A UI deve refletir imediatamente o novo status.
- O conjunto de botões deve atualizar conforme a nova transição.

# Escopo completo afetado (mapeamento sistêmico)
Este bug não é pontual e pode afetar **todas as transições de status no fluxo de compras** que utilizam a mesma ação de mudança de status.

Possíveis áreas impactadas:
- **Ações de status** em `TicketActions` (todas as transições disparadas por botão).
- **Fluxo de status** em `changeTicketStatus` (server action / API).
- **RLS / permissões** para update de `tickets`.
- **Cache / revalidação** do App Router (UI não atualiza após mudança).
- **Sincronia UI ↔ banco** (toast de sucesso sem persistência).

# Fluxo lógico relacionado (visão de processo)
1. Usuário clica em botão de ação.
2. UI chama `changeTicketStatus`.
3. Backend tenta persistir o novo status.
4. Backend retorna sucesso/erro.
5. UI mostra toast e atualiza o estado da página.

Falha potencial em qualquer ponto 3–5 pode gerar a inconsistência observada.

# Hipóteses de causa raiz (sem correção ainda)
1. **Falha silenciosa de persistência**: update rejeitado por RLS ou policy, mas tratado como sucesso no frontend.
2. **Mismatch de permissões**: usuário comprador não autorizado a transitar entre certos status.
3. **Mudança ocorre, mas UI não revalida**: resposta de sucesso sem re-fetch ou sem invalidar cache.
4. **Action retorna sucesso sem checar erro real**: `changeTicketStatus` pode estar engolindo erro ou retornando sucesso indevido.
5. **Regras de transição divergentes**: UI permite ação, mas backend bloqueia por regra diferente.

# Outros pontos potencialmente afetados
- Qualquer botão que use a mesma action: **Aprovar**, **Executar Compra**, **Enviar para Entrega**, **Confirmar Entrega**, **Avaliar Entrega**, **Fechar**.
- Fluxos onde a UI se baseia apenas no toast, sem validação do estado persistido.

# Risco de regressão
Correções locais (ex.: alterar apenas um botão) podem mascarar falhas sistêmicas.
O risco é **alto** se não houver alinhamento entre:
- regras de transição (frontend vs backend),
- políticas RLS,
- revalidação de dados no App Router.

# Próximos passos recomendados (sem implementar)
1. Auditar a action `changeTicketStatus` e retorno de erros.
2. Verificar políticas RLS de `tickets` para update.
3. Confirmar se a UI revalida dados após mudança.
4. Cruzar regras de transição do frontend com as regras de backend.

# Atualizações
- 2026-01-26: Implementação planejada e tarefas geradas; ajustes incluem política RLS para Compras/Manutenção, validação de persistência e refresh de UI.
