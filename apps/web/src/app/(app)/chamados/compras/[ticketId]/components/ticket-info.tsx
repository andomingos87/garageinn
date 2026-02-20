"use client";

import { Package, Hash, DollarSign, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeliverySection } from "./delivery-section";

interface PurchaseDetails {
  delivery_date?: string | null;
  delivery_address?: string | null;
  delivery_notes?: string | null;
  delivery_confirmed_at?: string | null;
  delivery_rating?: number | null;
}

interface TicketInfoProps {
  ticket: {
    description: string;
    item_name?: string | null;
    quantity?: number | null;
    unit_of_measure?: string | null;
    estimated_price?: number | null;
    items?: Array<{
      item_name: string;
      quantity: number;
      unit_of_measure: string | null;
      estimated_price: number | null;
    }>;
    denial_reason: string | null;
    status: string;
    purchase_details?: PurchaseDetails | null;
  };
}

export function TicketInfo({ ticket }: TicketInfoProps) {
  const formatCurrency = (value: number | null) => {
    if (!value) return "Não informado";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const items =
    ticket.items && ticket.items.length > 0
      ? ticket.items
      : ticket.item_name
        ? [
            {
              item_name: ticket.item_name,
              quantity: ticket.quantity || 0,
              unit_of_measure: ticket.unit_of_measure || "un",
              estimated_price: ticket.estimated_price ?? null,
            },
          ]
        : [];

  const totalEstimated = items.reduce((sum, item) => {
    if (!item.estimated_price) return sum;
    return sum + item.estimated_price * item.quantity;
  }, 0);

  return (
    <div className="space-y-4">
      {/* Detalhes do Item */}
      {items.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" />
              Itens solicitados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={`${item.item_name}-${index}`}
                  className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-md border p-3"
                >
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Item</p>
                    <p className="font-medium">{item.item_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      Quantidade
                    </p>
                    <p className="font-medium">
                      {item.quantity} {item.unit_of_measure || "un"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Preço Estimado
                    </p>
                    <p className="font-medium">
                      {formatCurrency(item.estimated_price)}
                    </p>
                  </div>
                  {item.estimated_price && item.quantity ? (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Total Estimado
                      </p>
                      <p className="font-medium text-primary">
                        {formatCurrency(item.estimated_price * item.quantity)}
                      </p>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground">
                      Total estimado não informado
                    </div>
                  )}
                </div>
              ))}
            </div>

            {totalEstimated > 0 && (
              <div className="flex justify-end pt-3 text-sm">
                <span className="text-muted-foreground mr-2">
                  Total estimado:
                </span>
                <span className="font-semibold text-primary">
                  {formatCurrency(totalEstimated)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Justificativa */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Justificativa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
        </CardContent>
      </Card>

      {/* Seção de Entrega */}
      <DeliverySection
        purchaseDetails={ticket.purchase_details ?? null}
        ticketStatus={ticket.status}
      />

      {/* Motivo da Negação (se negado) */}
      {ticket.status === "denied" && ticket.denial_reason && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-destructive">
              Motivo da Negação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive/90 whitespace-pre-wrap">
              {ticket.denial_reason}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
