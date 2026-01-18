---
status: completed
generated: 2026-01-18
completed: 2026-01-18
epic: "4.2"
title: "Fluxo de Chamados (Mobile)"
priority: high
agents:
  - type: "mobile-specialist"
    role: "Implementar telas e componentes do modulo de chamados mobile"
  - type: "backend-specialist"
    role: "Criar servicos de integracao com Supabase"
  - type: "test-writer"
    role: "Criar testes unitarios e de integracao"
  - type: "frontend-specialist"
    role: "Adaptar componentes UI existentes"
docs:
  - "project-overview.md"
  - "architecture.md"
  - "data-flow.md"
phases:
  - id: "phase-1"
    name: "Tipos e Constantes"
    prevc: "P"
    status: "completed"
  - id: "phase-2"
    name: "Servicos (ticketsService)"
    prevc: "E"
    status: "completed"
  - id: "phase-3"
    name: "Hooks (useTickets, useNewTicket)"
    prevc: "E"
    status: "completed"
  - id: "phase-4"
    name: "Componentes Reutilizaveis"
    prevc: "E"
    status: "completed"
  - id: "phase-5"
    name: "Telas (List, Details, New)"
    prevc: "E"
    status: "completed"
  - id: "phase-6"
    name: "Validacao e Testes"
    prevc: "V"
    status: "completed"
  - id: "phase-7"
    name: "Documentacao"
    prevc: "C"
    status: "completed"
---

# Plano: Epico 4.2 - Fluxo de Chamados (Mobile)

> Implementacao do modulo de chamados no aplicativo mobile Expo, permitindo que usuarios em campo listem, criem e acompanhem chamados de diferentes departamentos.

## Visao Geral

### Objetivo Principal

Implementar as funcionalidades de chamados no app mobile que atualmente mostram placeholder "Em desenvolvimento":
- **TicketDetailsScreen** - Exibir detalhes completos de um chamado
- **NewTicketScreen** - Formulario de criacao de chamados com anexos via camera

### Status Atual (Verificado em 2026-01-18)

| Tela | Arquivo | Status |
|------|---------|--------|
| TicketsListScreen | `modules/tickets/screens/TicketsListScreen.tsx` | Parcial (dados mockados) |
| TicketDetailsScreen | `modules/tickets/screens/TicketDetailsScreen.tsx` | Placeholder |
| NewTicketScreen | `modules/tickets/screens/NewTicketScreen.tsx` | Placeholder |

### Arquitetura de Referencia

O modulo de **Checklists** ja implementado serve como referencia arquitetural:

```
modules/checklists/
├── components/          # Componentes reutilizaveis (PhotoPicker, QuestionCard)
├── hooks/               # useChecklistExecution, useUnitSelection
├── screens/             # ChecklistsListScreen, ChecklistExecutionScreen
├── services/            # checklistService, photoService, draftService
└── types/               # checklist.types.ts
```

### Tipos de Chamados Suportados

```typescript
type TicketType = 'sinistro' | 'manutencao' | 'compras' | 'rh';
```

Mapeamento para departamentos:
- `sinistro` → Sinistros (claims)
- `manutencao` → Manutencao (maintenance)
- `compras` → Compras (procurement)
- `rh` → RH (human resources)

---

## Fase 1 - Tipos e Constantes

### Tarefa 1.1: Criar arquivo de tipos

**Responsavel:** mobile-specialist
**Arquivo:** `apps/mobile/src/modules/tickets/types/tickets.types.ts` (criar)
**Dependencias:** Nenhuma

**Descricao:**
Definir tipos TypeScript para o modulo de chamados, baseado na estrutura do banco de dados.

**Tipos a implementar:**

```typescript
// Status possiveis de um chamado
export type TicketStatus =
  | 'awaiting_approval_encarregado'
  | 'awaiting_approval_supervisor'
  | 'awaiting_approval_gerente'
  | 'awaiting_triage'
  | 'prioritized'
  | 'in_progress'
  | 'resolved'
  | 'closed'
  | 'denied'
  | 'cancelled';

// Prioridades
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

// Urgencia percebida (ao criar)
export type PerceivedUrgency = 'baixa' | 'media' | 'alta';

// Tipo de chamado
export type TicketType = 'sinistro' | 'manutencao' | 'compras' | 'rh';

// Ticket resumido (para listagem)
export interface TicketSummary {
  id: string;
  ticketNumber: number;
  title: string;
  status: TicketStatus;
  priority: TicketPriority | null;
  perceivedUrgency: PerceivedUrgency | null;
  departmentId: string;
  departmentName: string;
  unitId: string | null;
  unitName: string | null;
  createdAt: string;
  updatedAt: string;
}

// Ticket completo (para detalhes)
export interface Ticket extends TicketSummary {
  description: string;
  categoryId: string | null;
  categoryName: string | null;
  createdBy: string;
  createdByName: string;
  assignedTo: string | null;
  assignedToName: string | null;
  dueDate: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  denialReason: string | null;
}

// Comentario
export interface TicketComment {
  id: string;
  ticketId: string;
  content: string;
  isInternal: boolean;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

// Anexo
export interface TicketAttachment {
  id: string;
  ticketId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  createdAt: string;
}

// Historico
export interface TicketHistoryEntry {
  id: string;
  ticketId: string;
  action: string;
  oldValue: string | null;
  newValue: string | null;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

// Input para criacao
export interface CreateTicketInput {
  title: string;
  description: string;
  departmentId: string;
  categoryId?: string;
  unitId?: string;
  perceivedUrgency?: PerceivedUrgency;
  attachments?: TicketPhoto[];
}

// Foto/anexo local (antes de upload)
export interface TicketPhoto {
  id: string;
  uri: string;
  uploadStatus: 'pending' | 'uploading' | 'uploaded' | 'failed';
  uploadedUrl?: string;
  fileName?: string;
  mimeType?: string;
}

// Erro tipado
export type TicketErrorCode =
  | 'ticket_not_found'
  | 'permission_denied'
  | 'validation_error'
  | 'network_error'
  | 'upload_failed'
  | 'unknown';

export interface TicketError {
  code: TicketErrorCode;
  message: string;
  originalError?: Error;
}

// Filtros para listagem
export interface TicketFilters {
  status?: TicketStatus[];
  priority?: TicketPriority[];
  departmentId?: string;
  unitId?: string;
  search?: string;
}
```

**Criterios de Aceite (do backlog):**
- [x] Tipos cobrem estrutura da tabela `tickets`
- [x] Tipos para comentarios, anexos e historico
- [x] Tipos para input de criacao
- [x] Interface de erro tipada
- [x] Compatibilidade com tipos do web (`database.types.ts`)

**Tipo de teste:** N/A (tipos)

---

### Tarefa 1.2: Criar arquivo de constantes

**Responsavel:** mobile-specialist
**Arquivo:** `apps/mobile/src/modules/tickets/constants/tickets.constants.ts` (criar)
**Dependencias:** Tarefa 1.1

**Descricao:**
Definir constantes como IDs de departamentos, labels de status, cores e mapeamentos.

**Constantes a implementar:**

```typescript
import { colors } from '../../../theme';

// IDs dos departamentos (do seed)
export const DEPARTMENT_IDS = {
  sinistros: 'UUID_SINISTROS',
  manutencao: 'UUID_MANUTENCAO',
  compras: 'UUID_COMPRAS',
  rh: 'UUID_RH',
} as const;

// Mapeamento tipo -> departamento
export const TICKET_TYPE_TO_DEPARTMENT: Record<string, string> = {
  sinistro: DEPARTMENT_IDS.sinistros,
  manutencao: DEPARTMENT_IDS.manutencao,
  compras: DEPARTMENT_IDS.compras,
  rh: DEPARTMENT_IDS.rh,
};

// Labels de status
export const STATUS_LABELS: Record<string, string> = {
  awaiting_approval_encarregado: 'Aguardando Aprovacao',
  awaiting_approval_supervisor: 'Aguardando Aprovacao',
  awaiting_approval_gerente: 'Aguardando Aprovacao',
  awaiting_triage: 'Aguardando Triagem',
  prioritized: 'Priorizado',
  in_progress: 'Em Andamento',
  resolved: 'Resolvido',
  closed: 'Fechado',
  denied: 'Negado',
  cancelled: 'Cancelado',
};

// Cores de status para badges
export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  awaiting_approval_encarregado: { bg: colors.warning.light, text: colors.warning.dark },
  awaiting_approval_supervisor: { bg: colors.warning.light, text: colors.warning.dark },
  awaiting_approval_gerente: { bg: colors.warning.light, text: colors.warning.dark },
  awaiting_triage: { bg: colors.warning.light, text: colors.warning.dark },
  prioritized: { bg: colors.info.light, text: colors.info.dark },
  in_progress: { bg: colors.primary.light, text: colors.primary.dark },
  resolved: { bg: colors.success.light, text: colors.success.dark },
  closed: { bg: colors.muted.light, text: colors.muted.dark },
  denied: { bg: colors.destructive.light, text: colors.destructive.dark },
  cancelled: { bg: colors.muted.light, text: colors.muted.dark },
};

// Labels de prioridade
export const PRIORITY_LABELS: Record<string, string> = {
  low: 'Baixa',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente',
};

// Cores de prioridade
export const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  low: { bg: colors.muted.light, text: colors.muted.dark },
  medium: { bg: colors.info.light, text: colors.info.dark },
  high: { bg: colors.warning.light, text: colors.warning.dark },
  urgent: { bg: colors.destructive.light, text: colors.destructive.dark },
};

// Tipos de chamado com icones
export const TICKET_TYPES = [
  { key: 'sinistro', label: 'Sinistros', icon: 'car', color: colors.destructive.DEFAULT },
  { key: 'manutencao', label: 'Manutencao', icon: 'build', color: colors.warning.DEFAULT },
  { key: 'compras', label: 'Compras', icon: 'cart', color: colors.info.DEFAULT },
  { key: 'rh', label: 'RH', icon: 'people', color: colors.success.DEFAULT },
] as const;

// Urgencia percebida
export const PERCEIVED_URGENCY_OPTIONS = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
] as const;
```

**Criterios de Aceite:**
- [ ] IDs de departamentos corretos (buscar no banco)
- [ ] Labels em portugues
- [ ] Cores consistentes com design system
- [ ] Icones Ionicons validos

**Tipo de teste:** Unit test (opcional)

---

## Fase 2 - Servicos (ticketsService)

### Tarefa 2.1: Criar servico principal de chamados

**Responsavel:** backend-specialist
**Arquivo:** `apps/mobile/src/modules/tickets/services/ticketsService.ts` (criar)
**Dependencias:** Tarefa 1.1, Tarefa 1.2

**Descricao:**
Implementar servico com operacoes CRUD de chamados via Supabase, seguindo padrao do `checklistService.ts`.

**Funcoes a implementar:**

| Funcao | Descricao | Retorno |
|--------|-----------|---------|
| `fetchTickets(filters?, page?, limit?)` | Listar chamados do usuario | `Promise<{ tickets: TicketSummary[], total: number }>` |
| `fetchTicketById(id)` | Obter detalhes de um chamado | `Promise<Ticket>` |
| `createTicket(input)` | Criar novo chamado | `Promise<Ticket>` |
| `fetchTicketComments(ticketId)` | Listar comentarios | `Promise<TicketComment[]>` |
| `addComment(ticketId, content)` | Adicionar comentario | `Promise<TicketComment>` |
| `fetchTicketHistory(ticketId)` | Listar historico | `Promise<TicketHistoryEntry[]>` |
| `fetchTicketAttachments(ticketId)` | Listar anexos | `Promise<TicketAttachment[]>` |
| `fetchCategories(departmentId)` | Listar categorias do departamento | `Promise<Category[]>` |
| `fetchUserUnits()` | Listar unidades do usuario | `Promise<Unit[]>` |

**Estrutura do arquivo:**

```typescript
import { supabase } from '../../../lib/supabase/client';
import { logger } from '../../../lib/observability';
import type {
  Ticket,
  TicketSummary,
  TicketComment,
  TicketHistoryEntry,
  TicketAttachment,
  CreateTicketInput,
  TicketFilters,
  TicketError
} from '../types/tickets.types';

// Mapper de snake_case para camelCase
function mapDbTicket(row: any): TicketSummary {
  return {
    id: row.id,
    ticketNumber: row.ticket_number,
    title: row.title,
    status: row.status,
    priority: row.priority,
    perceivedUrgency: row.perceived_urgency,
    departmentId: row.department_id,
    departmentName: row.departments?.name || '',
    unitId: row.unit_id,
    unitName: row.units?.name || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchTickets(
  filters?: TicketFilters,
  page = 1,
  limit = 20
): Promise<{ tickets: TicketSummary[]; total: number }> {
  try {
    let query = supabase
      .from('tickets')
      .select(`
        id,
        ticket_number,
        title,
        status,
        priority,
        perceived_urgency,
        department_id,
        unit_id,
        created_at,
        updated_at,
        departments:department_id (name),
        units:unit_id (name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    // Aplicar filtros
    if (filters?.status?.length) {
      query = query.in('status', filters.status);
    }
    if (filters?.departmentId) {
      query = query.eq('department_id', filters.departmentId);
    }
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,ticket_number::text.ilike.%${filters.search}%`);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      tickets: (data || []).map(mapDbTicket),
      total: count || 0,
    };
  } catch (error) {
    logger.error('ticketsService.fetchTickets failed', { error });
    throw createTicketError('network_error', 'Falha ao carregar chamados', error as Error);
  }
}

// ... demais funcoes seguindo mesmo padrao
```

**Criterios de Aceite (do backlog - Tarefa 4.2.1):**
- [ ] Listagem de chamados funciona com filtros basicos
- [ ] Detalhes do chamado carregam corretamente
- [ ] Tratamento de erros com tipos especificos
- [ ] Logs de observabilidade (logger.info, logger.error)
- [ ] RLS aplicado automaticamente pelo Supabase

**Tipo de teste:** Integration test

---

### Tarefa 2.2: Criar servico de upload de anexos

**Responsavel:** backend-specialist
**Arquivo:** `apps/mobile/src/modules/tickets/services/attachmentService.ts` (criar)
**Dependencias:** Tarefa 1.1

**Descricao:**
Implementar servico para upload de fotos/anexos via Supabase Storage, reutilizando logica do `photoService.ts` dos checklists.

**Funcoes a implementar:**

```typescript
import { supabase } from '../../../lib/supabase/client';
import { logger } from '../../../lib/observability';
import type { TicketPhoto } from '../types/tickets.types';

const BUCKET_NAME = 'ticket-attachments';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const PHOTO_MAX_WIDTH = 1200;
const PHOTO_QUALITY = 0.7;

/**
 * Solicita permissao de camera
 */
export async function requestCameraPermission(): Promise<boolean>;

/**
 * Solicita permissao de galeria
 */
export async function requestMediaLibraryPermission(): Promise<boolean>;

/**
 * Abre picker de imagem (camera ou galeria)
 */
export async function pickImage(source: 'camera' | 'gallery'): Promise<string | null>;

/**
 * Comprime imagem antes do upload
 */
export async function compressImage(uri: string): Promise<string>;

/**
 * Faz upload de uma foto para o Supabase Storage
 */
export async function uploadPhoto(
  photo: TicketPhoto,
  ticketId: string,
  onProgress?: (progress: number) => void
): Promise<string>;

/**
 * Cria objeto TicketPhoto a partir de URI local
 */
export function createPhotoObject(uri: string): TicketPhoto;
```

**Criterios de Aceite (do backlog - Tarefa 4.2.2):**
- [ ] Captura via camera funciona
- [ ] Selecao da galeria funciona
- [ ] Compressao de imagem (1200px max, 70% qualidade)
- [ ] Upload para bucket `ticket-attachments`
- [ ] Tracking de progresso de upload
- [ ] Tratamento de permissoes negadas

**Tipo de teste:** Integration test

---

## Fase 3 - Hooks

### Tarefa 3.1: Criar hook useTickets

**Responsavel:** mobile-specialist
**Arquivo:** `apps/mobile/src/modules/tickets/hooks/useTickets.ts` (criar)
**Dependencias:** Tarefa 2.1

**Descricao:**
Hook para gerenciar listagem de chamados com loading states e refresh.

**Interface do hook:**

```typescript
import { useState, useCallback, useEffect } from 'react';
import * as ticketsService from '../services/ticketsService';
import type { TicketSummary, TicketFilters } from '../types/tickets.types';

interface UseTicketsOptions {
  initialFilters?: TicketFilters;
  autoLoad?: boolean;
}

interface UseTicketsReturn {
  tickets: TicketSummary[];
  total: number;
  page: number;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  filters: TicketFilters;
  setFilters: (filters: TicketFilters) => void;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  hasMore: boolean;
}

export function useTickets(options?: UseTicketsOptions): UseTicketsReturn {
  // Implementacao...
}
```

**Criterios de Aceite:**
- [ ] Carrega chamados automaticamente ao montar
- [ ] Suporta pull-to-refresh
- [ ] Suporta paginacao infinita (loadMore)
- [ ] Gerencia estados de loading/error
- [ ] Filtragem funcional

**Tipo de teste:** Unit test

---

### Tarefa 3.2: Criar hook useTicketDetails

**Responsavel:** mobile-specialist
**Arquivo:** `apps/mobile/src/modules/tickets/hooks/useTicketDetails.ts` (criar)
**Dependencias:** Tarefa 2.1

**Descricao:**
Hook para gerenciar detalhes de um chamado especifico.

**Interface do hook:**

```typescript
interface UseTicketDetailsReturn {
  ticket: Ticket | null;
  comments: TicketComment[];
  history: TicketHistoryEntry[];
  attachments: TicketAttachment[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addComment: (content: string) => Promise<void>;
  addingComment: boolean;
}

export function useTicketDetails(ticketId: string): UseTicketDetailsReturn;
```

**Criterios de Aceite:**
- [ ] Carrega detalhes do chamado
- [ ] Carrega comentarios, historico e anexos
- [ ] Permite adicionar comentario
- [ ] Gerencia estados de loading

**Tipo de teste:** Unit test

---

### Tarefa 3.3: Criar hook useNewTicket

**Responsavel:** mobile-specialist
**Arquivo:** `apps/mobile/src/modules/tickets/hooks/useNewTicket.ts` (criar)
**Dependencias:** Tarefa 2.1, Tarefa 2.2

**Descricao:**
Hook para gerenciar criacao de novo chamado com fotos.

**Interface do hook:**

```typescript
interface UseNewTicketOptions {
  ticketType: TicketType;
  onSuccess?: (ticket: Ticket) => void;
}

interface UseNewTicketReturn {
  // Campos do formulario
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  categoryId: string;
  setCategoryId: (value: string) => void;
  unitId: string;
  setUnitId: (value: string) => void;
  perceivedUrgency: PerceivedUrgency | undefined;
  setPerceivedUrgency: (value: PerceivedUrgency) => void;

  // Fotos
  photos: TicketPhoto[];
  addPhoto: (photo: TicketPhoto) => void;
  removePhoto: (photoId: string) => void;

  // Dados auxiliares
  categories: Category[];
  units: Unit[];
  loadingData: boolean;

  // Validacao
  errors: Record<string, string>;
  validate: () => boolean;

  // Submissao
  submit: () => Promise<void>;
  submitting: boolean;
  submitError: string | null;
}

export function useNewTicket(options: UseNewTicketOptions): UseNewTicketReturn;
```

**Criterios de Aceite (do backlog - Tarefa 4.2.2):**
- [ ] Carrega categorias do departamento selecionado
- [ ] Carrega unidades do usuario
- [ ] Gerencia estado de fotos (local e upload)
- [ ] Validacao de campos obrigatorios
- [ ] Submit cria chamado e faz upload de anexos
- [ ] Callback de sucesso funciona

**Tipo de teste:** Unit test

---

## Fase 4 - Componentes Reutilizaveis

### Tarefa 4.1: Criar componente TicketStatusBadge

**Responsavel:** frontend-specialist
**Arquivo:** `apps/mobile/src/modules/tickets/components/TicketStatusBadge.tsx` (criar)
**Dependencias:** Tarefa 1.2

**Descricao:**
Badge colorido para exibir status do chamado.

```typescript
interface TicketStatusBadgeProps {
  status: TicketStatus;
  size?: 'sm' | 'md';
}

export function TicketStatusBadge({ status, size = 'md' }: TicketStatusBadgeProps): JSX.Element;
```

**Criterios de Aceite:**
- [ ] Cores corretas para cada status
- [ ] Labels em portugues
- [ ] Suporte a tamanhos diferentes

**Tipo de teste:** Snapshot test

---

### Tarefa 4.2: Criar componente TicketPriorityBadge

**Responsavel:** frontend-specialist
**Arquivo:** `apps/mobile/src/modules/tickets/components/TicketPriorityBadge.tsx` (criar)
**Dependencias:** Tarefa 1.2

**Descricao:**
Badge colorido para exibir prioridade do chamado.

```typescript
interface TicketPriorityBadgeProps {
  priority: TicketPriority | null;
  size?: 'sm' | 'md';
}

export function TicketPriorityBadge({ priority, size = 'md' }: TicketPriorityBadgeProps): JSX.Element;
```

**Criterios de Aceite:**
- [ ] Cores corretas para cada prioridade
- [ ] Exibe "Nao definida" quando null
- [ ] Labels em portugues

**Tipo de teste:** Snapshot test

---

### Tarefa 4.3: Criar componente TicketCard

**Responsavel:** frontend-specialist
**Arquivo:** `apps/mobile/src/modules/tickets/components/TicketCard.tsx` (criar)
**Dependencias:** Tarefa 4.1, Tarefa 4.2

**Descricao:**
Card para exibir resumo de um chamado na listagem.

```typescript
interface TicketCardProps {
  ticket: TicketSummary;
  onPress: () => void;
}

export function TicketCard({ ticket, onPress }: TicketCardProps): JSX.Element;
```

**Conteudo do card:**
- Numero do chamado (#1234)
- Titulo
- Status badge
- Prioridade badge (se definida)
- Unidade
- Data relativa (ex: "ha 2 dias")

**Criterios de Aceite:**
- [ ] Layout responsivo
- [ ] Pressable com feedback visual
- [ ] Data formatada relativamente (date-fns ou similar)
- [ ] Segue design system

**Tipo de teste:** Snapshot test

---

### Tarefa 4.4: Criar componente TicketForm

**Responsavel:** frontend-specialist
**Arquivo:** `apps/mobile/src/modules/tickets/components/TicketForm.tsx` (criar)
**Dependencias:** Tarefa 3.3, PhotoPicker existente

**Descricao:**
Formulario completo para criacao de chamados.

```typescript
interface TicketFormProps {
  ticketType: TicketType;
  onSubmitSuccess: (ticket: Ticket) => void;
  onCancel: () => void;
}

export function TicketForm({ ticketType, onSubmitSuccess, onCancel }: TicketFormProps): JSX.Element;
```

**Campos do formulario:**
- Titulo (Input, obrigatorio, min 3 chars)
- Categoria (Select/Picker)
- Unidade (Select/Picker, opcional)
- Descricao (TextArea, obrigatorio, min 10 chars)
- Urgencia Percebida (Select: Baixa/Media/Alta)
- Fotos (PhotoPicker, max 5)

**Criterios de Aceite (do backlog - Tarefa 4.2.2):**
- [ ] Campos obrigatorios validados
- [ ] Mensagens de erro claras
- [ ] PhotoPicker integrado (reutilizar de checklists)
- [ ] Loading state no submit
- [ ] Scroll automatico para campo com erro

**Tipo de teste:** Integration test

---

### Tarefa 4.5: Criar componente CommentsList

**Responsavel:** frontend-specialist
**Arquivo:** `apps/mobile/src/modules/tickets/components/CommentsList.tsx` (criar)
**Dependencias:** Tarefa 1.1

**Descricao:**
Lista de comentarios com input para novo comentario.

```typescript
interface CommentsListProps {
  comments: TicketComment[];
  onAddComment: (content: string) => Promise<void>;
  addingComment: boolean;
}

export function CommentsList({ comments, onAddComment, addingComment }: CommentsListProps): JSX.Element;
```

**Criterios de Aceite:**
- [ ] Lista cronologica de comentarios
- [ ] Avatar e nome do autor
- [ ] Data relativa
- [ ] Input para novo comentario
- [ ] Botao de envio com loading

**Tipo de teste:** Snapshot test

---

### Tarefa 4.6: Criar componente TicketTimeline

**Responsavel:** frontend-specialist
**Arquivo:** `apps/mobile/src/modules/tickets/components/TicketTimeline.tsx` (criar)
**Dependencias:** Tarefa 1.1

**Descricao:**
Timeline de historico de mudancas do chamado.

```typescript
interface TicketTimelineProps {
  history: TicketHistoryEntry[];
}

export function TicketTimeline({ history }: TicketTimelineProps): JSX.Element;
```

**Criterios de Aceite:**
- [ ] Linha do tempo visual
- [ ] Icones para cada tipo de acao
- [ ] Descrição da mudanca
- [ ] Data formatada

**Tipo de teste:** Snapshot test

---

### Tarefa 4.7: Criar barrel exports

**Responsavel:** mobile-specialist
**Arquivo:** `apps/mobile/src/modules/tickets/components/index.ts` (criar)
**Dependencias:** Tarefas 4.1 a 4.6

**Descricao:**
Exportar todos os componentes do modulo.

```typescript
export { TicketStatusBadge } from './TicketStatusBadge';
export { TicketPriorityBadge } from './TicketPriorityBadge';
export { TicketCard } from './TicketCard';
export { TicketForm } from './TicketForm';
export { CommentsList } from './CommentsList';
export { TicketTimeline } from './TicketTimeline';
```

**Criterios de Aceite:**
- [ ] Todos os componentes exportados
- [ ] Imports funcionando

**Tipo de teste:** N/A

---

## Fase 5 - Telas

### Tarefa 5.1: Implementar TicketsListScreen

**Responsavel:** mobile-specialist
**Arquivo:** `apps/mobile/src/modules/tickets/screens/TicketsListScreen.tsx` (atualizar)
**Dependencias:** Tarefa 3.1, Tarefa 4.3

**Descricao:**
Atualizar tela de listagem para usar dados reais do Supabase.

**Mudancas necessarias:**
1. Substituir dados mockados por hook `useTickets`
2. Implementar FlatList com paginacao infinita
3. Implementar pull-to-refresh
4. Manter grid de tipos de chamado para criacao
5. Adicionar filtros basicos (status, tipo)

**Criterios de Aceite (do backlog - Tarefa 4.2.1):**
- [ ] Listagem de chamados com filtros basicos
- [ ] Pull-to-refresh funciona
- [ ] Paginacao infinita funciona
- [ ] Loading state inicial
- [ ] Empty state quando sem chamados
- [ ] Navegar para detalhes ao clicar

**Tipo de teste:** E2E

---

### Tarefa 5.2: Implementar TicketDetailsScreen

**Responsavel:** mobile-specialist
**Arquivo:** `apps/mobile/src/modules/tickets/screens/TicketDetailsScreen.tsx` (atualizar)
**Dependencias:** Tarefa 3.2, Tarefas 4.1-4.6

**Descricao:**
Substituir placeholder por tela completa de detalhes.

**Secoes da tela:**
1. **Header**: Numero, titulo, badges de status/prioridade
2. **Info**: Categoria, unidade, autor, responsavel, datas
3. **Descricao**: Texto completo do chamado
4. **Anexos**: Grid de fotos/arquivos (com preview)
5. **Timeline**: Historico de mudancas
6. **Comentarios**: Lista com input para novo

**Criterios de Aceite (do backlog - Tarefa 4.2.1):**
- [ ] Exibe todas as informacoes do chamado
- [ ] Badges de status e prioridade
- [ ] Lista de anexos com preview
- [ ] Timeline de historico
- [ ] Comentarios com input para adicionar
- [ ] Loading state durante carregamento
- [ ] Error state com retry

**Tipo de teste:** E2E

---

### Tarefa 5.3: Implementar NewTicketScreen

**Responsavel:** mobile-specialist
**Arquivo:** `apps/mobile/src/modules/tickets/screens/NewTicketScreen.tsx` (atualizar)
**Dependencias:** Tarefa 3.3, Tarefa 4.4

**Descricao:**
Substituir placeholder por formulario funcional.

**Fluxo:**
1. Receber `type` via route params
2. Exibir TicketForm com tipo correto
3. Ao submeter com sucesso, navegar para detalhes

**Criterios de Aceite (do backlog - Tarefa 4.2.2):**
- [ ] Formulario padrao funciona
- [ ] Campos especificos por tipo de chamado
- [ ] PhotoPicker permite camera e galeria
- [ ] Validacao client-side
- [ ] Loading durante submit
- [ ] Navega para detalhes apos sucesso
- [ ] Botao cancelar volta para lista

**Tipo de teste:** E2E

---

## Fase 6 - Validacao e Testes

### Tarefa 6.1: Criar testes unitarios dos servicos

**Responsavel:** test-writer
**Arquivo:** `apps/mobile/src/modules/tickets/services/__tests__/ticketsService.test.ts` (criar)
**Dependencias:** Fase 2 completa

**Descricao:**
Testes unitarios para o servico de chamados.

**Cenarios:**
```typescript
describe('ticketsService', () => {
  describe('fetchTickets', () => {
    it('deve retornar lista de chamados', async () => {});
    it('deve aplicar filtros corretamente', async () => {});
    it('deve paginar resultados', async () => {});
    it('deve tratar erros de rede', async () => {});
  });

  describe('fetchTicketById', () => {
    it('deve retornar detalhes do chamado', async () => {});
    it('deve lançar erro para ID invalido', async () => {});
  });

  describe('createTicket', () => {
    it('deve criar chamado com sucesso', async () => {});
    it('deve validar campos obrigatorios', async () => {});
  });
});
```

**Criterios de Aceite:**
- [ ] Cobertura minima de 80%
- [ ] Mock do supabase client
- [ ] Testes de casos de erro

**Tipo de teste:** Unit test

---

### Tarefa 6.2: Criar testes de snapshot dos componentes

**Responsavel:** test-writer
**Arquivo:** `apps/mobile/src/modules/tickets/components/__tests__/*.test.tsx` (criar)
**Dependencias:** Fase 4 completa

**Descricao:**
Testes de snapshot para garantir consistencia visual.

**Componentes a testar:**
- TicketStatusBadge
- TicketPriorityBadge
- TicketCard
- CommentsList
- TicketTimeline

**Criterios de Aceite:**
- [ ] Snapshots para todos os estados
- [ ] Snapshots para diferentes props

**Tipo de teste:** Snapshot test

---

### Tarefa 6.3: Validar integracao com Supabase

**Responsavel:** test-writer
**Ferramenta:** Supabase MCP
**Dependencias:** Fase 5 completa

**Descricao:**
Validar que as operacoes funcionam corretamente com o banco real.

**Validacoes:**

```sql
-- Verificar que RLS permite usuario ver apenas seus chamados
SELECT * FROM tickets WHERE created_by = 'user_id';

-- Verificar que comentarios sao criados corretamente
INSERT INTO ticket_comments (ticket_id, content, created_by) VALUES (...);

-- Verificar que anexos sao salvos no storage
SELECT * FROM storage.objects WHERE bucket_id = 'ticket-attachments';
```

**Criterios de Aceite:**
- [ ] Usuario ve apenas chamados visiveis (RLS)
- [ ] Comentarios sao persistidos
- [ ] Anexos sao salvos no storage
- [ ] Historico e registrado automaticamente

**Tipo de teste:** Integration test

---

## Fase 7 - Documentacao

### Tarefa 7.1: Atualizar BACKLOG.md

**Responsavel:** documentation-writer
**Arquivo:** `docs/BACKLOG.md`
**Dependencias:** Fase 6 completa

**Descricao:**
Marcar tarefas do Epico 4.2 como completas.

**Atualizacoes:**

```markdown
### Epico 4.2 - Fluxo de Chamados (Mobile) ✅
**Contexto**: listar, criar e acompanhar chamados em campo.
**Status**: COMPLETO (verificado em 2026-01-XX)

- [x] Tarefa 4.2.1: Listagem de chamados
  - [x] Subtarefa: Filtros basicos ✅ (TicketsListScreen com useTickets)
  - [x] Subtarefa: Detalhe do chamado ✅ (TicketDetailsScreen implementado)
- [x] Tarefa 4.2.2: Criacao de chamado
  - [x] Subtarefa: Formulario padrao ✅ (NewTicketScreen com TicketForm)
  - [x] Subtarefa: Anexos via camera ✅ (PhotoPicker integrado)
```

**Criterios de Aceite:**
- [ ] Tarefa 4.2.1 marcada como completa
- [ ] Tarefa 4.2.2 marcada como completa
- [ ] Status do Epico 4.2 = COMPLETO
- [ ] Referencias aos arquivos implementados

**Tipo de teste:** N/A

---

## Checklist Final

### Pre-requisitos Verificados
- [x] Modulo de checklists funcional (referencia arquitetural)
- [x] PhotoPicker existente e reutilizavel
- [x] Supabase client configurado no mobile
- [x] Navegacao TicketsStack configurada
- [x] Tema e design system definidos

### Estrutura de Arquivos a Criar

```
apps/mobile/src/modules/tickets/
├── components/
│   ├── index.ts
│   ├── TicketStatusBadge.tsx
│   ├── TicketPriorityBadge.tsx
│   ├── TicketCard.tsx
│   ├── TicketForm.tsx
│   ├── CommentsList.tsx
│   └── TicketTimeline.tsx
├── constants/
│   └── tickets.constants.ts
├── hooks/
│   ├── index.ts
│   ├── useTickets.ts
│   ├── useTicketDetails.ts
│   └── useNewTicket.ts
├── services/
│   ├── ticketsService.ts
│   └── attachmentService.ts
├── types/
│   └── tickets.types.ts
├── screens/
│   ├── TicketsListScreen.tsx    # ATUALIZAR
│   ├── TicketDetailsScreen.tsx  # ATUALIZAR
│   └── NewTicketScreen.tsx      # ATUALIZAR
└── index.ts
```

### Entregas por Fase
- [ ] **Fase 1:** Tipos e constantes definidos (2 arquivos)
- [ ] **Fase 2:** Servicos implementados (2 arquivos)
- [ ] **Fase 3:** Hooks criados (3 arquivos)
- [ ] **Fase 4:** Componentes reutilizaveis (7 arquivos)
- [ ] **Fase 5:** Telas funcionais (3 arquivos atualizados)
- [ ] **Fase 6:** Testes criados e passando
- [ ] **Fase 7:** Documentacao atualizada

### Ferramentas MCP a Utilizar

| Ferramenta | Uso |
|------------|-----|
| Supabase MCP | `execute_sql` (verificar dados), `get_logs` (debug) |
| Context7 MCP | Documentacao Expo, React Native, expo-image-picker |

---

## Dependencias Externas

### Pacotes Expo necessarios (ja instalados)
- `expo-image-picker` - Camera e galeria
- `@expo/vector-icons` - Ionicons

### Verificar instalacao
```bash
cd apps/mobile
npx expo install expo-image-picker
```

### Permissoes (app.json)
```json
{
  "expo": {
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "Permitir acesso as fotos para anexar aos chamados",
          "cameraPermission": "Permitir acesso a camera para fotografar problemas"
        }
      ]
    ]
  }
}
```

---

## Riscos e Mitigacoes

| Risco | Probabilidade | Impacto | Mitigacao |
|-------|--------------|---------|-----------|
| Permissoes de camera negadas | Media | Alto | Exibir mensagem clara e link para configuracoes |
| Upload de arquivos grandes lento | Media | Medio | Comprimir imagens, mostrar progresso |
| Offline sem suporte | Alta | Medio | Fase futura (draft offline) |
| RLS muito restritivo | Baixa | Alto | Testar com diferentes perfis |

---

## Notas de Implementacao

### Padroes a Seguir
1. **Servicos:** Funcoes assincronas com try/catch e logger
2. **Hooks:** Estados separados para loading/error/data
3. **Componentes:** Funcionais com TypeScript strict
4. **Testes:** Jest + React Native Testing Library

### Reutilizacao de Codigo
- **PhotoPicker:** Mover para `components/shared/` ou importar de checklists
- **Tipos:** Podem compartilhar com web via pacote comum (futuro)

### Ordem de Execucao
```
Fase 1 -> Fase 2 -> Fase 3 -> Fase 4 -> Fase 5 -> Fase 6 -> Fase 7
(Tipos)  (Servicos) (Hooks)  (Comps)   (Telas)  (Testes)  (Docs)
```
