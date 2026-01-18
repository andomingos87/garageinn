// ID do departamento Financeiro
export const FINANCEIRO_DEPARTMENT_ID = "589a0e19-768e-4051-bbd2-87cdea103748";

// Transicoes de status permitidas
export const statusTransitions: Record<string, string[]> = {
  awaiting_approval_encarregado: ["awaiting_approval_supervisor", "denied"],
  awaiting_approval_supervisor: ["awaiting_approval_gerente", "denied"],
  awaiting_approval_gerente: ["awaiting_triage", "denied"],
  awaiting_triage: ["prioritized", "in_progress", "denied"],
  prioritized: ["in_progress", "denied", "cancelled"],
  in_progress: ["resolved", "denied", "cancelled"],
  resolved: ["closed"],
  denied: ["awaiting_triage"],
  closed: [],
  cancelled: [],
};

// Labels para status
export const statusLabels: Record<string, string> = {
  awaiting_approval_encarregado: "Aguardando Aprovacao (Encarregado)",
  awaiting_approval_supervisor: "Aguardando Aprovacao (Supervisor)",
  awaiting_approval_gerente: "Aguardando Aprovacao (Gerente)",
  awaiting_triage: "Aguardando Triagem",
  prioritized: "Priorizado",
  in_progress: "Em Andamento",
  resolved: "Resolvido",
  closed: "Fechado",
  denied: "Negado",
  cancelled: "Cancelado",
};

// Cores para status (usando as cores do design system)
export const statusColors: Record<string, string> = {
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
  resolved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  denied: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  cancelled: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

// Prioridades para triagem
export const PRIORITIES = [
  { value: "low", label: "Baixa" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
  { value: "urgent", label: "Urgente" },
] as const;

export const PRIORITY_LABELS: Record<string, string> = {
  low: "Baixa",
  medium: "Media",
  high: "Alta",
  urgent: "Urgente",
};

export const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

// Urgencia percebida
export const PERCEIVED_URGENCY = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
] as const;

// Funcao helper para obter transicoes permitidas
export function getAllowedTransitions(currentStatus: string): string[] {
  return statusTransitions[currentStatus] || [];
}
