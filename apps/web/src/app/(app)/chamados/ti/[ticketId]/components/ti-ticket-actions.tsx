"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Play, Settings } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { closeTiTicket, startTiTicket } from "../../actions";

interface TiTicketActionsProps {
  ticketId: string;
  ticketStatus: string;
  canExecute: boolean;
}

export function TiTicketActions({
  ticketId,
  ticketStatus,
  canExecute,
}: TiTicketActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (!canExecute) return null;

  const canStart = ticketStatus === "awaiting_triage";
  const canClose = ticketStatus === "in_progress";

  if (!canStart && !canClose) return null;

  const handleStart = () => {
    startTransition(async () => {
      const result = await startTiTicket(ticketId);
      if (result.error) {
        if (result.code === "conflict") {
          toast.warning(result.error);
          router.refresh();
          return;
        }
        toast.error(result.error);
        return;
      }
      toast.success("Chamado iniciado");
      router.refresh();
    });
  };

  const handleClose = () => {
    startTransition(async () => {
      const result = await closeTiTicket(ticketId);
      if (result.error) {
        if (result.code === "conflict") {
          toast.warning(result.error);
          router.refresh();
          return;
        }
        toast.error(result.error);
        return;
      }
      toast.success("Chamado concluído");
      router.refresh();
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Ações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {canStart && (
          <Button
            className="w-full gap-2"
            onClick={handleStart}
            disabled={isPending}
          >
            <Play className="h-4 w-4" />
            {isPending ? "Processando..." : "Iniciar"}
          </Button>
        )}

        {canClose && (
          <Button
            variant="default"
            className="w-full gap-2"
            onClick={handleClose}
            disabled={isPending}
          >
            <CheckCircle className="h-4 w-4" />
            {isPending ? "Processando..." : "Concluir"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

