"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { registerDelivery } from "../../actions";

interface DeliveryRegistrationDialogProps {
  ticketId: string;
  disabled?: boolean;
  onSuccess?: () => void;
}

export function DeliveryRegistrationDialog({
  ticketId,
  disabled,
  onSuccess,
}: DeliveryRegistrationDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await registerDelivery(ticketId, formData);

      if (result.error) {
        if (result.code === "conflict") {
          toast.warning(result.error);
          router.refresh();
          setIsOpen(false);
          return;
        }
        toast.error(result.error);
        return;
      }

      toast.success("Entrega registrada");
      setIsOpen(false);
      onSuccess?.();
      router.refresh();
    });
  };

  return (
    <>
      <Button
        variant="default"
        className="w-full gap-2"
        onClick={() => setIsOpen(true)}
        disabled={disabled}
      >
        <Truck className="h-4 w-4" />
        Enviar para Entrega
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Entrega</DialogTitle>
            <DialogDescription>
              Informe os detalhes da entrega para avançar o chamado.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="delivery_date">Data prevista de entrega *</Label>
              <Input
                id="delivery_date"
                name="delivery_date"
                type="date"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery_address">Endereço de entrega</Label>
              <Input
                id="delivery_address"
                name="delivery_address"
                placeholder="Endereço onde o item será entregue"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery_notes">Observações</Label>
              <Textarea
                id="delivery_notes"
                name="delivery_notes"
                placeholder="Informações adicionais sobre a entrega..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Registrando..." : "Confirmar Entrega"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
