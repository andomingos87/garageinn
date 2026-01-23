"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ============================================
// Types
// ============================================

export type ChecklistType = "opening" | "supervision";

export interface AvailableChecklist {
  unit: {
    id: string;
    name: string;
    code: string;
  };
  template: {
    id: string;
    name: string;
    type: string;
    questions_count: number;
  };
  todayExecution: {
    id: string;
    status: string;
    completed_at: string | null;
  } | null;
}

export interface ExecutionWithDetails {
  id: string;
  template_id: string;
  unit_id: string;
  executed_by: string;
  started_at: string;
  completed_at: string | null;
  status: string;
  general_observations: string | null;
  has_non_conformities: boolean | null;
  template: {
    id: string;
    name: string;
    type: string;
  };
  unit: {
    id: string;
    name: string;
    code: string;
  };
  questions: Array<{
    id: string;
    question_text: string;
    order_index: number;
    is_required: boolean | null;
    requires_observation_on_no: boolean | null;
    status: string;
  }>;
  answers: Array<{
    id: string;
    question_id: string;
    answer: boolean;
    observation: string | null;
  }>;
}

// ============================================
// Permission Checks
// ============================================

/**
 * Verifica se o usuário atual pode acessar Supervisão
 */
export async function checkCanAccessSupervision(): Promise<boolean> {
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
    return false;
  }

  const { getUserPermissions, hasPermission } = await import("@/lib/auth/rbac");

  interface RoleData {
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

  const roles = userRoles
    .map((ur: RoleData) => {
      const role = Array.isArray(ur.role) ? ur.role[0] : ur.role;
      if (!role) return null;
      const dept = Array.isArray(role.department)
        ? role.department[0]
        : role.department;
      return {
        role_name: role.name,
        department_name: dept?.name ?? null,
        is_global: role.is_global ?? false,
      };
    })
    .filter(
      (role): role is { role_name: string; department_name: string | null; is_global: boolean } =>
        role !== null
    );

  const permissions = getUserPermissions(roles);
  return hasPermission(permissions, "supervision:read");
}

// ============================================
// Query Functions
// ============================================

/**
 * Obtém os checklists disponíveis para o usuário executar
 * baseado nas unidades vinculadas e tipo de checklist
 * @param type - 'opening' para abertura (padrão), 'supervision' para supervisão
 */
export async function getAvailableChecklists(
  type: ChecklistType = "opening"
): Promise<AvailableChecklist[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  // Para supervisão, buscar apenas unidades com is_coverage = true
  // Para abertura, buscar todas as unidades vinculadas
  const userUnitsQuery = supabase
    .from("user_units")
    .select(
      `
      is_coverage,
      unit:units!inner(
        id,
        name,
        code,
        status
      )
    `
    )
    .eq("user_id", user.id);

  // Se for supervisão, filtrar apenas unidades com cobertura
  if (type === "supervision") {
    userUnitsQuery.eq("is_coverage", true);
  }

  const { data: userUnits, error: unitsError } = await userUnitsQuery;

  if (unitsError) {
    console.error("Error fetching user units:", unitsError);
    throw new Error("Erro ao buscar unidades do usuário");
  }

  if (!userUnits || userUnits.length === 0) {
    return [];
  }

  // Filtrar unidades ativas

  const activeUnits = userUnits
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((uu: any) => uu.unit)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((unit: any) => unit && unit.status === "active");

  if (activeUnits.length === 0) {
    return [];
  }

  const result: AvailableChecklist[] = [];
  const today = new Date().toISOString().split("T")[0];

  // Para cada unidade, buscar templates do tipo especificado
  for (const unit of activeUnits) {
    // Buscar templates vinculados
    const { data: unitTemplates } = await supabase
      .from("unit_checklist_templates")
      .select(
        `
        template:checklist_templates!inner(
          id,
          name,
          type,
          status
        )
      `
      )
      .eq("unit_id", unit.id);

    if (!unitTemplates || unitTemplates.length === 0) continue;

    // Filtrar templates pelo tipo especificado

    const filteredTemplates = unitTemplates
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((ut: any) => ut.template)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((t: any) => t && t.status === "active" && t.type === type);

    for (const template of filteredTemplates) {
      // Contar perguntas ativas
      const { count: questionsCount } = await supabase
        .from("checklist_questions")
        .select("id", { count: "exact", head: true })
        .eq("template_id", template.id)
        .eq("status", "active");

      // Verificar execução de hoje
      const { data: todayExec } = await supabase
        .from("checklist_executions")
        .select("id, status, completed_at")
        .eq("unit_id", unit.id)
        .eq("template_id", template.id)
        .gte("started_at", `${today}T00:00:00`)
        .lt("started_at", `${today}T23:59:59`)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      result.push({
        unit: {
          id: unit.id,
          name: unit.name,
          code: unit.code,
        },
        template: {
          id: template.id,
          name: template.name,
          type: template.type,
          questions_count: questionsCount || 0,
        },
        todayExecution: todayExec
          ? {
              id: todayExec.id,
              status: todayExec.status,
              completed_at: todayExec.completed_at,
            }
          : null,
      });
    }
  }

  return result;
}

/**
 * Obtém os checklists de supervisão disponíveis
 * Wrapper conveniente para getAvailableChecklists('supervision')
 */
export async function getSupervisionChecklists(): Promise<
  AvailableChecklist[]
> {
  return getAvailableChecklists("supervision");
}

/**
 * Obtém os detalhes de uma execução
 */
export async function getExecution(
  executionId: string
): Promise<ExecutionWithDetails | null> {
  const supabase = await createClient();

  const { data: execution, error } = await supabase
    .from("checklist_executions")
    .select(
      `
      *,
      template:checklist_templates(
        id,
        name,
        type
      ),
      unit:units(
        id,
        name,
        code
      )
    `
    )
    .eq("id", executionId)
    .single();

  if (error) {
    console.error("Error fetching execution:", error);
    return null;
  }

  // Buscar perguntas ativas do template
  const { data: questions } = await supabase
    .from("checklist_questions")
    .select("*")
    .eq("template_id", execution.template_id)
    .eq("status", "active")
    .order("order_index");

  // Buscar respostas da execução
  const { data: answers } = await supabase
    .from("checklist_answers")
    .select("*")
    .eq("execution_id", executionId);

  return {
    ...execution,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    template: execution.template as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    unit: execution.unit as any,
    questions: questions || [],
    answers: answers || [],
  };
}

// ============================================
// Mutation Functions
// ============================================

/**
 * Inicia uma nova execução de checklist
 * @param unitId - ID da unidade
 * @param templateId - ID do template
 * @param checklistType - Tipo do checklist ('opening' ou 'supervision')
 */
export async function startExecution(
  unitId: string,
  templateId: string,
  checklistType: ChecklistType = "opening"
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Não autenticado" };
  }

  // Verificar se o usuário tem acesso à unidade
  // Para supervisão, verificar também is_coverage = true
  const accessQuery = supabase
    .from("user_units")
    .select("id, is_coverage")
    .eq("user_id", user.id)
    .eq("unit_id", unitId);

  const { data: userUnit } = await accessQuery.maybeSingle();

  if (!userUnit) {
    return { error: "Você não tem acesso a esta unidade" };
  }

  // Para supervisão, verificar se tem cobertura
  if (checklistType === "supervision" && !userUnit.is_coverage) {
    return { error: "Você não tem permissão de supervisão para esta unidade" };
  }

  // Verificar se o template é do tipo correto
  const { data: template } = await supabase
    .from("checklist_templates")
    .select("id, type")
    .eq("id", templateId)
    .single();

  if (!template) {
    return { error: "Template não encontrado" };
  }

  if (template.type !== checklistType) {
    return {
      error: `Este template não é do tipo ${checklistType === "opening" ? "abertura" : "supervisão"}`,
    };
  }

  // Verificar se já existe execução em andamento hoje
  const today = new Date().toISOString().split("T")[0];
  const { data: existingExecution } = await supabase
    .from("checklist_executions")
    .select("id, status")
    .eq("unit_id", unitId)
    .eq("template_id", templateId)
    .gte("started_at", `${today}T00:00:00`)
    .lt("started_at", `${today}T23:59:59`)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Definir rota base dependendo do tipo
  const baseRoute =
    checklistType === "supervision" ? "/checklists/supervisao" : "/checklists";

  if (existingExecution) {
    if (existingExecution.status === "in_progress") {
      // Retomar execução existente
      redirect(`${baseRoute}/executar/${existingExecution.id}`);
    }
    // Se já completou hoje, redirecionar para a lista
    return { error: "Este checklist já foi executado hoje para esta unidade" };
  }

  // Criar nova execução
  const { data, error } = await supabase
    .from("checklist_executions")
    .insert({
      template_id: templateId,
      unit_id: unitId,
      executed_by: user.id,
      started_at: new Date().toISOString(),
      status: "in_progress",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating execution:", error);
    return { error: error.message };
  }

  revalidatePath("/checklists");
  revalidatePath("/checklists/executar");
  revalidatePath("/checklists/supervisao");
  revalidatePath("/checklists/supervisao/executar");
  redirect(`${baseRoute}/executar/${data.id}`);
}

/**
 * Inicia uma nova execução de checklist de supervisão
 * Wrapper conveniente para startExecution com tipo 'supervision'
 */
export async function startSupervisionExecution(
  unitId: string,
  templateId: string
) {
  return startExecution(unitId, templateId, "supervision");
}

/**
 * Salva a resposta de uma pergunta
 */
export async function saveAnswer(
  executionId: string,
  questionId: string,
  answer: boolean,
  observation?: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Não autenticado" };
  }

  // Verificar se a execução pertence ao usuário e está em andamento
  const { data: execution } = await supabase
    .from("checklist_executions")
    .select("id, executed_by, status")
    .eq("id", executionId)
    .single();

  if (!execution) {
    return { error: "Execução não encontrada" };
  }

  if (execution.executed_by !== user.id) {
    return { error: "Você não pode editar esta execução" };
  }

  if (execution.status !== "in_progress") {
    return { error: "Esta execução já foi finalizada" };
  }

  // Upsert da resposta
  const { error } = await supabase.from("checklist_answers").upsert(
    {
      execution_id: executionId,
      question_id: questionId,
      answer,
      observation: observation || null,
    },
    {
      onConflict: "execution_id,question_id",
    }
  );

  if (error) {
    console.error("Error saving answer:", error);
    return { error: error.message };
  }

  revalidatePath(`/checklists/executar/${executionId}`);
  return { success: true };
}

/**
 * Finaliza uma execução de checklist
 */
export async function completeExecution(
  executionId: string,
  generalObservations?: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Não autenticado" };
  }

  // Buscar execução com template para determinar o tipo
  const { data: execution, error: execError } = await supabase
    .from("checklist_executions")
    .select(
      `
      id,
      executed_by,
      status,
      template_id,
      template:checklist_templates(type)
    `
    )
    .eq("id", executionId)
    .single();

  if (execError || !execution) {
    return { error: "Execução não encontrada" };
  }

  if (execution.executed_by !== user.id) {
    return { error: "Você não pode finalizar esta execução" };
  }

  if (execution.status !== "in_progress") {
    return { error: "Esta execução já foi finalizada" };
  }

  // Buscar perguntas obrigatórias
  const { data: questions } = await supabase
    .from("checklist_questions")
    .select("id, is_required, requires_observation_on_no")
    .eq("template_id", execution.template_id)
    .eq("status", "active");

  // Buscar respostas
  const { data: answers } = await supabase
    .from("checklist_answers")
    .select("question_id, answer, observation")
    .eq("execution_id", executionId);

  // Validar respostas
  const requiredQuestions = questions?.filter((q) => q.is_required) || [];
  const answersMap = new Map(answers?.map((a) => [a.question_id, a]) || []);

  for (const q of requiredQuestions) {
    const ans = answersMap.get(q.id);
    if (!ans) {
      return { error: "Responda todas as perguntas obrigatórias" };
    }

    if (
      q.requires_observation_on_no &&
      ans.answer === false &&
      !ans.observation
    ) {
      return {
        error:
          'Adicione observação para as respostas "Não" que exigem justificativa',
      };
    }
  }

  // Calcular has_non_conformities
  const hasNonConformities = answers?.some((a) => a.answer === false) || false;

  // Atualizar execução
  const { error } = await supabase
    .from("checklist_executions")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      general_observations: generalObservations || null,
      has_non_conformities: hasNonConformities,
    })
    .eq("id", executionId);

  if (error) {
    console.error("Error completing execution:", error);
    return { error: error.message };
  }

  // Determinar rota de redirecionamento baseado no tipo
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const templateType = (execution.template as any)?.type as ChecklistType;
  const isSupervision = templateType === "supervision";

  revalidatePath("/checklists");
  revalidatePath("/checklists/executar");
  revalidatePath("/checklists/supervisao");
  revalidatePath("/checklists/supervisao/executar");

  redirect(isSupervision ? "/checklists/supervisao" : "/checklists");
}

// ============================================
// Supervision-specific Functions
// ============================================

export interface SupervisionSignatureData {
  supervisorSignature: string;
  attendantSignature: string;
  attendantName: string;
}

/**
 * Finaliza uma execução de checklist de supervisão com assinaturas
 */
export async function completeSupervisionExecution(
  executionId: string,
  signatureData: SupervisionSignatureData,
  generalObservations?: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Não autenticado" };
  }

  // Buscar execução com template
  const { data: execution, error: execError } = await supabase
    .from("checklist_executions")
    .select(
      `
      id,
      executed_by,
      status,
      template_id,
      template:checklist_templates(type)
    `
    )
    .eq("id", executionId)
    .single();

  if (execError || !execution) {
    return { error: "Execução não encontrada" };
  }

  if (execution.executed_by !== user.id) {
    return { error: "Você não pode finalizar esta execução" };
  }

  if (execution.status !== "in_progress") {
    return { error: "Esta execução já foi finalizada" };
  }

  // Verificar se é supervisão
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const templateType = (execution.template as any)?.type as ChecklistType;
  if (templateType !== "supervision") {
    return { error: "Esta função é apenas para checklists de supervisão" };
  }

  // Validar assinaturas
  if (!signatureData.supervisorSignature) {
    return { error: "A assinatura do supervisor é obrigatória" };
  }
  if (!signatureData.attendantSignature) {
    return { error: "A assinatura do encarregado é obrigatória" };
  }
  if (!signatureData.attendantName?.trim()) {
    return { error: "O nome do encarregado é obrigatório" };
  }

  // Buscar perguntas obrigatórias
  const { data: questions } = await supabase
    .from("checklist_questions")
    .select("id, is_required, requires_observation_on_no")
    .eq("template_id", execution.template_id)
    .eq("status", "active");

  // Buscar respostas
  const { data: answers } = await supabase
    .from("checklist_answers")
    .select("question_id, answer, observation")
    .eq("execution_id", executionId);

  // Validar respostas
  const requiredQuestions = questions?.filter((q) => q.is_required) || [];
  const answersMap = new Map(answers?.map((a) => [a.question_id, a]) || []);

  for (const q of requiredQuestions) {
    const ans = answersMap.get(q.id);
    if (!ans) {
      return { error: "Responda todas as perguntas obrigatórias" };
    }

    if (
      q.requires_observation_on_no &&
      ans.answer === false &&
      !ans.observation
    ) {
      return {
        error:
          'Adicione observação para as respostas "Não" que exigem justificativa',
      };
    }
  }

  // Calcular has_non_conformities
  const hasNonConformities = answers?.some((a) => a.answer === false) || false;

  // Atualizar execução com assinaturas
  const { error } = await supabase
    .from("checklist_executions")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      general_observations: generalObservations || null,
      has_non_conformities: hasNonConformities,
      supervisor_signature: signatureData.supervisorSignature,
      attendant_signature: signatureData.attendantSignature,
      attendant_name: signatureData.attendantName.trim(),
    })
    .eq("id", executionId);

  if (error) {
    console.error("Error completing supervision execution:", error);
    return { error: error.message };
  }

  revalidatePath("/checklists");
  revalidatePath("/checklists/supervisao");
  revalidatePath("/checklists/supervisao/executar");

  redirect("/checklists/supervisao");
}
