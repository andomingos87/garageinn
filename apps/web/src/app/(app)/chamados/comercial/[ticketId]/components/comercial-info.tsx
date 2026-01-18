"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { COMERCIAL_TYPE_LABELS, RESOLUTION_TYPE_LABELS } from "../../constants";

interface ComercialInfoProps {
  ticket: {
    description: string | null;
  };
  comercialDetails: {
    comercial_type: string;
    resolution_type: string | null;
    resolution_notes: string | null;
    negotiation_notes: string | null;
    competitor_info: string | null;
  } | null;
}

export function ComercialInfo({
  ticket,
  comercialDetails,
}: ComercialInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Informacoes do Chamado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tipo Comercial */}
        {comercialDetails?.comercial_type && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">
              Tipo Comercial
            </h4>
            <p className="font-medium">
              {COMERCIAL_TYPE_LABELS[comercialDetails.comercial_type] ||
                comercialDetails.comercial_type}
            </p>
          </div>
        )}

        {/* Descricao */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">
            Descricao
          </h4>
          <p className="whitespace-pre-wrap">
            {ticket.description || "Sem descricao"}
          </p>
        </div>

        {/* Resolucao */}
        {comercialDetails?.resolution_type && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">
              Resolucao
            </h4>
            <p className="font-medium">
              {RESOLUTION_TYPE_LABELS[comercialDetails.resolution_type] ||
                comercialDetails.resolution_type}
            </p>
            {comercialDetails.resolution_notes && (
              <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                {comercialDetails.resolution_notes}
              </p>
            )}
          </div>
        )}

        {/* Informacoes do Concorrente */}
        {comercialDetails?.competitor_info && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">
              Informacoes do Concorrente
            </h4>
            <p className="whitespace-pre-wrap">
              {comercialDetails.competitor_info}
            </p>
          </div>
        )}

        {/* Notas da Negociacao */}
        {comercialDetails?.negotiation_notes && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">
              Notas da Negociacao
            </h4>
            <p className="whitespace-pre-wrap">
              {comercialDetails.negotiation_notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
