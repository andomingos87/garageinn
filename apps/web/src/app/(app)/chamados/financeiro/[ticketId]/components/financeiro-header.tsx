"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock } from "lucide-react";
import { FinanceiroStatusBadge } from "../../components/financeiro-status-badge";
import { PRIORITY_LABELS, PRIORITY_COLORS } from "../../constants";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FinanceiroHeaderProps {
  ticket: {
    id: string;
    ticket_number: number;
    title: string;
    status: string;
    priority: string | null;
    due_date: string | null;
    created_at: string;
  };
}

export function FinanceiroHeader({ ticket }: FinanceiroHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Back Button */}
      <Button variant="ghost" asChild>
        <Link href="/chamados/financeiro">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para lista
        </Link>
      </Button>

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              #{ticket.ticket_number}
            </span>
            <FinanceiroStatusBadge status={ticket.status} />
            {ticket.priority && (
              <Badge
                variant="outline"
                className={cn("border-0", PRIORITY_COLORS[ticket.priority])}
              >
                {PRIORITY_LABELS[ticket.priority]}
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold">{ticket.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              Criado em{" "}
              {format(new Date(ticket.created_at), "dd/MM/yyyy 'as' HH:mm", {
                locale: ptBR,
              })}
            </span>
            {ticket.due_date && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Prazo:{" "}
                {format(new Date(ticket.due_date), "dd/MM/yyyy", {
                  locale: ptBR,
                })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
