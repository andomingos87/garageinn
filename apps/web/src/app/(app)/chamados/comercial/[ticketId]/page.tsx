import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  getComercialTicket,
  canTriageComercialTicket,
  getComercialDepartmentMembers,
} from "../actions";
import {
  ComercialHeader,
  ComercialInfo,
  ComercialClientInfo,
  ComercialContractInfo,
  ComercialComments,
  ComercialTimeline,
  ComercialStatusActions,
  ComercialTriageDialog,
} from "./components";
import { DeleteTicketButton } from "../../components";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  MessageSquare,
  Clock,
  Building2,
  DollarSign,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

interface PageProps {
  params: Promise<{ ticketId: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { ticketId } = await params;
  const ticket = await getComercialTicket(ticketId);

  if (!ticket) {
    return { title: "Chamado nao encontrado" };
  }

  return {
    title: `#${ticket.ticket_number} - ${ticket.title} | Comercial`,
    description: ticket.description?.slice(0, 160),
  };
}

async function canManageComercial(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: userRoles } = await supabase
    .from("user_roles")
    .select(
      `
      role:roles!role_id(name)
    `
    )
    .eq("user_id", user.id);

  if (!userRoles) return false;

  const manageRoles = [
    "Desenvolvedor",
    "Administrador",
    "Diretor",
    "Gerente",
    "Supervisor",
    "Analista",
    "Encarregado",
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return userRoles.some((ur) => manageRoles.includes((ur.role as any)?.name));
}

async function checkIsAdminUser(): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_admin");
  if (error) return false;
  return data === true;
}

export default async function ComercialDetailsPage({ params }: PageProps) {
  const { ticketId } = await params;

  const [ticket, canManage, canTriage, departmentMembers, isAdmin] =
    await Promise.all([
      getComercialTicket(ticketId),
      canManageComercial(),
      canTriageComercialTicket(),
      getComercialDepartmentMembers(),
      checkIsAdminUser(),
    ]);

  if (!ticket) {
    notFound();
  }

  const comercialDetails = ticket.comercial_details?.[0] || null;
  const isAwaitingTriage = ticket.status === "awaiting_triage";

  const hasClientInfo =
    comercialDetails &&
    (comercialDetails.client_name ||
      comercialDetails.client_cnpj ||
      comercialDetails.client_phone ||
      comercialDetails.client_email);

  const hasContractInfo =
    comercialDetails &&
    (comercialDetails.contract_value ||
      comercialDetails.contract_start_date ||
      comercialDetails.contract_end_date ||
      comercialDetails.proposal_deadline);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <ComercialHeader ticket={ticket} />

      {/* Botao de Triagem */}
      {isAwaitingTriage && canTriage && (
        <div className="flex justify-end">
          <ComercialTriageDialog
            ticketId={ticketId}
            ticketNumber={ticket.ticket_number}
            ticketTitle={ticket.title}
            perceivedUrgency={ticket.perceived_urgency}
            comercialType={comercialDetails?.comercial_type}
            departmentMembers={departmentMembers}
          />
        </div>
      )}

      {/* Conteudo Principal com Tabs */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="details" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Detalhes</span>
          </TabsTrigger>
          <TabsTrigger value="comments" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Comentarios</span>
            {ticket.comments?.length > 0 && (
              <span className="ml-1 bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-full">
                {ticket.comments.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Historico</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab: Detalhes */}
        <TabsContent value="details" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna Principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Informacoes do Chamado */}
              <ComercialInfo
                ticket={ticket}
                comercialDetails={comercialDetails}
              />

              {/* Dados do Cliente */}
              {hasClientInfo && (
                <ComercialClientInfo comercialDetails={comercialDetails} />
              )}

              {/* Dados do Contrato */}
              {hasContractInfo && (
                <ComercialContractInfo comercialDetails={comercialDetails} />
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Resumo Cliente */}
              {comercialDetails?.client_name && (
                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    Cliente
                  </div>
                  <p className="font-medium">{comercialDetails.client_name}</p>
                  {comercialDetails.client_cnpj && (
                    <p className="text-sm text-muted-foreground font-mono">
                      {comercialDetails.client_cnpj}
                    </p>
                  )}
                  {comercialDetails.client_phone && (
                    <a
                      href={`tel:${comercialDetails.client_phone.replace(/\D/g, "")}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {comercialDetails.client_phone}
                    </a>
                  )}
                </div>
              )}

              {/* Resumo Valor */}
              {comercialDetails?.contract_value && (
                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-2 text-sm font-medium mb-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    Valor do Contrato
                  </div>
                  <p className="text-xl font-bold text-green-600">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(comercialDetails.contract_value)}
                  </p>
                </div>
              )}

              {/* Acoes de Status */}
              <ComercialStatusActions
                ticketId={ticketId}
                currentStatus={ticket.status}
                canManage={canManage}
              />

              {/* Botao de Excluir (apenas para Admin) */}
              {isAdmin && (
                <div className="pt-4 border-t">
                  <DeleteTicketButton
                    ticketId={ticketId}
                    ticketNumber={ticket.ticket_number}
                    ticketTitle={ticket.title}
                    redirectTo="/chamados/comercial"
                  />
                </div>
              )}

              {/* Timeline resumida */}
              <ComercialTimeline history={(ticket.history || []).slice(0, 5)} />
            </div>
          </div>
        </TabsContent>

        {/* Tab: Comentarios */}
        <TabsContent value="comments" className="mt-6">
          <ComercialComments
            ticketId={ticketId}
            comments={ticket.comments || []}
            canManage={canManage}
          />
        </TabsContent>

        {/* Tab: Historico */}
        <TabsContent value="history" className="mt-6">
          <ComercialTimeline history={ticket.history || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
