/**
 * Gapp Mobile - useTicketDetails Hook
 *
 * Hook para gerenciar detalhes de um chamado.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import * as ticketsService from '../services/ticketsService';
import type {
  Ticket,
  TicketComment,
  TicketHistoryEntry,
  TicketAttachment,
} from '../types/tickets.types';
import { logger } from '../../../lib/observability';

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

export function useTicketDetails(ticketId: string): UseTicketDetailsReturn {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [history, setHistory] = useState<TicketHistoryEntry[]>([]);
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingComment, setAddingComment] = useState(false);

  const isMounted = useRef(true);

  // Carregar todos os dados do chamado
  const loadData = useCallback(async () => {
    if (!ticketId) return;

    setLoading(true);
    setError(null);

    try {
      // Carregar tudo em paralelo
      const [ticketData, commentsData, historyData, attachmentsData] = await Promise.all([
        ticketsService.fetchTicketById(ticketId),
        ticketsService.fetchTicketComments(ticketId),
        ticketsService.fetchTicketHistory(ticketId),
        ticketsService.fetchTicketAttachments(ticketId),
      ]);

      if (!isMounted.current) return;

      setTicket(ticketData);
      setComments(commentsData);
      setHistory(historyData);
      setAttachments(attachmentsData);

      logger.info('useTicketDetails: Data loaded', {
        ticketId,
        commentsCount: commentsData.length,
        historyCount: historyData.length,
        attachmentsCount: attachmentsData.length,
      });
    } catch (err) {
      if (!isMounted.current) return;
      const message = err instanceof Error ? err.message : 'Erro ao carregar chamado';
      setError(message);
      logger.error('useTicketDetails: Failed to load data', { ticketId, error: err });
    } finally {
      if (!isMounted.current) return;
      setLoading(false);
    }
  }, [ticketId]);

  // Refresh
  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Adicionar comentario
  const addComment = useCallback(
    async (content: string) => {
      if (!ticketId || !content.trim()) return;

      setAddingComment(true);

      try {
        const newComment = await ticketsService.addComment(ticketId, content.trim());

        if (!isMounted.current) return;

        setComments((prev) => [...prev, newComment]);

        logger.info('useTicketDetails: Comment added', { ticketId, commentId: newComment.id });
      } catch (err) {
        if (!isMounted.current) return;
        logger.error('useTicketDetails: Failed to add comment', { ticketId, error: err });
        throw err;
      } finally {
        if (!isMounted.current) return;
        setAddingComment(false);
      }
    },
    [ticketId]
  );

  // Carregar ao montar
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Cleanup
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    ticket,
    comments,
    history,
    attachments,
    loading,
    error,
    refresh,
    addComment,
    addingComment,
  };
}
