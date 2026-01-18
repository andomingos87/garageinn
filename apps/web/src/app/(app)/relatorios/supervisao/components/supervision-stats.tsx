"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
  Building2,
} from "lucide-react";
import { getScoreColor, getScoreLabel } from "../constants";
import type { SupervisionReportStats } from "../actions";

interface SupervisionStatsProps {
  stats: SupervisionReportStats;
}

export function SupervisionStats({ stats }: SupervisionStatsProps) {
  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Supervisoes
            </CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              No periodo selecionado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluidas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0
                ? `${Math.round((stats.completed / stats.total) * 100)}% do total`
                : "0% do total"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando conclusao
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nao Conformidades
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withNonConformities}</div>
            <p className="text-xs text-muted-foreground">
              Supervisoes com problemas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Score Medio
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avgConformityScore}%
            </div>
            <Badge className={getScoreColor(stats.avgConformityScore)}>
              {getScoreLabel(stats.avgConformityScore)}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribuicao de Scores</CardTitle>
            <CardDescription>Faixas de conformidade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.scoreDistribution.map((item) => (
                <div
                  key={item.range}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm">{item.range}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{
                          width: `${
                            stats.total > 0
                              ? Math.round((item.count / stats.total) * 100)
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* By Unit */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <CardTitle className="text-base">Por Unidade</CardTitle>
            </div>
            <CardDescription>Top 5 unidades com mais supervisoes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.byUnit.length > 0 ? (
                stats.byUnit.slice(0, 5).map((item) => (
                  <div
                    key={item.unitId}
                    className="flex items-center justify-between"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {item.unitCode}
                      </span>
                      <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                        {item.unitName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{item.count}</Badge>
                      <Badge className={getScoreColor(item.avgScore)}>
                        {item.avgScore}%
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum dado disponivel
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* By Supervisor */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <CardTitle className="text-base">Por Supervisor</CardTitle>
            </div>
            <CardDescription>Top 5 supervisores mais ativos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.bySupervisor.length > 0 ? (
                stats.bySupervisor.slice(0, 5).map((item) => (
                  <div
                    key={item.supervisorId}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm truncate max-w-[150px]">
                      {item.supervisorName}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{item.count}</Badge>
                      <Badge className={getScoreColor(item.avgScore)}>
                        {item.avgScore}%
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum dado disponivel
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
