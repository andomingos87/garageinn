"use client";

import { Truck, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PurchaseDetails {
  delivery_date?: string | null;
  delivery_address?: string | null;
  delivery_notes?: string | null;
  delivery_confirmed_at?: string | null;
  delivery_rating?: number | null;
}

interface DeliverySectionProps {
  purchaseDetails: PurchaseDetails | null;
  ticketStatus: string;
}

const DELIVERY_STATUSES = ["in_delivery", "delivered"];

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "Não informado";
  try {
    return format(parseISO(dateStr), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return dateStr;
  }
}

function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "Não informado";
  try {
    return format(parseISO(dateStr), "dd/MM/yyyy 'às' HH:mm", {
      locale: ptBR,
    });
  } catch {
    return dateStr;
  }
}

export function DeliverySection({
  purchaseDetails,
  ticketStatus,
}: DeliverySectionProps) {
  if (!DELIVERY_STATUSES.includes(ticketStatus)) {
    return null;
  }

  const rating = purchaseDetails?.delivery_rating ?? 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Truck className="h-4 w-4" />
          Entrega
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              Data prevista
            </p>
            <p className="text-sm font-medium">
              {formatDate(purchaseDetails?.delivery_date)}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Endereço</p>
            <p className="text-sm font-medium">
              {purchaseDetails?.delivery_address || "Não informado"}
            </p>
          </div>

          {purchaseDetails?.delivery_notes && (
            <div className="col-span-full">
              <p className="text-xs text-muted-foreground mb-1">Observações</p>
              <p className="text-sm whitespace-pre-wrap">
                {purchaseDetails.delivery_notes}
              </p>
            </div>
          )}

          {purchaseDetails?.delivery_confirmed_at && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Confirmado em
              </p>
              <p className="text-sm font-medium">
                {formatDateTime(purchaseDetails.delivery_confirmed_at)}
              </p>
            </div>
          )}

          {rating > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Avaliação</p>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
