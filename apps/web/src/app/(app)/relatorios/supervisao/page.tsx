import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Loader2, ClipboardCheck } from "lucide-react";
import {
  canAccessSupervisionReports,
  getUnitsForSupervisionReport,
  getSupervisorsForReport,
  getSupervisionReportData,
  getSupervisionReportStats,
} from "./actions";
import { SupervisionFilters } from "./components/supervision-filters";
import { SupervisionStats } from "./components/supervision-stats";
import { SupervisionTable } from "./components/supervision-table";
import { DEFAULT_ITEMS_PER_PAGE } from "./constants";

interface PageProps {
  searchParams: Promise<{
    startDate?: string;
    endDate?: string;
    statuses?: string;
    unitIds?: string;
    supervisorIds?: string;
    hasNonConformities?: string;
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

export default async function RelatoriosSupervisaoPage({ searchParams }: PageProps) {
  // Verificar permissao
  const hasAccess = await canAccessSupervisionReports();
  if (!hasAccess) {
    redirect("/dashboard");
  }

  const params = await searchParams;

  // Buscar dados de filtros
  const [units, supervisors] = await Promise.all([
    getUnitsForSupervisionReport(),
    getSupervisorsForReport(),
  ]);

  // Preparar filtros
  const filters = {
    startDate: params.startDate || "",
    endDate: params.endDate || "",
    statuses: params.statuses?.split(",").filter(Boolean),
    unitIds: params.unitIds?.split(",").filter(Boolean),
    supervisorIds: params.supervisorIds?.split(",").filter(Boolean),
    hasNonConformities: params.hasNonConformities === "true",
  };

  const page = parseInt(params.page || "1", 10);
  const limit = parseInt(params.limit || DEFAULT_ITEMS_PER_PAGE.toString(), 10);
  const sortBy = params.sortBy || "started_at";
  const sortOrder = (params.sortOrder as "asc" | "desc") || "desc";

  // Verificar se ha filtros de periodo
  const hasDateFilter = filters.startDate && filters.endDate;

  // Buscar dados se houver filtros
  const [reportData, stats] = hasDateFilter
    ? await Promise.all([
        getSupervisionReportData(filters, page, limit, sortBy, sortOrder),
        getSupervisionReportStats(filters),
      ])
    : [
        { executions: [], total: 0, page: 1, limit, totalPages: 0 },
        {
          total: 0,
          completed: 0,
          inProgress: 0,
          withNonConformities: 0,
          avgConformityScore: 0,
          byUnit: [],
          bySupervisor: [],
          scoreDistribution: [],
        },
      ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-6 w-6" />
          <h1 className="text-2xl font-semibold">Relatorios de Supervisao</h1>
        </div>
        <p className="mt-1 text-muted-foreground">
          Analise e exporte dados de supervisoes por periodo, unidade, supervisor e score de conformidade.
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-lg border bg-card p-4">
        <Suspense fallback={<LoadingSpinner />}>
          <SupervisionFilters units={units} supervisors={supervisors} />
        </Suspense>
      </div>

      {/* Content */}
      {hasDateFilter ? (
        <>
          {/* Stats */}
          <Suspense fallback={<LoadingSpinner />}>
            <SupervisionStats stats={stats} />
          </Suspense>

          {/* Table */}
          <div className="rounded-lg border bg-card p-4">
            <Suspense fallback={<LoadingSpinner />}>
              <SupervisionTable data={reportData} />
            </Suspense>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-12 text-center">
          <ClipboardCheck className="h-12 w-12 text-muted-foreground" />
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
