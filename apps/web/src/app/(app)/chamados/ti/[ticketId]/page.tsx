import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  MessageSquare,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AccessDenied } from "@/components/auth/access-denied";
import { StatusBadge } from "../../components/status-badge";
import { TiTicketStatus } from "../components";
import {
  canAccessTiTicketDetail,
  getTiAccessContext,
  getApprovalContext,
  getTiTicketDetail,
} from "../actions";
import { normalizeApprovalStatus } from "@/lib/ticket-statuses";
import { TiTicketActions } from "./components/ti-ticket-actions";
import { TiTicketComments } from "./components/ti-ticket-comments";
import { TiTicketAttachments } from "./components/ti-ticket-attachments";

interface PageProps {
  params: Promise<{ ticketId: string }>;
}

export default async function TiTicketDetailsPage({ params }: PageProps) {
  const { ticketId } = await params;
  const canAccess = await canAccessTiTicketDetail(ticketId);
  if (!canAccess) {
    return <AccessDenied />;
  }

  const [ticket, approvalContext, tiAccess] = await Promise.all([
    getTiTicketDetail(ticketId),
    getApprovalContext(),
    getTiAccessContext(),
  ]);

  if (!ticket) {
    notFound();
  }

  const normalizedApprovals = (ticket.approvals ?? []).map((approval) => ({
    ...approval,
    status: normalizeApprovalStatus(approval.status),
  }));

  const canExecute = tiAccess.canAccess
    ? tiAccess.permissions.includes("tickets:execute") ||
      tiAccess.permissions.includes("admin:all")
    : false;

  const getInitials = (name: string | null) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild className="gap-2">
            <Link href="/chamados/ti">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <span className="text-muted-foreground flex items-center gap-2">
            Chamado #{ticket.ticket_number}
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{ticket.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={ticket.status} />
              {ticket.priority && (
                <Badge variant="outline">{ticket.priority}</Badge>
              )}
              {ticket.perceived_urgency && !ticket.priority && (
                <Badge variant="outline">
                  Urgencia: {ticket.perceived_urgency}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={ticket.created_by_avatar || undefined} />
              <AvatarFallback className="text-xs">
                {getInitials(ticket.created_by_name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Solicitante</p>
              <p className="text-sm font-medium truncate">
                {ticket.created_by_name || "Desconhecido"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {ticket.assigned_to_name ? (
              <>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={ticket.assigned_to_avatar || undefined} />
                  <AvatarFallback className="text-xs">
                    {getInitials(ticket.assigned_to_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Responsavel</p>
                  <p className="text-sm font-medium truncate">
                    {ticket.assigned_to_name}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-8 w-8 p-1.5 bg-muted rounded-full" />
                <div>
                  <p className="text-xs">Responsavel</p>
                  <p className="text-sm">Nao atribuido</p>
                </div>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Categoria</p>
            <p className="text-sm font-medium truncate">
              {ticket.category_name || "Nao definida"}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Equipamento</p>
            <p className="text-sm font-medium truncate">
              {ticket.equipment_type || "Nao informado"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            Criado{" "}
            {formatDistanceToNow(new Date(ticket.created_at), {
              addSuffix: true,
              locale: ptBR,
            })}
          </span>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Descricao
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
        </CardContent>
      </Card>

      <TiTicketStatus
        ticketId={ticketId}
        approvals={normalizedApprovals}
        ticketStatus={ticket.status}
        currentUserRoles={approvalContext.roles}
        isAdmin={approvalContext.isAdmin}
      />

      <TiTicketActions
        ticketId={ticketId}
        ticketStatus={ticket.status}
        canExecute={canExecute}
      />

      <TiTicketComments
        ticketId={ticketId}
        ticketStatus={ticket.status}
        canExecute={canExecute}
        comments={ticket.comments ?? []}
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Historico
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {ticket.history?.length ? (
            ticket.history.map((item) => (
              <div key={item.id} className="border rounded-md p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {item.user?.full_name || "Sistema"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(item.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>
                <p className="text-sm mt-2 text-muted-foreground">
                  {item.action || "Atualizacao"} {item.new_value || ""}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhum historico disponivel.
            </p>
          )}
        </CardContent>
      </Card>

      <TiTicketAttachments
        ticketId={ticketId}
        ticketStatus={ticket.status}
        canExecute={canExecute}
        attachments={ticket.attachments ?? []}
      />
    </div>
  );
}
