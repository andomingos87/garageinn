"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { History } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { statusLabels } from "../../constants";

interface HistoryItem {
  id: string;
  action: string;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
  user: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
}

interface FinanceiroTimelineProps {
  history: HistoryItem[];
}

const actionLabels: Record<string, string> = {
  created: "criou o chamado",
  status_changed: "alterou o status",
  triaged: "realizou a triagem",
  approved: "aprovou",
  denied: "negou",
  updated: "atualizou",
  commented: "comentou",
};

export function FinanceiroTimeline({ history }: FinanceiroTimelineProps) {
  // Ordenar por data (mais recente primeiro)
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const getActionDescription = (item: HistoryItem) => {
    const action = actionLabels[item.action] || item.action;

    if (item.action === "status_changed" && item.old_value && item.new_value) {
      const oldLabel = statusLabels[item.old_value] || item.old_value;
      const newLabel = statusLabels[item.new_value] || item.new_value;
      return `${action} de "${oldLabel}" para "${newLabel}"`;
    }

    if (item.new_value) {
      return `${action}: ${item.new_value}`;
    }

    return action;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5" />
          Historico
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedHistory.length > 0 ? (
          <div className="relative space-y-4">
            {/* Linha vertical */}
            <div className="absolute left-4 top-0 h-full w-px bg-border" />

            {sortedHistory.map((item, index) => (
              <div key={item.id} className="relative flex gap-4 pl-10">
                {/* Ponto na timeline */}
                <div className="absolute left-2.5 top-1 h-3 w-3 rounded-full border-2 border-background bg-primary" />

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={item.user?.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {item.user?.full_name?.charAt(0).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">
                      {item.user?.full_name || "Sistema"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {getActionDescription(item)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(
                      new Date(item.created_at),
                      "dd/MM/yyyy 'as' HH:mm",
                      {
                        locale: ptBR,
                      }
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            Nenhum registro no historico
          </p>
        )}
      </CardContent>
    </Card>
  );
}
