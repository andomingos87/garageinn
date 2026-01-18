/**
 * Constantes para o módulo de Relatórios de Chamados
 */

// Status disponíveis para filtro
export const TICKET_STATUSES = [
  { value: "awaiting_triage", label: "Aguardando Triagem" },
  { value: "prioritized", label: "Priorizado" },
  { value: "in_progress", label: "Em Andamento" },
  { value: "resolved", label: "Resolvido" },
  { value: "closed", label: "Fechado" },
  { value: "denied", label: "Negado" },
  { value: "cancelled", label: "Cancelado" },
] as const;

// Labels de status para exibição
export const STATUS_LABELS: Record<string, string> = {
  awaiting_approval_encarregado: "Aguardando Aprovação (Encarregado)",
  awaiting_approval_supervisor: "Aguardando Aprovação (Supervisor)",
  awaiting_approval_gerente: "Aguardando Aprovação (Gerente)",
  awaiting_triage: "Aguardando Triagem",
  prioritized: "Priorizado",
  in_progress: "Em Andamento",
  quoting: "Em Cotação",
  approved: "Aprovado",
  awaiting_return: "Aguardando Retorno",
  resolved: "Resolvido",
  closed: "Fechado",
  denied: "Negado",
  cancelled: "Cancelado",
};

// Cores de status
export const STATUS_COLORS: Record<string, string> = {
  awaiting_approval_encarregado:
    "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  awaiting_approval_supervisor:
    "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  awaiting_approval_gerente:
    "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  awaiting_triage:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  prioritized: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  in_progress:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  quoting:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  approved: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  awaiting_return:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  resolved:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  denied: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  cancelled: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

// Prioridades
export const TICKET_PRIORITIES = [
  { value: "low", label: "Baixa" },
  { value: "medium", label: "Média" },
  { value: "high", label: "Alta" },
  { value: "urgent", label: "Urgente" },
] as const;

// Labels de prioridade
export const PRIORITY_LABELS: Record<string, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  urgent: "Urgente",
};

// Cores de prioridade
export const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

// Períodos rápidos
export const QUICK_PERIODS = [
  { value: "today", label: "Hoje" },
  { value: "last7days", label: "Últimos 7 dias" },
  { value: "last30days", label: "Últimos 30 dias" },
  { value: "last90days", label: "Últimos 90 dias" },
  { value: "thisMonth", label: "Mês atual" },
  { value: "lastMonth", label: "Mês anterior" },
] as const;

// Items por página
export const ITEMS_PER_PAGE_OPTIONS = [25, 50, 100] as const;
export const DEFAULT_ITEMS_PER_PAGE = 50;

// Prefixos de número de chamado por departamento
export const DEPARTMENT_PREFIXES: Record<string, string> = {
  Operações: "OPS",
  "Compras e Manutenção": "CPM",
  Financeiro: "FIN",
  RH: "RH",
  Comercial: "COM",
  Sinistros: "SIN",
  TI: "TI",
  Auditoria: "AUD",
};

// Helper para calcular datas de períodos
export function getDateRangeFromPeriod(period: string): {
  startDate: Date;
  endDate: Date;
} {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const endDate = new Date(today);

  const startDate = new Date(today);
  startDate.setHours(0, 0, 0, 0);

  switch (period) {
    case "today":
      break;
    case "last7days":
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "last30days":
      startDate.setDate(startDate.getDate() - 30);
      break;
    case "last90days":
      startDate.setDate(startDate.getDate() - 90);
      break;
    case "thisMonth":
      startDate.setDate(1);
      break;
    case "lastMonth":
      startDate.setMonth(startDate.getMonth() - 1);
      startDate.setDate(1);
      endDate.setDate(0); // Último dia do mês anterior
      break;
    default:
      startDate.setDate(startDate.getDate() - 30);
  }

  return { startDate, endDate };
}
