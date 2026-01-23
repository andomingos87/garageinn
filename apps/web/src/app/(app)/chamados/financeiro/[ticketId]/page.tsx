import { notFound, redirect } from "next/navigation";
import {
  getFinanceiroTicket,
  canTriageFinanceiroTicket,
  getFinanceiroDepartmentMembers,
  checkIsAdmin,
  checkCanAccessFinanceiro,
} from "../actions";
import {
  FinanceiroHeader,
  FinanceiroInfo,
  FinanceiroActions,
  FinanceiroComments,
  FinanceiroTimeline,
  FinanceiroTriageDialog,
  FinanceiroApprovals,
} from "./components";

interface PageProps {
  params: Promise<{ ticketId: string }>;
}

export default async function FinanceiroTicketDetailPage({
  params,
}: PageProps) {
  const { ticketId } = await params;

  const canAccess = await checkCanAccessFinanceiro();
  if (!canAccess) {
    redirect("/dashboard");
  }

  const [ticket, canTriage, departmentMembers, isAdmin] = await Promise.all([
    getFinanceiroTicket(ticketId),
    canTriageFinanceiroTicket(),
    getFinanceiroDepartmentMembers(),
    checkIsAdmin(),
  ]);

  if (!ticket) {
    notFound();
  }

  // Verificar se pode gerenciar (admin, responsavel ou gerente)
  const canManage = isAdmin || canTriage;

  // Verificar se esta aguardando triagem
  const isAwaitingTriage = ticket.status === "awaiting_triage";

  // Verificar se esta em fluxo de aprovacao
  const isInApprovalFlow = [
    "awaiting_approval_encarregado",
    "awaiting_approval_supervisor",
    "awaiting_approval_gerente",
  ].includes(ticket.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <FinanceiroHeader ticket={ticket} />

      {/* Acoes principais */}
      <div className="flex flex-wrap gap-4">
        {/* Triagem */}
        {isAwaitingTriage && canTriage && (
          <FinanceiroTriageDialog
            ticketId={ticketId}
            departmentMembers={departmentMembers}
          />
        )}

        {/* Mudanca de Status */}
        {!isInApprovalFlow && (
          <FinanceiroActions
            ticketId={ticketId}
            currentStatus={ticket.status}
            canManage={canManage}
          />
        )}
      </div>

      {/* Fluxo de Aprovacao */}
      {isInApprovalFlow && ticket.approvals && (
        <FinanceiroApprovals
          ticketId={ticketId}
          approvals={ticket.approvals}
          currentStatus={ticket.status}
          canApprove={canManage}
        />
      )}

      {/* Informacoes */}
      <FinanceiroInfo ticket={ticket} />

      {/* Comentarios e Timeline */}
      <div className="grid gap-6 lg:grid-cols-2">
        <FinanceiroComments
          ticketId={ticketId}
          comments={ticket.comments || []}
        />
        <FinanceiroTimeline history={ticket.history || []} />
      </div>
    </div>
  );
}
