/**
 * Gapp Mobile - Tickets Constants
 *
 * Constantes para o modulo de chamados.
 */

import { colors } from '../../../theme';
import type { TicketStatus, TicketPriority, TicketType } from '../types/tickets.types';

// IDs dos departamentos (do banco de dados)
export const DEPARTMENT_IDS = {
  comprasManutencao: '1973b68b-eed0-440d-9ed3-036f26ebf6f4',
  rh: '5b47223b-9872-4821-89f0-c18611f55ae1',
  sinistros: 'f08e5e16-b198-4a2c-ad5b-c1c448d31177',
  comercial: '60458004-2249-4aab-b7b5-d2558a6add2f',
  financeiro: '589a0e19-768e-4051-bbd2-87cdea103748',
  operacoes: '2ada7239-b44b-4d85-b04b-379333a5545f',
  ti: '1e56d0a3-ed3e-4346-901a-74c1e71c93a1',
  auditoria: '2fee5a8d-0695-43df-a756-7137f7ac150d',
} as const;

// Mapeamento tipo -> departamento
export const TICKET_TYPE_TO_DEPARTMENT: Record<TicketType, string> = {
  sinistro: DEPARTMENT_IDS.sinistros,
  manutencao: DEPARTMENT_IDS.comprasManutencao,
  compras: DEPARTMENT_IDS.comprasManutencao,
  rh: DEPARTMENT_IDS.rh,
};

// Labels de status
export const STATUS_LABELS: Record<TicketStatus, string> = {
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
export const STATUS_COLORS: Record<TicketStatus, { bg: string; text: string }> = {
  awaiting_approval_encarregado: { bg: '#FEF3C7', text: '#92400E' },
  awaiting_approval_supervisor: { bg: '#FEF3C7', text: '#92400E' },
  awaiting_approval_gerente: { bg: '#FEF3C7', text: '#92400E' },
  awaiting_triage: { bg: '#FEF9C3', text: '#854D0E' },
  prioritized: { bg: '#DBEAFE', text: '#1E40AF' },
  in_progress: { bg: '#E9D5FF', text: '#6B21A8' },
  resolved: { bg: '#D1FAE5', text: '#065F46' },
  closed: { bg: '#F3F4F6', text: '#374151' },
  denied: { bg: '#FEE2E2', text: '#991B1B' },
  cancelled: { bg: '#F3F4F6', text: '#6B7280' },
};

// Labels de prioridade
export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: 'Baixa',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente',
};

// Cores de prioridade
export const PRIORITY_COLORS: Record<TicketPriority, { bg: string; text: string }> = {
  low: { bg: '#F3F4F6', text: '#374151' },
  medium: { bg: '#DBEAFE', text: '#1E40AF' },
  high: { bg: '#FFEDD5', text: '#9A3412' },
  urgent: { bg: '#FEE2E2', text: '#991B1B' },
};

// Tipos de chamado com icones (Ionicons)
export const TICKET_TYPES: Array<{
  key: TicketType;
  label: string;
  icon: string;
  color: string;
}> = [
  { key: 'sinistro', label: 'Sinistros', icon: 'car-outline', color: colors.destructive.DEFAULT },
  { key: 'manutencao', label: 'Manutencao', icon: 'build-outline', color: colors.warning.DEFAULT },
  { key: 'compras', label: 'Compras', icon: 'cart-outline', color: colors.info.DEFAULT },
  { key: 'rh', label: 'RH', icon: 'people-outline', color: colors.success.DEFAULT },
];

// Urgencia percebida
export const PERCEIVED_URGENCY_OPTIONS = [
  { value: 'baixa' as const, label: 'Baixa' },
  { value: 'media' as const, label: 'Media' },
  { value: 'alta' as const, label: 'Alta' },
];

// Configuracoes de paginacao
export const PAGINATION = {
  defaultLimit: 20,
  defaultPage: 1,
} as const;

// Configuracoes de anexos
export const ATTACHMENT_CONFIG = {
  maxFiles: 5,
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  photoMaxWidth: 1200,
  photoQuality: 0.7,
} as const;
