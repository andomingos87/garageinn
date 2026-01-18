"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateFinanceiroTicketStatus } from "../../actions";
import { getAllowedTransitions, statusLabels } from "../../constants";

interface FinanceiroActionsProps {
  ticketId: string;
  currentStatus: string;
  canManage: boolean;
}

export function FinanceiroActions({
  ticketId,
  currentStatus,
  canManage,
}: FinanceiroActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showDenyDialog, setShowDenyDialog] = useState(false);
  const [denyReason, setDenyReason] = useState("");

  const allowedTransitions = getAllowedTransitions(currentStatus);

  if (!canManage || allowedTransitions.length === 0) {
    return null;
  }

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === "denied") {
      setShowDenyDialog(true);
      return;
    }

    startTransition(async () => {
      const result = await updateFinanceiroTicketStatus(ticketId, newStatus);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Status alterado para ${statusLabels[newStatus]}`);
      }
    });
  };

  const handleDeny = () => {
    if (!denyReason.trim()) {
      toast.error("Justificativa e obrigatoria para negar um chamado");
      return;
    }

    startTransition(async () => {
      const result = await updateFinanceiroTicketStatus(
        ticketId,
        "denied",
        denyReason
      );
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Chamado negado");
        setShowDenyDialog(false);
        setDenyReason("");
      }
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                Alterar Status
                <ChevronDown className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {allowedTransitions.map((status) => (
            <DropdownMenuItem
              key={status}
              onClick={() => handleStatusChange(status)}
              className={status === "denied" ? "text-destructive" : ""}
            >
              {statusLabels[status]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

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
            <Label htmlFor="deny-reason">Justificativa</Label>
            <Textarea
              id="deny-reason"
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
