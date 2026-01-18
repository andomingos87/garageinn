"use server";

import { createClient } from "@/lib/supabase/server";
import { DEFAULT_ITEMS_PER_PAGE } from "./constants";

// ============================================================================
// Types
// ============================================================================

export interface SupervisionReportFilters {
  startDate: string;
  endDate: string;
  statuses?: string[];
  unitIds?: string[];
  supervisorIds?: string[];
  hasNonConformities?: boolean;
  scoreRange?: string;
  search?: string;
}

export interface SupervisionReportItem {
  id: string;
  started_at: string;
  completed_at: string | null;
  status: string;
  has_non_conformities: boolean | null;
  general_observations: string | null;
  unit: { id: string; name: string; code: string } | null;
  template: { id: string; name: string; type: string } | null;
  supervisor: { id: string; full_name: string; email: string } | null;
  total_questions: number;
  conformity_count: number;
  conformity_score: number;
}

export interface SupervisionReportStats {
  total: number;
  completed: number;
  inProgress: number;
  withNonConformities: number;
  avgConformityScore: number;
  byUnit: { unitId: string; unitName: string; unitCode: string; count: number; avgScore: number }[];
  bySupervisor: { supervisorId: string; supervisorName: string; count: number; avgScore: number }[];
  scoreDistribution: { range: string; count: number }[];
}

export interface SupervisionReportResult {
  executions: SupervisionReportItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================================
// Permission Check
// ============================================================================

export async function canAccessSupervisionReports(): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  // Buscar roles do usuario
  const { data: userRoles } = await supabase
    .from("user_roles")
    .select(
      `
      role:roles(
        id,
        name,
        is_global,
        department:departments(name)
      )
    `
    )
    .eq("user_id", user.id);

  if (!userRoles || userRoles.length === 0) return false;

  // Verificar se tem permissao
  for (const ur of userRoles) {
    const role = ur.role as unknown as {
      name: string;
      is_global: boolean;
      department: { name: string } | null;
    };

    // Cargos globais com admin
    if (
      role.is_global &&
      ["Desenvolvedor", "Diretor", "Administrador"].includes(role.name)
    ) {
      return true;
    }

    // Gerentes tem acesso
    if (role.name === "Gerente") {
      return true;
    }

    // Supervisor de Operacoes tem acesso
    if (
      role.name === "Supervisor" &&
      role.department?.name === "Operacoes"
    ) {
      return true;
    }

    // Auditor
    if (role.name === "Auditor") {
      return true;
    }
  }

  return false;
}

// ============================================================================
// Data Fetching
// ============================================================================

export async function getUnitsForSupervisionReport(): Promise<
  { id: string; name: string; code: string }[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("units")
    .select("id, name, code")
    .eq("status", "active")
    .order("code");

  if (error) {
    console.error("Error fetching units:", error);
    return [];
  }

  return data || [];
}

export async function getSupervisorsForReport(): Promise<
  { id: string; full_name: string }[]
> {
  const supabase = await createClient();

  // Buscar usuarios que ja executaram checklists de supervisao
  const { data, error } = await supabase
    .from("checklist_executions")
    .select(
      `
      executed_by,
      profiles!executed_by(id, full_name)
    `
    )
    .not("executed_by", "is", null);

  if (error) {
    console.error("Error fetching supervisors:", error);
    return [];
  }

  // Remover duplicados
  const uniqueSupervisors = new Map<string, { id: string; full_name: string }>();
  data?.forEach((item) => {
    const profile = item.profiles as unknown as { id: string; full_name: string } | null;
    if (profile && !uniqueSupervisors.has(profile.id)) {
      uniqueSupervisors.set(profile.id, profile);
    }
  });

  return Array.from(uniqueSupervisors.values()).sort((a, b) =>
    a.full_name.localeCompare(b.full_name)
  );
}

export async function getSupervisionReportData(
  filters: SupervisionReportFilters,
  page: number = 1,
  limit: number = DEFAULT_ITEMS_PER_PAGE,
  sortBy: string = "started_at",
  sortOrder: "asc" | "desc" = "desc"
): Promise<SupervisionReportResult> {
  const supabase = await createClient();

  // Verificar permissao
  const hasAccess = await canAccessSupervisionReports();
  if (!hasAccess) {
    return { executions: [], total: 0, page, limit, totalPages: 0 };
  }

  // Query execucoes de supervisao
  let query = supabase
    .from("checklist_executions")
    .select(
      `
      id,
      started_at,
      completed_at,
      status,
      has_non_conformities,
      general_observations,
      unit:units(id, name, code),
      template:checklist_templates!inner(id, name, type),
      supervisor:profiles!executed_by(id, full_name, email)
    `,
      { count: "exact" }
    )
    .eq("template.type", "supervision");

  // Filtro de periodo
  if (filters.startDate) {
    query = query.gte("started_at", `${filters.startDate}T00:00:00`);
  }
  if (filters.endDate) {
    query = query.lte("started_at", `${filters.endDate}T23:59:59`);
  }

  // Filtro de status
  if (filters.statuses && filters.statuses.length > 0) {
    query = query.in("status", filters.statuses);
  }

  // Filtro de unidade
  if (filters.unitIds && filters.unitIds.length > 0) {
    query = query.in("unit_id", filters.unitIds);
  }

  // Filtro de supervisor
  if (filters.supervisorIds && filters.supervisorIds.length > 0) {
    query = query.in("executed_by", filters.supervisorIds);
  }

  // Filtro de nao conformidades
  if (filters.hasNonConformities === true) {
    query = query.eq("has_non_conformities", true);
  }

  // Ordenacao
  const validSortColumns = ["started_at", "completed_at", "status"];
  const sortColumn = validSortColumns.includes(sortBy) ? sortBy : "started_at";
  query = query.order(sortColumn, { ascending: sortOrder === "asc" });

  // Paginacao
  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching supervision report data:", error);
    return { executions: [], total: 0, page, limit, totalPages: 0 };
  }

  // Buscar respostas para calcular score de conformidade
  const executionIds = data?.map((e) => e.id) || [];

  const answersMap: Map<string, { total: number; conformity: number }> = new Map();

  if (executionIds.length > 0) {
    const { data: answers } = await supabase
      .from("checklist_answers")
      .select("execution_id, answer")
      .in("execution_id", executionIds);

    if (answers) {
      answers.forEach((a) => {
        const current = answersMap.get(a.execution_id) || { total: 0, conformity: 0 };
        current.total += 1;
        if (a.answer === true) current.conformity += 1;
        answersMap.set(a.execution_id, current);
      });
    }
  }

  const executions: SupervisionReportItem[] = (data || []).map((e) => {
    const answerStats = answersMap.get(e.id) || { total: 0, conformity: 0 };
    const conformityScore = answerStats.total > 0
      ? Math.round((answerStats.conformity / answerStats.total) * 100)
      : 0;

    return {
      id: e.id,
      started_at: e.started_at,
      completed_at: e.completed_at,
      status: e.status,
      has_non_conformities: e.has_non_conformities,
      general_observations: e.general_observations,
      unit: e.unit as unknown as { id: string; name: string; code: string } | null,
      template: e.template as unknown as { id: string; name: string; type: string } | null,
      supervisor: e.supervisor as unknown as { id: string; full_name: string; email: string } | null,
      total_questions: answerStats.total,
      conformity_count: answerStats.conformity,
      conformity_score: conformityScore,
    };
  });

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    executions,
    total,
    page,
    limit,
    totalPages,
  };
}

export async function getSupervisionReportStats(
  filters: SupervisionReportFilters
): Promise<SupervisionReportStats> {
  const supabase = await createClient();

  // Verificar permissao
  const hasAccess = await canAccessSupervisionReports();
  if (!hasAccess) {
    return {
      total: 0,
      completed: 0,
      inProgress: 0,
      withNonConformities: 0,
      avgConformityScore: 0,
      byUnit: [],
      bySupervisor: [],
      scoreDistribution: [],
    };
  }

  // Query base para estatisticas
  let query = supabase
    .from("checklist_executions")
    .select(
      `
      id,
      status,
      has_non_conformities,
      unit_id,
      executed_by,
      unit:units(id, name, code),
      supervisor:profiles!executed_by(id, full_name),
      template:checklist_templates!inner(type)
    `
    )
    .eq("template.type", "supervision");

  // Aplicar filtros
  if (filters.startDate) {
    query = query.gte("started_at", `${filters.startDate}T00:00:00`);
  }
  if (filters.endDate) {
    query = query.lte("started_at", `${filters.endDate}T23:59:59`);
  }
  if (filters.statuses && filters.statuses.length > 0) {
    query = query.in("status", filters.statuses);
  }
  if (filters.unitIds && filters.unitIds.length > 0) {
    query = query.in("unit_id", filters.unitIds);
  }
  if (filters.supervisorIds && filters.supervisorIds.length > 0) {
    query = query.in("executed_by", filters.supervisorIds);
  }
  if (filters.hasNonConformities === true) {
    query = query.eq("has_non_conformities", true);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error("Error fetching supervision report stats:", error);
    return {
      total: 0,
      completed: 0,
      inProgress: 0,
      withNonConformities: 0,
      avgConformityScore: 0,
      byUnit: [],
      bySupervisor: [],
      scoreDistribution: [],
    };
  }

  // Buscar respostas para calcular scores
  const executionIds = data.map((e) => e.id);
  const answersMap: Map<string, { total: number; conformity: number }> = new Map();

  if (executionIds.length > 0) {
    const { data: answers } = await supabase
      .from("checklist_answers")
      .select("execution_id, answer")
      .in("execution_id", executionIds);

    if (answers) {
      answers.forEach((a) => {
        const current = answersMap.get(a.execution_id) || { total: 0, conformity: 0 };
        current.total += 1;
        if (a.answer === true) current.conformity += 1;
        answersMap.set(a.execution_id, current);
      });
    }
  }

  // Calcular estatisticas basicas
  const total = data.length;
  const completed = data.filter((e) => e.status === "completed").length;
  const inProgress = data.filter((e) => e.status === "in_progress").length;
  const withNonConformities = data.filter((e) => e.has_non_conformities).length;

  // Calcular scores
  const scores: number[] = [];
  data.forEach((e) => {
    const stats = answersMap.get(e.id);
    if (stats && stats.total > 0) {
      scores.push(Math.round((stats.conformity / stats.total) * 100));
    }
  });

  const avgConformityScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  // Por unidade
  const unitMap: Record<string, { name: string; code: string; count: number; totalScore: number; scoreCount: number }> = {};
  data.forEach((e) => {
    const unit = e.unit as unknown as { id: string; name: string; code: string } | null;
    if (unit) {
      if (!unitMap[unit.id]) {
        unitMap[unit.id] = { name: unit.name, code: unit.code, count: 0, totalScore: 0, scoreCount: 0 };
      }
      unitMap[unit.id].count += 1;
      const stats = answersMap.get(e.id);
      if (stats && stats.total > 0) {
        unitMap[unit.id].totalScore += Math.round((stats.conformity / stats.total) * 100);
        unitMap[unit.id].scoreCount += 1;
      }
    }
  });
  const byUnit = Object.entries(unitMap)
    .map(([id, info]) => ({
      unitId: id,
      unitName: info.name,
      unitCode: info.code,
      count: info.count,
      avgScore: info.scoreCount > 0 ? Math.round(info.totalScore / info.scoreCount) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Por supervisor
  const supervisorMap: Record<string, { name: string; count: number; totalScore: number; scoreCount: number }> = {};
  data.forEach((e) => {
    const supervisor = e.supervisor as unknown as { id: string; full_name: string } | null;
    if (supervisor) {
      if (!supervisorMap[supervisor.id]) {
        supervisorMap[supervisor.id] = { name: supervisor.full_name, count: 0, totalScore: 0, scoreCount: 0 };
      }
      supervisorMap[supervisor.id].count += 1;
      const stats = answersMap.get(e.id);
      if (stats && stats.total > 0) {
        supervisorMap[supervisor.id].totalScore += Math.round((stats.conformity / stats.total) * 100);
        supervisorMap[supervisor.id].scoreCount += 1;
      }
    }
  });
  const bySupervisor = Object.entries(supervisorMap)
    .map(([id, info]) => ({
      supervisorId: id,
      supervisorName: info.name,
      count: info.count,
      avgScore: info.scoreCount > 0 ? Math.round(info.totalScore / info.scoreCount) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Distribuicao de scores
  const scoreDistribution = [
    { range: "0-50%", count: scores.filter((s) => s <= 50).length },
    { range: "51-70%", count: scores.filter((s) => s > 50 && s <= 70).length },
    { range: "71-90%", count: scores.filter((s) => s > 70 && s <= 90).length },
    { range: "91-100%", count: scores.filter((s) => s > 90).length },
  ];

  return {
    total,
    completed,
    inProgress,
    withNonConformities,
    avgConformityScore,
    byUnit,
    bySupervisor,
    scoreDistribution,
  };
}
