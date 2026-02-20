// Constantes e tipos para chamados de TI

// Transições de status permitidas para TI
export const statusTransitions: Record<string, string[]> = {
  awaiting_approval_encarregado: ["awaiting_approval_supervisor", "denied"],
  awaiting_approval_supervisor: ["awaiting_approval_gerente", "denied"],
  awaiting_approval_gerente: ["awaiting_triage", "denied"],
  awaiting_triage: ["in_progress", "denied"],
  in_progress: ["executing", "waiting_parts", "denied", "cancelled"],
  executing: ["waiting_parts", "resolved", "denied"],
  waiting_parts: ["executing", "resolved", "denied"],
  resolved: ["closed"],
  denied: ["awaiting_triage"],
  closed: [],
  cancelled: [],
};

// Labels para status de TI
export const statusLabels: Record<string, string> = {
  awaiting_approval_encarregado: "Aguardando Aprovação (Encarregado)",
  awaiting_approval_supervisor: "Aguardando Aprovação (Supervisor)",
  awaiting_approval_gerente: "Aguardando Aprovação (Gerente)",
  awaiting_triage: "Pronto para Execução",
  in_progress: "Em Andamento",
  executing: "Em Execução",
  waiting_parts: "Aguardando Peças",
  resolved: "Resolvido",
  closed: "Fechado",
  denied: "Negado",
  cancelled: "Cancelado",
};

/**
 * Mapeamento de permissões necessárias para cada transição de status
 * - "tickets:execute": Executar ações operacionais
 * - null: Sem restrição de permissão específica
 */
export const transitionPermissions: Record<string, "tickets:execute" | null> = {
  in_progress: "tickets:execute",
  executing: "tickets:execute",
  waiting_parts: "tickets:execute",
  resolved: "tickets:execute",
  closed: "tickets:execute",
  cancelled: "tickets:execute",
  denied: "tickets:execute",
  awaiting_approval_encarregado: null,
  awaiting_approval_supervisor: null,
  awaiting_approval_gerente: null,
  awaiting_triage: null,
};

/**
 * Retorna a permissão necessária para uma transição de status
 */
export function getTransitionPermission(
  status: string
): "tickets:execute" | null {
  return transitionPermissions[status] ?? null;
}
