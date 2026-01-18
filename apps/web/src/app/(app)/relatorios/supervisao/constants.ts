/**
 * Constantes para o módulo de Relatórios de Supervisão
 */

// Status de execução
export const EXECUTION_STATUSES = [
  { value: "in_progress", label: "Em Andamento" },
  { value: "completed", label: "Concluído" },
] as const;

// Labels de status
export const EXECUTION_STATUS_LABELS: Record<string, string> = {
  in_progress: "Em Andamento",
  completed: "Concluído",
};

// Cores de status
export const EXECUTION_STATUS_COLORS: Record<string, string> = {
  in_progress:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  completed:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

// Faixas de score para filtro
export const SCORE_RANGES = [
  { value: "0-50", label: "Crítico (0-50%)", min: 0, max: 50 },
  { value: "51-70", label: "Baixo (51-70%)", min: 51, max: 70 },
  { value: "71-90", label: "Médio (71-90%)", min: 71, max: 90 },
  { value: "91-100", label: "Alto (91-100%)", min: 91, max: 100 },
] as const;

// Cores para scores
export const SCORE_COLORS = {
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", // 0-50
  low: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200", // 51-70
  medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", // 71-90
  high: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", // 91-100
} as const;

/**
 * Retorna a classe de cor CSS para um score de conformidade
 */
export function getScoreColor(score: number): string {
  if (score <= 50) return SCORE_COLORS.critical;
  if (score <= 70) return SCORE_COLORS.low;
  if (score <= 90) return SCORE_COLORS.medium;
  return SCORE_COLORS.high;
}

/**
 * Retorna o label da faixa de score
 */
export function getScoreLabel(score: number): string {
  if (score <= 50) return "Crítico";
  if (score <= 70) return "Baixo";
  if (score <= 90) return "Médio";
  return "Alto";
}

// Períodos rápidos
export const QUICK_PERIODS = [
  { value: "today", label: "Hoje" },
  { value: "last7days", label: "Últimos 7 dias" },
  { value: "last30days", label: "Últimos 30 dias" },
  { value: "thisMonth", label: "Mês atual" },
  { value: "lastMonth", label: "Mês anterior" },
] as const;

// Items por página
export const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50] as const;
export const DEFAULT_ITEMS_PER_PAGE = 20;

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
    case "thisMonth":
      startDate.setDate(1);
      break;
    case "lastMonth":
      startDate.setMonth(startDate.getMonth() - 1);
      startDate.setDate(1);
      endDate.setDate(0);
      break;
    default:
      startDate.setDate(startDate.getDate() - 30);
  }

  return { startDate, endDate };
}
