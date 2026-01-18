"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FinanceiroStatusBadge } from "./financeiro-status-badge";
import { PRIORITY_LABELS, PRIORITY_COLORS } from "../constants";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FinanceiroTicket {
  id: string;
  ticket_number: number;
  title: string;
  status: string;
  priority: string | null;
  perceived_urgency: string | null;
  created_at: string;
  category_name: string | null;
  unit_name: string | null;
  unit_code: string | null;
  created_by_id: string;
  created_by_name: string;
  created_by_avatar: string | null;
  assigned_to_id: string | null;
  assigned_to_name: string | null;
  assigned_to_avatar: string | null;
}

interface FinanceiroTableProps {
  tickets: FinanceiroTicket[];
}

export function FinanceiroTable({ tickets }: FinanceiroTableProps) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">Nenhum chamado encontrado</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Numero</TableHead>
            <TableHead>Titulo</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Unidade</TableHead>
            <TableHead>Prioridade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Responsavel</TableHead>
            <TableHead>Criado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell>
                <Link
                  href={`/chamados/financeiro/${ticket.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  #{ticket.ticket_number}
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={`/chamados/financeiro/${ticket.id}`}
                  className="hover:underline"
                >
                  <span className="line-clamp-1 max-w-[250px]">
                    {ticket.title}
                  </span>
                </Link>
              </TableCell>
              <TableCell>
                {ticket.category_name && (
                  <Badge variant="outline">{ticket.category_name}</Badge>
                )}
              </TableCell>
              <TableCell>
                {ticket.unit_code && (
                  <span className="text-sm text-muted-foreground">
                    {ticket.unit_code}
                  </span>
                )}
              </TableCell>
              <TableCell>
                {ticket.priority && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "border-0",
                      PRIORITY_COLORS[ticket.priority]
                    )}
                  >
                    {PRIORITY_LABELS[ticket.priority]}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <FinanceiroStatusBadge status={ticket.status} />
              </TableCell>
              <TableCell>
                {ticket.assigned_to_name ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={ticket.assigned_to_avatar || undefined} />
                      <AvatarFallback className="text-xs">
                        {ticket.assigned_to_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{ticket.assigned_to_name}</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(ticket.created_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
