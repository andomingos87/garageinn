/**
 * Gapp Mobile - useTickets Hook
 *
 * Hook para gerenciar listagem de chamados.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import * as ticketsService from '../services/ticketsService';
import type { TicketSummary, TicketFilters, TicketType } from '../types/tickets.types';
import { TICKET_TYPE_TO_DEPARTMENT, PAGINATION } from '../constants/tickets.constants';
import { logger } from '../../../lib/observability';

interface UseTicketsOptions {
  initialFilters?: TicketFilters;
  ticketType?: TicketType;
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

export function useTickets(options: UseTicketsOptions = {}): UseTicketsReturn {
  const { initialFilters = {}, ticketType, autoLoad = true } = options;

  // Aplicar filtro de departamento se ticketType foi fornecido
  const getInitialFilters = useCallback((): TicketFilters => {
    if (ticketType) {
      return {
        ...initialFilters,
        departmentId: TICKET_TYPE_TO_DEPARTMENT[ticketType],
      };
    }
    return initialFilters;
  }, [ticketType, initialFilters]);

  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<TicketFilters>(getInitialFilters());

  const isMounted = useRef(true);

  // Carregar chamados
  const loadTickets = useCallback(
    async (pageNum: number, isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      }
      setError(null);

      try {
        const response = await ticketsService.fetchTickets(
          filters,
          pageNum,
          PAGINATION.defaultLimit
        );

        if (!isMounted.current) return;

        if (isRefresh || pageNum === 1) {
          setTickets(response.data);
        } else {
          setTickets((prev) => [...prev, ...response.data]);
        }
        setTotal(response.total);
        setPage(pageNum);

        logger.info('useTickets: Tickets loaded', {
          page: pageNum,
          count: response.data.length,
          total: response.total,
        });
      } catch (err) {
        if (!isMounted.current) return;
        const message = err instanceof Error ? err.message : 'Erro ao carregar chamados';
        setError(message);
        logger.error('useTickets: Failed to load tickets', { error: err });
      } finally {
        if (!isMounted.current) return;
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filters]
  );

  // Carregar mais (paginacao infinita)
  const loadMore = useCallback(async () => {
    if (loading || refreshing) return;
    if (tickets.length >= total) return;

    await loadTickets(page + 1);
  }, [loading, refreshing, tickets.length, total, page, loadTickets]);

  // Refresh (pull-to-refresh)
  const refresh = useCallback(async () => {
    await loadTickets(1, true);
  }, [loadTickets]);

  // Atualizar filtros
  const setFilters = useCallback((newFilters: TicketFilters) => {
    setFiltersState(newFilters);
    setPage(1);
    setTickets([]);
  }, []);

  // Carregar automaticamente ao montar ou quando filtros mudarem
  useEffect(() => {
    if (autoLoad) {
      loadTickets(1);
    }
  }, [autoLoad, loadTickets]);

  // Cleanup
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    tickets,
    total,
    page,
    loading,
    refreshing,
    error,
    filters,
    setFilters,
    loadMore,
    refresh,
    hasMore: tickets.length < total,
  };
}
