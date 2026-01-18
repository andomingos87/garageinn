---
status: pending
generated: 2026-01-18
epic: "3.3"
title: "Dashboard e Relatorios - Tarefas 3.3.2 e 3.3.3"
priority: high
agents:
  - type: "backend-specialist"
    role: "Implementar Server Actions e API Routes para relatorios e exportacao"
  - type: "frontend-specialist"
    role: "Desenvolver paginas de relatorios com filtros avancados e graficos"
  - type: "test-writer"
    role: "Criar testes E2E com Playwright"
  - type: "documentation-writer"
    role: "Atualizar BACKLOG.md e documentacao"
  - type: "security-auditor"
    role: "Validar RLS policies e permissoes de acesso"
docs:
  - "project-overview.md"
  - "architecture.md"
  - "security.md"
  - "data-flow.md"
phases:
  - id: "phase-1"
    name: "Infraestrutura e Permissoes"
    prevc: "P"
    status: "pending"
  - id: "phase-2"
    name: "Backend - Relatorios de Chamados (3.3.2)"
    prevc: "E"
    status: "pending"
  - id: "phase-3"
    name: "Frontend - Relatorios de Chamados (3.3.2)"
    prevc: "E"
    status: "pending"
  - id: "phase-4"
    name: "Backend - Relatorios de Supervisao (3.3.3)"
    prevc: "E"
    status: "pending"
  - id: "phase-5"
    name: "Frontend - Relatorios de Supervisao (3.3.3)"
    prevc: "E"
    status: "pending"
  - id: "phase-6"
    name: "Exportacao PDF e Excel"
    prevc: "E"
    status: "pending"
  - id: "phase-7"
    name: "Validacao e Testes E2E"
    prevc: "V"
    status: "pending"
  - id: "phase-8"
    name: "Documentacao e Commit"
    prevc: "C"
    status: "pending"
---

# Plano: Epico 3.3 - Relatorios de Chamados e Supervisao

> Implementacao das tarefas 3.3.2 (Relatorios de Chamados) e 3.3.3 (Relatorios de Supervisao) do Epico 3.3 - Dashboard e Relatorios.

## Visao Geral

### Objetivo Principal

Criar o modulo `/relatorios` com duas subrotas principais:
- `/relatorios/chamados` - Relatorios consolidados de todos os chamados
- `/relatorios/supervisao` - Relatorios de execucoes de supervisao

### Contexto Tecnico

**Bibliotecas necessarias (ja instaladas):**
- `@react-pdf/renderer` v4.3.2 - Geracao de PDF (ja usado em supervisao individual)
- `exceljs` - **NOVA DEPENDENCIA** - Geracao de Excel

**Bibliotecas opcionais para graficos:**
- `recharts` - Graficos (recomendado, popular com React)

**Padroes existentes a reutilizar:**
- API Route PDF: `apps/web/src/app/api/checklists/[executionId]/pdf/route.ts`
- Componente PDF: `apps/web/src/app/(app)/checklists/[executionId]/components/supervision-pdf-document.tsx`
- Filtros: `apps/web/src/app/(app)/chamados/financeiro/components/financeiro-filters.tsx`
- Tabelas: Componentes existentes em cada modulo de chamados

### Tabelas Envolvidas

**Para Relatorios de Chamados:**
- `tickets` - Chamados (16 registros atualmente)
- `departments` - Departamentos (8 registros)
- `ticket_categories` - Categorias (62 registros)
- `units` - Unidades (74 registros)
- `profiles` - Usuarios (33 registros)
- `ticket_history` - Historico de mudancas

**Para Relatorios de Supervisao:**
- `checklist_executions` - Execucoes (3 registros)
- `checklist_templates` - Templates (3 registros, type='supervision')
- `checklist_answers` - Respostas
- `checklist_questions` - Perguntas
- `units` - Unidades
- `user_units` - Cobertura de supervisores (is_coverage)

---

## Fase 1 - Infraestrutura e Permissoes

### Tarefa 1.1: Adicionar permissao de relatorios ao sistema

**Responsavel:** backend-specialist
**Dependencias:** Nenhuma

**Descricao:**
Adicionar nova permissao `reports:read` ao sistema de permissoes para controlar acesso aos relatorios.

**Arquivos envolvidos:**
- `apps/web/src/lib/auth/permissions.ts` (editar)

**Alteracoes necessarias:**
```typescript
// Adicionar ao tipo Permission
export type Permission =
  // ... existentes ...
  | "reports:read"  // NOVA

// Adicionar aos departamentos relevantes
export const DEPARTMENT_ROLE_PERMISSIONS = {
  // Operacoes - Gerente pode ver relatorios
  Operacoes: {
    Gerente: [
      // ... existentes ...
      "reports:read",
    ],
  },
  // Financeiro - Supervisor e Gerente
  Financeiro: {
    Supervisor: [
      // ... existentes ...
      "reports:read",
    ],
    Gerente: [
      // ... existentes ...
      "reports:read",
    ],
  },
  // Auditoria - Auditor e Gerente (leitura de relatorios e essencial)
  Auditoria: {
    Auditor: [
      // ... existentes ...
      "reports:read",
    ],
    Gerente: [
      // ... existentes ...
      "reports:read",
    ],
  },
  // TI - Analista e Gerente
  TI: {
    Analista: [
      // ... existentes ...
      "reports:read",
    ],
  },
  // ... outros departamentos conforme necessario
};

// ALL_PERMISSIONS
export const ALL_PERMISSIONS: Permission[] = [
  // ... existentes ...
  "reports:read",
];
```

**Criterios de Aceite:**
- [ ] Permissao `reports:read` adicionada ao tipo Permission
- [ ] Gerentes de Operacoes, Financeiro, TI tem permissao
- [ ] Auditoria (Auditor e Gerente) tem permissao
- [ ] Supervisores de Operacoes podem ver relatorios de supervisao (via checklists:read)
- [ ] Admin (admin:all) automaticamente tem acesso

**Tipo de teste:** Unit test

---

### Tarefa 1.2: Adicionar menu de Relatorios ao sidebar

**Responsavel:** frontend-specialist
**Arquivo:** `apps/web/src/components/layout/app-sidebar.tsx`
**Dependencias:** Tarefa 1.1

**Descricao:**
Adicionar secao "Relatorios" no menu lateral com subitens para Chamados e Supervisao.

**Alteracoes:**
```typescript
import { FileText, BarChart3 } from "lucide-react";

// Adicionar aos menuItems (antes de configItems)
const menuItems: MenuItem[] = [
  // ... existentes ...
  {
    title: "Relatorios",
    href: "/relatorios",
    icon: BarChart3,
    requirePermission: ["reports:read", "admin:all"],
    permissionMode: "any",
  },
];
```

**Criterios de Aceite (extraidos do backlog):**
- [ ] Existe menu "Relatorios" no sidebar
- [ ] Menu visivel apenas para usuarios com permissao `reports:read` ou `admin:all`
- [ ] Icone apropriado (BarChart3 ou FileText)
- [ ] Navegacao para `/relatorios` funciona

**Tipo de teste:** E2E

---

### Tarefa 1.3: Instalar dependencia ExcelJS

**Responsavel:** devops-specialist
**Arquivo:** `apps/web/package.json`
**Dependencias:** Nenhuma

**Descricao:**
Instalar biblioteca ExcelJS para geracao de arquivos Excel.

**Comando:**
```bash
cd apps/web && npm install exceljs
```

**Criterios de Aceite:**
- [ ] ExcelJS instalado em apps/web/package.json
- [ ] Build passa sem erros
- [ ] Tipos TypeScript disponiveis (@types/exceljs se necessario)

**Tipo de teste:** Build

---

### Tarefa 1.4: Criar estrutura de diretorios do modulo

**Responsavel:** frontend-specialist
**Dependencias:** Nenhuma

**Descricao:**
Criar toda a estrutura de pastas e arquivos do modulo de relatorios.

**Estrutura de arquivos:**
```
apps/web/src/app/(app)/relatorios/
├── page.tsx                          # Hub de relatorios (redirect ou cards)
├── loading.tsx                       # Loading state
├── layout.tsx                        # Layout compartilhado (opcional)
├── chamados/
│   ├── page.tsx                      # Pagina de relatorios de chamados
│   ├── loading.tsx
│   ├── actions.ts                    # Server Actions
│   ├── constants.ts                  # Constantes
│   └── components/
│       ├── index.ts
│       ├── reports-filters.tsx       # Filtros avancados
│       ├── reports-table.tsx         # Tabela de resultados
│       ├── reports-stats.tsx         # Estatisticas/cards
│       ├── reports-charts.tsx        # Graficos (opcional)
│       └── export-buttons.tsx        # Botoes de exportacao
└── supervisao/
    ├── page.tsx                      # Pagina de relatorios de supervisao
    ├── loading.tsx
    ├── actions.ts                    # Server Actions
    ├── constants.ts                  # Constantes
    └── components/
        ├── index.ts
        ├── supervision-filters.tsx   # Filtros especificos
        ├── supervision-table.tsx     # Tabela de execucoes
        ├── supervision-stats.tsx     # Estatisticas
        ├── supervision-charts.tsx    # Graficos (opcional)
        └── export-buttons.tsx        # Botoes de exportacao

apps/web/src/app/api/relatorios/
├── chamados/
│   ├── pdf/route.ts                  # API Route para PDF de chamados
│   └── excel/route.ts                # API Route para Excel de chamados
└── supervisao/
    ├── pdf/route.ts                  # API Route para PDF consolidado
    └── excel/route.ts                # API Route para Excel
```

**Criterios de Aceite:**
- [ ] Todas as pastas criadas
- [ ] Arquivos index.ts com barrel exports
- [ ] Estrutura segue padrao do projeto

**Tipo de teste:** N/A (estrutura)

---

## Fase 2 - Backend - Relatorios de Chamados (3.3.2)

### Tarefa 2.1: Criar constantes do modulo de chamados

**Responsavel:** backend-specialist
**Arquivo:** `apps/web/src/app/(app)/relatorios/chamados/constants.ts`
**Dependencias:** Fase 1 completa

**Descricao:**
Criar arquivo com constantes para o modulo de relatorios de chamados.

**Conteudo:**
```typescript
// Status disponiveis para filtro
export const TICKET_STATUSES = [
  { value: "awaiting_triage", label: "Aguardando Triagem" },
  { value: "prioritized", label: "Priorizado" },
  { value: "in_progress", label: "Em Andamento" },
  { value: "resolved", label: "Resolvido" },
  { value: "closed", label: "Fechado" },
  { value: "denied", label: "Negado" },
  { value: "cancelled", label: "Cancelado" },
] as const;

// Prioridades
export const TICKET_PRIORITIES = [
  { value: "low", label: "Baixa" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
  { value: "urgent", label: "Urgente" },
] as const;

// Departamentos (IDs do banco)
export const DEPARTMENTS = {
  OPERACOES: "...",
  COMPRAS_MANUTENCAO: "...",
  FINANCEIRO: "589a0e19-768e-4051-bbd2-87cdea103748",
  RH: "...",
  COMERCIAL: "...",
  SINISTROS: "...",
  TI: "...",
} as const;

// Periodos rapidos
export const QUICK_PERIODS = [
  { value: "today", label: "Hoje" },
  { value: "last7days", label: "Ultimos 7 dias" },
  { value: "last30days", label: "Ultimos 30 dias" },
  { value: "last90days", label: "Ultimos 90 dias" },
  { value: "thisMonth", label: "Mes atual" },
  { value: "lastMonth", label: "Mes anterior" },
] as const;

// Items por pagina
export const ITEMS_PER_PAGE_OPTIONS = [25, 50, 100] as const;
export const DEFAULT_ITEMS_PER_PAGE = 50;
```

**Criterios de Aceite:**
- [ ] Constantes de status correspondem aos valores do banco
- [ ] Prioridades em portugues
- [ ] Periodos rapidos implementados
- [ ] Exportacoes TypeScript corretas

**Tipo de teste:** Unit test

---

### Tarefa 2.2: Criar Server Actions para relatorios de chamados

**Responsavel:** backend-specialist
**Arquivo:** `apps/web/src/app/(app)/relatorios/chamados/actions.ts`
**Dependencias:** Tarefa 2.1

**Descricao:**
Implementar Server Actions para busca e agregacao de dados de chamados.

**Actions a implementar:**

| Action | Descricao | Parametros |
|--------|-----------|------------|
| `getReportTickets` | Listar chamados com filtros avancados | `filters`, `page`, `limit`, `sortBy`, `sortOrder` |
| `getReportStats` | Estatisticas agregadas | `filters` |
| `getDepartments` | Listar departamentos | - |
| `getCategories` | Listar categorias (opcionalmente por departamento) | `departmentId?` |
| `getUnitsForReport` | Listar unidades visiveis ao usuario | - |
| `canAccessReports` | Verificar permissao de acesso | - |

**Interface de filtros:**
```typescript
export interface TicketReportFilters {
  // Periodo
  startDate: string;      // ISO date, obrigatorio
  endDate: string;        // ISO date, obrigatorio

  // Multi-select
  statuses?: string[];    // awaiting_triage, prioritized, etc
  departments?: string[]; // UUIDs
  priorities?: string[];  // low, medium, high, urgent
  unitIds?: string[];     // UUIDs

  // Busca
  search?: string;        // Numero ou titulo
}

export interface TicketReportStats {
  total: number;
  byStatus: { status: string; count: number }[];
  byPriority: { priority: string; count: number }[];
  byDepartment: { department: string; count: number }[];
  avgResolutionTime: number; // em dias
  resolutionRate: number;    // percentual
}
```

**Criterios de Aceite (extraidos do backlog - Tarefa 3.3.2):**

**Filtros:**
- [ ] Filtro por Periodo (date range) com data inicial e final obrigatorias
- [ ] Filtro por Status (multi-select) com todos os status
- [ ] Filtro por Departamento (multi-select) com todos os departamentos
- [ ] Filtro por Prioridade (multi-select)
- [ ] Filtro por Unidade (multi-select) respeitando RBAC
- [ ] Opcoes rapidas de periodo (Hoje, Ultimos 7 dias, etc)

**Listagem:**
- [ ] Retorna numero, titulo, departamento, status, prioridade, unidade, responsavel, data criacao, data resolucao, tempo de resolucao
- [ ] Ordenacao por qualquer coluna
- [ ] Paginacao (25/50/100 itens)
- [ ] Contador total de resultados

**Estatisticas:**
- [ ] Total de chamados no periodo
- [ ] Distribuicao por status
- [ ] Distribuicao por prioridade
- [ ] Distribuicao por departamento
- [ ] Tempo medio de resolucao (em dias)
- [ ] Taxa de resolucao (%)

**Permissoes:**
- [ ] Usuarios veem apenas chamados conforme RBAC (via RLS)
- [ ] Apenas usuarios com `reports:read` ou `admin:all` podem acessar

**Tipo de teste:** Integration test

---

## Fase 3 - Frontend - Relatorios de Chamados (3.3.2)

### Tarefa 3.1: Criar componente de filtros avancados

**Responsavel:** frontend-specialist
**Arquivo:** `apps/web/src/app/(app)/relatorios/chamados/components/reports-filters.tsx`
**Dependencias:** Tarefa 2.2

**Descricao:**
Criar componente de filtros com date range picker, multi-selects e opcoes rapidas.

**Componentes a usar:**
- `DatePickerWithRange` (criar ou usar react-day-picker)
- `MultiSelect` (criar baseado em cmdk/combobox)
- shadcn/ui Select, Button, Popover

**Criterios de Aceite (extraidos do backlog):**
- [ ] Date range picker com validacao (data final >= data inicial)
- [ ] Opcoes rapidas de periodo funcionando
- [ ] Multi-select para Status
- [ ] Multi-select para Departamento
- [ ] Multi-select para Prioridade
- [ ] Multi-select para Unidade (respeitando RBAC)
- [ ] Botao "Limpar Filtros" reseta tudo
- [ ] Botao "Aplicar Filtros" atualiza listagem
- [ ] Filtros sincronizados via URL (searchParams)

**Tipo de teste:** E2E

---

### Tarefa 3.2: Criar tabela de resultados

**Responsavel:** frontend-specialist
**Arquivo:** `apps/web/src/app/(app)/relatorios/chamados/components/reports-table.tsx`
**Dependencias:** Tarefa 3.1

**Descricao:**
Criar tabela com ordenacao, paginacao e todas as colunas necessarias.

**Colunas (extraidas do backlog):**
- Numero do chamado (formato: DEP-XXXX)
- Titulo
- Departamento
- Status (badge colorido)
- Prioridade (badge colorido)
- Unidade(s)
- Responsavel
- Data de criacao
- Data de resolucao (se aplicavel)
- Tempo de resolucao (em dias/horas, se resolvido)

**Criterios de Aceite (extraidos do backlog):**
- [ ] Todas as colunas listadas acima presentes
- [ ] Ordenacao por qualquer coluna (clicando no header)
- [ ] Indicacao visual da coluna e direcao de ordenacao
- [ ] Paginacao com opcoes 25, 50, 100 itens
- [ ] Navegacao: primeira, anterior, proxima, ultima
- [ ] Contador: "Mostrando X de Y resultados"
- [ ] Mensagem "Nenhum chamado encontrado" quando vazio
- [ ] Link para detalhes do chamado (opcional)

**Tipo de teste:** E2E

---

### Tarefa 3.3: Criar cards de estatisticas

**Responsavel:** frontend-specialist
**Arquivo:** `apps/web/src/app/(app)/relatorios/chamados/components/reports-stats.tsx`
**Dependencias:** Tarefa 2.2

**Descricao:**
Criar cards de resumo com estatisticas do relatorio.

**Cards (extraidos do backlog):**
- Total de chamados no periodo
- Distribuicao por status
- Distribuicao por prioridade
- Distribuicao por departamento
- Tempo medio de resolucao (em dias)
- Taxa de resolucao (%)

**Criterios de Aceite:**
- [ ] Cards exibem estatisticas calculadas com base nos filtros
- [ ] Atualizados ao aplicar/remover filtros
- [ ] Design consistente com cards existentes no dashboard
- [ ] Loading state durante calculo

**Tipo de teste:** E2E

---

### Tarefa 3.4: Criar pagina principal de relatorios de chamados

**Responsavel:** frontend-specialist
**Arquivo:** `apps/web/src/app/(app)/relatorios/chamados/page.tsx`
**Dependencias:** Tarefas 3.1, 3.2, 3.3

**Descricao:**
Criar pagina que integra filtros, estatisticas e tabela.

**Criterios de Aceite (extraidos do backlog):**
- [ ] Rota `/relatorios/chamados` acessivel
- [ ] Titulo "Relatorios de Chamados"
- [ ] Filtros no topo
- [ ] Cards de estatisticas abaixo dos filtros
- [ ] Tabela de resultados
- [ ] Botoes de exportacao (PDF/Excel)
- [ ] Layout responsivo
- [ ] Loading states apropriados

**Tipo de teste:** E2E

---

## Fase 4 - Backend - Relatorios de Supervisao (3.3.3)

### Tarefa 4.1: Criar constantes do modulo de supervisao

**Responsavel:** backend-specialist
**Arquivo:** `apps/web/src/app/(app)/relatorios/supervisao/constants.ts`
**Dependencias:** Fase 1 completa

**Descricao:**
Criar arquivo com constantes para o modulo de relatorios de supervisao.

**Conteudo:**
```typescript
// Status de execucao
export const EXECUTION_STATUSES = [
  { value: "in_progress", label: "Em Andamento" },
  { value: "completed", label: "Concluido" },
] as const;

// Faixas de score para filtro
export const SCORE_RANGES = [
  { value: "0-50", label: "Critico (0-50%)" },
  { value: "51-70", label: "Baixo (51-70%)" },
  { value: "71-90", label: "Medio (71-90%)" },
  { value: "91-100", label: "Alto (91-100%)" },
] as const;

// Cores para scores
export const SCORE_COLORS = {
  critical: "bg-red-100 text-red-800",   // 0-50
  low: "bg-orange-100 text-orange-800",  // 51-70
  medium: "bg-yellow-100 text-yellow-800", // 71-90
  high: "bg-green-100 text-green-800",   // 91-100
} as const;

export function getScoreColor(score: number): string {
  if (score <= 50) return SCORE_COLORS.critical;
  if (score <= 70) return SCORE_COLORS.low;
  if (score <= 90) return SCORE_COLORS.medium;
  return SCORE_COLORS.high;
}

// Items por pagina
export const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50] as const;
export const DEFAULT_ITEMS_PER_PAGE = 20;
```

**Criterios de Aceite:**
- [ ] Status correspondem aos valores do banco
- [ ] Faixas de score definidas conforme backlog
- [ ] Funcao helper para cores implementada

**Tipo de teste:** Unit test

---

### Tarefa 4.2: Criar Server Actions para relatorios de supervisao

**Responsavel:** backend-specialist
**Arquivo:** `apps/web/src/app/(app)/relatorios/supervisao/actions.ts`
**Dependencias:** Tarefa 4.1

**Descricao:**
Implementar Server Actions para busca e agregacao de dados de supervisao.

**Actions a implementar:**

| Action | Descricao | Parametros |
|--------|-----------|------------|
| `getSupervisionReport` | Listar execucoes com filtros | `filters`, `page`, `limit`, `sortBy` |
| `getSupervisionStats` | Estatisticas agregadas | `filters` |
| `getSupervisionUnits` | Unidades para filtro (respeitando is_coverage) | - |
| `getSupervisionExecution` | Detalhes de uma execucao | `executionId` |
| `getNonConformities` | Lista de nao-conformidades agregadas | `filters` |

**Interface de filtros:**
```typescript
export interface SupervisionReportFilters {
  // Periodo
  startDate: string;
  endDate: string;

  // Filtros
  unitIds?: string[];
  statuses?: ('in_progress' | 'completed')[];

  // Score
  minScore?: number;      // 0-100
  maxScore?: number;      // 0-100

  // Nao-conformidades
  hasNonConformities?: boolean;
}

export interface SupervisionReportStats {
  total: number;
  byUnit: { unitId: string; unitName: string; count: number; avgScore: number }[];
  avgScore: number;
  totalNonConformities: number;
  topUnitsWithIssues: { unitName: string; nonConformities: number }[];
  completionRate: number;
}
```

**Criterios de Aceite (extraidos do backlog - Tarefa 3.3.3):**

**Filtros:**
- [ ] Filtro por Unidade (respeitando `is_coverage` para Supervisores)
- [ ] Filtro por Periodo (date range)
- [ ] Filtro por Status (multi-select: Em Andamento, Concluido)
- [ ] Filtro por Score de Conformidade (range slider ou inputs, 0-100%)
- [ ] Checkbox "Apenas com nao-conformidades"

**Listagem:**
- [ ] Data/Hora de execucao
- [ ] Unidade (nome e codigo)
- [ ] Template (nome do checklist)
- [ ] Supervisor (nome do executante)
- [ ] Score de Conformidade (% com badge colorido)
- [ ] Total de Perguntas
- [ ] Conformidades (numero de "Sim")
- [ ] Nao-Conformidades (numero de "Nao")
- [ ] Status (Em Andamento / Concluido)
- [ ] Duracao (tempo de execucao, se concluido)

**Estatisticas:**
- [ ] Total de supervisoes no periodo
- [ ] Supervisoes por unidade (distribuicao)
- [ ] Score medio de conformidade (%)
- [ ] Total de nao-conformidades
- [ ] Top 5 unidades com mais nao-conformidades
- [ ] Taxa de conclusao (%)

**Permissoes:**
- [ ] Supervisores veem apenas unidades com `is_coverage = true`
- [ ] Gerentes/Admins veem todas as unidades
- [ ] RLS aplica corretamente as politicas

**Tipo de teste:** Integration test

---

## Fase 5 - Frontend - Relatorios de Supervisao (3.3.3)

### Tarefa 5.1: Criar componente de filtros de supervisao

**Responsavel:** frontend-specialist
**Arquivo:** `apps/web/src/app/(app)/relatorios/supervisao/components/supervision-filters.tsx`
**Dependencias:** Tarefa 4.2

**Descricao:**
Criar componente de filtros especificos para supervisao incluindo score range.

**Criterios de Aceite (extraidos do backlog):**
- [ ] Select de Unidade (respeitando RBAC/is_coverage)
- [ ] Date range picker
- [ ] Multi-select para Status
- [ ] Range slider ou inputs para Score (0-100%)
- [ ] Checkbox "Apenas com nao-conformidades"
- [ ] Botao "Limpar Filtros"
- [ ] Botao "Aplicar Filtros"

**Tipo de teste:** E2E

---

### Tarefa 5.2: Criar tabela de execucoes

**Responsavel:** frontend-specialist
**Arquivo:** `apps/web/src/app/(app)/relatorios/supervisao/components/supervision-table.tsx`
**Dependencias:** Tarefa 5.1

**Descricao:**
Criar tabela de execucoes de supervisao com todas as colunas.

**Criterios de Aceite (extraidos do backlog):**
- [ ] Todas as colunas: Data/Hora, Unidade, Template, Supervisor, Score, Total Perguntas, Conformidades, Nao-Conformidades, Status, Duracao, Acoes
- [ ] Ordenacao por: unidade, score, data, supervisor
- [ ] Paginacao (10, 20, 50 itens)
- [ ] Score com badge colorido (vermelho < 50%, amarelo < 70%, verde >= 90%)
- [ ] Botao "Visualizar" em cada linha
- [ ] Botao "Exportar PDF" em cada linha (individual)

**Tipo de teste:** E2E

---

### Tarefa 5.3: Criar cards de estatisticas de supervisao

**Responsavel:** frontend-specialist
**Arquivo:** `apps/web/src/app/(app)/relatorios/supervisao/components/supervision-stats.tsx`
**Dependencias:** Tarefa 4.2

**Descricao:**
Criar cards com metricas de supervisao.

**Cards:**
- Total de supervisoes
- Score medio de conformidade
- Total de nao-conformidades
- Taxa de conclusao

**Criterios de Aceite:**
- [ ] Cards atualizados conforme filtros
- [ ] Design consistente
- [ ] Loading states

**Tipo de teste:** E2E

---

### Tarefa 5.4: Criar graficos (opcional)

**Responsavel:** frontend-specialist
**Arquivo:** `apps/web/src/app/(app)/relatorios/supervisao/components/supervision-charts.tsx`
**Dependencias:** Tarefa 4.2

**Descricao:**
Criar graficos de distribuicao de scores e supervisoes por unidade.

**Graficos sugeridos:**
- Histograma de distribuicao de scores
- Barras de supervisoes por unidade

**Criterios de Aceite (extraidos do backlog):**
- [ ] Grafico de distribuicao de scores (histograma ou barras)
- [ ] Grafico de supervisoes por unidade (barras ou pizza)
- [ ] Responsivo
- [ ] Loading states

**Biblioteca recomendada:** recharts (adicionar como dependencia)

**Tipo de teste:** E2E

---

### Tarefa 5.5: Criar pagina principal de relatorios de supervisao

**Responsavel:** frontend-specialist
**Arquivo:** `apps/web/src/app/(app)/relatorios/supervisao/page.tsx`
**Dependencias:** Tarefas 5.1, 5.2, 5.3, 5.4

**Descricao:**
Criar pagina que integra todos os componentes.

**Criterios de Aceite (extraidos do backlog):**
- [ ] Rota `/relatorios/supervisao` acessivel
- [ ] Titulo "Relatorios de Supervisao"
- [ ] Filtros funcionando
- [ ] Estatisticas exibidas
- [ ] Tabela de execucoes
- [ ] Graficos (se implementados)
- [ ] Botoes de exportacao consolidada

**Tipo de teste:** E2E

---

## Fase 6 - Exportacao PDF e Excel

### Tarefa 6.1: Criar API Route para PDF de chamados

**Responsavel:** backend-specialist
**Arquivo:** `apps/web/src/app/api/relatorios/chamados/pdf/route.ts`
**Dependencias:** Fase 2 completa

**Descricao:**
Criar API Route que gera PDF consolidado de chamados.

**Criterios de Aceite (extraidos do backlog):**

**Conteudo do PDF:**
- [ ] Cabecalho com logo (se disponivel), titulo "Relatorio de Chamados"
- [ ] Periodo do relatorio (data inicial - data final)
- [ ] Filtros aplicados (status, departamento, prioridade, unidade)
- [ ] Data/hora de geracao
- [ ] Tabela com todas as colunas da listagem
- [ ] Rodape com total de chamados e pagina X de Y
- [ ] Layout profissional e legivel

**Tecnico:**
- [ ] Usa @react-pdf/renderer
- [ ] Gerado server-side (API Route)
- [ ] Nome do arquivo: `relatorio-chamados-YYYY-MM-DD.pdf`
- [ ] Funciona com ate 10.000 registros
- [ ] Timeout adequado

**Tipo de teste:** Integration test

---

### Tarefa 6.2: Criar API Route para Excel de chamados

**Responsavel:** backend-specialist
**Arquivo:** `apps/web/src/app/api/relatorios/chamados/excel/route.ts`
**Dependencias:** Tarefa 1.3 (ExcelJS instalado)

**Descricao:**
Criar API Route que gera Excel de chamados.

**Criterios de Aceite (extraidos do backlog):**

**Conteudo do Excel:**
- [ ] Planilha principal com cabecalho (informacoes do relatorio)
- [ ] Tabela com todas as colunas da listagem
- [ ] Formatacao adequada:
  - Datas no formato brasileiro (DD/MM/YYYY)
  - Numeros com formatacao numerica
  - Textos alinhados a esquerda
- [ ] Aba "Resumo" com estatisticas:
  - Total de chamados
  - Distribuicao por status
  - Distribuicao por prioridade
  - Distribuicao por departamento
  - Tempo medio de resolucao

**Tecnico:**
- [ ] Usa ExcelJS
- [ ] Gerado server-side (API Route)
- [ ] Nome do arquivo: `relatorio-chamados-YYYY-MM-DD.xlsx`
- [ ] Funciona com ate 10.000 registros

**Tipo de teste:** Integration test

---

### Tarefa 6.3: Criar API Route para PDF consolidado de supervisao

**Responsavel:** backend-specialist
**Arquivo:** `apps/web/src/app/api/relatorios/supervisao/pdf/route.ts`
**Dependencias:** Fase 4 completa

**Descricao:**
Criar API Route que gera PDF consolidado de supervisoes.

**Criterios de Aceite (extraidos do backlog):**

**Conteudo do PDF:**
- [ ] Resumo executivo com:
  - Periodo do relatorio
  - Filtros aplicados
  - Estatisticas gerais (total, score medio, nao-conformidades)
- [ ] Lista de todas as supervisoes filtradas
- [ ] Secao de nao-conformidades agrupadas por unidade
- [ ] Graficos de distribuicao (se aplicavel)
- [ ] Layout profissional

**Tecnico:**
- [ ] Usa @react-pdf/renderer
- [ ] Nome do arquivo: `relatorio-supervisao-YYYY-MM-DD.pdf`
- [ ] Funciona com ate 1.000 supervisoes

**Tipo de teste:** Integration test

---

### Tarefa 6.4: Criar API Route para Excel de supervisao

**Responsavel:** backend-specialist
**Arquivo:** `apps/web/src/app/api/relatorios/supervisao/excel/route.ts`
**Dependencias:** Tarefa 1.3 (ExcelJS instalado)

**Descricao:**
Criar API Route que gera Excel de supervisoes.

**Criterios de Aceite (extraidos do backlog):**

**Conteudo do Excel:**
- [ ] Planilha "Resumo" com informacoes do periodo e estatisticas
- [ ] Planilha "Supervisoes" com todas as execucoes:
  - Todas as colunas da listagem
  - Formatacao adequada
- [ ] Planilha "Nao-Conformidades" com:
  - Unidade, data, pergunta, observacao
  - Agrupadas por unidade
- [ ] Planilha "Estatisticas por Unidade" com:
  - Unidade, total de supervisoes, score medio, total de nao-conformidades

**Tecnico:**
- [ ] Usa ExcelJS
- [ ] Nome do arquivo: `relatorio-supervisao-YYYY-MM-DD.xlsx`
- [ ] Funciona com ate 1.000 supervisoes

**Tipo de teste:** Integration test

---

### Tarefa 6.5: Criar componentes de botoes de exportacao

**Responsavel:** frontend-specialist
**Arquivos:**
- `apps/web/src/app/(app)/relatorios/chamados/components/export-buttons.tsx`
- `apps/web/src/app/(app)/relatorios/supervisao/components/export-buttons.tsx`
**Dependencias:** Tarefas 6.1-6.4

**Descricao:**
Criar componentes de botoes para exportacao PDF e Excel.

**Criterios de Aceite (extraidos do backlog):**
- [ ] Botao "Exportar PDF" visivel
- [ ] Botao "Exportar Excel" visivel
- [ ] Botoes desabilitados quando nao ha resultados
- [ ] Indicador de carregamento durante geracao
- [ ] Mensagem de aviso para muitos registros
- [ ] Tratamento de erro com mensagem clara
- [ ] Download automatico do arquivo

**Tipo de teste:** E2E

---

## Fase 7 - Validacao e Testes E2E

### Tarefa 7.1: Criar testes E2E para relatorios de chamados

**Responsavel:** test-writer
**Ferramenta:** Playwright MCP
**Arquivo:** `e2e/relatorios-chamados.spec.ts`
**Dependencias:** Fase 3 completa

**Descricao:**
Criar suite de testes E2E para relatorios de chamados.

**Cenarios de teste:**
```typescript
test.describe('Relatorios de Chamados', () => {
  test('deve acessar pagina de relatorios', async ({ page }) => {
    // Login como usuario com permissao reports:read
    // Navegar para /relatorios/chamados
    // Verificar titulo e componentes visiveis
  });

  test('deve filtrar por periodo', async ({ page }) => {
    // Selecionar data inicial e final
    // Aplicar filtros
    // Verificar resultados atualizados
  });

  test('deve filtrar por departamento e status', async ({ page }) => {
    // Selecionar departamentos
    // Selecionar status
    // Verificar resultados filtrados
  });

  test('deve exibir estatisticas corretas', async ({ page }) => {
    // Aplicar filtros
    // Verificar cards de estatisticas
    // Validar valores
  });

  test('deve exportar PDF', async ({ page }) => {
    // Aplicar filtros
    // Clicar em Exportar PDF
    // Verificar download iniciado
  });

  test('deve exportar Excel', async ({ page }) => {
    // Aplicar filtros
    // Clicar em Exportar Excel
    // Verificar download iniciado
  });

  test('usuario sem permissao nao acessa relatorios', async ({ page }) => {
    // Login como usuario sem reports:read
    // Tentar acessar /relatorios/chamados
    // Verificar acesso negado ou redirect
  });
});
```

**Criterios de Aceite:**
- [ ] Todos os cenarios implementados
- [ ] Testes isolados e reproduziveis
- [ ] Cobertura de permissoes

**Tipo de teste:** E2E

---

### Tarefa 7.2: Criar testes E2E para relatorios de supervisao

**Responsavel:** test-writer
**Ferramenta:** Playwright MCP
**Arquivo:** `e2e/relatorios-supervisao.spec.ts`
**Dependencias:** Fase 5 completa

**Descricao:**
Criar suite de testes E2E para relatorios de supervisao.

**Cenarios de teste:**
```typescript
test.describe('Relatorios de Supervisao', () => {
  test('deve acessar pagina de relatorios de supervisao', async ({ page }) => {
    // Login como supervisor ou gerente
    // Navegar para /relatorios/supervisao
    // Verificar componentes
  });

  test('deve filtrar por unidade (respeitando is_coverage)', async ({ page }) => {
    // Login como supervisor
    // Verificar que apenas unidades com is_coverage aparecem
    // Selecionar unidade
    // Verificar resultados
  });

  test('deve filtrar por score de conformidade', async ({ page }) => {
    // Definir range de score
    // Aplicar filtro
    // Verificar supervisoes retornadas
  });

  test('deve filtrar apenas com nao-conformidades', async ({ page }) => {
    // Marcar checkbox
    // Verificar apenas supervisoes com nao-conformidades
  });

  test('deve exportar PDF individual', async ({ page }) => {
    // Clicar em exportar PDF de uma supervisao especifica
    // Verificar download (reutiliza API existente)
  });

  test('deve exportar PDF consolidado', async ({ page }) => {
    // Aplicar filtros
    // Clicar em Exportar PDF
    // Verificar download
  });

  test('deve exportar Excel', async ({ page }) => {
    // Aplicar filtros
    // Clicar em Exportar Excel
    // Verificar download
  });
});
```

**Criterios de Aceite:**
- [ ] Todos os cenarios implementados
- [ ] Teste de is_coverage para supervisores
- [ ] Cobertura de exportacoes

**Tipo de teste:** E2E

---

### Tarefa 7.3: Validar permissoes e RLS

**Responsavel:** security-auditor
**Ferramenta:** Supabase MCP
**Dependencias:** Fases 2-6 completas

**Descricao:**
Validar que as permissoes e RLS funcionam corretamente.

**Cenarios de seguranca:**

| Usuario | Acao | Resultado |
|---------|------|-----------|
| Admin | Acessar relatorios | Sucesso, ve todos |
| Gerente Operacoes | Acessar relatorios | Sucesso, ve conforme RBAC |
| Supervisor Operacoes | Relatorio supervisao | Sucesso, ve unidades is_coverage |
| Manobrista | Acessar relatorios | Acesso negado |
| Usuario sem permissao | Exportar PDF/Excel | Acesso negado |

**Criterios de Aceite:**
- [ ] Executar `get_advisors({ type: 'security' })` sem alertas
- [ ] Validar permissao `reports:read`
- [ ] Validar filtro por `is_coverage` para supervisores
- [ ] Sem vazamento de dados entre usuarios

**Tipo de teste:** Security audit

---

## Fase 8 - Documentacao e Commit

### Tarefa 8.1: Atualizar BACKLOG.md

**Responsavel:** documentation-writer
**Arquivo:** `docs/BACKLOG.md`
**Dependencias:** Fase 7 completa

**Descricao:**
Marcar tarefas 3.3.2 e 3.3.3 como completas.

**Atualizacoes:**
```markdown
### Epico 3.3 - Dashboard e Relatorios ✅
**Contexto**: visibilidade gerencial pos-MVP.
**Status**: COMPLETO (verificado em 2026-01-XX)

- [x] Tarefa 3.3.1: Dashboard gerencial ✅
- [x] Tarefa 3.3.2: Relatorios de chamados ✅
  - [x] Subtarefa: Filtros por periodo/status ✅ reports-filters.tsx
  - [x] Subtarefa: Exportacao PDF/Excel ✅ API Routes implementadas
- [x] Tarefa 3.3.3: Relatorios de supervisao ✅
  - [x] Subtarefa: Listagem por unidade ✅ supervision-table.tsx
  - [x] Subtarefa: Exportacao simples ✅ API Routes implementadas
```

**Criterios de Aceite:**
- [ ] Tarefas 3.3.2 e 3.3.3 marcadas como completas
- [ ] Status do Epico 3.3 = COMPLETO
- [ ] Data de verificacao adicionada

**Tipo de teste:** N/A

---

### Tarefa 8.2: Commit das alteracoes

**Responsavel:** devops-specialist
**Dependencias:** Tarefa 8.1

**Descricao:**
Realizar commit seguindo Conventional Commits.

**Mensagem de commit:**
```
feat(relatorios): implementa modulo de relatorios de chamados e supervisao

- Cria estrutura do modulo /relatorios com chamados e supervisao
- Implementa Server Actions para busca e agregacao de dados
- Desenvolve componentes de filtros avancados com multi-select
- Cria tabelas com ordenacao, paginacao e estatisticas
- Implementa API Routes para exportacao PDF (@react-pdf/renderer)
- Implementa API Routes para exportacao Excel (ExcelJS)
- Adiciona permissao reports:read ao sistema RBAC
- Adiciona menu Relatorios ao sidebar
- Cria testes E2E com Playwright
- Atualiza documentacao (BACKLOG.md)

Fecha Tarefas 3.3.2 e 3.3.3 do Epico 3.3 (Fase 3)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

**Criterios de Aceite:**
- [ ] Todos os arquivos staged
- [ ] Commit com mensagem descritiva
- [ ] Conventional Commits (feat)
- [ ] Co-authored-by incluido

**Tipo de teste:** N/A

---

## Checklist Final

### Pre-requisitos
- [ ] @react-pdf/renderer ja instalado (v4.3.2)
- [ ] ExcelJS instalado (Tarefa 1.3)
- [ ] Permissao reports:read adicionada
- [ ] Menu Relatorios no sidebar

### Entregas por Fase
- [ ] **Fase 1:** Infraestrutura e permissoes (4 tarefas)
- [ ] **Fase 2:** Backend chamados (2 tarefas)
- [ ] **Fase 3:** Frontend chamados (4 tarefas)
- [ ] **Fase 4:** Backend supervisao (2 tarefas)
- [ ] **Fase 5:** Frontend supervisao (5 tarefas)
- [ ] **Fase 6:** Exportacao PDF/Excel (5 tarefas)
- [ ] **Fase 7:** Testes E2E (3 tarefas)
- [ ] **Fase 8:** Documentacao e commit (2 tarefas)

### Ferramentas MCP a Utilizar

| Ferramenta | Uso |
|------------|-----|
| Supabase MCP | `execute_sql` (queries), `get_advisors` (seguranca) |
| Playwright MCP | Testes E2E |
| Context7 MCP | Documentacao Next.js, ExcelJS, react-pdf |

---

## Dependencias Entre Tarefas

```
Fase 1 (Infraestrutura)
├── 1.1 Permissoes -> 1.2 Sidebar
├── 1.3 ExcelJS (independente)
└── 1.4 Estrutura (independente)

Fase 2 (Backend Chamados)
└── 2.1 Constantes -> 2.2 Actions

Fase 3 (Frontend Chamados)
├── 3.1 Filtros -> 3.2 Tabela
├── 3.3 Stats (paralelo com 3.1)
└── 3.4 Pagina (depende de 3.1, 3.2, 3.3)

Fase 4 (Backend Supervisao)
└── 4.1 Constantes -> 4.2 Actions

Fase 5 (Frontend Supervisao)
├── 5.1 Filtros -> 5.2 Tabela
├── 5.3 Stats (paralelo)
├── 5.4 Graficos (opcional, paralelo)
└── 5.5 Pagina (depende de 5.1-5.4)

Fase 6 (Exportacao)
├── 6.1 PDF Chamados (depende Fase 2)
├── 6.2 Excel Chamados (depende Fase 2, 1.3)
├── 6.3 PDF Supervisao (depende Fase 4)
├── 6.4 Excel Supervisao (depende Fase 4, 1.3)
└── 6.5 Botoes (depende 6.1-6.4)

Fase 7 (Testes)
├── 7.1 E2E Chamados (depende Fase 3, 6)
├── 7.2 E2E Supervisao (depende Fase 5, 6)
└── 7.3 Seguranca (depende 7.1, 7.2)

Fase 8 (Docs)
├── 8.1 Backlog (depende Fase 7)
└── 8.2 Commit (depende 8.1)
```

---

## Estimativa de Arquivos

| Tipo | Quantidade |
|------|------------|
| Server Actions | 2 |
| API Routes | 4 |
| Pages | 3 |
| Components | ~15 |
| Testes E2E | 2 |
| Constantes | 2 |
| **Total** | ~28 arquivos |

---

## Referencias

- API PDF existente: `apps/web/src/app/api/checklists/[executionId]/pdf/route.ts`
- Componente PDF: `supervision-pdf-document.tsx`
- Filtros modelo: `financeiro-filters.tsx`
- Permissoes: `apps/web/src/lib/auth/permissions.ts`
- Sidebar: `apps/web/src/components/layout/app-sidebar.tsx`
