# GAPP - Backlog de Implementacao

## Fase 0 - Fundacao e Bootstrap

### Epico 0.1 - Configuracao do Ambiente

- [x] **Tarefa 0.1.1: Dependencias base**
  - ✅ Criar `.nvmrc` com Node 18.18.0
  - ✅ Criar `package.json` raiz com workspaces
  - ✅ Adicionar `engines` no web package.json
  - ✅ Adicionar `engines` no mobile package.json

- [x] **Tarefa 0.1.2: Lint e Format**
  - ✅ Web: ESLint + Prettier configurados
  - ✅ Mobile: Criar `eslint.config.mjs`
  - ✅ Mobile: Criar `.prettierrc`
  - ✅ Mobile: Atualizar scripts no package.json

- [x] **Tarefa 0.1.3: Estrutura de pastas e convencoes**
  - ✅ Criar `CONVENTIONS.md` na raiz
  - ✅ Criar barrel export `hooks/index.ts`

### Epico 0.2 - Design System e Componentes

- [x] **Tarefa 0.2.1: Tokens de cores e tipografia**
  - ✅ Paleta primaria: `hsl(0 95% 60%)` (vermelho GarageInn)
  - ✅ Paleta semantica: success, warning, info, destructive
  - ✅ Tipografia: Inter configurada
  - ✅ Dark mode implementado

- [x] **Tarefa 0.2.2: Componentes base (shadcn/ui)**
  - ✅ Button, Card, Input, Label, Textarea
  - ✅ Select, Checkbox, Switch, Tabs
  - ✅ Dialog, Sheet, Popover, Tooltip
  - ✅ Table, Avatar, Badge, Separator
  - ✅ **Calendar** (react-day-picker v9)
  - ✅ **DatePicker** e **DateRangePicker**

- [x] **Tarefa 0.2.3: Layout principal**
  - ✅ AppShell com sidebar e header
  - ✅ AppSidebar com navegacao
  - ✅ AppHeader com titulo dinamico
  - ✅ Responsividade implementada

### Epico 0.3 - Integracao Supabase

- [x] **Tarefa 0.3.1: Setup Supabase**
  - ✅ Criar `supabase/config.toml`
  - ✅ Criar `.env.local` para web
  - ✅ Criar `.env.local` para mobile

- [x] **Tarefa 0.3.2: Autenticacao e perfis**
  - ✅ Clientes Supabase: client.ts, server.ts, middleware.ts
  - ✅ Funcoes SQL: is_admin(), is_rh()
  - ✅ Hooks: useAuth, useProfile, usePermissions

- [x] **Tarefa 0.3.3: Storage**
  - ✅ Bucket `ticket-attachments` (50MB, images + PDF)
  - ✅ Bucket `checklist-photos` (10MB, images)
  - ✅ RLS policies para upload e leitura

---

## Resumo da Fase 0

| Epico | Status | Tarefas Concluidas |
|-------|--------|-------------------|
| 0.1 - Ambiente | ✅ Completo | 3/3 |
| 0.2 - Design System | ✅ Completo | 3/3 |
| 0.3 - Supabase | ✅ Completo | 3/3 |

**Total: 9/9 tarefas concluidas**

---

## Verificacoes Realizadas

- ✅ `npm run build` (web) - Sucesso
- ✅ `npm run lint` (web) - 0 erros, 36 warnings
- ✅ `npm run lint` (mobile) - 0 erros, 42 warnings
- ✅ Storage buckets criados no Supabase

---

## Proximos Passos

- Fase 1: Modulo de Tickets
- Fase 2: Modulo de Checklists
- Fase 3: Modulo de Usuarios e RBAC

---

_Atualizado em: Janeiro 2025_
