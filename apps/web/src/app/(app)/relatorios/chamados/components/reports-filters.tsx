"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-picker";
import { Search, X, Loader2, Download, FileSpreadsheet } from "lucide-react";
import {
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  QUICK_PERIODS,
  getDateRangeFromPeriod,
} from "../constants";
import { MultiSelectFilter } from "./multi-select-filter";

interface ReportsFiltersProps {
  departments: { id: string; name: string }[];
  units: { id: string; name: string; code: string }[];
}

export function ReportsFilters({ departments, units }: ReportsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  // Parse date range from URL
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: startDateParam ? new Date(startDateParam) : undefined,
    to: endDateParam ? new Date(endDateParam) : undefined,
  });

  // Parse multi-select values from URL
  const parseMultiValue = (key: string): string[] => {
    const value = searchParams.get(key);
    return value ? value.split(",") : [];
  };

  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    parseMultiValue("statuses")
  );
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>(
    parseMultiValue("departments")
  );
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(
    parseMultiValue("priorities")
  );
  const [selectedUnits, setSelectedUnits] = useState<string[]>(
    parseMultiValue("unitIds")
  );

  const buildParams = useCallback(() => {
    const params = new URLSearchParams();

    if (dateRange.from) {
      params.set("startDate", format(dateRange.from, "yyyy-MM-dd"));
    }
    if (dateRange.to) {
      params.set("endDate", format(dateRange.to, "yyyy-MM-dd"));
    }
    if (selectedStatuses.length > 0) {
      params.set("statuses", selectedStatuses.join(","));
    }
    if (selectedDepartments.length > 0) {
      params.set("departments", selectedDepartments.join(","));
    }
    if (selectedPriorities.length > 0) {
      params.set("priorities", selectedPriorities.join(","));
    }
    if (selectedUnits.length > 0) {
      params.set("unitIds", selectedUnits.join(","));
    }
    if (search.trim()) {
      params.set("search", search.trim());
    }

    return params;
  }, [
    dateRange,
    selectedStatuses,
    selectedDepartments,
    selectedPriorities,
    selectedUnits,
    search,
  ]);

  const applyFilters = useCallback(() => {
    startTransition(() => {
      const params = buildParams();
      router.push(`/relatorios/chamados?${params.toString()}`);
    });
  }, [router, buildParams]);

  const handleQuickPeriod = useCallback(
    (period: string) => {
      const { startDate, endDate } = getDateRangeFromPeriod(period);
      setDateRange({ from: startDate, to: endDate });
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        applyFilters();
      }
    },
    [applyFilters]
  );

  const clearFilters = useCallback(() => {
    startTransition(() => {
      setSearch("");
      setDateRange({ from: undefined, to: undefined });
      setSelectedStatuses([]);
      setSelectedDepartments([]);
      setSelectedPriorities([]);
      setSelectedUnits([]);
      router.push("/relatorios/chamados");
    });
  }, [router]);

  const hasFilters =
    searchParams.toString().length > 0 ||
    dateRange.from ||
    dateRange.to ||
    selectedStatuses.length > 0 ||
    selectedDepartments.length > 0 ||
    selectedPriorities.length > 0 ||
    selectedUnits.length > 0 ||
    search.trim();

  const handleExportPDF = useCallback(() => {
    const params = buildParams();
    window.open(`/api/relatorios/chamados/pdf?${params.toString()}`, "_blank");
  }, [buildParams]);

  const handleExportExcel = useCallback(() => {
    const params = buildParams();
    window.open(
      `/api/relatorios/chamados/excel?${params.toString()}`,
      "_blank"
    );
  }, [buildParams]);

  return (
    <div className="space-y-4">
      {/* Quick Period Buttons */}
      <div className="flex flex-wrap gap-2">
        {QUICK_PERIODS.map((period) => (
          <Button
            key={period.value}
            variant="outline"
            size="sm"
            onClick={() => handleQuickPeriod(period.value)}
          >
            {period.label}
          </Button>
        ))}
      </div>

      {/* Date Range and Search */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex-1">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            placeholder="Selecione o periodo"
            className="w-full lg:w-[300px]"
            toDate={new Date()}
          />
        </div>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por numero ou titulo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10"
          />
        </div>
      </div>

      {/* Multi-select Filters */}
      <div className="flex flex-wrap gap-4">
        <MultiSelectFilter
          options={TICKET_STATUSES.map((s) => ({
            value: s.value,
            label: s.label,
          }))}
          selected={selectedStatuses}
          onChange={setSelectedStatuses}
          placeholder="Status"
          className="w-[180px]"
        />

        <MultiSelectFilter
          options={departments.map((d) => ({
            value: d.id,
            label: d.name,
          }))}
          selected={selectedDepartments}
          onChange={setSelectedDepartments}
          placeholder="Departamento"
          className="w-[180px]"
        />

        <MultiSelectFilter
          options={TICKET_PRIORITIES.map((p) => ({
            value: p.value,
            label: p.label,
          }))}
          selected={selectedPriorities}
          onChange={setSelectedPriorities}
          placeholder="Prioridade"
          className="w-[180px]"
        />

        <MultiSelectFilter
          options={units.map((u) => ({
            value: u.id,
            label: `${u.code} - ${u.name}`,
          }))}
          selected={selectedUnits}
          onChange={setSelectedUnits}
          placeholder="Unidade"
          className="w-[200px]"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-4">
        <Button onClick={applyFilters} disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Search className="mr-2 h-4 w-4" />
          )}
          Aplicar Filtros
        </Button>

        {hasFilters && (
          <Button variant="ghost" onClick={clearFilters} disabled={isPending}>
            <X className="mr-2 h-4 w-4" />
            Limpar Filtros
          </Button>
        )}

        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={!dateRange.from || !dateRange.to}
            title={
              !dateRange.from || !dateRange.to
                ? "Selecione um periodo para exportar"
                : "Exportar PDF"
            }
          >
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button
            variant="outline"
            onClick={handleExportExcel}
            disabled={!dateRange.from || !dateRange.to}
            title={
              !dateRange.from || !dateRange.to
                ? "Selecione um periodo para exportar"
                : "Exportar Excel"
            }
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Excel
          </Button>
        </div>
      </div>
    </div>
  );
}
