"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, X, Loader2, Download, FileSpreadsheet } from "lucide-react";
import {
  EXECUTION_STATUSES,
  QUICK_PERIODS,
  getDateRangeFromPeriod,
} from "../constants";
import { MultiSelectFilter } from "../../chamados/components/multi-select-filter";

interface SupervisionFiltersProps {
  units: { id: string; name: string; code: string }[];
  supervisors: { id: string; full_name: string }[];
}

export function SupervisionFilters({ units, supervisors }: SupervisionFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

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
  const [selectedUnits, setSelectedUnits] = useState<string[]>(
    parseMultiValue("unitIds")
  );
  const [selectedSupervisors, setSelectedSupervisors] = useState<string[]>(
    parseMultiValue("supervisorIds")
  );
  const [hasNonConformities, setHasNonConformities] = useState<boolean>(
    searchParams.get("hasNonConformities") === "true"
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
    if (selectedUnits.length > 0) {
      params.set("unitIds", selectedUnits.join(","));
    }
    if (selectedSupervisors.length > 0) {
      params.set("supervisorIds", selectedSupervisors.join(","));
    }
    if (hasNonConformities) {
      params.set("hasNonConformities", "true");
    }

    return params;
  }, [
    dateRange,
    selectedStatuses,
    selectedUnits,
    selectedSupervisors,
    hasNonConformities,
  ]);

  const applyFilters = useCallback(() => {
    startTransition(() => {
      const params = buildParams();
      router.push(`/relatorios/supervisao?${params.toString()}`);
    });
  }, [router, buildParams]);

  const handleQuickPeriod = useCallback((period: string) => {
    const { startDate, endDate } = getDateRangeFromPeriod(period);
    setDateRange({ from: startDate, to: endDate });
  }, []);

  const clearFilters = useCallback(() => {
    startTransition(() => {
      setDateRange({ from: undefined, to: undefined });
      setSelectedStatuses([]);
      setSelectedUnits([]);
      setSelectedSupervisors([]);
      setHasNonConformities(false);
      router.push("/relatorios/supervisao");
    });
  }, [router]);

  const hasFilters =
    searchParams.toString().length > 0 ||
    dateRange.from ||
    dateRange.to ||
    selectedStatuses.length > 0 ||
    selectedUnits.length > 0 ||
    selectedSupervisors.length > 0 ||
    hasNonConformities;

  const handleExportPDF = useCallback(() => {
    const params = buildParams();
    window.open(`/api/relatorios/supervisao/pdf?${params.toString()}`, "_blank");
  }, [buildParams]);

  const handleExportExcel = useCallback(() => {
    const params = buildParams();
    window.open(
      `/api/relatorios/supervisao/excel?${params.toString()}`,
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

      {/* Date Range */}
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
      </div>

      {/* Multi-select Filters */}
      <div className="flex flex-wrap gap-4">
        <MultiSelectFilter
          options={EXECUTION_STATUSES.map((s) => ({
            value: s.value,
            label: s.label,
          }))}
          selected={selectedStatuses}
          onChange={setSelectedStatuses}
          placeholder="Status"
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

        <MultiSelectFilter
          options={supervisors.map((s) => ({
            value: s.id,
            label: s.full_name,
          }))}
          selected={selectedSupervisors}
          onChange={setSelectedSupervisors}
          placeholder="Supervisor"
          className="w-[200px]"
        />

        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasNonConformities"
            checked={hasNonConformities}
            onCheckedChange={(checked) =>
              setHasNonConformities(checked === true)
            }
          />
          <Label
            htmlFor="hasNonConformities"
            className="text-sm font-normal cursor-pointer"
          >
            Apenas com nao conformidades
          </Label>
        </div>
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
