"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  statusTransitions,
  statusLabels,
  COMERCIAL_DEPARTMENT_ID,
} from "./constants";
import type {
  ComercialCategory,
  ComercialFilters,
  ComercialStats,
} from "./types";

// ============================================
// Query Functions
// ============================================

/**
 * Lista categorias de Comercial
 */
export async function getComercialCategories(): Promise<ComercialCategory[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ticket_categories")
    .select("*")
    .eq("department_id", COMERCIAL_DEPARTMENT_ID)
    .eq("status", "active")
    .order("name");

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return data || [];
}

/**
 * Lista chamados comerciais com filtros
 */
export async function getComercialTickets(filters?: ComercialFilters) {
  const supabase = await createClient();

  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const offset = (page - 1) * limit;

  // Query para tickets com detalhes comerciais
  let query = supabase
    .from("tickets")
    .select(
      `
      id,
      ticket_number,
      title,
      description,
      status,
      priority,
      perceived_urgency,
      created_at,
      updated_at,
      created_by,
      assigned_to,
      unit:units(id, name, code),
      category:ticket_categories(id, name),
      comercial_details:ticket_comercial_details!ticket_id(
        comercial_type,
        client_name,
        client_cnpj,
        client_phone,
        client_email,
        contract_value,
        proposal_deadline,
        resolution_type
      )
    `,
      { count: "exact" }
    )
    .eq("department_id", COMERCIAL_DEPARTMENT_ID)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters?.priority && filters.priority !== "all") {
    query = query.eq("priority", filters.priority);
  }

  if (filters?.category_id && filters.category_id !== "all") {
    query = query.eq("category_id", filters.category_id);
  }

  if (filters?.unit_id && filters.unit_id !== "all") {
    query = query.eq("unit_id", filters.unit_id);
  }

  if (filters?.assigned_to && filters.assigned_to !== "all") {
    query = query.eq("assigned_to", filters.assigned_to);
  }

  if (filters?.search) {
    const searchTerm = filters.search.trim();
    const ticketNumber = parseInt(searchTerm.replace("#", ""));

    if (!isNaN(ticketNumber)) {
      query = query.or(
        `title.ilike.%${searchTerm}%,ticket_number.eq.${ticketNumber}`
      );
    } else {
      query = query.ilike("title", `%${searchTerm}%`);
    }
  }

  if (filters?.startDate) {
    query = query.gte("created_at", `${filters.startDate}T00:00:00`);
  }

  if (filters?.endDate) {
    query = query.lte("created_at", `${filters.endDate}T23:59:59`);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching comercial tickets:", error);
    return { data: [], count: 0, page, limit };
  }

  // Buscar perfis dos criadores
  const creatorIds = [
    ...new Set(
      (data || [])
        .map((t: { created_by: string }) => t.created_by)
        .filter(Boolean)
    ),
  ];
  let creatorsMap: Record<
    string,
    { full_name: string; avatar_url: string | null }
  > = {};

  if (creatorIds.length > 0) {
    const { data: creators } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", creatorIds);

    creatorsMap = (creators || []).reduce(
      (acc, c) => {
        acc[c.id] = { full_name: c.full_name, avatar_url: c.avatar_url };
        return acc;
      },
      {} as Record<string, { full_name: string; avatar_url: string | null }>
    );
  }

  // Transformar dados para formato esperado pela tabela
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedData = (data || []).map((ticket: any) => ({
    id: ticket.id,
    ticket_number: ticket.ticket_number,
    title: ticket.title,
    status: ticket.status,
    priority: ticket.priority,
    perceived_urgency: ticket.perceived_urgency,
    created_at: ticket.created_at,
    category_name: ticket.category?.name || null,
    unit_name: ticket.unit?.name || null,
    unit_code: ticket.unit?.code || null,
    // Comercial specific
    comercial_type: ticket.comercial_details?.[0]?.comercial_type || null,
    client_name: ticket.comercial_details?.[0]?.client_name || null,
    client_cnpj: ticket.comercial_details?.[0]?.client_cnpj || null,
    contract_value: ticket.comercial_details?.[0]?.contract_value || null,
    proposal_deadline: ticket.comercial_details?.[0]?.proposal_deadline || null,
    resolution_type: ticket.comercial_details?.[0]?.resolution_type || null,
    // Creator
    created_by_id: ticket.created_by || "",
    created_by_name:
      creatorsMap[ticket.created_by]?.full_name || "Desconhecido",
    created_by_avatar: creatorsMap[ticket.created_by]?.avatar_url || null,
    // Counts (placeholder - would need separate queries)
    comments_count: 0,
    attachments_count: 0,
  }));

  return { data: transformedData, count: count || 0, page, limit };
}

/**
 * Obter detalhes de um chamado comercial
 */
export async function getComercialTicket(id: string) {
  const supabase = await createClient();

  const { data: ticket, error } = await supabase
    .from("tickets")
    .select(
      `
      *,
      unit:units(id, name, code),
      category:ticket_categories(id, name),
      comercial_details:ticket_comercial_details!ticket_id(*),
      creator:profiles!tickets_created_by_fkey(id, full_name, email, avatar_url),
      assignee:profiles!tickets_assigned_to_fkey(id, full_name, email, avatar_url),
      comments:ticket_comments(
        id,
        content,
        is_internal,
        created_at,
        user:profiles!ticket_comments_user_id_fkey(id, full_name, avatar_url)
      ),
      history:ticket_history(
        id,
        action,
        field_name,
        old_value,
        new_value,
        created_at,
        user:profiles!ticket_history_user_id_fkey(id, full_name, avatar_url)
      ),
      attachments:ticket_attachments(
        id,
        file_name,
        file_url,
        file_size,
        file_type,
        created_at
      )
    `
    )
    .eq("id", id)
    .eq("department_id", COMERCIAL_DEPARTMENT_ID)
    .single();

  if (error) {
    console.error("Error fetching comercial ticket:", error);
    return null;
  }

  return ticket;
}

/**
 * Estatisticas de Comercial
 */
export async function getComercialStats(): Promise<ComercialStats> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("tickets")
    .select("status")
    .eq("department_id", COMERCIAL_DEPARTMENT_ID);

  if (!data) {
    return { total: 0, awaitingTriage: 0, inProgress: 0, resolved: 0 };
  }

  const resolvedStatuses = ["resolved", "closed", "cancelled", "denied"];
  const triageStatuses = [
    "awaiting_triage",
    "awaiting_approval_encarregado",
    "awaiting_approval_supervisor",
    "awaiting_approval_gerente",
  ];

  return {
    total: data.length,
    awaitingTriage: data.filter((t) => triageStatuses.includes(t.status))
      .length,
    inProgress: data.filter(
      (t) =>
        !resolvedStatuses.includes(t.status) &&
        !triageStatuses.includes(t.status)
    ).length,
    resolved: data.filter((t) => resolvedStatuses.includes(t.status)).length,
  };
}

/**
 * Verifica se o usuario atual precisa de aprovacao
 */
export async function checkNeedsApproval(): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return true;

  // Verificar via RPC se precisa de aprovacao
  const { data: needsApproval } = await supabase.rpc("ticket_needs_approval", {
    p_created_by: user.id,
    p_department_id: COMERCIAL_DEPARTMENT_ID,
  });

  return needsApproval === true;
}

// ============================================
// Mutation Functions
// ============================================

/**
 * Cria um chamado comercial
 */
export async function createComercialTicket(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Nao autenticado" };
  }

  // Extrair dados do formulario
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const unit_id = formData.get("unit_id") as string | null;
  const category_id = formData.get("category_id") as string | null;
  const comercial_type = formData.get("comercial_type") as string;
  const perceived_urgency = formData.get("perceived_urgency") as string | null;

  // Dados do cliente
  const client_name = formData.get("client_name") as string | null;
  const client_cnpj = formData.get("client_cnpj") as string | null;
  const client_phone = formData.get("client_phone") as string | null;
  const client_email = formData.get("client_email") as string | null;

  // Dados do contrato
  const contract_value_str = formData.get("contract_value") as string | null;
  const contract_value = contract_value_str
    ? parseFloat(contract_value_str)
    : null;
  const contract_start_date = formData.get("contract_start_date") as
    | string
    | null;
  const contract_end_date = formData.get("contract_end_date") as string | null;
  const proposal_deadline = formData.get("proposal_deadline") as string | null;

  // Informacoes adicionais
  const competitor_info = formData.get("competitor_info") as string | null;
  const negotiation_notes = formData.get("negotiation_notes") as string | null;

  // Validacoes
  if (!title || title.length < 5) {
    return { error: "Titulo deve ter pelo menos 5 caracteres" };
  }
  if (!description || description.length < 10) {
    return { error: "Descricao deve ter pelo menos 10 caracteres" };
  }
  if (!unit_id) {
    return { error: "Unidade e obrigatoria" };
  }
  if (!category_id) {
    return { error: "Categoria e obrigatoria" };
  }
  if (!comercial_type) {
    return { error: "Tipo comercial e obrigatorio" };
  }

  // Verificar se precisa de aprovacao
  const { data: needsApproval } = await supabase.rpc("ticket_needs_approval", {
    p_created_by: user.id,
    p_department_id: COMERCIAL_DEPARTMENT_ID,
  });

  const initialStatus = needsApproval
    ? "awaiting_approval_encarregado"
    : "awaiting_triage";

  // Criar ticket principal
  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .insert({
      title,
      description,
      department_id: COMERCIAL_DEPARTMENT_ID,
      category_id: category_id && category_id !== "" ? category_id : null,
      unit_id: unit_id && unit_id !== "" ? unit_id : null,
      created_by: user.id,
      status: initialStatus,
      perceived_urgency:
        perceived_urgency && perceived_urgency !== ""
          ? perceived_urgency
          : null,
    })
    .select()
    .single();

  if (ticketError) {
    console.error("Error creating ticket:", ticketError);
    return { error: ticketError.message };
  }

  // Criar detalhes comerciais
  const { error: detailsError } = await supabase
    .from("ticket_comercial_details")
    .insert({
      ticket_id: ticket.id,
      comercial_type,
      client_name: client_name || null,
      client_cnpj: client_cnpj || null,
      client_phone: client_phone || null,
      client_email: client_email || null,
      contract_value: contract_value || null,
      contract_start_date: contract_start_date || null,
      contract_end_date: contract_end_date || null,
      proposal_deadline: proposal_deadline || null,
      competitor_info: competitor_info || null,
      negotiation_notes: negotiation_notes || null,
    });

  if (detailsError) {
    console.error("Error creating comercial details:", detailsError);
    // Rollback: deletar ticket
    await supabase.from("tickets").delete().eq("id", ticket.id);
    return { error: detailsError.message };
  }

  // Se precisa aprovacao, criar registros de aprovacao
  if (needsApproval) {
    await supabase.rpc("create_ticket_approvals", { p_ticket_id: ticket.id });
  }

  revalidatePath("/chamados/comercial");
  redirect(`/chamados/comercial/${ticket.id}`);
}

/**
 * Atualiza um chamado comercial
 */
export async function updateComercialTicket(id: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Nao autenticado" };
  }

  // Verificar se o ticket existe
  const { data: existingTicket } = await supabase
    .from("tickets")
    .select("id, status")
    .eq("id", id)
    .eq("department_id", COMERCIAL_DEPARTMENT_ID)
    .single();

  if (!existingTicket) {
    return { error: "Chamado nao encontrado" };
  }

  // Extrair dados do formulario
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  // Dados comerciais
  const client_name = formData.get("client_name") as string | null;
  const client_cnpj = formData.get("client_cnpj") as string | null;
  const client_phone = formData.get("client_phone") as string | null;
  const client_email = formData.get("client_email") as string | null;
  const contract_value_str = formData.get("contract_value") as string | null;
  const contract_value = contract_value_str
    ? parseFloat(contract_value_str)
    : null;
  const contract_start_date = formData.get("contract_start_date") as
    | string
    | null;
  const contract_end_date = formData.get("contract_end_date") as string | null;
  const proposal_deadline = formData.get("proposal_deadline") as string | null;
  const competitor_info = formData.get("competitor_info") as string | null;
  const negotiation_notes = formData.get("negotiation_notes") as string | null;

  // Atualizar ticket
  const { error: ticketError } = await supabase
    .from("tickets")
    .update({
      title,
      description,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (ticketError) {
    console.error("Error updating ticket:", ticketError);
    return { error: ticketError.message };
  }

  // Atualizar detalhes comerciais
  const { error: detailsError } = await supabase
    .from("ticket_comercial_details")
    .update({
      client_name,
      client_cnpj,
      client_phone,
      client_email,
      contract_value,
      contract_start_date,
      contract_end_date,
      proposal_deadline,
      competitor_info,
      negotiation_notes,
      updated_at: new Date().toISOString(),
    })
    .eq("ticket_id", id);

  if (detailsError) {
    console.error("Error updating comercial details:", detailsError);
    return { error: detailsError.message };
  }

  // Registrar no historico
  await supabase.from("ticket_history").insert({
    ticket_id: id,
    user_id: user.id,
    action: "updated",
    new_value: "Chamado atualizado",
  });

  revalidatePath(`/chamados/comercial/${id}`);
  revalidatePath("/chamados/comercial");
  return { success: true };
}

// ============================================
// Triage Functions
// ============================================

/**
 * Verifica se o usuario pode triar chamados comerciais
 */
export async function canTriageComercialTicket(): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  // Verificar se e admin
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin) return true;

  // Buscar roles do usuario
  const { data: userRoles } = await supabase
    .from("user_roles")
    .select(
      `
      role:roles!role_id(
        name,
        department:departments!department_id(name)
      )
    `
    )
    .eq("user_id", user.id);

  if (!userRoles) return false;

  // Verificar se tem cargo de triagem no departamento Comercial
  const triageRoles = ["Supervisor", "Gerente", "Coordenador", "Analista"];
  const globalTriageRoles = [
    "Desenvolvedor",
    "Administrador",
    "Diretor",
    "Gerente",
  ];

  return userRoles.some((ur) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const role = ur.role as any;
    const roleName = role?.name;
    const deptName = role?.department?.name?.toLowerCase();

    // Se e um cargo global de triagem
    if (globalTriageRoles.includes(roleName)) return true;

    // Se e um cargo de triagem dentro do departamento Comercial
    return triageRoles.includes(roleName) && deptName === "comercial";
  });
}

/**
 * Lista membros do departamento Comercial
 */
export async function getComercialDepartmentMembers() {
  const supabase = await createClient();

  const { data } = await supabase.from("user_roles").select(`
      user:profiles!user_id(id, full_name, email, avatar_url),
      role:roles!role_id(name, department_id)
    `);

  // Filtrar por departamento Comercial, removendo duplicatas
  const membersMap = new Map<
    string,
    {
      id: string;
      full_name: string;
      email: string;
      avatar_url: string | null;
      role: string;
    }
  >();

  data?.forEach((d: Record<string, unknown>) => {
    const role = d.role as { department_id: string; name: string } | null;
    const user = d.user as {
      id: string;
      full_name: string;
      email: string;
      avatar_url: string | null;
    } | null;

    if (role && user && role.department_id === COMERCIAL_DEPARTMENT_ID) {
      if (!membersMap.has(user.id)) {
        membersMap.set(user.id, {
          ...user,
          role: role.name,
        });
      }
    }
  });

  return Array.from(membersMap.values());
}

/**
 * Triar chamado comercial
 */
export async function triageComercialTicket(
  ticketId: string,
  formData: FormData
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Nao autenticado" };
  }

  // Verificar permissao de triagem
  const canTriage = await canTriageComercialTicket();
  if (!canTriage) {
    return { error: "Sem permissao para triar chamados comerciais" };
  }

  // Extrair dados do formulario
  const priority = formData.get("priority") as string;
  const assigned_to = formData.get("assigned_to") as string | null;
  const due_date = formData.get("due_date") as string | null;

  // Validacoes
  if (!priority) {
    return { error: "Prioridade e obrigatoria" };
  }

  // Verificar se o ticket existe e esta aguardando triagem
  const { data: ticket } = await supabase
    .from("tickets")
    .select("status")
    .eq("id", ticketId)
    .single();

  if (!ticket) {
    return { error: "Chamado nao encontrado" };
  }

  if (ticket.status !== "awaiting_triage") {
    return { error: "Este chamado nao esta aguardando triagem" };
  }

  // Atualizar ticket
  const { error } = await supabase
    .from("tickets")
    .update({
      priority,
      assigned_to: assigned_to && assigned_to !== "" ? assigned_to : null,
      due_date: due_date || null,
      status: "prioritized", // Avanca para priorizado apos triagem
    })
    .eq("id", ticketId);

  if (error) {
    console.error("Error triaging comercial ticket:", error);
    return { error: error.message };
  }

  // Registrar no historico
  await supabase.from("ticket_history").insert({
    ticket_id: ticketId,
    user_id: user.id,
    action: "triaged",
    new_value: `Prioridade: ${priority}`,
    metadata: { priority, assigned_to, due_date },
  });

  revalidatePath(`/chamados/comercial/${ticketId}`);
  revalidatePath("/chamados/comercial");
  return { success: true };
}

/**
 * Muda status do chamado comercial
 */
export async function updateComercialTicketStatus(
  ticketId: string,
  newStatus: string,
  reason?: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Nao autenticado" };
  }

  const { data: ticket } = await supabase
    .from("tickets")
    .select("status")
    .eq("id", ticketId)
    .single();

  if (!ticket) {
    return { error: "Chamado nao encontrado" };
  }

  const allowedTransitions = statusTransitions[ticket.status] || [];
  if (!allowedTransitions.includes(newStatus)) {
    return {
      error: `Transicao de ${statusLabels[ticket.status]} para ${statusLabels[newStatus]} nao permitida`,
    };
  }

  const updates: Record<string, unknown> = { status: newStatus };

  if (newStatus === "denied" && reason) {
    updates.denial_reason = reason;
  }

  if (newStatus === "closed") {
    updates.closed_at = new Date().toISOString();
  }

  if (newStatus === "resolved") {
    updates.resolved_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("tickets")
    .update(updates)
    .eq("id", ticketId);

  if (error) {
    console.error("Error changing comercial ticket status:", error);
    return { error: error.message };
  }

  // Registrar no historico
  await supabase.from("ticket_history").insert({
    ticket_id: ticketId,
    user_id: user.id,
    action: "status_changed",
    field_name: "status",
    old_value: ticket.status,
    new_value: newStatus,
    metadata: reason ? { reason } : undefined,
  });

  revalidatePath(`/chamados/comercial/${ticketId}`);
  revalidatePath("/chamados/comercial");
  return { success: true };
}

/**
 * Atualiza resolucao do chamado comercial
 */
export async function updateComercialResolution(
  ticketId: string,
  resolutionType: string,
  resolutionNotes?: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Nao autenticado" };
  }

  const { error } = await supabase
    .from("ticket_comercial_details")
    .update({
      resolution_type: resolutionType,
      resolution_notes: resolutionNotes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("ticket_id", ticketId);

  if (error) {
    console.error("Error updating comercial resolution:", error);
    return { error: error.message };
  }

  // Registrar no historico
  await supabase.from("ticket_history").insert({
    ticket_id: ticketId,
    user_id: user.id,
    action: "resolution_updated",
    new_value: `Resolucao: ${resolutionType}`,
    metadata: {
      resolution_type: resolutionType,
      resolution_notes: resolutionNotes,
    },
  });

  revalidatePath(`/chamados/comercial/${ticketId}`);
  return { success: true };
}

// ============================================
// Comment Functions
// ============================================

/**
 * Adiciona comentario ao chamado comercial
 */
export async function addComercialTicketComment(
  ticketId: string,
  content: string,
  isInternal: boolean = false
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Nao autenticado" };
  }

  if (!content || content.trim().length === 0) {
    return { error: "Comentario nao pode estar vazio" };
  }

  const { error } = await supabase.from("ticket_comments").insert({
    ticket_id: ticketId,
    user_id: user.id,
    content: content.trim(),
    is_internal: isInternal,
  });

  if (error) {
    console.error("Error adding comment:", error);
    return { error: error.message };
  }

  revalidatePath(`/chamados/comercial/${ticketId}`);
  return { success: true };
}

/**
 * Obtem usuario atual
 */
export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}

/**
 * Verifica se o usuario atual e admin
 */
export async function checkIsAdmin(): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("is_admin");

  if (error) {
    console.error("Error checking admin status:", error);
    return false;
  }

  return data === true;
}
