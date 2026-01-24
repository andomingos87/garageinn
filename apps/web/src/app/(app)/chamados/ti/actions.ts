"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { TiCategory, TiFilters, TiStats, TiTicketListItem } from "./types";

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

export async function getTiTickets(filters?: TiFilters) {
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

export async function getTiStats(): Promise<TiStats> {
  const supabase = await createClient();
  const dept = await getTiDepartment();
  if (!dept) return { total: 0, awaitingTriage: 0, inProgress: 0, closed: 0 };

  const { data } = await supabase
    .from("tickets")
    .select("status")
    .eq("department_id", dept.id);

  if (!data) {
    return { total: 0, awaitingTriage: 0, inProgress: 0, closed: 0 };
  }

  const closedStatuses = ["closed", "cancelled", "denied"];
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
        !closedStatuses.includes(t.status) && !triageStatuses.includes(t.status)
    ).length,
    closed: data.filter((t) => closedStatuses.includes(t.status)).length,
  };
}

// ============================================
// Mutation Functions
// ============================================

export async function createTiTicket(formData: FormData) {
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

  const { data: needsApproval } = await supabase.rpc("ticket_needs_approval", {
    p_created_by: user.id,
    p_department_id: dept.id,
  });

  const initialStatus = needsApproval
    ? "awaiting_approval_encarregado"
    : "awaiting_triage";

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

export async function getTiTicketDetail(ticketId: string) {
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
    ...ticket,
    approvals: approvals || [],
    comments: comments || [],
    history: history || [],
    attachments: attachments || [],
  };
}

// ============================================
// Comment/Approval helpers (shared components)
// ============================================

export async function addComment(ticketId: string, formData: FormData) {
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
  decision: "approved" | "rejected",
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

  if (decision === "rejected") {
    const { error: ticketError } = await supabase
      .from("tickets")
      .update({
        status: "denied",
        denial_reason: notes || "Negado na aprovacao",
      })
      .eq("id", ticketId);

    if (ticketError) {
      console.error("Error updating ticket status (rejected):", ticketError);
      return {
        error: "Aprovacao registrada, mas falha ao atualizar status do chamado",
      };
    }
  } else {
    const nextStatusMap: Record<number, string> = {
      1: "awaiting_approval_supervisor",
      2: "awaiting_approval_gerente",
      3: "awaiting_triage",
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
