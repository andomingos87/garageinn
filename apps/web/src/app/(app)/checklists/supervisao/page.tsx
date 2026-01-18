import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ClipboardCheck,
  PlayCircle,
  History,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { getSupervisionChecklists } from "../executar/actions";

async function SupervisionStats() {
  const checklists = await getSupervisionChecklists();

  const total = checklists.length;
  const pending = checklists.filter((c) => !c.todayExecution).length;
  const completed = checklists.filter(
    (c) => c.todayExecution?.status === "completed"
  ).length;
  const inProgress = checklists.filter(
    (c) => c.todayExecution?.status === "in_progress"
  ).length;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total de Unidades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total}</div>
          <p className="text-xs text-muted-foreground">com cobertura</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pendentes Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-warning">{pending}</div>
          <p className="text-xs text-muted-foreground">aguardando execução</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Em Andamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-info">{inProgress}</div>
          <p className="text-xs text-muted-foreground">em execução</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Concluídos Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">{completed}</div>
          <p className="text-xs text-muted-foreground">finalizados</p>
        </CardContent>
      </Card>
    </div>
  );
}

function StatsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-3 w-20 mt-1" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function SupervisaoPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/checklists">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              Supervisão
            </h2>
            <p className="text-muted-foreground">
              Gerencie os checklists de supervisão das unidades sob sua
              cobertura
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <Suspense fallback={<StatsLoading />}>
        <SupervisionStats />
      </Suspense>

      {/* Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-primary" />
              Executar Supervisão
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Inicie um novo checklist de supervisão para as unidades sob sua
              cobertura.
            </p>
            <Button asChild className="w-full">
              <Link href="/checklists/supervisao/executar">
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Iniciar Supervisão
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Histórico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Visualize o histórico de supervisões realizadas e seus relatórios.
            </p>
            <Button variant="outline" asChild className="w-full">
              <Link href="/checklists?type=supervision">
                <History className="mr-2 h-4 w-4" />
                Ver Histórico
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
