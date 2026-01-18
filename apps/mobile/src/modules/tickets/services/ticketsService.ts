/**
 * Gapp Mobile - Tickets Service
 *
 * Servico para operacoes de chamados no Supabase.
 */

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
  TicketError,
  TicketCategory,
  Unit,
  PaginatedResponse,
} from '../types/tickets.types';
import { PAGINATION } from '../constants/tickets.constants';

/**
 * Cria um erro tipado
 */
function createTicketError(
  code: TicketError['code'],
  message: string,
  originalError?: Error
): TicketError {
  return { code, message, originalError };
}

/**
 * Mapeia resposta do DB para TicketSummary
 */
function mapDbTicketSummary(row: any): TicketSummary {
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
    unitName: row.units?.name || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Mapeia resposta do DB para Ticket completo
 */
function mapDbTicket(row: any): Ticket {
  return {
    ...mapDbTicketSummary(row),
    description: row.description || '',
    categoryId: row.category_id,
    categoryName: row.ticket_categories?.name || null,
    createdBy: row.created_by,
    createdByName: row.creator?.full_name || '',
    assignedTo: row.assigned_to,
    assignedToName: row.assignee?.full_name || null,
    dueDate: row.due_date,
    resolvedAt: row.resolved_at,
    closedAt: row.closed_at,
    denialReason: row.denial_reason,
  };
}

/**
 * Mapeia resposta do DB para TicketComment
 */
function mapDbComment(row: any): TicketComment {
  return {
    id: row.id,
    ticketId: row.ticket_id,
    content: row.content,
    isInternal: row.is_internal || false,
    createdBy: row.created_by,
    createdByName: row.profiles?.full_name || '',
    createdAt: row.created_at,
  };
}

/**
 * Mapeia resposta do DB para TicketHistoryEntry
 */
function mapDbHistory(row: any): TicketHistoryEntry {
  return {
    id: row.id,
    ticketId: row.ticket_id,
    action: row.action,
    oldValue: row.old_value,
    newValue: row.new_value,
    createdBy: row.created_by,
    createdByName: row.profiles?.full_name || '',
    createdAt: row.created_at,
  };
}

/**
 * Mapeia resposta do DB para TicketAttachment
 */
function mapDbAttachment(row: any): TicketAttachment {
  return {
    id: row.id,
    ticketId: row.ticket_id,
    fileName: row.file_name,
    fileSize: row.file_size,
    mimeType: row.mime_type,
    url: row.file_url,
    createdAt: row.created_at,
  };
}

/**
 * Busca lista de chamados com filtros e paginacao
 */
export async function fetchTickets(
  filters?: TicketFilters,
  page: number = PAGINATION.defaultPage,
  limit: number = PAGINATION.defaultLimit
): Promise<PaginatedResponse<TicketSummary>> {
  logger.info('ticketsService: Fetching tickets', { filters, page, limit });

  try {
    let query = supabase
      .from('tickets')
      .select(
        `
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
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    // Aplicar filtros
    if (filters?.status?.length) {
      query = query.in('status', filters.status);
    }
    if (filters?.priority?.length) {
      query = query.in('priority', filters.priority);
    }
    if (filters?.departmentId) {
      query = query.eq('department_id', filters.departmentId);
    }
    if (filters?.unitId) {
      query = query.eq('unit_id', filters.unitId);
    }
    if (filters?.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,ticket_number::text.ilike.%${filters.search}%`
      );
    }

    const { data, error, count } = await query;

    if (error) {
      logger.error('ticketsService: Error fetching tickets', { error });
      throw error;
    }

    const total = count || 0;
    const tickets = (data || []).map(mapDbTicketSummary);

    logger.info('ticketsService: Tickets loaded', { count: tickets.length, total });

    return {
      data: tickets,
      total,
      page,
      limit,
      hasMore: page * limit < total,
    };
  } catch (error) {
    logger.error('ticketsService: Failed to fetch tickets', { error });
    throw createTicketError('network_error', 'Falha ao carregar chamados', error as Error);
  }
}

/**
 * Busca detalhes de um chamado
 */
export async function fetchTicketById(ticketId: string): Promise<Ticket> {
  logger.info('ticketsService: Fetching ticket details', { ticketId });

  try {
    const { data, error } = await supabase
      .from('tickets')
      .select(
        `
        *,
        departments:department_id (name),
        units:unit_id (name),
        ticket_categories:category_id (name),
        creator:created_by (full_name),
        assignee:assigned_to (full_name)
      `
      )
      .eq('id', ticketId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw createTicketError('ticket_not_found', 'Chamado nao encontrado');
      }
      throw error;
    }

    logger.info('ticketsService: Ticket loaded', { ticketId });

    return mapDbTicket(data);
  } catch (error) {
    if ((error as TicketError).code) {
      throw error;
    }
    logger.error('ticketsService: Failed to fetch ticket', { ticketId, error });
    throw createTicketError('network_error', 'Falha ao carregar chamado', error as Error);
  }
}

/**
 * Cria um novo chamado
 */
export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  logger.info('ticketsService: Creating ticket', { departmentId: input.departmentId });

  try {
    // Obter usuario atual
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw createTicketError('permission_denied', 'Usuario nao autenticado');
    }

    const { data, error } = await supabase
      .from('tickets')
      .insert({
        title: input.title,
        description: input.description,
        department_id: input.departmentId,
        category_id: input.categoryId || null,
        unit_id: input.unitId || null,
        perceived_urgency: input.perceivedUrgency || null,
        created_by: user.id,
        status: 'awaiting_triage',
      })
      .select(
        `
        *,
        departments:department_id (name),
        units:unit_id (name),
        ticket_categories:category_id (name),
        creator:created_by (full_name),
        assignee:assigned_to (full_name)
      `
      )
      .single();

    if (error) {
      logger.error('ticketsService: Error creating ticket', { error });
      throw error;
    }

    logger.info('ticketsService: Ticket created', { ticketId: data.id });

    return mapDbTicket(data);
  } catch (error) {
    if ((error as TicketError).code) {
      throw error;
    }
    logger.error('ticketsService: Failed to create ticket', { error });
    throw createTicketError('network_error', 'Falha ao criar chamado', error as Error);
  }
}

/**
 * Busca comentarios de um chamado
 */
export async function fetchTicketComments(ticketId: string): Promise<TicketComment[]> {
  logger.info('ticketsService: Fetching comments', { ticketId });

  try {
    const { data, error } = await supabase
      .from('ticket_comments')
      .select(
        `
        id,
        ticket_id,
        content,
        is_internal,
        created_by,
        created_at,
        profiles:created_by (full_name)
      `
      )
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) {
      logger.error('ticketsService: Error fetching comments', { error });
      throw error;
    }

    logger.info('ticketsService: Comments loaded', { count: data?.length || 0 });

    return (data || []).map(mapDbComment);
  } catch (error) {
    logger.error('ticketsService: Failed to fetch comments', { error });
    throw createTicketError('network_error', 'Falha ao carregar comentarios', error as Error);
  }
}

/**
 * Adiciona comentario a um chamado
 */
export async function addComment(
  ticketId: string,
  content: string,
  isInternal = false
): Promise<TicketComment> {
  logger.info('ticketsService: Adding comment', { ticketId, isInternal });

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw createTicketError('permission_denied', 'Usuario nao autenticado');
    }

    const { data, error } = await supabase
      .from('ticket_comments')
      .insert({
        ticket_id: ticketId,
        content,
        is_internal: isInternal,
        created_by: user.id,
      })
      .select(
        `
        id,
        ticket_id,
        content,
        is_internal,
        created_by,
        created_at,
        profiles:created_by (full_name)
      `
      )
      .single();

    if (error) {
      logger.error('ticketsService: Error adding comment', { error });
      throw error;
    }

    logger.info('ticketsService: Comment added', { commentId: data.id });

    return mapDbComment(data);
  } catch (error) {
    if ((error as TicketError).code) {
      throw error;
    }
    logger.error('ticketsService: Failed to add comment', { error });
    throw createTicketError('network_error', 'Falha ao adicionar comentario', error as Error);
  }
}

/**
 * Busca historico de um chamado
 */
export async function fetchTicketHistory(ticketId: string): Promise<TicketHistoryEntry[]> {
  logger.info('ticketsService: Fetching history', { ticketId });

  try {
    const { data, error } = await supabase
      .from('ticket_history')
      .select(
        `
        id,
        ticket_id,
        action,
        old_value,
        new_value,
        created_by,
        created_at,
        profiles:created_by (full_name)
      `
      )
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('ticketsService: Error fetching history', { error });
      throw error;
    }

    logger.info('ticketsService: History loaded', { count: data?.length || 0 });

    return (data || []).map(mapDbHistory);
  } catch (error) {
    logger.error('ticketsService: Failed to fetch history', { error });
    throw createTicketError('network_error', 'Falha ao carregar historico', error as Error);
  }
}

/**
 * Busca anexos de um chamado
 */
export async function fetchTicketAttachments(ticketId: string): Promise<TicketAttachment[]> {
  logger.info('ticketsService: Fetching attachments', { ticketId });

  try {
    const { data, error } = await supabase
      .from('ticket_attachments')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) {
      logger.error('ticketsService: Error fetching attachments', { error });
      throw error;
    }

    logger.info('ticketsService: Attachments loaded', { count: data?.length || 0 });

    return (data || []).map(mapDbAttachment);
  } catch (error) {
    logger.error('ticketsService: Failed to fetch attachments', { error });
    throw createTicketError('network_error', 'Falha ao carregar anexos', error as Error);
  }
}

/**
 * Busca categorias de um departamento
 */
export async function fetchCategories(departmentId: string): Promise<TicketCategory[]> {
  logger.info('ticketsService: Fetching categories', { departmentId });

  try {
    const { data, error } = await supabase
      .from('ticket_categories')
      .select('id, name, department_id')
      .eq('department_id', departmentId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      logger.error('ticketsService: Error fetching categories', { error });
      throw error;
    }

    logger.info('ticketsService: Categories loaded', { count: data?.length || 0 });

    return (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      departmentId: row.department_id,
    }));
  } catch (error) {
    logger.error('ticketsService: Failed to fetch categories', { error });
    throw createTicketError('network_error', 'Falha ao carregar categorias', error as Error);
  }
}

/**
 * Busca unidades do usuario
 */
export async function fetchUserUnits(): Promise<Unit[]> {
  logger.info('ticketsService: Fetching user units');

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw createTicketError('permission_denied', 'Usuario nao autenticado');
    }

    const { data, error } = await supabase
      .from('user_units')
      .select(
        `
        unit_id,
        units:unit_id (id, name, code)
      `
      )
      .eq('user_id', user.id);

    if (error) {
      logger.error('ticketsService: Error fetching user units', { error });
      throw error;
    }

    logger.info('ticketsService: User units loaded', { count: data?.length || 0 });

    return (data || [])
      .filter((row) => row.units)
      .map((row) => ({
        id: (row.units as any).id,
        name: (row.units as any).name,
        code: (row.units as any).code,
      }));
  } catch (error) {
    if ((error as TicketError).code) {
      throw error;
    }
    logger.error('ticketsService: Failed to fetch user units', { error });
    throw createTicketError('network_error', 'Falha ao carregar unidades', error as Error);
  }
}

/**
 * Busca o usuario atual
 */
export async function getCurrentUser(): Promise<{ id: string; email: string } | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    return { id: user.id, email: user.email || '' };
  } catch (error) {
    logger.error('ticketsService: Failed to get current user', { error });
    return null;
  }
}
