"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Clock,
  PlayCircle,
  CheckCircle2,
} from "lucide-react";
import type { FinanceiroStats } from "../actions";

interface FinanceiroStatsCardsProps {
  stats: FinanceiroStats;
}

export function FinanceiroStatsCards({ stats }: FinanceiroStatsCardsProps) {
  const cards = [
    {
      title: "Total de Chamados",
      value: stats.total,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Aguardando Triagem",
      value: stats.awaitingTriage,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950",
    },
    {
      title: "Em Andamento",
      value: stats.inProgress,
      icon: PlayCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
    {
      title: "Resolvidos",
      value: stats.resolved,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <div className={`rounded-full p-2 ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
