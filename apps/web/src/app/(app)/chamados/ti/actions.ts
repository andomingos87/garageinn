"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Permission } from "@/lib/auth/permissions";
import {
  getUserPermissions,
  hasAnyPermission,
  isAdmin as isAdminPermission,
  type UserRole,
} from "@/lib/auth/rbac";
import {
  canAccessTiArea,
  isOperacoesApprover,
  getOperacoesApproverRole,
  getApprovalLevelForRole,
} from "@/lib/auth/ti-access";
import type { ApprovalDecision, ApprovalFlowStatus } from "@/lib/ticket-statuses";
import { APPROVAL_FLOW_STATUS } from "@/lib/ticket-statuses";
import { hasPermission } from "@/lib/auth/rbac";
import {
  statusTransitions,
  statusLabels,
  getTransitionPermission,
} from "./constants";
import type {
  TiCategory,
  TiFilters,
  TiStats,
  TiTicketDetail,
  TiTicketListItem,
} from "./types";

interface TiTicketListResult {
  data: TiTicketListItem[];
  count: number;
  page: number;
  limit: number;
}

interface TiReadyListResult extends TiTicketListResult {
  canAccess: boolean;
}

interface TiApprovalContextRole {
  name: string;
  department: string | null;
}

interface TiApprovalContext {
  isAdmin: boolean;
  roles: TiApprovalContextRole[];
}

interface TiAccessContext {
  canAccess: boolean;
  isAdmin: boolean;
  permissions: Permission[];
  roles: UserRole[];
}

// ============================================
// Helpers
// ============================================

async function getTiDepartment() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("departments")
    .select("id")
    .eq("name", "TI")
    .single();

  if (error) {
    console.error("Error fetching TI department:", error);
    return null;
  }

  return data;
}

async function getCurrentUserRoles(): Promise<UserRole[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: userRoles, error } = await supabase
    .from("user_roles")
    .select(
      `
      role:roles (
        name,
        is_global,
        department:departments (
          name
        )
      )
    `
    )
    .eq("user_id", user.id);

  if (error || !userRoles) {
    console.error("Error fetching user roles:", error);
    return [];
  }

  interface RoleQueryData {
    role:
      | {
          name: string;
          is_global: boolean;
          department: { name: string }[] | null;
        }
      | {
          name: string;
          is_global: boolean;
          department: { name: string }[] | null;
        }[]
      | null;
  }

  return (userRoles as RoleQueryData[])
    .map((ur) => {
      const roleData = Array.isArray(ur.role) ? ur.role[0] : ur.role;
      if (!roleData) return null;
      const dept = Array.isArray(roleData.department)
        ? roleData.department[0]
        : roleData.department;
      return {
        role_name: roleData.name,
        department_name: dept?.name ?? null,
        is_global: roleData.is_global ?? false,
      };
    })
    .filter((role): role is UserRole => role !== null);
}

async function getCurrentUserPermissions(): Promise<Permission[]> {
  const roles = await getCurrentUserRoles();
  return getUserPermissions(roles);
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
    return { error: "Nao foi possivel validar o criador do chamado", code: "conflict" };
  }

  const { data: isOpsCreator, error: creatorError } = await supabase.rpc(
    "is_operacoes_creator",
    {
      p_user_id: ticket.created_by,
    }
  );

  if (creatorError) {
    console.error("Error checking operations creator:", creatorError);
    return { error: "Nao foi possivel validar permissoes de aprovacao", code: "conflict" };
  }

  if (!isOpsCreator) {
    return null;
  }

  const { data: isOpsManager, error: managerError } = await supabase.rpc(
    "is_operacoes_gerente"
  );

  if (managerError) {
    console.error("Error checking operations manager:", managerError);
    return { error: "Nao foi possivel validar permissoes de aprovacao", code: "conflict" };
  }

  if (!isOpsManager) {
    return { error: "Apenas o gerente de operacoes pode aprovar este chamado", code: "forbidden" };
  }

  return null;
}

async function checkIsGerente(): Promise<boolean> {
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

  interface RoleQueryData {
    role:
      | { name: string }
      | { name: string }[]
      | null;
  }

  const hasGerenteRole = (userRoles as RoleQueryData[] | null)?.some((ur) => {
    const role = Array.isArray(ur.role) ? ur.role[0] : ur.role;
    return role?.name === "Gerente";
  });

  return hasGerenteRole || false;
}

export async function getTiAccessContext(): Promise<TiAccessContext> {
  const roles = await getCurrentUserRoles();
  const permissions = getUserPermissions(roles);
  const isAdmin = isAdminPermission(permissions);

  return {
    roles,
    permissions,
    isAdmin,
    canAccess: canAccessTiArea({ isAdmin, roles }),
  };
}

async function ensureTiAccess(): Promise<boolean> {
  const access = await getTiAccessContext();
  return access.canAccess;
}

export async function canAccessTiTicketDetail(
  ticketId: string
): Promise<boolean> {
  const access = await getTiAccessContext();
  if (access.canAccess) return true;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const dept = await getTiDepartment();
  if (!dept) return false;

  const { data: ticket, error } = await supabase
    .from("tickets")
    .select("created_by, department_id, status")
    .eq("id", ticketId)
    .single();

  if (error || !ticket) {
    console.error("Error checking TI ticket access:", error);
    return false;
  }

  if (ticket.department_id !== dept.id) return false;

  // Ticket creator can always access their own ticket
  if (ticket.created_by === user.id) return true;

  // Operations approvers can access TI tickets awaiting their approval level
  if (isOperacoesApprover(access.roles)) {
    const approverRole = getOperacoesApproverRole(access.roles);
    if (approverRole) {
      const approverLevel = getApprovalLevelForRole(approverRole);
      const statusToLevel: Record<string, number> = {
        awaiting_approval_encarregado: 1,
        awaiting_approval_supervisor: 2,
        awaiting_approval_gerente: 3,
      };
      const ticketLevel = statusToLevel[ticket.status];
      // Allow access while ticket is in approval flow at or above user's level
      if (ticketLevel && ticketLevel >= approverLevel) {
        return true;
      }
      // After Gerente approves, status becomes awaiting_triage; allow Gerente to keep viewing
      if (
        ticket.status === "awaiting_triage" &&
        approverLevel === 3
      ) {
        return true;
      }
    }
  }

  return false;
}

async function canAccessTiReadyList(): Promise<boolean> {
  const access = await getTiAccessContext();
  if (!access.canAccess) return false;
  if (access.permissions.length === 0) return false;
  return hasAnyPermission(access.permissions, ["tickets:execute", "admin:all"]);
}

// ============================================
// Query Functions
// ============================================

export async function getTiCategories(): Promise<TiCategory[]> {
  const supabase = await createClient();
  const dept = await getTiDepartment();
  if (!dept) return [];

  const { data, error } = await supabase
    .from("ticket_categories")
    .select("*")
    .eq("department_id", dept.id)
    .eq("status", "active")
    .order("name");

  if (error) {
    console.error("Error fetching TI categories:", error);
    return [];
  }

  return data || [];
}

export async function getTiTickets(
  filters?: TiFilters
): Promise<TiTicketListResult> {
  const canAccess = await ensureTiAccess();
  if (!canAccess) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    return { data: [], count: 0, page, limit };
  }
  const supabase = await createClient();
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("tickets_it_with_details")
    .select("*", { count: "exact" })
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

  if (filters?.parent_ticket_id) {
    query = query.eq("parent_ticket_id", filters.parent_ticket_id);
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

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching TI tickets:", error);
    return { data: [], count: 0, page, limit };
  }

  return {
    data: (data || []) as TiTicketListItem[],
    count: count || 0,
    page,
    limit,
  };
}

export async function getTiReadyTickets(
  filters?: TiFilters
): Promise<TiReadyListResult> {
  const supabase = await createClient();
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const offset = (page - 1) * limit;

  const canAccess = await canAccessTiReadyList();
  if (!canAccess) {
    return { data: [], count: 0, page, limit, canAccess: false };
  }

  const { data, error, count } = await supabase
    .from("tickets_it_ready")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching ready TI tickets:", error);
    return { data: [], count: 0, page, limit, canAccess: true };
  }

  return {
    data: (data || []) as TiTicketListItem[],
    count: count || 0,
    page,
    limit,
    canAccess: true,
  };
}

export async function getTiStats(): Promise<TiStats> {
  const canAccess = await ensureTiAccess();
  if (!canAccess) {
    return { total: 0, ready: 0, inProgress: 0, closed: 0 };
  }
  const supabase = await createClient();
  const dept = await getTiDepartment();
  if (!dept) return { total: 0, ready: 0, inProgress: 0, closed: 0 };

  const { data } = await supabase
    .from("tickets")
    .select("status")
    .eq("department_id", dept.id);

  if (!data) {
    return { total: 0, ready: 0, inProgress: 0, closed: 0 };
  }

  const closedStatuses = ["closed", "cancelled", "denied"];
  const approvalStatuses = [
    "awaiting_approval_encarregado",
    "awaiting_approval_supervisor",
    "awaiting_approval_gerente",
  ];
  const readyStatuses = ["awaiting_triage"];

  return {
    total: data.length,
    ready: data.filter((t) => readyStatuses.includes(t.status)).length,
    inProgress: data.filter(
      (t) =>
        !closedStatuses.includes(t.status) &&
        !readyStatuses.includes(t.status) &&
        !approvalStatuses.includes(t.status)
    ).length,
    closed: data.filter((t) => closedStatuses.includes(t.status)).length,
  };
}

// ============================================
// Mutation Functions
// ============================================

/**
 * Muda status do chamado de TI
 */
export async function changeTicketStatus(
  ticketId: string,
  newStatus: string,
  reason?: string
) {
  const supabase = await createClient();

  const { data: ticket } = await supabase
    .from("tickets")
    .select("status, department_id")
    .eq("id", ticketId)
    .single();

  if (!ticket) {
    return { error: "Chamado nao encontrado", code: "not_found" as const };
  }

  const dept = await getTiDepartment();
  if (!dept || ticket.department_id !== dept.id) {
    return { error: "Chamado nao encontrado", code: "not_found" as const };
  }

  const { data: isAdmin } = await supabase.rpc("is_admin");
  const isGerente = await checkIsGerente();
  const adminOverrideStatuses = ["closed", "cancelled"];
  const finalStatuses = ["closed", "cancelled", "denied"];

  if (
    (isAdmin || isGerente) &&
    adminOverrideStatuses.includes(newStatus) &&
    !finalStatuses.includes(ticket.status)
  ) {
    // Permitir transição (admin/Gerente override)
  } else {
    const allowedTransitions = statusTransitions[ticket.status] || [];
    if (!allowedTransitions.includes(newStatus)) {
      return {
        error: `Transicao de ${statusLabels[ticket.status]} para ${statusLabels[newStatus]} nao permitida`,
        code: "validation" as const,
      };
    }
  }

  const trimmedReason = reason?.trim();
  if (newStatus === "denied" && !trimmedReason) {
    return {
      error: "Informe o motivo da negacao",
      code: "validation" as const,
    };
  }

  const requiredPermission = getTransitionPermission(newStatus);
  if (requiredPermission !== null) {
    const userPermissions = await getCurrentUserPermissions();
    if (!hasPermission(userPermissions, requiredPermission as Permission)) {
      return {
        error: `Voce nao tem permissao para realizar esta acao. A transicao para "${statusLabels[newStatus]}" requer permissao de execucao.`,
        code: "forbidden" as const,
      };
    }
  }

  const updates: Record<string, unknown> = { status: newStatus };

  if (newStatus === "denied" && trimmedReason) {
    updates.denial_reason = trimmedReason;
  }

  if (newStatus === "closed") {
    updates.closed_at = new Date().toISOString();
  }

  if (newStatus === "resolved") {
    updates.resolved_at = new Date().toISOString();
  }

  const { data: updatedTickets, error } = await supabase
    .from("tickets")
    .update(updates)
    .eq("id", ticketId)
    .select("id, status");

  if (error) {
    console.error("Error changing ticket status:", error);
    return { error: error.message, code: "conflict" as const };
  }

  if (!updatedTickets || updatedTickets.length === 0) {
    return {
      error:
        "Nao foi possivel atualizar o status. O chamado pode ter sido alterado por outro usuario.",
      code: "conflict" as const,
    };
  }

  revalidatePath(`/chamados/ti/${ticketId}`);
  revalidatePath("/chamados/ti");
  return { success: true };
}

export async function createTiTicket(
  formData: FormData
): Promise<{ error?: string; code?: "forbidden" | "not_found" | "validation" | "conflict" } | void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nao autenticado", code: "forbidden" };
  }

  const dept = await getTiDepartment();
  if (!dept) {
    return { error: "Departamento de TI nao encontrado", code: "not_found" };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category_id = formData.get("category_id") as string | null;
  const unit_id = formData.get("unit_id") as string | null;
  const perceived_urgency = formData.get("perceived_urgency") as string | null;
  const equipment_type = formData.get("equipment_type") as string | null;

  if (!title || title.trim().length < 5) {
    return { error: "Titulo deve ter pelo menos 5 caracteres", code: "validation" };
  }
  if (!description || description.trim().length < 10) {
    return { error: "Descricao deve ter pelo menos 10 caracteres", code: "validation" };
  }
  if (!category_id) {
    return { error: "Categoria e obrigatoria", code: "validation" };
  }
  if (!equipment_type || equipment_type.trim().length === 0) {
    return { error: "Tipo de equipamento e obrigatorio", code: "validation" };
  }

  // Verificar se precisa de aprovação e obter status inicial baseado no cargo
  const { data: needsApproval } = await supabase.rpc("ticket_needs_approval", {
    p_created_by: user.id,
    p_department_id: dept.id,
  });

  // Usar função SQL que determina o status inicial correto baseado na hierarquia
  const { data: initialStatusData } = await supabase.rpc(
    "get_initial_approval_status",
    { p_created_by: user.id }
  );
  const initialStatus = initialStatusData || "awaiting_triage";

  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .insert({
      title,
      description,
      department_id: dept.id,
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
    console.error("Error creating TI ticket:", ticketError);
    return { error: ticketError.message, code: "conflict" };
  }

  const { error: detailsError } = await supabase
    .from("ticket_it_details")
    .insert({
      ticket_id: ticket.id,
      equipment_type: equipment_type.trim(),
    });

  if (detailsError) {
    console.error("Error creating TI ticket details:", detailsError);
    await supabase.from("tickets").delete().eq("id", ticket.id);
    return { error: detailsError.message, code: "conflict" };
  }

  if (needsApproval) {
    await supabase.rpc("create_ticket_approvals", { p_ticket_id: ticket.id });
  }

  const attachments = formData.getAll("attachments") as File[];
  const validAttachments = attachments.filter(
    (file) => file instanceof File && file.size > 0
  );
  if (validAttachments.length > 0) {
    const uploadResults = await Promise.all(
      validAttachments.map(async (file) => {
        const extension = file.name.split(".").pop() || "bin";
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const filePath = `tickets/${ticket.id}/${Date.now()}-${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from("ticket-attachments")
          .upload(filePath, file, {
            upsert: false,
            cacheControl: "3600",
          });

        if (uploadError) {
          console.error("Error uploading attachment:", uploadError);
          return null;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("ticket-attachments").getPublicUrl(filePath);

        return {
          ticket_id: ticket.id,
          file_name: file.name,
          file_path: publicUrl,
          file_type: file.type || `application/${extension}`,
          file_size: file.size,
          uploaded_by: user.id,
        };
      })
    );

    const attachmentsToInsert = uploadResults.filter(
      (item): item is NonNullable<typeof item> => item !== null
    );

    if (attachmentsToInsert.length > 0) {
      const { error: attachmentError } = await supabase
        .from("ticket_attachments")
        .insert(attachmentsToInsert);

      if (attachmentError) {
        console.error("Error saving ticket attachments:", attachmentError);
      }
    }
  }

  await supabase.from("ticket_history").insert({
    ticket_id: ticket.id,
    user_id: user.id,
    action: "created",
    new_value: "Chamado criado",
  });

  revalidatePath("/chamados/ti");
  redirect(`/chamados/ti/${ticket.id}`);
}

// ============================================
// Detail Functions
// ============================================

export async function getTiTicketDetail(
  ticketId: string
): Promise<TiTicketDetail | null> {
  const canAccess = await canAccessTiTicketDetail(ticketId);
  if (!canAccess) return null;
  const supabase = await createClient();

  const { data: ticket, error: ticketError } = await supabase
    .from("tickets_it_with_details")
    .select("*")
    .eq("id", ticketId)
    .single();

  if (ticketError || !ticket) {
    console.error("Error fetching TI ticket:", ticketError);
    return null;
  }

  const ticketWithParent = ticket as TiTicketDetail & {
    parent_ticket_id?: string | null;
  };

  const parentTicketQuery = ticketWithParent.parent_ticket_id
    ? supabase
        .from("tickets")
        .select(
          "id, ticket_number, title, status, department:departments!department_id(name)"
        )
        .eq("id", ticketWithParent.parent_ticket_id)
        .single()
    : Promise.resolve({ data: null });

  const [{ data: approvals }, { data: comments }, { data: history }, { data: attachments }, { data: parentTicketRow }] =
    await Promise.all([
      supabase
        .from("ticket_approvals")
        .select(
          `
          *,
          approver:profiles!approved_by(id, full_name, avatar_url)
        `
        )
        .eq("ticket_id", ticketId)
        .order("approval_level", { ascending: true }),
      supabase
        .from("ticket_comments")
        .select(
          `
          *,
          author:profiles!user_id(id, full_name, avatar_url)
        `
        )
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true }),
      supabase
        .from("ticket_history")
        .select(
          `
          *,
          user:profiles!user_id(id, full_name, avatar_url)
        `
        )
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: false }),
      supabase
        .from("ticket_attachments")
        .select(
          `
          *,
          uploader:profiles!uploaded_by(id, full_name, avatar_url)
        `
        )
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: false }),
      parentTicketQuery,
    ]);

  const parentTicket =
    parentTicketRow &&
    typeof parentTicketRow === "object" &&
    "id" in parentTicketRow &&
    "ticket_number" in parentTicketRow
      ? {
          id: parentTicketRow.id,
          ticket_number: parentTicketRow.ticket_number,
          title: parentTicketRow.title,
          status: parentTicketRow.status,
          department_name: (() => {
            const dept = (parentTicketRow as { department?: { name?: string } | { name?: string }[] }).department;
            if (Array.isArray(dept)) return dept[0]?.name ?? "";
            return dept?.name ?? "";
          })(),
        }
      : null;

  return {
    ...(ticket as TiTicketDetail),
    approvals: approvals || [],
    comments: comments || [],
    history: history || [],
    attachments: attachments || [],
    parent_ticket: parentTicket,
  };
}

// ============================================
// Comment/Approval helpers (shared components)
// ============================================

export async function addComment(
  ticketId: string,
  formData: FormData
): Promise<{ error?: string; code?: "forbidden" | "validation" | "conflict"; success?: boolean }> {
  const canAccess = await ensureTiAccess();
  if (!canAccess) {
    return { error: "Acesso negado", code: "forbidden" };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Nao autenticado", code: "forbidden" };
  }

  const content = formData.get("content") as string;
  const is_internal = formData.get("is_internal") === "true";

  if (!content || content.trim().length < 1) {
    return { error: "Comentario nao pode ser vazio", code: "validation" };
  }

  const { error } = await supabase.from("ticket_comments").insert({
    ticket_id: ticketId,
    user_id: user.id,
    content: content.trim(),
    is_internal,
  });

  if (error) {
    console.error("Error adding comment:", error);
    return { error: error.message, code: "conflict" };
  }

  revalidatePath(`/chamados/ti/${ticketId}`);
  return { success: true };
}

export async function handleApproval(
  ticketId: string,
  approvalId: string,
  decision: ApprovalDecision,
  notes?: string
): Promise<{ error?: string; code?: "forbidden" | "not_found" | "conflict"; success?: boolean }> {
  const access = await getTiAccessContext();
  const roles = access.roles;

  // Check if user can access: TI area access OR Operations approver
  const canAccessTi = access.canAccess;
  const isOpsApprover = isOperacoesApprover(roles);

  if (!canAccessTi && !isOpsApprover) {
    return { error: "Acesso negado", code: "forbidden" as const };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Nao autenticado", code: "forbidden" as const };
  }

  const { data: approval } = await supabase
    .from("ticket_approvals")
    .select("approval_level, approval_role")
    .eq("id", approvalId)
    .single();

  if (!approval) {
    return { error: "Aprovacao nao encontrada", code: "not_found" as const };
  }

  // For Operations approvers, verify they have the correct role for this approval level
  if (isOpsApprover && !canAccessTi) {
    const approverRole = getOperacoesApproverRole(roles);
    const requiredLevel = approval.approval_level;
    const userLevel = approverRole ? getApprovalLevelForRole(approverRole) : 0;

    if (userLevel < requiredLevel) {
      return {
        error: `Apenas ${approval.approval_role} pode aprovar neste nivel`,
        code: "forbidden" as const,
      };
    }
  }

  const opsCheck = await ensureOperacoesGerenteApproval(
    supabase,
    ticketId,
    approval.approval_level,
    approval.approval_role
  );
  if (opsCheck?.error) {
    return { ...opsCheck, code: "forbidden" as const };
  }

  const { data: approvalUpdate, error } = await supabase
    .from("ticket_approvals")
    .update({
      approved_by: user.id,
      status: decision,
      decision_at: new Date().toISOString(),
      notes: notes || null,
    })
    .eq("id", approvalId)
    .select();

  if (error) {
    console.error("Error handling approval:", error);
    return { error: error.message, code: "conflict" as const };
  }

  if (!approvalUpdate || approvalUpdate.length === 0) {
    return {
      error: "Não foi possível processar a aprovação. Verifique suas permissões.",
      code: "conflict" as const,
    };
  }

  if (decision === APPROVAL_FLOW_STATUS.denied) {
    const { data: ticketUpdate, error: ticketError } = await supabase
      .from("tickets")
      .update({
        status: APPROVAL_FLOW_STATUS.denied,
        denial_reason: notes || "Negado na aprovacao",
      })
      .eq("id", ticketId)
      .select();

    if (ticketError) {
      console.error("Error updating ticket status (denied):", ticketError);
      return {
        error: "Aprovacao registrada, mas falha ao atualizar status do chamado",
        code: "conflict" as const,
      };
    }

    if (!ticketUpdate || ticketUpdate.length === 0) {
      return {
        error: "Não foi possível processar a aprovação. Verifique suas permissões.",
        code: "conflict" as const,
      };
    }
  } else {
    const nextStatusMap: Record<number, ApprovalFlowStatus> = {
      1: APPROVAL_FLOW_STATUS.awaitingApprovalSupervisor,
      2: APPROVAL_FLOW_STATUS.awaitingApprovalGerente,
      3: APPROVAL_FLOW_STATUS.awaitingTriage,
    };

    const { data: ticketUpdate, error: ticketError } = await supabase
      .from("tickets")
      .update({ status: nextStatusMap[approval.approval_level] })
      .eq("id", ticketId)
      .select();

    if (ticketError) {
      console.error("Error updating ticket status (approved):", ticketError);
      return {
        error: "Aprovacao registrada, mas falha ao atualizar status do chamado",
        code: "conflict" as const,
      };
    }

    if (!ticketUpdate || ticketUpdate.length === 0) {
      return {
        error: "Não foi possível processar a aprovação. Verifique suas permissões.",
        code: "conflict" as const,
      };
    }
  }

  revalidatePath(`/chamados/ti/${ticketId}`);
  revalidatePath("/chamados/ti");
  return { success: true };
}

export async function checkIsAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_admin");

  if (error) {
    console.error("Error checking admin status:", error);
    return false;
  }

  return data === true;
}

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

export async function getApprovalContext(): Promise<TiApprovalContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { isAdmin: false, roles: [] };

  const { data: userRoles, error } = await supabase
    .from("user_roles")
    .select(
      `
      role:roles (
        name,
        is_global,
        department:departments (
          name
        )
      )
    `
    )
    .eq("user_id", user.id);

  if (error || !userRoles) {
    console.error("Error fetching user roles:", error);
    return { isAdmin: false, roles: [] };
  }

  interface RoleData {
    name: string;
    is_global: boolean;
    department: { name: string } | { name: string }[] | null;
  }

  const rolesWithDepartment: TiApprovalContextRole[] = userRoles
    .map((ur) => {
      const roleData = ur.role as unknown;
      const role: RoleData | null = Array.isArray(roleData)
        ? roleData[0]
        : (roleData as RoleData | null);
      if (!role?.name) return null;

      const dept = Array.isArray(role.department)
        ? role.department[0]
        : role.department;

      return {
        name: role.name,
        department: dept?.name || null,
      };
    })
    .filter((role): role is TiApprovalContextRole => role !== null);

  const permissions = await getCurrentUserPermissions();

  return {
    isAdmin: isAdminPermission(permissions),
    roles: rolesWithDepartment,
  };
}
