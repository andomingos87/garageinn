"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { handleFinanceiroApproval } from "../../actions";
import { cn } from "@/lib/utils";
import type { ApprovalStatus } from "@/lib/ticket-statuses";
import { APPROVAL_FLOW_STATUS, APPROVAL_STATUS } from "@/lib/ticket-statuses";

interface Approval {
  id: string;
  approval_level: number;
  approval_role: string;
  status: ApprovalStatus;
  approved_by: string | null;
  decision_at: string | null;
  notes: string | null;
}

interface FinanceiroApprovalsProps {
  ticketId: string;
  approvals: Approval[];
  currentStatus: string;
  canApprove: boolean;
}

const statusConfig: Record<
  ApprovalStatus,
  { icon: React.ComponentType<{ className?: string }>; color: string; label: string }
> = {
  [APPROVAL_STATUS.pending]: {
    icon: Clock,
    color: "text-yellow-600",
    label: "Pendente",
  },
  [APPROVAL_STATUS.approved]: {
    icon: CheckCircle2,
    color: "text-green-600",
    label: "Aprovado",
  },
  [APPROVAL_STATUS.denied]: {
    icon: XCircle,
    color: "text-red-600",
    label: "Negado",
  },
};

export function FinanceiroApprovals({
  ticketId,
  approvals,
  currentStatus,
  canApprove,
}: FinanceiroApprovalsProps) {
  const [isPending, startTransition] = useTransition();
  const [showDenyDialog, setShowDenyDialog] = useState(false);
  const [selectedApprovalId, setSelectedApprovalId] = useState<string | null>(
    null
  );
  const [denyReason, setDenyReason] = useState("");

  // Ordenar aprovacoes por nivel
  const sortedApprovals = [...approvals].sort(
    (a, b) => a.approval_level - b.approval_level
  );

  // Verificar se o status atual corresponde ao nivel de aprovacao
  const statusLevelMap: Record<string, number> = {
    [APPROVAL_FLOW_STATUS.awaitingApprovalEncarregado]: 1,
    [APPROVAL_FLOW_STATUS.awaitingApprovalSupervisor]: 2,
    [APPROVAL_FLOW_STATUS.awaitingApprovalGerente]: 3,
  };
  const currentLevel = statusLevelMap[currentStatus] || 0;

  const handleApprove = (approvalId: string) => {
    startTransition(async () => {
      const result = await handleFinanceiroApproval(
        ticketId,
        approvalId,
        APPROVAL_STATUS.approved
      );
      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      toast.success("Chamado aprovado");
    });
  };

  const handleDeny = () => {
    if (!selectedApprovalId) return;

    startTransition(async () => {
      const result = await handleFinanceiroApproval(
        ticketId,
        selectedApprovalId,
        APPROVAL_STATUS.denied,
        denyReason
      );
      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      toast.success("Chamado negado");
      setShowDenyDialog(false);
      setDenyReason("");
      setSelectedApprovalId(null);
    });
  };

  const openDenyDialog = (approvalId: string) => {
    setSelectedApprovalId(approvalId);
    setShowDenyDialog(true);
  };

  if (approvals.length === 0) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="h-5 w-5" />
            Fluxo de Aprovacao
          </CardTitle>
          <CardDescription>
            Este chamado requer aprovacao em multiplos niveis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedApprovals.map((approval) => {
              const config = statusConfig[approval.status];
              const StatusIcon = config.icon;
              const isCurrentLevel = approval.approval_level === currentLevel;
              const canAct =
                canApprove &&
                approval.status === APPROVAL_STATUS.pending &&
                isCurrentLevel;

              return (
                <div
                  key={approval.id}
                  className={cn(
                    "flex items-center justify-between rounded-lg border p-4",
                    isCurrentLevel && approval.status === APPROVAL_STATUS.pending
                      ? "border-primary bg-primary/5"
                      : ""
                  )}
                >
                  <div className="flex items-center gap-3">
                    <StatusIcon className={cn("h-5 w-5", config.color)} />
                    <div>
                      <p className="font-medium">{approval.approval_role}</p>
                      <p className="text-sm text-muted-foreground">
                        Nivel {approval.approval_level}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "border-0",
                        approval.status === APPROVAL_STATUS.approved &&
                          "bg-green-100 text-green-800",
                        approval.status === APPROVAL_STATUS.denied &&
                          "bg-red-100 text-red-800",
                        approval.status === APPROVAL_STATUS.pending &&
                          "bg-yellow-100 text-yellow-800"
                      )}
                    >
                      {config.label}
                    </Badge>

                    {canAct && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(approval.id)}
                          disabled={isPending}
                        >
                          {isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openDenyDialog(approval.id)}
                          disabled={isPending}
                        >
                          Negar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Deny Dialog */}
      <AlertDialog open={showDenyDialog} onOpenChange={setShowDenyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Negar Chamado</AlertDialogTitle>
            <AlertDialogDescription>
              Por favor, informe a justificativa para negar este chamado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="deny-reason-approval">Justificativa</Label>
            <Textarea
              id="deny-reason-approval"
              placeholder="Informe o motivo da negacao..."
              value={denyReason}
              onChange={(e) => setDenyReason(e.target.value)}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeny}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar Negacao
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
