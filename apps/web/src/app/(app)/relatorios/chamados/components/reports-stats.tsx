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
  BarChart3,
  Clock,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS } from "../constants";
import type { TicketReportStats } from "../actions";

interface ReportsStatsProps {
  stats: TicketReportStats;
}

export function ReportsStats({ stats }: ReportsStatsProps) {
  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Chamados
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">
              Taxa de Resolucao
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolutionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Chamados resolvidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tempo Medio de Resolucao
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avgResolutionDays}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                dias
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Media de tempo para resolver
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Departamentos
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byDepartment.length}</div>
            <p className="text-xs text-muted-foreground">
              Com chamados no periodo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* By Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Por Status</CardTitle>
            <CardDescription>Distribuicao dos chamados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.byStatus.length > 0 ? (
                stats.byStatus.map((item) => (
                  <div
                    key={item.status}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          STATUS_COLORS[item.status] ||
                          "bg-gray-100 text-gray-800"
                        }
                      >
                        {STATUS_LABELS[item.status] || item.status}
                      </Badge>
                    </div>
                    <span className="text-sm font-medium">{item.count}</span>
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

        {/* By Priority */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Por Prioridade</CardTitle>
            <CardDescription>Distribuicao por urgencia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.byPriority.length > 0 ? (
                stats.byPriority.map((item) => (
                  <div
                    key={item.priority}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          PRIORITY_COLORS[item.priority] ||
                          "bg-gray-100 text-gray-800"
                        }
                      >
                        {PRIORITY_LABELS[item.priority] || item.priority}
                      </Badge>
                    </div>
                    <span className="text-sm font-medium">{item.count}</span>
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

        {/* By Department */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Por Departamento</CardTitle>
            <CardDescription>Volume por area</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.byDepartment.length > 0 ? (
                stats.byDepartment
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 5)
                  .map((item) => (
                    <div
                      key={item.departmentId}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">{item.department}</span>
                      <span className="text-sm font-medium">{item.count}</span>
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
