/**
 * Gapp Mobile - Tickets Types
 *
 * Tipos TypeScript para o modulo de chamados.
 */

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

// Tipo de chamado (mapeado para departamentos)
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

// Categoria de chamado
export interface TicketCategory {
  id: string;
  name: string;
  departmentId: string;
}

// Unidade
export interface Unit {
  id: string;
  name: string;
  code: string;
}

// Resposta paginada
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
