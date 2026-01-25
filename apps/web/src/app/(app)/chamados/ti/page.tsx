import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AccessDenied } from "@/components/auth/access-denied";
import { Laptop, Plus } from "lucide-react";
import { getUserUnits } from "@/lib/units";
import {
  getTiAccessContext,
  getTiTickets,
  getTiStats,
  getTiCategories,
  getTiReadyTickets,
} from "./actions";
import type { TiFilters } from "./types";
import {
  TiFilters as TiFiltersComponent,
  TiStatsCards,
  TiTable,
  TiPagination,
} from "./components";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    priority?: string;
    category_id?: string;
    unit_id?: string;
    page?: string;
  }>;
}

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

async function TiStatsSection() {
  const stats = await getTiStats();
  return <TiStatsCards stats={stats} />;
}

async function TiFiltersSection() {
  const [categories, units] = await Promise.all([
    getTiCategories(),
    getUserUnits(),
  ]);
  return <TiFiltersComponent categories={categories} units={units} />;
}

async function TiReadySection() {
  const ready = await getTiReadyTickets({ page: 1, limit: 10 });
  if (!ready.canAccess) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Prontos para Execução</h3>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/chamados/ti?status=awaiting_triage">Ver todos</Link>
        </Button>
      </div>
      <TiTable tickets={ready.data} />
    </div>
  );
}

async function TiListSection({ filters }: { filters: TiFilters }) {
  const result = await getTiTickets(filters);

  return (
    <>
      <TiTable tickets={result.data} />
      <TiPagination
        currentPage={result.page}
        totalCount={result.count}
        limit={result.limit}
      />
    </>
  );
}

export default async function ChamadosTiPage({ searchParams }: PageProps) {
  const access = await getTiAccessContext();
  if (!access.canAccess) {
    return <AccessDenied />;
  }

  const params = await searchParams;

  const filters: TiFilters = {
    search: params.search,
    status: params.status,
    priority: params.priority,
    category_id: params.category_id,
    unit_id: params.unit_id,
    page: params.page ? parseInt(params.page) : 1,
    limit: 20,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Laptop className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold tracking-tight">
              Chamados de TI
            </h2>
          </div>
          <p className="text-muted-foreground mt-1">
            Registre e acompanhe solicitacoes de suporte tecnico
          </p>
        </div>
        <Button asChild>
          <Link href="/chamados/ti/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Chamado
          </Link>
        </Button>
      </div>

      <Suspense fallback={<StatsCardsSkeleton />}>
        <TiStatsSection />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <TiReadySection />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-10 w-full" />}>
        <TiFiltersSection />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <TiListSection filters={filters} />
      </Suspense>
    </div>
  );
}
