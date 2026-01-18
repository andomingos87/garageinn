"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Settings, Loader2, ArrowRight, X, CheckCircle } from "lucide-react";
import { statusLabels, getAllowedTransitions } from "../../constants";
import { updateComercialTicketStatus } from "../../actions";

interface ComercialStatusActionsProps {
  ticketId: string;
  currentStatus: string;
  canManage: boolean;
}

export function ComercialStatusActions({
  ticketId,
  currentStatus,
  canManage,
}: ComercialStatusActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const allowedTransitions = getAllowedTransitions(currentStatus);

  if (!canManage || allowedTransitions.length === 0) {
    return null;
  }

  const handleStatusChange = () => {
    if (!selectedStatus) return;

    startTransition(async () => {
      const result = await updateComercialTicketStatus(
        ticketId,
        selectedStatus,
        selectedStatus === "denied" ? reason : undefined
      );

      if (result.success) {
        setIsOpen(false);
        setSelectedStatus(null);
        setReason("");
      }
    });
  };

  const getStatusButtonVariant = (status: string) => {
    switch (status) {
      case "denied":
      case "cancelled":
        return "destructive";
      case "resolved":
      case "closed":
        return "default";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "denied":
      case "cancelled":
        return <X className="h-4 w-4 mr-2" />;
      case "resolved":
      case "closed":
        return <CheckCircle className="h-4 w-4 mr-2" />;
      default:
        return <ArrowRight className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Acoes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground mb-4">
          Status atual:{" "}
          <span className="font-medium">{statusLabels[currentStatus]}</span>
        </p>

        <div className="flex flex-wrap gap-2">
          {allowedTransitions.map((status) => (
            <Dialog
              key={status}
              open={isOpen && selectedStatus === status}
              onOpenChange={(open) => {
                setIsOpen(open);
                if (open) {
                  setSelectedStatus(status);
                } else {
                  setSelectedStatus(null);
                  setReason("");
                }
              }}
            >
              <DialogTrigger asChild>
                <Button variant={getStatusButtonVariant(status)} size="sm">
                  {getStatusIcon(status)}
                  {statusLabels[status]}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Alterar Status</DialogTitle>
                  <DialogDescription>
                    Voce esta alterando o status de{" "}
                    <strong>{statusLabels[currentStatus]}</strong> para{" "}
                    <strong>{statusLabels[status]}</strong>.
                  </DialogDescription>
                </DialogHeader>

                {status === "denied" && (
                  <div className="space-y-2">
                    <Label htmlFor="reason">Motivo da negacao *</Label>
                    <Textarea
                      id="reason"
                      placeholder="Descreva o motivo..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                    />
                  </div>
                )}

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    disabled={isPending}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleStatusChange}
                    disabled={
                      isPending || (status === "denied" && !reason.trim())
                    }
                    variant={getStatusButtonVariant(status)}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Alterando...
                      </>
                    ) : (
                      "Confirmar"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
