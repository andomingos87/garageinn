"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import {
  statusLabels,
  COMERCIAL_TYPE_LABELS,
  PRIORITY_LABELS,
} from "../constants";
import type { ComercialCategory } from "../types";
import type { UserUnit } from "@/lib/units";

interface ComercialFiltersProps {
  categories: ComercialCategory[];
  units: UserUnit[];
}

const STATUS_OPTIONS = [
  { value: "all", label: "Todos os status" },
  { value: "awaiting_triage", label: statusLabels["awaiting_triage"] },
  { value: "prioritized", label: statusLabels["prioritized"] },
  { value: "in_progress", label: statusLabels["in_progress"] },
  { value: "resolved", label: statusLabels["resolved"] },
  { value: "closed", label: statusLabels["closed"] },
  { value: "denied", label: statusLabels["denied"] },
  { value: "cancelled", label: statusLabels["cancelled"] },
];

const PRIORITY_OPTIONS = [
  { value: "all", label: "Todas prioridades" },
  { value: "low", label: PRIORITY_LABELS["low"] },
  { value: "medium", label: PRIORITY_LABELS["medium"] },
  { value: "high", label: PRIORITY_LABELS["high"] },
  { value: "urgent", label: PRIORITY_LABELS["urgent"] },
];

const TYPE_OPTIONS = [
  { value: "all", label: "Todos os tipos" },
  { value: "novo_contrato", label: COMERCIAL_TYPE_LABELS["novo_contrato"] },
  { value: "renovacao", label: COMERCIAL_TYPE_LABELS["renovacao"] },
  { value: "cancelamento", label: COMERCIAL_TYPE_LABELS["cancelamento"] },
  { value: "proposta", label: COMERCIAL_TYPE_LABELS["proposta"] },
  { value: "reclamacao", label: COMERCIAL_TYPE_LABELS["reclamacao"] },
  { value: "outros", label: COMERCIAL_TYPE_LABELS["outros"] },
];

export function ComercialFilters({ categories, units }: ComercialFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  // Current filter values
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "all";
  const priority = searchParams.get("priority") || "all";
  const comercial_type = searchParams.get("comercial_type") || "all";
  const category_id = searchParams.get("category_id") || "all";
  const unit_id = searchParams.get("unit_id") || "all";

  const [localSearch, setLocalSearch] = useState(search);

  const updateFilters = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== "all") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      // Reset to page 1 when filters change
      params.delete("page");

      startTransition(() => {
        router.push(`/chamados/comercial?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const handleSearch = () => {
    updateFilters({ search: localSearch });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setLocalSearch("");
    startTransition(() => {
      router.push("/chamados/comercial");
    });
  };

  const hasActiveFilters =
    search ||
    status !== "all" ||
    priority !== "all" ||
    comercial_type !== "all" ||
    category_id !== "all" ||
    unit_id !== "all";
  const activeFilterCount = [
    search,
    status !== "all",
    priority !== "all",
    comercial_type !== "all",
    category_id !== "all",
    unit_id !== "all",
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Search */}
      <div className="flex flex-1 gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por titulo, cliente ou #numero..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9"
            disabled={isPending}
          />
        </div>
        <Button onClick={handleSearch} variant="secondary" disabled={isPending}>
          Buscar
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {/* Desktop Filters */}
        <div className="hidden lg:flex items-center gap-2">
          <Select
            value={status}
            onValueChange={(value) => updateFilters({ status: value })}
            disabled={isPending}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={comercial_type}
            onValueChange={(value) => updateFilters({ comercial_type: value })}
            disabled={isPending}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={priority}
            onValueChange={(value) => updateFilters({ priority: value })}
            disabled={isPending}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mobile Filters Sheet */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="lg:hidden relative">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filtros
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
              <SheetDescription>
                Refine a listagem de chamados comerciais
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={status}
                  onValueChange={(value) => {
                    updateFilters({ status: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={comercial_type}
                  onValueChange={(value) => {
                    updateFilters({ comercial_type: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select
                  value={priority}
                  onValueChange={(value) => {
                    updateFilters({ priority: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas prioridades" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={category_id}
                  onValueChange={(value) => {
                    updateFilters({ category_id: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas categorias</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Unidade</Label>
                <Select
                  value={unit_id}
                  onValueChange={(value) => {
                    updateFilters({ unit_id: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas unidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas unidades</SelectItem>
                    {units.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.code} - {unit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={() => {
                    clearFilters();
                    setIsOpen(false);
                  }}
                  className="w-full"
                >
                  <X className="mr-2 h-4 w-4" />
                  Limpar Filtros
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            disabled={isPending}
            className="hidden lg:flex"
          >
            <X className="mr-2 h-4 w-4" />
            Limpar
          </Button>
        )}
      </div>
    </div>
  );
}
