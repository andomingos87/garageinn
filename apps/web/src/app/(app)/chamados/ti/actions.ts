"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Permission } from "@/lib/auth/permissions";
import {
  getUserPermissions,
  hasAnyPermission,
  isAdmin as isAdminPermission,
  type UserRole,
} from "@/lib/auth/rbac";
import { canAccessTiArea } from "@/lib/auth/ti-access";
import type { ApprovalDecision, ApprovalFlowStatus } from "@/lib/ticket-statuses";
import { APPROVAL_FLOW_STATUS } from "@/lib/ticket-statuses";
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

interface TiApprovalContext {
  isAdmin: boolean;
  roles: string[];
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
    .select("created_by, department_id")
    .eq("id", ticketId)
    .single();

  if (error || !ticket) {
    console.error("Error checking TI ticket access:", error);
    return false;
  }

  if (ticket.department_id !== dept.id) return false;

  return ticket.created_by === user.id;
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

export async function createTiTicket(
  formData: FormData
): Promise<{ error?: string } | void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nao autenticado" };
  }

  const dept = await getTiDepartment();
  if (!dept) {
    return { error: "Departamento de TI nao encontrado" };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category_id = formData.get("category_id") as string | null;
  const unit_id = formData.get("unit_id") as string | null;
  const perceived_urgency = formData.get("perceived_urgency") as string | null;
  const equipment_type = formData.get("equipment_type") as string | null;

  if (!title || title.trim().length < 5) {
    return { error: "Titulo deve ter pelo menos 5 caracteres" };
  }
  if (!description || description.trim().length < 10) {
    return { error: "Descricao deve ter pelo menos 10 caracteres" };
  }
  if (!category_id) {
    return { error: "Categoria e obrigatoria" };
  }
  if (!equipment_type || equipment_type.trim().length === 0) {
    return { error: "Tipo de equipamento e obrigatorio" };
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
    return { error: ticketError.message };
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
    return { error: detailsError.message };
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

  const { data: approvals } = await supabase
    .from("ticket_approvals")
    .select(
      `
      *,
      approver:profiles!approved_by(id, full_name, avatar_url)
    `
    )
    .eq("ticket_id", ticketId)
    .order("approval_level", { ascending: true });

  const { data: comments } = await supabase
    .from("ticket_comments")
    .select(
      `
      *,
      author:profiles!user_id(id, full_name, avatar_url)
    `
    )
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  const { data: history } = await supabase
    .from("ticket_history")
    .select(
      `
      *,
      user:profiles!user_id(id, full_name, avatar_url)
    `
    )
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: false });

  const { data: attachments } = await supabase
    .from("ticket_attachments")
    .select(
      `
      *,
      uploader:profiles!uploaded_by(id, full_name, avatar_url)
    `
    )
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: false });

  return {
    ...(ticket as TiTicketDetail),
    approvals: approvals || [],
    comments: comments || [],
    history: history || [],
    attachments: attachments || [],
  };
}

// ============================================
// Comment/Approval helpers (shared components)
// ============================================

export async function addComment(
  ticketId: string,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const canAccess = await ensureTiAccess();
  if (!canAccess) {
    return { error: "Acesso negado" };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Nao autenticado" };
  }

  const content = formData.get("content") as string;
  const is_internal = formData.get("is_internal") === "true";

  if (!content || content.trim().length < 1) {
    return { error: "Comentario nao pode ser vazio" };
  }

  const { error } = await supabase.from("ticket_comments").insert({
    ticket_id: ticketId,
    user_id: user.id,
    content: content.trim(),
    is_internal,
  });

  if (error) {
    console.error("Error adding comment:", error);
    return { error: error.message };
  }

  revalidatePath(`/chamados/ti/${ticketId}`);
  return { success: true };
}

export async function handleApproval(
  ticketId: string,
  approvalId: string,
  decision: ApprovalDecision,
  notes?: string
): Promise<{ error?: string; success?: boolean }> {
  const canAccess = await ensureTiAccess();
  if (!canAccess) {
    return { error: "Acesso negado" };
  }
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

  const { error } = await supabase
    .from("ticket_approvals")
    .update({
      approved_by: user.id,
      status: decision,
      decision_at: new Date().toISOString(),
      notes: notes || null,
    })
    .eq("id", approvalId);

  if (error) {
    console.error("Error handling approval:", error);
    return { error: error.message };
  }

  if (decision === APPROVAL_FLOW_STATUS.denied) {
    const { error: ticketError } = await supabase
      .from("tickets")
      .update({
        status: APPROVAL_FLOW_STATUS.denied,
        denial_reason: notes || "Negado na aprovacao",
      })
      .eq("id", ticketId);

    if (ticketError) {
      console.error("Error updating ticket status (denied):", ticketError);
      return {
        error: "Aprovacao registrada, mas falha ao atualizar status do chamado",
      };
    }
  } else {
    const nextStatusMap: Record<number, ApprovalFlowStatus> = {
      1: APPROVAL_FLOW_STATUS.awaitingApprovalSupervisor,
      2: APPROVAL_FLOW_STATUS.awaitingApprovalGerente,
      3: APPROVAL_FLOW_STATUS.awaitingTriage,
    };

    const { error: ticketError } = await supabase
      .from("tickets")
      .update({ status: nextStatusMap[approval.approval_level] })
      .eq("id", ticketId);

    if (ticketError) {
      console.error("Error updating ticket status (approved):", ticketError);
      return {
        error: "Aprovacao registrada, mas falha ao atualizar status do chamado",
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

  const roleNames = userRoles
    .map((ur) => {
      const roleData = ur.role as unknown;
      const role = Array.isArray(roleData) ? roleData[0] : roleData;
      return role?.name || null;
    })
    .filter((name): name is string => !!name);

  const permissions = await getCurrentUserPermissions();

  return {
    isAdmin: isAdminPermission(permissions),
    roles: Array.from(new Set(roleNames)),
  };
}
