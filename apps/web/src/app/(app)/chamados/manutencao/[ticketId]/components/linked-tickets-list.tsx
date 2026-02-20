"use client";

import Link from "next/link";
import { ShoppingCart, Monitor, ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "../../../components/status-badge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LinkedTicket {
  id: string;
  ticket_number: number;
  title: string;
  status: string;
  created_at: string;
  department_name: string;
}

interface LinkedTicketsListProps {
  linkedTickets: LinkedTicket[];
}

function getDepartmentRoute(departmentName: string): string {
  if (departmentName === "Compras e Manutenção") return "/chamados/compras";
  if (departmentName === "TI") return "/chamados/ti";
  return "/chamados";
}

function getDepartmentIcon(departmentName: string) {
  if (departmentName === "Compras e Manutenção")
    return <ShoppingCart className="h-4 w-4 text-purple-600" />;
  return <Monitor className="h-4 w-4 text-blue-600" />;
}

function getDepartmentLabel(departmentName: string): string {
  if (departmentName === "Compras e Manutenção") return "Compras";
  return departmentName;
}

export function LinkedTicketsList({ linkedTickets }: LinkedTicketsListProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          Chamados Vinculados
          {linkedTickets.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {linkedTickets.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {linkedTickets.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum chamado vinculado
          </p>
        ) : (
          <div className="space-y-3">
            {linkedTickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`${getDepartmentRoute(ticket.department_name)}/${ticket.id}`}
                className="flex items-center gap-3 rounded-md border p-3 transition-colors hover:bg-muted/50"
              >
                {getDepartmentIcon(ticket.department_name)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      #{ticket.ticket_number}
                    </span>
                    <span className="text-sm truncate">
                      {ticket.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={ticket.status} size="sm" />
                    <Badge
                      variant="outline"
                      className="text-xs"
                    >
                      {getDepartmentLabel(ticket.department_name)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(ticket.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
