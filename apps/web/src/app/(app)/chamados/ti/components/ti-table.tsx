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
import { StatusBadge } from "../../components/status-badge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { TiTicketListItem } from "../types";

interface TiTableProps {
  tickets: TiTicketListItem[];
}

export function TiTable({ tickets }: TiTableProps) {
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
            <TableHead>Equipamento</TableHead>
            <TableHead>Unidade</TableHead>
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
                  href={`/chamados/ti/${ticket.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  #{ticket.ticket_number}
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={`/chamados/ti/${ticket.id}`}
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
                {ticket.equipment_type ? (
                  <span className="text-sm text-muted-foreground">
                    {ticket.equipment_type}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
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
                <StatusBadge status={ticket.status} size="sm" />
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
