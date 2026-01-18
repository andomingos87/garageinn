import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Loader2, BarChart3 } from "lucide-react";
import {
  canAccessReports,
  getDepartments,
  getUnitsForReport,
  getReportTickets,
  getReportStats,
} from "./actions";
import { ReportsFilters } from "./components/reports-filters";
import { ReportsStats } from "./components/reports-stats";
import { ReportsTable } from "./components/reports-table";
import { DEFAULT_ITEMS_PER_PAGE } from "./constants";

interface PageProps {
  searchParams: Promise<{
    startDate?: string;
    endDate?: string;
    statuses?: string;
    departments?: string;
    priorities?: string;
    unitIds?: string;
    search?: string;
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

function LoadingSpinner() {
  return (
    <div className="flex h-32 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default async function RelatoriosChamadosPage({ searchParams }: PageProps) {
  // Verificar permissao
  const hasAccess = await canAccessReports();
  if (!hasAccess) {
    redirect("/dashboard");
  }

  const params = await searchParams;

  // Buscar dados de filtros
  const [departments, units] = await Promise.all([
    getDepartments(),
    getUnitsForReport(),
  ]);

  // Preparar filtros
  const filters = {
    startDate: params.startDate || "",
    endDate: params.endDate || "",
    statuses: params.statuses?.split(",").filter(Boolean),
    departments: params.departments?.split(",").filter(Boolean),
    priorities: params.priorities?.split(",").filter(Boolean),
    unitIds: params.unitIds?.split(",").filter(Boolean),
    search: params.search,
  };

  const page = parseInt(params.page || "1", 10);
  const limit = parseInt(params.limit || DEFAULT_ITEMS_PER_PAGE.toString(), 10);
  const sortBy = params.sortBy || "created_at";
  const sortOrder = (params.sortOrder as "asc" | "desc") || "desc";

  // Verificar se ha filtros de periodo
  const hasDateFilter = filters.startDate && filters.endDate;

  // Buscar dados se houver filtros
  const [reportData, stats] = hasDateFilter
    ? await Promise.all([
        getReportTickets(filters, page, limit, sortBy, sortOrder),
        getReportStats(filters),
      ])
    : [
        { tickets: [], total: 0, page: 1, limit, totalPages: 0 },
        {
          total: 0,
          byStatus: [],
          byPriority: [],
          byDepartment: [],
          avgResolutionDays: 0,
          resolutionRate: 0,
        },
      ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          <h1 className="text-2xl font-semibold">Relatorios de Chamados</h1>
        </div>
        <p className="mt-1 text-muted-foreground">
          Analise e exporte dados de chamados por periodo, status, departamento e mais.
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-lg border bg-card p-4">
        <Suspense fallback={<LoadingSpinner />}>
          <ReportsFilters departments={departments} units={units} />
        </Suspense>
      </div>

      {/* Content */}
      {hasDateFilter ? (
        <>
          {/* Stats */}
          <Suspense fallback={<LoadingSpinner />}>
            <ReportsStats stats={stats} />
          </Suspense>

          {/* Table */}
          <div className="rounded-lg border bg-card p-4">
            <Suspense fallback={<LoadingSpinner />}>
              <ReportsTable data={reportData} />
            </Suspense>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-12 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-medium">Selecione um periodo</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Utilize os filtros acima para selecionar o periodo e os criterios do relatorio.
            <br />
            Voce pode usar os botoes de periodo rapido ou selecionar datas especificas.
          </p>
        </div>
      )}
    </div>
  );
}
