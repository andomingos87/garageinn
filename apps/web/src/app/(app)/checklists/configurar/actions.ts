"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ============================================
// Types
// ============================================

export interface TemplateFilters {
  search?: string;
  type?: "opening" | "supervision" | "all";
  status?: "active" | "inactive" | "all";
}

export interface TemplateWithDetails {
  id: string;
  name: string;
  description: string | null;
  type: string;
  is_default: boolean | null;
  status: string;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  questions_count: number;
  units: Array<{
    id: string;
    name: string;
    code: string;
  }>;
}

export interface TemplatesStats {
  total: number;
  active: number;
  inactive: number;
  opening: number;
  supervision: number;
}

// ============================================
// Query Functions - Templates
// ============================================

/**
 * Busca lista de templates com detalhes
 */
export async function getTemplates(
  filters?: TemplateFilters
): Promise<TemplateWithDetails[]> {
  const supabase = await createClient();

  let query = supabase
    .from("checklist_templates")
    .select(
      `
      *,
      checklist_questions(id),
      unit_checklist_templates(
        unit:units(id, name, code)
      )
    `
    )
    .order("created_at", { ascending: false });

  if (filters?.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }

  if (filters?.type && filters.type !== "all") {
    query = query.eq("type", filters.type);
  }

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching templates:", error);
    throw new Error("Erro ao buscar templates");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || []).map((template: any) => ({
    id: template.id,
    name: template.name,
    description: template.description,
    type: template.type,
    is_default: template.is_default,
    status: template.status,
    created_by: template.created_by,
    created_at: template.created_at,
    updated_at: template.updated_at,
    questions_count: template.checklist_questions?.length || 0,
    units:
      template.unit_checklist_templates
        ?.map(
          (uct: { unit: { id: string; name: string; code: string } | null }) =>
            uct.unit
        )
        .filter(Boolean) || [],
  }));
}

/**
 * Busca estatísticas de templates
 */
export async function getTemplatesStats(): Promise<TemplatesStats> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("checklist_templates")
    .select("id, status, type");

  if (error) {
    console.error("Error fetching templates stats:", error);
    return { total: 0, active: 0, inactive: 0, opening: 0, supervision: 0 };
  }

  return (data || []).reduce(
    (acc, template) => {
      acc.total++;
      if (template.status === "active") acc.active++;
      else acc.inactive++;
      if (template.type === "opening") acc.opening++;
      else if (template.type === "supervision") acc.supervision++;
      return acc;
    },
    { total: 0, active: 0, inactive: 0, opening: 0, supervision: 0 }
  );
}

/**
 * Busca um template por ID
 */
export async function getTemplateById(templateId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("checklist_templates")
    .select(
      `
      *,
      checklist_questions(id),
      unit_checklist_templates(
        unit:units(id, name, code, status)
      )
    `
    )
    .eq("id", templateId)
    .single();

  if (error) {
    console.error("Error fetching template:", error);
    return null;
  }

  interface UnitTemplateRow {
    unit: {
      id: string;
      name: string;
      code: string;
      status: string;
    } | null;
  }

  return {
    ...data,
    questions_count: data.checklist_questions?.length || 0,
    units:
      (data.unit_checklist_templates as UnitTemplateRow[] | null)
        ?.map((uct) => uct.unit)
        .filter(Boolean) || [],
  };
}

// ============================================
// Mutation Functions - Templates
// ============================================

/**
 * Cria um novo template
 */
export async function createTemplate(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Não autenticado" };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string | null;
  const type = (formData.get("type") as string) || "opening";
  const is_default = formData.get("is_default") === "true";

  if (!name || name.length < 3) {
    return { error: "Nome deve ter pelo menos 3 caracteres" };
  }

  const { data, error } = await supabase
    .from("checklist_templates")
    .insert({
      name,
      description: description || null,
      type,
      is_default,
      created_by: user.id,
      status: "active",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating template:", error);
    return { error: error.message };
  }

  revalidatePath("/checklists/configurar");
  redirect(`/checklists/configurar/${data.id}/perguntas`);
}

/**
 * Atualiza um template
 */
export async function updateTemplate(templateId: string, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string | null;
  const is_default = formData.get("is_default") === "true";
  const status = formData.get("status") as "active" | "inactive";

  if (!name || name.length < 3) {
    return { error: "Nome deve ter pelo menos 3 caracteres" };
  }

  const { error } = await supabase
    .from("checklist_templates")
    .update({
      name,
      description: description || null,
      is_default,
      status,
    })
    .eq("id", templateId);

  if (error) {
    console.error("Error updating template:", error);
    return { error: error.message };
  }

  revalidatePath("/checklists/configurar");
  revalidatePath(`/checklists/configurar/${templateId}`);
  redirect(`/checklists/configurar/${templateId}`);
}

/**
 * Deleta um template
 */
export async function deleteTemplate(templateId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("checklist_templates")
    .delete()
    .eq("id", templateId);

  if (error) {
    console.error("Error deleting template:", error);
    return { error: error.message };
  }

  revalidatePath("/checklists/configurar");
  return { success: true };
}

// ============================================
// Query Functions - Questions
// ============================================

/**
 * Busca perguntas de um template
 */
export async function getQuestions(templateId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("checklist_questions")
    .select("*")
    .eq("template_id", templateId)
    .order("order_index");

  if (error) {
    console.error("Error fetching questions:", error);
    throw new Error("Erro ao buscar perguntas");
  }

  return data || [];
}

// ============================================
// Mutation Functions - Questions
// ============================================

/**
 * Adiciona uma pergunta
 */
export async function addQuestion(templateId: string, formData: FormData) {
  const supabase = await createClient();

  const question_text = formData.get("question_text") as string;
  const is_required = formData.get("is_required") === "true";
  const requires_observation_on_no =
    formData.get("requires_observation_on_no") === "true";

  if (!question_text || question_text.trim().length < 5) {
    return { error: "Pergunta deve ter pelo menos 5 caracteres" };
  }

  // Obter próximo order_index
  const { data: maxOrder } = await supabase
    .from("checklist_questions")
    .select("order_index")
    .eq("template_id", templateId)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = (maxOrder?.order_index ?? 0) + 1;

  const { data, error } = await supabase
    .from("checklist_questions")
    .insert({
      template_id: templateId,
      question_text: question_text.trim(),
      order_index: nextOrder,
      is_required,
      requires_observation_on_no,
      status: "active",
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding question:", error);
    return { error: error.message };
  }

  revalidatePath(`/checklists/configurar/${templateId}`);
  revalidatePath(`/checklists/configurar/${templateId}/perguntas`);
  return { success: true, data };
}

/**
 * Atualiza uma pergunta
 */
export async function updateQuestion(
  questionId: string,
  templateId: string,
  formData: FormData
) {
  const supabase = await createClient();

  const question_text = formData.get("question_text") as string;
  const is_required = formData.get("is_required") === "true";
  const requires_observation_on_no =
    formData.get("requires_observation_on_no") === "true";
  const status = formData.get("status") as "active" | "inactive";

  if (!question_text || question_text.trim().length < 5) {
    return { error: "Pergunta deve ter pelo menos 5 caracteres" };
  }

  const { error } = await supabase
    .from("checklist_questions")
    .update({
      question_text: question_text.trim(),
      is_required,
      requires_observation_on_no,
      status,
    })
    .eq("id", questionId);

  if (error) {
    console.error("Error updating question:", error);
    return { error: error.message };
  }

  revalidatePath(`/checklists/configurar/${templateId}`);
  revalidatePath(`/checklists/configurar/${templateId}/perguntas`);
  return { success: true };
}

/**
 * Deleta uma pergunta
 */
export async function deleteQuestion(questionId: string, templateId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("checklist_questions")
    .delete()
    .eq("id", questionId);

  if (error) {
    console.error("Error deleting question:", error);
    return { error: error.message };
  }

  revalidatePath(`/checklists/configurar/${templateId}`);
  revalidatePath(`/checklists/configurar/${templateId}/perguntas`);
  return { success: true };
}

/**
 * Reordena perguntas
 */
export async function reorderQuestions(
  templateId: string,
  orderedIds: string[]
) {
  const supabase = await createClient();

  // Usar uma transação para atualizar todas as ordens
  // Como Supabase não tem transações no cliente, vamos atualizar sequencialmente
  // usando um offset temporário para evitar conflitos de unique constraint

  const tempOffset = 10000;

  // Primeiro, mover todas para um offset temporário
  for (let i = 0; i < orderedIds.length; i++) {
    await supabase
      .from("checklist_questions")
      .update({ order_index: tempOffset + i })
      .eq("id", orderedIds[i]);
  }

  // Depois, colocar nas posições finais
  for (let i = 0; i < orderedIds.length; i++) {
    await supabase
      .from("checklist_questions")
      .update({ order_index: i + 1 })
      .eq("id", orderedIds[i]);
  }

  revalidatePath(`/checklists/configurar/${templateId}`);
  revalidatePath(`/checklists/configurar/${templateId}/perguntas`);
  return { success: true };
}

// ============================================
// Unit Assignment Functions
// ============================================

/**
 * Busca todas as unidades ativas
 */
export async function getAllUnits() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("units")
    .select("id, name, code, status")
    .eq("status", "active")
    .order("name");

  if (error) {
    console.error("Error fetching units:", error);
    return [];
  }

  return data || [];
}

/**
 * Busca unidades vinculadas a um template
 */
export async function getTemplateUnits(templateId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("unit_checklist_templates")
    .select(
      `
      id,
      unit:units(id, name, code, status)
    `
    )
    .eq("template_id", templateId);

  if (error) {
    console.error("Error fetching template units:", error);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || []).map((item: any) => item.unit).filter(Boolean);
}

/**
 * Vincula template a unidades
 */
export async function assignTemplateToUnits(
  templateId: string,
  unitIds: string[]
) {
  const supabase = await createClient();

  // Remover vínculos existentes
  await supabase
    .from("unit_checklist_templates")
    .delete()
    .eq("template_id", templateId);

  // Inserir novos vínculos
  if (unitIds.length > 0) {
    const inserts = unitIds.map((unitId) => ({
      unit_id: unitId,
      template_id: templateId,
    }));

    const { error } = await supabase
      .from("unit_checklist_templates")
      .insert(inserts);

    if (error) {
      console.error("Error assigning units:", error);
      return { error: error.message };
    }
  }

  revalidatePath("/checklists/configurar");
  revalidatePath(`/checklists/configurar/${templateId}`);
  return { success: true };
}

// ============================================
// Admin Check
// ============================================

/**
 * Verifica se o usuário atual é admin
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

// ============================================
// Permission Check - Checklists Configure
// ============================================

/**
 * Mapeamento de permissões por cargo e departamento
 * Cargos que têm permissão 'checklists:configure'
 */
const CHECKLISTS_CONFIGURE_PERMISSIONS: Record<string, string[]> = {
  // Cargos globais com acesso total
  global: ["Administrador", "Desenvolvedor", "Diretor"],
  // Cargos por departamento
  Operações: ["Gerente"],
  Auditoria: ["Gerente"],
};

/**
 * Verifica se o usuário atual pode configurar checklists
 * Retorna true se for admin OU tiver permissão 'checklists:configure'
 */
export async function checkCanConfigureChecklists(): Promise<boolean> {
  const supabase = await createClient();

  // Primeiro verifica se é admin (caminho rápido)
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin === true) {
    return true;
  }

  // Buscar usuário atual
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return false;
  }

  // Buscar roles do usuário com departamento
  const { data: userRoles, error } = await supabase
    .from("user_roles")
    .select(
      `
      role:roles(
        name,
        is_global,
        department:departments(name)
      )
    `
    )
    .eq("user_id", user.id);

  if (error || !userRoles) {
    console.error("Error fetching user roles:", error);
    return false;
  }

  // Verificar se algum role tem permissão checklists:configure
  return userRoles.some((ur) => {
    // O select retorna role como array devido à sintaxe do Supabase
    const roles = ur.role as
      | {
          name: string;
          is_global: boolean;
          department: { name: string }[] | null;
        }[]
      | null;

    if (!roles || roles.length === 0) return false;
    const roleData = roles[0];

    // Verificar cargos globais
    if (
      roleData.is_global &&
      CHECKLISTS_CONFIGURE_PERMISSIONS["global"]?.includes(roleData.name)
    ) {
      return true;
    }

    // Verificar cargos por departamento (pegar primeiro departamento se existir)
    const departmentName = roleData.department?.[0]?.name;
    if (
      departmentName &&
      CHECKLISTS_CONFIGURE_PERMISSIONS[departmentName]?.includes(roleData.name)
    ) {
      return true;
    }

    return false;
  });
}
