"use client";

import { useState, useTransition } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { handleRHApproval } from "../../actions";
import type { ApprovalDecision, ApprovalStatus } from "@/lib/ticket-statuses";
import { APPROVAL_STATUS } from "@/lib/ticket-statuses";

interface Approval {
  id: string;
  approval_level: number;
  approval_role: string;
  status: ApprovalStatus;
  notes: string | null;
  decision_at: string | null;
  created_at: string;
  approver: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
}

interface RHTicketApprovalsProps {
  ticketId: string;
  approvals: Approval[];
  ticketStatus: string;
  currentUserRole?: string;
  isAdmin?: boolean;
}

const roleLabels: Record<string, string> = {
  encarregado: "Encarregado",
  supervisor: "Supervisor",
  gerente: "Gerente",
};

const statusConfig: Record<
  ApprovalStatus,
  { icon: React.ElementType; color: string; label: string }
> = {
  [APPROVAL_STATUS.pending]: {
    icon: Clock,
    color: "text-amber-500",
    label: "Pendente",
  },
  [APPROVAL_STATUS.approved]: {
    icon: CheckCircle2,
    color: "text-green-500",
    label: "Aprovado",
  },
  [APPROVAL_STATUS.denied]: {
    icon: XCircle,
    color: "text-red-500",
    label: "Rejeitado",
  },
};

export function RHTicketApprovals({
  ticketId,
  approvals,
  ticketStatus,
  currentUserRole,
  isAdmin = false,
}: RHTicketApprovalsProps) {
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(
    null
  );
  const [decision, setDecision] = useState<ApprovalDecision | null>(
    null
  );
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  const getInitials = (name: string | null) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const canApproveLevel = (approval: Approval): boolean => {
    if (approval.status !== APPROVAL_STATUS.pending) return false;
    const statusToLevel: Record<string, number> = {
      awaiting_approval_encarregado: 1,
      awaiting_approval_supervisor: 2,
      awaiting_approval_gerente: 3,
    };
    const currentLevel = statusToLevel[ticketStatus];
    if (currentLevel !== approval.approval_level) return false;

    // Admin pode aprovar qualquer nível pendente que seja o atual
    if (isAdmin) return true;

    const roleToLevel: Record<string, number> = {
      Encarregado: 1,
      Supervisor: 2,
      Gerente: 3,
    };
    return currentUserRole
      ? roleToLevel[currentUserRole] === approval.approval_level
      : false;
  };

  const handleOpenDialog = (
    approval: Approval,
    selectedDecision: ApprovalDecision
  ) => {
    setSelectedApproval(approval);
    setDecision(selectedDecision);
    setNotes("");
  };

  const handleSubmitApproval = () => {
    if (!selectedApproval || !decision) return;
    startTransition(async () => {
      const result = await handleRHApproval(
        ticketId,
        selectedApproval.id,
        decision,
        notes || undefined
      );
      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      toast.success(
        decision === APPROVAL_STATUS.approved ? "Aprovado" : "Rejeitado"
      );
      setSelectedApproval(null);
    });
  };

  if (!approvals || approvals.length === 0) return null;

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> Aprovações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {approvals.map((approval) => {
              const config =
                statusConfig[approval.status] || statusConfig.pending;
              const Icon = config.icon;
              const canApprove = canApproveLevel(approval);
              return (
                <div key={approval.id} className="flex gap-4">
                  <div
                    className={`p-2 bg-background border-2 rounded-full h-fit ${approval.status === APPROVAL_STATUS.approved ? "border-green-500" : approval.status === APPROVAL_STATUS.denied ? "border-red-500" : "border-amber-500"}`}
                  >
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {roleLabels[approval.approval_role] ||
                            approval.approval_role}
                        </p>
                        <p className={`text-sm ${config.color}`}>
                          {config.label}
                        </p>
                      </div>
                      {canApprove && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleOpenDialog(approval, APPROVAL_STATUS.approved)
                            }
                          >
                            <ThumbsUp className="h-3 w-3 mr-1" /> Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleOpenDialog(approval, APPROVAL_STATUS.denied)
                            }
                          >
                            <ThumbsDown className="h-3 w-3 mr-1" /> Rejeitar
                          </Button>
                        </div>
                      )}
                    </div>
                    {approval.approver && (
                      <div className="flex items-center gap-2 mt-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage
                            src={approval.approver.avatar_url || undefined}
                          />
                          <AvatarFallback className="text-[10px]">
                            {getInitials(approval.approver.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">
                          {approval.approver.full_name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      <Dialog
        open={!!selectedApproval}
        onOpenChange={() => setSelectedApproval(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {decision === APPROVAL_STATUS.approved ? "Aprovar" : "Rejeitar"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Observações..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedApproval(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmitApproval} disabled={isPending}>
              {isPending ? "Processando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
