"use client";

import Link from "next/link";
import { Wrench, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";

export interface ParentTicket {
  id: string;
  ticket_number: number;
  title: string;
  status: string;
  department_name: string;
}

interface ParentTicketBannerProps {
  parentTicket: ParentTicket | null | undefined;
}

export function ParentTicketBanner({ parentTicket }: ParentTicketBannerProps) {
  if (!parentTicket) return null;

  const href = `/chamados/manutencao/${parentTicket.id}`;
  const truncatedTitle =
    parentTicket.title.length > 60
      ? `${parentTicket.title.slice(0, 60)}...`
      : parentTicket.title;

  return (
    <Card className="rounded-md border">
      <CardContent className="p-0">
        <Link
          href={href}
          className="flex items-center gap-3 rounded-md border-0 p-4 transition-colors hover:bg-muted/50"
        >
          <Wrench className="h-5 w-5 shrink-0 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground">
              Originado de chamado de Manutenção
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-sm font-medium">#{parentTicket.ticket_number}</span>
              <span className="text-sm truncate">{truncatedTitle}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status={parentTicket.status} size="sm" />
            </div>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
        </Link>
      </CardContent>
    </Card>
  );
}
