import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Briefcase } from "lucide-react";
import {
  getComercialTickets,
  getComercialStats,
  getComercialCategories,
  type ComercialFilters,
} from "./actions";
import { getUserUnits } from "@/lib/units";
import {
  ComercialStatsCards,
  ComercialFilters as ComercialFiltersComponent,
  ComercialTable,
  ComercialPagination,
} from "./components";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    priority?: string;
    comercial_type?: string;
    category_id?: string;
    unit_id?: string;
    page?: string;
  }>;
}

// Loading skeleton components
function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-[120px] rounded-lg" />
      ))}
    </div>
  );
}

function TableSkeleton() {
  return <Skeleton className="h-[400px] rounded-lg" />;
}

// Server components for data fetching
async function ComercialStatsSection() {
  const stats = await getComercialStats();
  return <ComercialStatsCards stats={stats} />;
}

async function ComercialFiltersSection() {
  const [categories, units] = await Promise.all([
    getComercialCategories(),
    getUserUnits(),
  ]);
  return <ComercialFiltersComponent categories={categories} units={units} />;
}

async function ComercialListSection({
  filters,
}: {
  filters: ComercialFilters;
}) {
  const result = await getComercialTickets(filters);

  return (
    <>
      <ComercialTable tickets={result.data} />
      <ComercialPagination
        currentPage={result.page}
        totalCount={result.count}
        limit={result.limit}
      />
    </>
  );
}

export default async function ChamadosComercialPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  const filters: ComercialFilters = {
    search: params.search,
    status: params.status,
    priority: params.priority,
    comercial_type: params.comercial_type,
    category_id: params.category_id,
    unit_id: params.unit_id,
    page: params.page ? parseInt(params.page) : 1,
    limit: 20,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold tracking-tight">
              Chamados Comerciais
            </h2>
          </div>
          <p className="text-muted-foreground mt-1">
            Gerencie contratos, propostas e solicitacoes comerciais
          </p>
        </div>
        <Button asChild>
          <Link href="/chamados/comercial/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Chamado
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <ComercialStatsSection />
      </Suspense>

      {/* Filters */}
      <Suspense fallback={<Skeleton className="h-10 w-full" />}>
        <ComercialFiltersSection />
      </Suspense>

      {/* Tickets Table */}
      <Suspense fallback={<TableSkeleton />}>
        <ComercialListSection filters={filters} />
      </Suspense>
    </div>
  );
}
