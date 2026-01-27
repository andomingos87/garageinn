# GarageInn — Documentação (Índice)

Este diretório (`docs/`) concentra a documentação “viva” do monorepo **GarageInn** (Web + Mobile + Supabase). Use este README como ponto de entrada para entender rapidamente **o que existe**, **onde está** e **qual guia ler** dependendo da sua tarefa.

---

## Visão geral rápida do repositório

### Apps
- **Web**: `apps/web`  
  Aplicação web (Next.js/App Router), páginas em `apps/web/src/app`, componentes compartilháveis em `apps/web/src/components`, libs em `apps/web/src/lib`.

- **Mobile**: `apps/mobile`  
  App mobile (React Native/Expo), módulos em `apps/mobile/src/modules`, navegação em `apps/mobile/src/navigation`, componentes UI em `apps/mobile/src/components`.

### Backend/Infra
- **Supabase**: `supabase/`  
  Edge Functions e recursos do projeto Supabase (ex.: funções `invite-user`, `impersonate-user`, `create-test-users`).

### Documentação e specs
- **Docs**: `docs/` (este diretório)  
  Guias gerados/curados para desenvolvimento, arquitetura, testes e regras do domínio.
- **Specs**: `specs/`  
  Materiais complementares de especificação/requisitos (quando existirem).

---

## Por onde começar

1. **Projeto e objetivos**
   - Leia: **[Project Overview](./project-overview.md)**

2. **Entender a arquitetura e módulos**
   - Leia: **[Architecture Notes](./architecture.md)**  
   Útil para localizar responsabilidades (Web vs Mobile), boundaries e dependências.

3. **Rodar e contribuir no dia a dia**
   - Leia: **[Development Workflow](./development-workflow.md)**  
   Inclui scripts, rotinas e convenções (branching/CI, se aplicável).

4. **Testes**
   - Leia: **[Testing Strategy](./testing-strategy.md)**  
   Inclui visão de e2e (há testes em `apps/web/e2e`), unit e práticas.

5. **Regras de negócio e termos**
   - Leia: **[Glossary & Domain Concepts](./glossary.md)**

6. **Integrações e fluxo de dados**
   - Leia: **[Data Flow & Integrations](./data-flow.md)**  
   Complementa a visão de Supabase e serviços.

7. **Segurança**
   - Leia: **[Security & Compliance Notes](./security.md)**  
   Relevante para Auth, RBAC, impersonação e gestão de segredos.

8. **Ferramentas e produtividade**
   - Leia: **[Tooling & Productivity Guide](./tooling.md)**

---

## Índice de guias (Documentação principal)

- [Project Overview](./project-overview.md)
- [Architecture Notes](./architecture.md)
- [Development Workflow](./development-workflow.md)
- [Testing Strategy](./testing-strategy.md)
- [Glossary & Domain Concepts](./glossary.md)
- [Data Flow & Integrations](./data-flow.md)
- [Security & Compliance Notes](./security.md)
- [Tooling & Productivity Guide](./tooling.md)

---

## Mapa dos documentos (o que cada guia cobre)

| Guia | Arquivo | Quando ler | Principais entradas/artefatos |
| --- | --- | --- | --- |
| Project Overview | `project-overview.md` | onboarding e visão executiva | README, roadmap, notas de stakeholders |
| Architecture Notes | `architecture.md` | entender módulos, boundaries e decisões | ADRs, estrutura `apps/*`, gráficos de dependência |
| Development Workflow | `development-workflow.md` | executar, buildar, contribuir | scripts, CI, convenções, rotinas locais |
| Testing Strategy | `testing-strategy.md` | testar local/CI e e2e | configs, suites, `apps/web/e2e` |
| Glossary & Domain Concepts | `glossary.md` | entender termos (tickets, checklists etc.) | regras e linguagem do domínio |
| Data Flow & Integrations | `data-flow.md` | rastrear dados e integrações | Supabase, serviços, relatórios/exportações |
| Security & Compliance Notes | `security.md` | auth, RBAC, riscos | modelo de autenticação, permissões, segredos |
| Tooling & Productivity Guide | `tooling.md` | acelerar o desenvolvimento | scripts, IDE, automações |

---

## Convenções de navegação no código (atalhos úteis)

### Web (`apps/web`)
- Rotas e páginas: `apps/web/src/app/(app)` e `apps/web/src/app/(auth)`
- Componentes de layout e UI: `apps/web/src/components/*`
- Serviços e integrações: `apps/web/src/lib/services`
- Supabase types e helpers: `apps/web/src/lib/supabase`

### Mobile (`apps/mobile`)
- Módulos por domínio (ex.: tickets, checklists, auth): `apps/mobile/src/modules/*`
- UI/guards: `apps/mobile/src/components/*`
- Navegação: `apps/mobile/src/navigation/*`
- Observabilidade/logging: `apps/mobile/src/lib/observability/*`

### Supabase (`supabase`)
- Edge Functions: `supabase/functions/*`  
  Exemplos observados no repo: `invite-user`, `impersonate-user`, `create-test-users`.

---

## Como manter esta documentação

- Prefira **documentos pequenos e linkáveis** (em vez de um único guia enorme).
- Ao adicionar um guia novo, inclua:
  - Link neste README (índice)
  - Seção “Quando usar”
  - Referências cruzadas para arquivos/pastas relevantes
- Atualize quando houver mudanças estruturais (novos módulos, alterações de auth, CI/testes).

---

## Referências rápidas (arquivos na raiz)

- `AGENTS.md`, `CLAUDE.md`: convenções e instruções internas (se aplicável ao seu fluxo)
- `BACKLOG.md`: pendências e próximos passos
- `apps/`: aplicações Web e Mobile
- `supabase/`: backend/infra Supabase
- `docs/`: esta base de conhecimento

---
