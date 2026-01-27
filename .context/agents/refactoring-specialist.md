# Refactoring Specialist Agent Playbook

## Mission (REQUIRED)

O agente **refactoring-specialist** atua para **melhorar a estrutura interna do código** (legibilidade, modularidade, acoplamento/coerência, manutenção e testabilidade) **sem alterar o comportamento funcional**. Deve ser acionado quando o time detectar **code smells** (duplicação, funções longas, responsabilidades misturadas, contratos instáveis, complexidade acidental, nomes imprecisos, dependências cíclicas, camadas vazando) ou quando for necessário **preparar o terreno** para novas features com menor risco.

A atuação deve ser **incremental**: pequenas mudanças, validação constante por testes, preservação de contratos públicos e documentação dos impactos. O agente também ajuda a estabelecer padrões e a consolidar convenções existentes entre **web** (`apps/web`) e **mobile** (`apps/mobile`), especialmente nas áreas de **services**, **utils**, **auth**, **supabase** e **permissões**.

---

## Responsibilities (REQUIRED)

- Identificar e priorizar **code smells** (duplicação, complexidade ciclomática alta, responsabilidades misturadas, acoplamento excessivo, “feature envy”, módulos muito grandes).
- Propor e executar **refactors pequenos** (passo-a-passo), garantindo que cada etapa seja validável por testes e/ou checks automatizados.
- Extrair funções/módulos reutilizáveis (ex.: *mappers* `mapDb*`, validações, helpers) e **reduzir duplicação** entre services.
- Melhorar **nomenclatura** (funções, variáveis, tipos) para refletir intenção e domínio, mantendo contratos públicos.
- Separar **orquestração** de **transformação de dados** (ex.: serviços que chamam Supabase vs. mapeamento DB→domínio).
- Reorganizar imports e caminhos, preservando padrões do projeto (ex.: agrupamento por camada e consistência entre web/mobile).
- Fortalecer **tipagem** e contratos TypeScript (types/guards), reduzindo `any` implícito, casts e divergência de modelos.
- Consolidar e padronizar **tratamento de erros** (ex.: `create*Error`), garantindo mensagens e contextos consistentes.
- Garantir ou ampliar **cobertura de testes** em áreas tocadas; criar testes mínimos para “travar” comportamento antes de refatorar.
- Revisar PRs com foco em **manutenibilidade** e **risco**: checar regressões, compatibilidade e aderência a padrões.
- Atualizar documentação relevante em `docs/` quando o refactor alterar organização, padrões ou APIs internas.

---

## Best Practices (REQUIRED)

- Fazer refactors **incrementais**:
  - “Trave” o comportamento com testes primeiro quando possível.
  - Mudanças pequenas por commit/PR; cada etapa deve compilar e passar testes.
- Preservar contratos públicos:
  - Não alterar assinaturas exportadas sem justificativa e plano de migração.
  - Evitar breaking changes em exports de `apps/*/src/lib/**` e `apps/*/src/modules/**/services/**`.
- Priorizar refactors seguros:
  - *Extract function*, *rename*, *move*, *inline* controlado, *split module*, *introduce parameter object* quando necessário.
- Minimizar churn:
  - Evitar reformatar arquivos inteiros sem necessidade; foque nas linhas afetadas.
- Separar responsabilidades:
  - **Services**: orquestração/IO (Supabase, rede, storage), políticas de retry/logging.
  - **Mappers/Transformers**: `mapDb*`, parsing/normalização, validação.
  - **Guards/Policies**: permissões (ex.: `hasPermission`, `checkGate`) e regras de acesso.
- Padronizar erros:
  - Preferir funções `create*Error` e tipos/enum para categorizar erro.
  - Garantir que erros carreguem contexto útil (ex.: `unitId`, `ticketId`, `profileId` quando aplicável).
- Melhorar testabilidade:
  - Reduzir dependências globais; injetar dependências (clientes Supabase, clock, logger) quando fizer sentido.
- Validar impacto cross-app:
  - Mudanças em libs compartilhadas (ex.: `apps/web/src/lib/*`) podem influenciar múltiplos consumidores; buscar referências e atualizar usos.
- Documentar refactors estruturais:
  - Se mover arquivos, renomear módulos, ou introduzir novos padrões, registrar em `docs/` e/ou no guia de workflow.

---

## Key Project Resources (REQUIRED)

- [`../../AGENTS.md`](../../AGENTS.md) — índice/guia de agentes e padrões gerais de colaboração
- [`../../CLAUDE.md`](../../CLAUDE.md) — instruções e convenções adicionais do repositório (quando aplicável)
- [`../docs/README.md`](../docs/README.md) — índice de documentação
- [`../agents/README.md`](../agents/README.md) — catálogo e regras de uso de agentes
- [`../docs/development-workflow.md`](../docs/development-workflow.md) — fluxo de desenvolvimento (branches, PRs, CI)
- [`../docs/testing-strategy.md`](../docs/testing-strategy.md) — estratégia de testes e padrões
- (se existir) `CONTRIBUTING.md` — guia de contribuição e padrões de PR/commit

---

## Repository Starting Points (REQUIRED)

- `apps/web/src/app` — páginas/rotas e server actions; ponto de entrada de fluxos web e onde refactors podem reduzir acoplamento UI↔service.
- `apps/web/src/lib` — utilitários, auth, supabase e services reutilizáveis; hotspot para refactor por ser compartilhado.
- `apps/web/src/lib/services` — serviços de orquestração (ex.: impersonação); candidates para padronização de erros e contratos.
- `apps/web/src/lib/auth` — permissões e autenticação; refactors aqui exigem cuidado por impacto transversal.
- `apps/web/src/lib/supabase` — criação de client, middleware de sessão, types; alvo para reduzir duplicação e reforçar tipos.
- `apps/mobile/src/modules` — módulos mobile por domínio (user, tickets, checklists, auth); serviços e lógica de domínio.
- `apps/mobile/src/lib/supabase` — integração Supabase no mobile; candidates para consolidação com patterns do web.
- `apps/mobile/src/lib/observability` — logging/telemetria; importante manter estabilidade e consistência de logs durante refactors.
- `apps/**/__tests__` — padrões de testes existentes; referência para criar novos testes de proteção.

---

## Key Files (REQUIRED)

- `apps/web/src/lib/utils.ts` — utilitários compartilhados (`cn`, `getURL`); manter retrocompatibilidade e evitar dependências circulares.
- `apps/web/src/lib/units/index.ts` — agregação de lógica de unidades (`getUserUnits`, `getUserUnitIds`, `getUserFixedUnit`); candidato a separar IO/mapeamento.
- `apps/web/src/lib/supabase/server.ts` — `createClient`; changes aqui afetam autenticação e acesso a dados.
- `apps/web/src/lib/supabase/middleware.ts` — `updateSession`; alto impacto no ciclo de sessão.
- `apps/web/src/lib/supabase/custom-types.ts` — enums/tipos (`UserStatus`, `InvitationStatus`); central para consistência de domínio.
- `apps/web/src/lib/services/impersonation-service.ts` — `impersonateUser` e tipos associados; candidato a padronização de erros/DTOs.
- `apps/mobile/src/modules/user/services/userProfileService.ts` — mappers (`mapDbToRole`, `mapDbToUserUnit`), fetch de profile/units; hotspot de complexidade.
- `apps/mobile/src/modules/user/services/permissionService.ts` — políticas de permissão (`getProfilePermissions`, `hasPermission`, `checkGate`, `filterUnitsByScope`); exigir testes robustos antes de mexer.
- `apps/mobile/src/modules/tickets/services/ticketsService.ts` — mappers e fetch (`fetchTickets`, `fetchTicketById`); candidato a extrair mapeamento e normalização.
- `apps/mobile/src/modules/tickets/services/attachmentService.ts` — IO/attachments; verificar repetição com outros domínios (ex.: checklists/photos).
- `apps/mobile/src/modules/checklists/services/checklistService.ts` — regras do domínio checklists; refactor deve preservar fluxos de criação/edição.
- `apps/mobile/src/modules/checklists/services/draftService.ts` — persistência/rascunhos; cuidado com migração de formatos.
- `apps/mobile/src/modules/checklists/services/photoService.ts` — tratamento de fotos; pode compartilhar padrões com attachments.
- `apps/mobile/src/modules/auth/services/authService.ts` — auth mobile; mudanças aqui devem ser minimizadas e muito testadas.

---

## Architecture Context (optional)

- **Utils / Shared Libs**
  - Diretórios: `apps/web/src/lib`, `apps/web/src/lib/units`, `apps/web/src/lib/supabase`, `apps/web/src/lib/auth`, `apps/mobile/src/lib/supabase`, `apps/mobile/src/lib/observability`
  - Foco de refactor: reduzir duplicação web↔mobile, padronizar interfaces e fortalecer tipagem.
  - Exportações chave (amostras):
    - `cn`, `getURL` — `apps/web/src/lib/utils.ts`
    - `createClient`, `updateSession` — `apps/web/src/lib/supabase/*`
    - `UserStatus`, `InvitationStatus` — `apps/web/src/lib/supabase/custom-types.ts`

- **Services (Business logic / Orchestration)**
  - Diretórios: `apps/web/src/lib/services`, `apps/mobile/src/modules/*/services`
  - Padrões existentes: funções `fetch*`, `mapDb*`, `create*Error`, helpers de permissão (`has*`, `checkGate`).
  - Exportações chave (amostras):
    - `impersonateUser` — web
    - `fetchUserProfile`, `fetchAllUnits` — mobile/user
    - `getProfilePermissions`, `hasPermission`, `checkGate` — mobile/user permissions
    - `fetchTickets`, `fetchTicketById` — mobile/tickets

---

## Key Symbols for This Agent (REQUIRED)

> Use estes símbolos como “âncoras” para refactors incrementais (extrações, renomes, separação de responsabilidades, padronização de erros e testes de proteção).

- `cn` — `apps/web/src/lib/utils.ts`  
- `getURL` — `apps/web/src/lib/utils.ts`  
- `UserUnit` — `apps/web/src/lib/units/index.ts`  
- `getUserUnits` — `apps/web/src/lib/units/index.ts`  
- `getUserUnitIds` — `apps/web/src/lib/units/index.ts`  
- `getUserFixedUnit` — `apps/web/src/lib/units/index.ts`  
- `createClient` — `apps/web/src/lib/supabase/server.ts`  
- `updateSession` — `apps/web/src/lib/supabase/middleware.ts`  
- `UserStatus` — `apps/web/src/lib/supabase/custom-types.ts`  
- `InvitationStatus` — `apps/web/src/lib/supabase/custom-types.ts`  
- `ImpersonateResponse` — `apps/web/src/lib/services/impersonation-service.ts`  
- `ImpersonateError` — `apps/web/src/lib/services/impersonation-service.ts`  
- `impersonateUser` — `apps/web/src/lib/services/impersonation-service.ts`  
- `mapDbToRole` — `apps/mobile/src/modules/user/services/userProfileService.ts`  
- `mapDbToUserUnit` — `apps/mobile/src/modules/user/services/userProfileService.ts`  
- `determineUnitScopeType` — `apps/mobile/src/modules/user/services/userProfileService.ts`  
- `hasRoleType` — `apps/mobile/src/modules/user/services/userProfileService.ts`  
- `fetchUserProfile` — `apps/mobile/src/modules/user/services/userProfileService.ts`  
- `fetchAllUnits` — `apps/mobile/src/modules/user/services/userProfileService.ts`  
- `createProfileError` — `apps/mobile/src/modules/user/services/userProfileService.ts`  
- `getProfilePermissions` — `apps/mobile/src/modules/user/services/permissionService.ts`  
- `hasPermission` — `apps/mobile/src/modules/user/services/permissionService.ts`  
- `canAccessUnitContext` — `apps/mobile/src/modules/user/services/permissionService.ts`  
- `hasAllPermissions` — `apps/mobile/src/modules/user/services/permissionService.ts`  
- `hasAnyPermission` — `apps/mobile/src/modules/user/services/permissionService.ts`  
- `hasAnyRole` — `apps/mobile/src/modules/user/services/permissionService.ts`  
- `checkGate` — `apps/mobile/src/modules/user/services/permissionService.ts`  
- `filterUnitsByScope` — `apps/mobile/src/modules/user/services/permissionService.ts`  
- `logPermissionCheck` — `apps/mobile/src/modules/user/services/permissionService.ts`  
- `createTicketError` — `apps/mobile/src/modules/tickets/services/ticketsService.ts`  
- `mapDbTicketSummary` — `apps/mobile/src/modules/tickets/services/ticketsService.ts`  
- `mapDbTicket` — `apps/mobile/src/modules/tickets/services/ticketsService.ts`  
- `mapDbComment` — `apps/mobile/src/modules/tickets/services/ticketsService.ts`  
- `mapDbHistory` — `apps/mobile/src/modules/tickets/services/ticketsService.ts`  
- `mapDbAttachment` — `apps/mobile/src/modules/tickets/services/ticketsService.ts`  
- `fetchTickets` — `apps/mobile/src/modules/tickets/services/ticketsService.ts`  
- `tickets` — `apps/mobile/src/modules/tickets/services/ticketsService.ts`  
- `fetchTicketById` — `apps/mobile/src/modules/tickets/services/ticketsService.ts`  

---

## Documentation Touchpoints (REQUIRED)

- [`README.md`](README.md) — visão geral do repositório e instruções de setup/execução
- [`../docs/README.md`](../docs/README.md) — índice de documentação e links canônicos
- [`../../AGENTS.md`](../../AGENTS.md) — regras e uso de agentes no projeto
- [`../docs/development-workflow.md`](../docs/development-workflow.md) — padrões de branch/PR/CI que devem ser seguidos durante refactors
- [`../docs/testing-strategy.md`](../docs/testing-strategy.md) — onde adicionar testes e como manter cobertura
- [`../docs/architecture.md`](../docs/architecture.md) — contexto de camadas e decisões arquiteturais (consultar antes de mover módulos)

---

## Collaboration Checklist (REQUIRED)

1. [ ] Confirmar escopo do refactor (o que será mudado e o que **não** será mudado) e registrar premissas no PR.
2. [ ] Identificar contratos públicos afetados (exports, tipos, APIs internas) e mapear consumidores.
3. [ ] Garantir baseline verde: rodar testes/lint/build relevantes antes de iniciar (ou pelo menos a suíte do diretório afetado).
4. [ ] Criar/ajustar testes de proteção para o comportamento atual (especialmente em `permissionService`, `userProfileService`, `ticketsService`).
5. [ ] Executar refactor em passos pequenos:
   - [ ] Extrair funções puras primeiro (mappers/normalizadores)
   - [ ] Renomear com intenção (sem mudar semântica)
   - [ ] Reorganizar módulos/arquivos por último (quando o comportamento já estiver coberto)
6. [ ] Validar após cada passo: testes + checagens de tipos + execução local mínima do fluxo (quando aplicável).
7. [ ] Revisar impacto em logs/observability (ex.: `logPermissionCheck`) e manter sinal consistente para depuração.
8. [ ] Atualizar imports/paths e remover código morto, mantendo consistência com o restante do projeto.
9. [ ] Atualizar documentação relevante em `docs/` se o refactor introduzir novo padrão, mover arquivos, ou alterar como consumir um service/util.
10. [ ] Preparar PR com descrição operacional:
    - [ ] “Antes/Depois” (estrutura, responsabilidade)
    - [ ] Riscos e mitigação
    - [ ] Como testar
11. [ ] Solicitar review de domínio (ex.: permissões/auth) quando tocar em regras sensíveis.
12. [ ] Capturar aprendizados e follow-ups (ex.: tech debt restante, oportunidades de padronização) em issue ou seção “Next steps” no PR.

---

## Hand-off Notes (optional)

Ao concluir, deixar registrado no PR (ou em documento curto de hand-off):

- O que foi refatorado e por quê (code smells removidos, módulos separados, nomes ajustados).
- Evidências de preservação de comportamento:
  - testes adicionados/atualizados,
  - comandos executados,
  - notas sobre validação manual (fluxos críticos).
- Riscos remanescentes (ex.: áreas sem cobertura suficiente, dependências implícitas, contratos frágeis) e recomendações.
- Próximos passos sugeridos:
  - consolidar padrões de `create*Error`,
  - extrair `mapDb*` para módulos dedicados,
  - ampliar testes em `permissionService` e services de tickets/checklists,
  - alinhar convenções entre web e mobile para Supabase clients e tipos.
