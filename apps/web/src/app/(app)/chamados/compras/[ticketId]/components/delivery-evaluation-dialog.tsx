"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { evaluateDelivery } from "../../actions";

interface DeliveryEvaluationDialogProps {
  ticketId: string;
  disabled?: boolean;
}

export function DeliveryEvaluationDialog({
  ticketId,
  disabled,
}: DeliveryEvaluationDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Selecione uma avaliação de 1 a 5 estrelas");
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("delivery_rating", String(rating));

    startTransition(async () => {
      const result = await evaluateDelivery(ticketId, formData);

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

      toast.success("Avaliação registrada");
      setIsOpen(false);
      setRating(0);
      router.refresh();
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    setRating(0);
    setHoverRating(0);
  };

  const activeRating = hoverRating || rating;

  return (
    <>
      <Button
        variant="default"
        className="w-full gap-2"
        onClick={() => setIsOpen(true)}
        disabled={disabled}
      >
        <Star className="h-4 w-4" />
        Avaliar Entrega
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Avaliar Entrega</DialogTitle>
            <DialogDescription>
              Como foi a sua experiência com a entrega deste pedido?
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Avaliação *</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 rounded transition-colors hover:bg-accent"
                  >
                    <Star
                      className={`h-7 w-7 transition-colors ${
                        star <= activeRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-muted-foreground">
                  {rating === 1 && "Muito ruim"}
                  {rating === 2 && "Ruim"}
                  {rating === 3 && "Regular"}
                  {rating === 4 && "Bom"}
                  {rating === 5 && "Excelente"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery_feedback">Comentário (opcional)</Label>
              <Textarea
                id="delivery_feedback"
                name="delivery_feedback"
                placeholder="Descreva sua experiência com a entrega..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending || rating === 0}>
                {isPending ? "Enviando..." : "Enviar Avaliação"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
