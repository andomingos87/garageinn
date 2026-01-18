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
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import {
  EXECUTION_STATUS_LABELS,
  EXECUTION_STATUS_COLORS,
  ITEMS_PER_PAGE_OPTIONS,
  getScoreColor,
} from "../constants";
import type { SupervisionReportResult } from "../actions";

interface SupervisionTableProps {
  data: SupervisionReportResult;
}

export function SupervisionTable({ data }: SupervisionTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSort = searchParams.get("sortBy") || "started_at";
  const currentOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";
  const currentLimit = parseInt(searchParams.get("limit") || "20", 10);

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
        router.push(`/relatorios/supervisao?${params.toString()}`);
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
                  onClick={() => handleSort("started_at")}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Data
                  {renderSortIcon("started_at")}
                </Button>
              </TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Supervisor</TableHead>
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
              <TableHead>Score</TableHead>
              <TableHead>Conformidade</TableHead>
              <TableHead>NC</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.executions.length > 0 ? (
              data.executions.map((execution) => (
                <TableRow key={execution.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {format(
                          new Date(execution.started_at),
                          "dd/MM/yyyy",
                          { locale: ptBR }
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(execution.started_at), "HH:mm", {
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {execution.unit ? (
                      <div className="flex flex-col">
                        <span className="font-medium">{execution.unit.code}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {execution.unit.name}
                        </span>
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="truncate max-w-[150px]">
                      {execution.supervisor?.full_name || "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        EXECUTION_STATUS_COLORS[execution.status] ||
                        "bg-gray-100 text-gray-800"
                      }
                    >
                      {EXECUTION_STATUS_LABELS[execution.status] ||
                        execution.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getScoreColor(execution.conformity_score)}>
                      {execution.conformity_score}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {execution.conformity_count}/{execution.total_questions}
                    </span>
                  </TableCell>
                  <TableCell>
                    {execution.has_non_conformities && (
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/checklists?executionId=${execution.id}`}
                      target="_blank"
                    >
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
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  Nenhuma supervisao encontrada para os filtros selecionados.
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
