"use client";

import { Badge } from "@/components/ui/badge";
import { statusLabels, statusColors } from "../constants";
import { cn } from "@/lib/utils";

interface FinanceiroStatusBadgeProps {
  status: string;
  className?: string;
}

export function FinanceiroStatusBadge({
  status,
  className,
}: FinanceiroStatusBadgeProps) {
  const label = statusLabels[status] || status;
  const colorClass = statusColors[status] || "bg-gray-100 text-gray-800";

  return (
    <Badge variant="outline" className={cn(colorClass, "border-0", className)}>
      {label}
    </Badge>
  );
}
