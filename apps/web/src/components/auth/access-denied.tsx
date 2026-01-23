import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Shield } from "lucide-react";

import { Button } from "@/components/ui/button";

interface AccessDeniedProps {
  title?: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  icon?: LucideIcon | null;
}

export function AccessDenied({
  title = "Acesso Negado",
  description = "Voce nao tem permissao para acessar esta pagina.",
  actionHref = "/dashboard",
  actionLabel = "Voltar ao Inicio",
  icon,
}: AccessDeniedProps) {
  const Icon = icon === undefined ? Shield : icon;
  const showIcon = Icon !== null;
  const showAction = Boolean(actionHref && actionLabel);

  return (
    <div className="flex flex-col items-center justify-center h-[50vh] space-y-4 text-center">
      {showIcon && Icon ? (
        <Icon className="h-16 w-16 text-muted-foreground/50" />
      ) : null}
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-muted-foreground">{description}</p>
      {showAction ? (
        <Button asChild>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
