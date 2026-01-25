"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  statusTransitions,
  statusLabels,
  FINANCEIRO_DEPARTMENT_ID,
} from "./constants";
import type {
  FinanceiroCategory,
  FinanceiroFilters,
  FinanceiroStats,
} from "./types";

// ============================================
// Query Functions
// ============================================

/**
 * Lista categorias do Financeiro
 */
export async function getFinanceiroCategories(): Promise<FinanceiroCategory[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ticket_categories")
    .select("*")
    .eq("department_id", FINANCEIRO_DEPARTMENT_ID)
    .eq("status", "active")
    .order("name");

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return data || [];
}

/**
 * Lista chamados financeiros com filtros
 */
export async function getFinanceiroTickets(filters?: FinanceiroFilters) {
  const supabase = await createClient();

  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const offset = (page - 1) * limit;

  // Query para tickets
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
      category:ticket_categories(id, name)
    `,
      { count: "exact" }
    )
    .eq("department_id", FINANCEIRO_DEPARTMENT_ID)
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
    const ticketNumber = parseInt(searchTerm.replace(/\D/g, ""));

    if (!isNaN(ticketNumber) && ticketNumber > 0) {
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
    console.error("Error fetching financeiro tickets:", error);
    return { data: [], count: 0, page, limit };
  }

  // Buscar perfis dos criadores e responsaveis
  const userIds = [
    ...new Set(
      (data || [])
        .flatMap((t: { created_by: string; assigned_to: string | null }) => [
          t.created_by,
          t.assigned_to,
        ])
        .filter(Boolean)
    ),
  ];
  let usersMap: Record<
    string,
    { full_name: string; avatar_url: string | null }
  > = {};

  if (userIds.length > 0) {
    const { data: users } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", userIds);

    usersMap = (users || []).reduce(
      (acc, u) => {
        acc[u.id] = { full_name: u.full_name, avatar_url: u.avatar_url };
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
    created_by_id: ticket.created_by || "",
    created_by_name:
      usersMap[ticket.created_by]?.full_name || "Desconhecido",
    created_by_avatar: usersMap[ticket.created_by]?.avatar_url || null,
    assigned_to_id: ticket.assigned_to || null,
    assigned_to_name: ticket.assigned_to
      ? usersMap[ticket.assigned_to]?.full_name || "Desconhecido"
      : null,
    assigned_to_avatar: ticket.assigned_to
      ? usersMap[ticket.assigned_to]?.avatar_url || null
      : null,
  }));

  return { data: transformedData, count: count || 0, page, limit };
}

/**
 * Obter detalhes de um chamado financeiro
 */
export async function getFinanceiroTicket(id: string) {
  const supabase = await createClient();

  const { data: ticket, error } = await supabase
    .from("tickets")
    .select(
      `
      *,
      unit:units(id, name, code),
      category:ticket_categories(id, name),
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
        file_path,
        file_size,
        file_type,
        created_at
      ),
      approvals:ticket_approvals(
        id,
        approval_level,
        approval_role,
        status,
        approved_by,
        decision_at,
        notes
      )
    `
    )
    .eq("id", id)
    .eq("department_id", FINANCEIRO_DEPARTMENT_ID)
    .single();

  if (error) {
    console.error("Error fetching financeiro ticket:", error);
    return null;
  }

  return ticket;
}

/**
 * Estatisticas do Financeiro
 */
export async function getFinanceiroStats(): Promise<FinanceiroStats> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("tickets")
    .select("status")
    .eq("department_id", FINANCEIRO_DEPARTMENT_ID);

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
    p_department_id: FINANCEIRO_DEPARTMENT_ID,
  });

  return needsApproval === true;
}

// ============================================
// Mutation Functions
// ============================================

/**
 * Cria um chamado financeiro
 */
export async function createFinanceiroTicket(formData: FormData) {
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
  const perceived_urgency = formData.get("perceived_urgency") as string | null;

  // Validacoes
  if (!title || title.length < 3) {
    return { error: "Titulo deve ter pelo menos 3 caracteres" };
  }
  if (!description || description.length < 10) {
    return { error: "Descricao deve ter pelo menos 10 caracteres" };
  }
  if (!category_id) {
    return { error: "Categoria e obrigatoria" };
  }

  // Verificar se precisa de aprovacao
  const { data: needsApproval } = await supabase.rpc("ticket_needs_approval", {
    p_created_by: user.id,
    p_department_id: FINANCEIRO_DEPARTMENT_ID,
  });

  // Usar função SQL que determina o status inicial correto baseado na hierarquia
  const { data: initialStatusData } = await supabase.rpc(
    "get_initial_approval_status",
    { p_created_by: user.id }
  );
  const initialStatus = initialStatusData || "awaiting_triage";

  // Criar ticket principal
  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .insert({
      title,
      description,
      department_id: FINANCEIRO_DEPARTMENT_ID,
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

  // Se precisa aprovacao, criar registros de aprovacao
  if (needsApproval) {
    await supabase.rpc("create_ticket_approvals", { p_ticket_id: ticket.id });
  }

  // Registrar no historico
  await supabase.from("ticket_history").insert({
    ticket_id: ticket.id,
    user_id: user.id,
    action: "created",
    new_value: "Chamado criado",
  });

  revalidatePath("/chamados/financeiro");
  redirect(`/chamados/financeiro/${ticket.id}`);
}

/**
 * Atualiza status do chamado financeiro
 */
export async function updateFinanceiroTicketStatus(
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
    console.error("Error changing financeiro ticket status:", error);
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

  revalidatePath(`/chamados/financeiro/${ticketId}`);
  revalidatePath("/chamados/financeiro");
  return { success: true };
}

// ============================================
// Triage Functions
// ============================================

/**
 * Verifica se o usuario pode triar chamados financeiros
 */
export async function canTriageFinanceiroTicket(): Promise<boolean> {
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

  // Verificar se tem cargo de triagem no departamento Financeiro
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

    // Se e um cargo de triagem dentro do departamento Financeiro
    return triageRoles.includes(roleName) && deptName === "financeiro";
  });
}

/**
 * Lista membros do departamento Financeiro
 */
export async function getFinanceiroDepartmentMembers() {
  const supabase = await createClient();

  const { data } = await supabase.from("user_roles").select(`
      user:profiles!user_id(id, full_name, email, avatar_url),
      role:roles!role_id(name, department_id)
    `);

  // Filtrar por departamento Financeiro, removendo duplicatas
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

    if (role && user && role.department_id === FINANCEIRO_DEPARTMENT_ID) {
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
 * Triar chamado financeiro
 */
export async function triageFinanceiroTicket(
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
  const canTriage = await canTriageFinanceiroTicket();
  if (!canTriage) {
    return { error: "Sem permissao para triar chamados financeiros" };
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
      status: "prioritized",
    })
    .eq("id", ticketId);

  if (error) {
    console.error("Error triaging financeiro ticket:", error);
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

  revalidatePath(`/chamados/financeiro/${ticketId}`);
  revalidatePath("/chamados/financeiro");
  return { success: true };
}

// ============================================
// Comment Functions
// ============================================

/**
 * Adiciona comentario ao chamado financeiro
 */
export async function addFinanceiroTicketComment(
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

  revalidatePath(`/chamados/financeiro/${ticketId}`);
  return { success: true };
}

async function ensureOperacoesGerenteApproval(
  supabase: Awaited<ReturnType<typeof createClient>>,
  ticketId: string,
  approvalLevel?: number | null,
  approvalRole?: string | null
) {
  if (approvalLevel !== 3 && approvalRole !== "Gerente") {
    return null;
  }

  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .select("created_by")
    .eq("id", ticketId)
    .single();

  if (ticketError || !ticket) {
    console.error("Error fetching ticket creator:", ticketError);
    return { error: "Nao foi possivel validar o criador do chamado" };
  }

  const { data: isOpsCreator, error: creatorError } = await supabase.rpc(
    "is_operacoes_creator",
    {
      p_user_id: ticket.created_by,
    }
  );

  if (creatorError) {
    console.error("Error checking operations creator:", creatorError);
    return { error: "Nao foi possivel validar permissoes de aprovacao" };
  }

  if (!isOpsCreator) {
    return null;
  }

  const { data: isOpsManager, error: managerError } = await supabase.rpc(
    "is_operacoes_gerente"
  );

  if (managerError) {
    console.error("Error checking operations manager:", managerError);
    return { error: "Nao foi possivel validar permissoes de aprovacao" };
  }

  if (!isOpsManager) {
    return { error: "Apenas o gerente de operacoes pode aprovar este chamado" };
  }

  return null;
}

// ============================================
// Approval Functions
// ============================================

/**
 * Aprovar ou rejeitar chamado no fluxo de aprovacao
 */
export async function handleFinanceiroApproval(
  ticketId: string,
  approvalId: string,
  decision: "approved" | "denied",
  notes?: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Nao autenticado" };
  }

  const { data: approval } = await supabase
    .from("ticket_approvals")
    .select("approval_level, approval_role")
    .eq("id", approvalId)
    .single();

  if (!approval) {
    return { error: "Aprovacao nao encontrada" };
  }

  const opsCheck = await ensureOperacoesGerenteApproval(
    supabase,
    ticketId,
    approval.approval_level,
    approval.approval_role
  );
  if (opsCheck?.error) {
    return opsCheck;
  }

  // Atualizar aprovacao
  const { error: approvalError } = await supabase
    .from("ticket_approvals")
    .update({
      status: decision,
      approved_by: user.id,
      decision_at: new Date().toISOString(),
      notes: notes || null,
    })
    .eq("id", approvalId);

  if (approvalError) {
    console.error("Error updating approval:", approvalError);
    return { error: approvalError.message };
  }

  // Buscar ticket e proxima aprovacao
  const { data: ticket } = await supabase
    .from("tickets")
    .select("status")
    .eq("id", ticketId)
    .single();

  if (!ticket) {
    return { error: "Chamado nao encontrado" };
  }

  let newStatus = ticket.status;

  if (decision === "denied") {
    newStatus = "denied";
  } else {
    // Verificar proxima etapa de aprovacao
    const statusMap: Record<string, string> = {
      awaiting_approval_encarregado: "awaiting_approval_supervisor",
      awaiting_approval_supervisor: "awaiting_approval_gerente",
      awaiting_approval_gerente: "awaiting_triage",
    };
    newStatus = statusMap[ticket.status] || "awaiting_triage";
  }

  // Atualizar status do ticket
  const { error: ticketError } = await supabase
    .from("tickets")
    .update({
      status: newStatus,
      denial_reason: decision === "denied" ? notes : null,
    })
    .eq("id", ticketId);

  if (ticketError) {
    console.error("Error updating ticket status:", ticketError);
    return { error: ticketError.message };
  }

  // Registrar no historico
  await supabase.from("ticket_history").insert({
    ticket_id: ticketId,
    user_id: user.id,
    action: decision === "approved" ? "approved" : "denied",
    old_value: ticket.status,
    new_value: newStatus,
    metadata: { notes },
  });

  revalidatePath(`/chamados/financeiro/${ticketId}`);
  revalidatePath("/chamados/financeiro");
  return { success: true };
}

// ============================================
// Helper Functions
// ============================================

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

/**
 * Verifica se o usuario atual pode acessar o Financeiro
 * Permitido para membros do departamento Financeiro ou admins
 */
export async function checkCanAccessFinanceiro(): Promise<boolean> {
  if (await checkIsAdmin()) return true;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: userRoles, error } = await supabase
    .from("user_roles")
    .select(
      `
      role:roles (
        name,
        department:departments (
          name
        )
      )
    `
    )
    .eq("user_id", user.id);

  if (error || !userRoles) {
    console.error("Error fetching user roles:", error);
    return false;
  }

  return userRoles.some((ur) => {
    const role = Array.isArray(ur.role) ? ur.role[0] : ur.role;
    if (!role) return false;
    const dept = Array.isArray(role.department)
      ? role.department[0]
      : role.department;
    return dept?.name === "Financeiro";
  });
}
