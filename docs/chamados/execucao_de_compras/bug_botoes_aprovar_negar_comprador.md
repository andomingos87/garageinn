---
title: Bug - Comprador vê botões de Aprovar/Negar
created_at: 2026-01-26
status: resolved
resolved_at: 2026-01-26
contexto: execucao_compras
ator: comprador
spec: 009-approval-deny-buttons
---

# Resumo do problema
Após o comprador iniciar a cotação, o status muda corretamente, porém **o comprador passa a ver os botões “Aprovar” e “Negar”**, que deveriam ser exclusivos do gerente de compras. Isso gera confusão e quebra a regra de negócio.

# Evidência observada
- Usuário comprador com cotações cadastradas
- Ao clicar em **Iniciar Cotação**, status muda para **Em Cotação**
- Em seguida, aparecem os botões **Aprovar** e **Negar** para o comprador

# Impacto
- A UI permite que perfis não autorizados vejam ações de aprovação
- Risco de ação indevida se o backend não bloquear
- Confusão no fluxo e quebra de governança

# Fluxo lógico relacionado (visão de processo)
1. Comprador inicia cotação → status muda para `quoting`
2. A lista de transições permitidas inclui `approved` e `denied`
3. A UI renderiza botões com base nas transições, sem filtrar por perfil
4. Resultado: comprador vê **Aprovar** / **Negar**

# Escopo completo afetado (mapeamento sistêmico)
O problema não é pontual e pode afetar outros fluxos que usam o mesmo padrão:
- **Compras**
- **Manutenção**
- **Financeiro**
- **Comercial**

# Hipóteses de causa raiz (sem correção ainda)
1. **Transições sem filtro por permissão**: a lista de transições não considera papéis.
2. **Permissão genérica**: “pode gerenciar” engloba ações de execução e aprovação.
3. **Frontend não aplica RBAC por transição**: renderiza tudo que está permitido pelo status.
4. **Backend valida somente transição**, não permissão específica para aprovar/negAR.

# Outros pontos potencialmente afetados
- Qualquer módulo onde `statusTransitions` inclua ações de aprovação
- Botões de ação baseados em `allowedTransitions` sem filtro por perfil

# Risco de regressão
Correções locais podem mascarar o problema e gerar inconsistência entre módulos.
O risco é **alto** se não houver alinhamento entre:
- regras de transição por perfil (frontend)
- validação de permissões por transição (backend)
- RLS (banco)

# Próximos passos recomendados (sem implementar)
1. Criar modelo de permissão por tipo de transição (executar vs aprovar).
2. Filtrar transições por perfil no frontend.
3. Validar permissão específica no backend ao trocar status.
4. Avaliar necessidade de reforço via RLS.

---

# Resolução (2026-01-26)

## Implementação

A correção foi implementada seguindo a especificação `009-approval-deny-buttons`:

### 1. Mapeamento de Permissões por Transição
- Adicionado `transitionPermissions` em `constants.ts` (Compras e Manutenção)
- Transições `approved` e `denied` requerem `tickets:approve` (apenas Gerente)
- Transições operacionais requerem `tickets:execute` (Comprador e Gerente)

### 2. Filtro no Frontend
- Páginas (`page.tsx`) filtram transições baseadas em permissões do usuário
- Componente `TicketActions` aplica filtro adicional no client (dupla validação)
- Permissões do usuário são obtidas via `getCurrentUserPermissions()`

### 3. Validação no Backend
- Função `changeTicketStatus` valida permissão antes de permitir transição
- Retorna erro `forbidden` se usuário não tiver permissão necessária
- Mensagem de erro clara indicando permissão requerida

### 4. Escopo
- Implementado em **Compras** e **Manutenção**
- Mesma lógica aplicada consistentemente em ambos os módulos

## Arquivos Modificados

### Compras
- `apps/web/src/app/(app)/chamados/compras/constants.ts`
- `apps/web/src/app/(app)/chamados/compras/actions.ts`
- `apps/web/src/app/(app)/chamados/compras/[ticketId]/page.tsx`
- `apps/web/src/app/(app)/chamados/compras/[ticketId]/components/ticket-actions.tsx`

### Manutenção
- `apps/web/src/app/(app)/chamados/manutencao/constants.ts`
- `apps/web/src/app/(app)/chamados/manutencao/actions.ts`
- `apps/web/src/app/(app)/chamados/manutencao/[ticketId]/page.tsx`
- `apps/web/src/app/(app)/chamados/manutencao/[ticketId]/components/ticket-actions.tsx`

### Testes
- `apps/web/e2e/chamados-compras-approval-visibility.spec.ts` (novo)

## Resultado

- ✅ Comprador não vê botões "Aprovar" e "Negar" em status "Em Cotação"
- ✅ Gerente vê botões de aprovação corretamente
- ✅ Backend bloqueia tentativas de aprovação por perfis não autorizados
- ✅ Consistência entre módulos Compras e Manutenção
