"use client";

import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ComercialStatusBadge, PriorityBadge } from "./comercial-status-badge";
import { ComercialTypeBadge } from "./comercial-type-badge";
import {
  FileText,
  MessageSquare,
  Paperclip,
  Building2,
  DollarSign,
} from "lucide-react";

interface ComercialTicket {
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
  // Comercial specific fields
  comercial_type: string | null;
  client_name: string | null;
  client_cnpj: string | null;
  contract_value: number | null;
  proposal_deadline: string | null;
  resolution_type: string | null;
  // Creator info
  created_by_id: string;
  created_by_name: string;
  created_by_avatar: string | null;
  // Counts
  comments_count: number | null;
  attachments_count: number | null;
}

interface ComercialTableProps {
  tickets: ComercialTicket[];
}

function formatCurrency(value: number | null): string {
  if (!value) return "-";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function ComercialTable({ tickets }: ComercialTableProps) {
  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">Nenhum chamado encontrado</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Ajuste os filtros ou crie um novo chamado comercial
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chamados Comerciais</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">#</TableHead>
                <TableHead>Titulo / Cliente</TableHead>
                <TableHead className="hidden md:table-cell">Tipo</TableHead>
                <TableHead className="hidden lg:table-cell">Unidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Prioridade
                </TableHead>
                <TableHead className="hidden xl:table-cell">Valor</TableHead>
                <TableHead className="hidden lg:table-cell">
                  Solicitante
                </TableHead>
                <TableHead className="hidden md:table-cell text-right">
                  Data
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id} className="group">
                  <TableCell className="font-mono text-muted-foreground">
                    <Link
                      href={`/chamados/comercial/${ticket.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      #{ticket.ticket_number}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/chamados/comercial/${ticket.id}`}
                      className="block group-hover:text-primary transition-colors"
                    >
                      <div className="font-medium line-clamp-1">
                        {ticket.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {ticket.client_name && (
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Building2 className="h-3 w-3" />
                            <span className="line-clamp-1">
                              {ticket.client_name}
                            </span>
                          </span>
                        )}
                        {ticket.client_cnpj && (
                          <span className="text-xs text-muted-foreground font-mono hidden xl:inline">
                            {ticket.client_cnpj}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-muted-foreground">
                        {ticket.category_name && (
                          <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                            {ticket.category_name}
                          </span>
                        )}
                        {(ticket.comments_count ?? 0) > 0 && (
                          <span className="flex items-center gap-1 text-xs">
                            <MessageSquare className="h-3 w-3" />
                            {ticket.comments_count}
                          </span>
                        )}
                        {(ticket.attachments_count ?? 0) > 0 && (
                          <span className="flex items-center gap-1 text-xs">
                            <Paperclip className="h-3 w-3" />
                            {ticket.attachments_count}
                          </span>
                        )}
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {ticket.comercial_type ? (
                      <ComercialTypeBadge type={ticket.comercial_type} />
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {ticket.unit_code ? (
                      <span className="text-sm">
                        <span className="font-mono text-muted-foreground">
                          {ticket.unit_code}
                        </span>
                        {ticket.unit_name && (
                          <span className="hidden xl:inline ml-1 text-muted-foreground">
                            - {ticket.unit_name}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <ComercialStatusBadge status={ticket.status} />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {ticket.priority ? (
                      <PriorityBadge priority={ticket.priority} />
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    {ticket.contract_value ? (
                      <span className="flex items-center gap-1 text-sm font-medium">
                        <DollarSign className="h-3 w-3 text-green-600" />
                        {formatCurrency(ticket.contract_value)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage
                          src={ticket.created_by_avatar || undefined}
                        />
                        <AvatarFallback className="text-xs">
                          {ticket.created_by_name?.slice(0, 2).toUpperCase() ||
                            "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm line-clamp-1">
                        {ticket.created_by_name?.split(" ")[0] ||
                          "Desconhecido"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-right">
                    <div className="text-sm">
                      {ticket.proposal_deadline ? (
                        <span className="text-foreground">
                          Prazo:{" "}
                          {format(
                            new Date(ticket.proposal_deadline),
                            "dd/MM/yyyy",
                            { locale: ptBR }
                          )}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          {formatDistanceToNow(new Date(ticket.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
