// Tipos de chamado comercial
export const COMERCIAL_TYPES = [
  { value: "novo_contrato", label: "Novo Contrato" },
  { value: "renovacao", label: "Renovação de Contrato" },
  { value: "cancelamento", label: "Cancelamento" },
  { value: "proposta", label: "Proposta Comercial" },
  { value: "reclamacao", label: "Reclamação de Cliente" },
  { value: "outros", label: "Outros" },
] as const;

export type ComercialType = (typeof COMERCIAL_TYPES)[number]["value"];

export const COMERCIAL_TYPE_LABELS: Record<string, string> = {
  novo_contrato: "Novo Contrato",
  renovacao: "Renovação de Contrato",
  cancelamento: "Cancelamento",
  proposta: "Proposta Comercial",
  reclamacao: "Reclamação de Cliente",
  outros: "Outros",
};

// Tipos de resolução
export const RESOLUTION_TYPES = [
  { value: "approved", label: "Aprovado" },
  { value: "rejected", label: "Rejeitado" },
  { value: "negotiating", label: "Em Negociação" },
  { value: "pending", label: "Pendente" },
] as const;

export type ResolutionType = (typeof RESOLUTION_TYPES)[number]["value"];

export const RESOLUTION_TYPE_LABELS: Record<string, string> = {
  approved: "Aprovado",
  rejected: "Rejeitado",
  negotiating: "Em Negociação",
  pending: "Pendente",
};

// Transições de status permitidas
export const statusTransitions: Record<string, string[]> = {
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

// Obtém transições permitidas para um status
export function getAllowedTransitions(currentStatus: string): string[] {
  return statusTransitions[currentStatus] || [];
}

// Urgência percebida
export const PERCEIVED_URGENCY = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Média" },
  { value: "alta", label: "Alta" },
] as const;

// Prioridades para triagem
export const PRIORITIES = [
  { value: "low", label: "Baixa" },
  { value: "medium", label: "Média" },
  { value: "high", label: "Alta" },
  { value: "urgent", label: "Urgente" },
] as const;

export const PRIORITY_LABELS: Record<string, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  urgent: "Urgente",
};

export const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

// ID do departamento Comercial
export const COMERCIAL_DEPARTMENT_ID = "60458004-2249-4aab-b7b5-d2558a6add2f";
