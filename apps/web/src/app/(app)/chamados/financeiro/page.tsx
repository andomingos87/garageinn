import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Wallet } from "lucide-react";
import {
  getFinanceiroTickets,
  getFinanceiroStats,
  getFinanceiroCategories,
  checkCanAccessFinanceiro,
} from "./actions";
import type { FinanceiroFilters } from "./types";
import { getUserUnits } from "@/lib/units";
import {
  FinanceiroStatsCards,
  FinanceiroFilters as FinanceiroFiltersComponent,
  FinanceiroTable,
  FinanceiroPagination,
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
async function FinanceiroStatsSection() {
  const stats = await getFinanceiroStats();
  return <FinanceiroStatsCards stats={stats} />;
}

async function FinanceiroFiltersSection() {
  const [categories, units] = await Promise.all([
    getFinanceiroCategories(),
    getUserUnits(),
  ]);
  return <FinanceiroFiltersComponent categories={categories} units={units} />;
}

async function FinanceiroListSection({
  filters,
}: {
  filters: FinanceiroFilters;
}) {
  const result = await getFinanceiroTickets(filters);

  return (
    <>
      <FinanceiroTable tickets={result.data} />
      <FinanceiroPagination
        currentPage={result.page}
        totalCount={result.count}
        limit={result.limit}
      />
    </>
  );
}

export default async function ChamadosFinanceiroPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  const canAccess = await checkCanAccessFinanceiro();
  if (!canAccess) {
    redirect("/dashboard");
  }

  const filters: FinanceiroFilters = {
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
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold tracking-tight">
              Chamados Financeiros
            </h2>
          </div>
          <p className="text-muted-foreground mt-1">
            Gerencie pagamentos, reembolsos e solicitacoes financeiras
          </p>
        </div>
        <Button asChild>
          <Link href="/chamados/financeiro/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Chamado
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <FinanceiroStatsSection />
      </Suspense>

      {/* Filters */}
      <Suspense fallback={<Skeleton className="h-10 w-full" />}>
        <FinanceiroFiltersSection />
      </Suspense>

      {/* Tickets Table */}
      <Suspense fallback={<TableSkeleton />}>
        <FinanceiroListSection filters={filters} />
      </Suspense>
    </div>
  );
}
