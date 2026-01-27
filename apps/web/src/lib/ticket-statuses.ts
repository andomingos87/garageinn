export const APPROVAL_STATUS = {
  pending: "pending",
  approved: "approved",
  denied: "denied",
} as const;

export type ApprovalStatus =
  (typeof APPROVAL_STATUS)[keyof typeof APPROVAL_STATUS];

export const APPROVAL_DECISION = {
  approved: "approved",
  denied: "denied",
} as const;

export type ApprovalDecision =
  (typeof APPROVAL_DECISION)[keyof typeof APPROVAL_DECISION];

export const APPROVAL_FLOW_STATUS = {
  awaitingApprovalEncarregado: "awaiting_approval_encarregado",
  awaitingApprovalSupervisor: "awaiting_approval_supervisor",
  awaitingApprovalGerente: "awaiting_approval_gerente",
  awaitingTriage: "awaiting_triage",
  denied: "denied",
} as const;

export type ApprovalFlowStatus =
  (typeof APPROVAL_FLOW_STATUS)[keyof typeof APPROVAL_FLOW_STATUS];

export function normalizeApprovalStatus(
  status: string | null | undefined
): ApprovalStatus {
  if (status === APPROVAL_STATUS.pending) return APPROVAL_STATUS.pending;
  if (status === APPROVAL_STATUS.approved) return APPROVAL_STATUS.approved;
  if (status === APPROVAL_STATUS.denied) return APPROVAL_STATUS.denied;
  return APPROVAL_STATUS.pending;
}
