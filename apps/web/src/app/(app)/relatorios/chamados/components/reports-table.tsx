"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  ITEMS_PER_PAGE_OPTIONS,
  DEPARTMENT_PREFIXES,
} from "../constants";
import type { TicketReportItem, ReportResult } from "../actions";

interface ReportsTableProps {
  data: ReportResult;
}

export function ReportsTable({ data }: ReportsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSort = searchParams.get("sortBy") || "created_at";
  const currentOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";
  const currentLimit = parseInt(searchParams.get("limit") || "50", 10);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
          if (value === null) {
            params.delete(key);
          } else {
            params.set(key, value);
          }
        });
        router.push(`/relatorios/chamados?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const handleSort = useCallback(
    (column: string) => {
      const newOrder =
        currentSort === column && currentOrder === "desc" ? "asc" : "desc";
      updateParams({ sortBy: column, sortOrder: newOrder, page: null });
    },
    [currentSort, currentOrder, updateParams]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateParams({ page: page.toString() });
    },
    [updateParams]
  );

  const handleLimitChange = useCallback(
    (limit: string) => {
      updateParams({ limit, page: null });
    },
    [updateParams]
  );

  const renderSortIcon = (column: string) => {
    if (currentSort !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return currentOrder === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  const formatTicketNumber = (ticket: TicketReportItem) => {
    const prefix = ticket.department
      ? DEPARTMENT_PREFIXES[ticket.department.name] || "TKT"
      : "TKT";
    return `${prefix}-${ticket.ticket_number.toString().padStart(5, "0")}`;
  };

  const getTicketLink = (ticket: TicketReportItem) => {
    if (!ticket.department) return "#";
    const deptName = ticket.department.name.toLowerCase();
    const deptMap: Record<string, string> = {
      "operacoes": "operacoes",
      "compras e manutencao": "compras",
      "financeiro": "financeiro",
      "rh": "rh",
      "comercial": "comercial",
      "sinistros": "sinistros",
      "ti": "ti",
      "auditoria": "auditoria",
    };
    const route = deptMap[deptName] || "operacoes";
    return `/chamados/${route}/${ticket.id}`;
  };

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("ticket_number")}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Numero
                  {renderSortIcon("ticket_number")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("title")}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Titulo
                  {renderSortIcon("title")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("status")}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Status
                  {renderSortIcon("status")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("priority")}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Prioridade
                  {renderSortIcon("priority")}
                </Button>
              </TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("created_at")}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Criado em
                  {renderSortIcon("created_at")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("resolved_at")}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Resolvido em
                  {renderSortIcon("resolved_at")}
                </Button>
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.tickets.length > 0 ? (
              data.tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-mono text-sm">
                    {formatTicketNumber(ticket)}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {ticket.title}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        STATUS_COLORS[ticket.status] ||
                        "bg-gray-100 text-gray-800"
                      }
                    >
                      {STATUS_LABELS[ticket.status] || ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {ticket.priority && (
                      <Badge
                        className={
                          PRIORITY_COLORS[ticket.priority] ||
                          "bg-gray-100 text-gray-800"
                        }
                      >
                        {PRIORITY_LABELS[ticket.priority] || ticket.priority}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{ticket.department?.name || "-"}</TableCell>
                  <TableCell>
                    {ticket.unit
                      ? `${ticket.unit.code} - ${ticket.unit.name}`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {format(new Date(ticket.created_at), "dd/MM/yyyy HH:mm", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>
                    {ticket.resolved_at
                      ? format(
                          new Date(ticket.resolved_at),
                          "dd/MM/yyyy HH:mm",
                          { locale: ptBR }
                        )
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Link href={getTicketLink(ticket)} target="_blank">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-24 text-center text-muted-foreground"
                >
                  Nenhum chamado encontrado para os filtros selecionados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Mostrar</span>
          <Select
            value={currentLimit.toString()}
            onValueChange={handleLimitChange}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option.toString()}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>de {data.total} resultados</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handlePageChange(1)}
            disabled={data.page <= 1 || isPending}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handlePageChange(data.page - 1)}
            disabled={data.page <= 1 || isPending}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="text-sm">
            Pagina {data.page} de {data.totalPages || 1}
          </span>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handlePageChange(data.page + 1)}
            disabled={data.page >= data.totalPages || isPending}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handlePageChange(data.totalPages)}
            disabled={data.page >= data.totalPages || isPending}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
