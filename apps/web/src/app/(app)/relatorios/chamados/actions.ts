"use server";

import { createClient } from "@/lib/supabase/server";
import { DEFAULT_ITEMS_PER_PAGE } from "./constants";

// ============================================================================
// Types
// ============================================================================

export interface TicketReportFilters {
  startDate: string;
  endDate: string;
  statuses?: string[];
  departments?: string[];
  priorities?: string[];
  unitIds?: string[];
  search?: string;
}

export interface TicketReportItem {
  id: string;
  ticket_number: number;
  title: string;
  status: string;
  priority: string | null;
  created_at: string;
  resolved_at: string | null;
  closed_at: string | null;
  department: { id: string; name: string } | null;
  unit: { id: string; name: string; code: string } | null;
  assigned_to_profile: { id: string; full_name: string } | null;
  created_by_profile: { id: string; full_name: string } | null;
}

export interface TicketReportStats {
  total: number;
  byStatus: { status: string; count: number }[];
  byPriority: { priority: string; count: number }[];
  byDepartment: { department: string; departmentId: string; count: number }[];
  avgResolutionDays: number;
  resolutionRate: number;
}

export interface ReportResult {
  tickets: TicketReportItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================================
// Permission Check
// ============================================================================

export async function canAccessReports(): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  // Buscar roles do usuário
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

  // Verificar se é admin ou tem permissão de relatórios
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

    // Gerentes têm acesso a relatórios
    if (role.name === "Gerente") {
      return true;
    }

    // Supervisor de Financeiro e Operações
    if (
      role.name === "Supervisor" &&
      role.department?.name &&
      ["Financeiro", "Operações"].includes(role.department.name)
    ) {
      return true;
    }

    // Analista de TI
    if (role.name === "Analista" && role.department?.name === "TI") {
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

export async function getDepartments(): Promise<
  { id: string; name: string }[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("departments")
    .select("id, name")
    .order("name");

  if (error) {
    console.error("Error fetching departments:", error);
    return [];
  }

  return data || [];
}

export async function getUnitsForReport(): Promise<
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

export async function getReportTickets(
  filters: TicketReportFilters,
  page: number = 1,
  limit: number = DEFAULT_ITEMS_PER_PAGE,
  sortBy: string = "created_at",
  sortOrder: "asc" | "desc" = "desc"
): Promise<ReportResult> {
  const supabase = await createClient();

  // Verificar permissão
  const hasAccess = await canAccessReports();
  if (!hasAccess) {
    return { tickets: [], total: 0, page, limit, totalPages: 0 };
  }

  // Construir query base
  let query = supabase
    .from("tickets")
    .select(
      `
      id,
      ticket_number,
      title,
      status,
      priority,
      created_at,
      resolved_at,
      closed_at,
      department:departments(id, name),
      unit:units(id, name, code),
      assigned_to_profile:profiles!assigned_to(id, full_name),
      created_by_profile:profiles!created_by(id, full_name)
    `,
      { count: "exact" }
    );

  // Filtro de período
  if (filters.startDate) {
    query = query.gte("created_at", filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte("created_at", `${filters.endDate}T23:59:59.999Z`);
  }

  // Filtro de status
  if (filters.statuses && filters.statuses.length > 0) {
    query = query.in("status", filters.statuses);
  }

  // Filtro de departamento
  if (filters.departments && filters.departments.length > 0) {
    query = query.in("department_id", filters.departments);
  }

  // Filtro de prioridade
  if (filters.priorities && filters.priorities.length > 0) {
    query = query.in("priority", filters.priorities);
  }

  // Filtro de unidade
  if (filters.unitIds && filters.unitIds.length > 0) {
    query = query.in("unit_id", filters.unitIds);
  }

  // Busca por texto (número ou título)
  if (filters.search) {
    const searchTerm = filters.search.trim();
    const numericSearch = parseInt(searchTerm.replace(/\D/g, ""), 10);

    if (!isNaN(numericSearch)) {
      query = query.eq("ticket_number", numericSearch);
    } else {
      query = query.ilike("title", `%${searchTerm}%`);
    }
  }

  // Ordenação
  const validSortColumns = [
    "created_at",
    "ticket_number",
    "title",
    "status",
    "priority",
    "resolved_at",
  ];
  const sortColumn = validSortColumns.includes(sortBy) ? sortBy : "created_at";
  query = query.order(sortColumn, { ascending: sortOrder === "asc" });

  // Paginação
  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching report tickets:", error);
    return { tickets: [], total: 0, page, limit, totalPages: 0 };
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    tickets: (data || []) as unknown as TicketReportItem[],
    total,
    page,
    limit,
    totalPages,
  };
}

export async function getReportStats(
  filters: TicketReportFilters
): Promise<TicketReportStats> {
  const supabase = await createClient();

  // Verificar permissão
  const hasAccess = await canAccessReports();
  if (!hasAccess) {
    return {
      total: 0,
      byStatus: [],
      byPriority: [],
      byDepartment: [],
      avgResolutionDays: 0,
      resolutionRate: 0,
    };
  }

  // Query base para estatísticas
  let query = supabase.from("tickets").select(
    `
      id,
      status,
      priority,
      created_at,
      resolved_at,
      department:departments(id, name)
    `
  );

  // Aplicar filtros
  if (filters.startDate) {
    query = query.gte("created_at", filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte("created_at", `${filters.endDate}T23:59:59.999Z`);
  }
  if (filters.statuses && filters.statuses.length > 0) {
    query = query.in("status", filters.statuses);
  }
  if (filters.departments && filters.departments.length > 0) {
    query = query.in("department_id", filters.departments);
  }
  if (filters.priorities && filters.priorities.length > 0) {
    query = query.in("priority", filters.priorities);
  }
  if (filters.unitIds && filters.unitIds.length > 0) {
    query = query.in("unit_id", filters.unitIds);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error("Error fetching report stats:", error);
    return {
      total: 0,
      byStatus: [],
      byPriority: [],
      byDepartment: [],
      avgResolutionDays: 0,
      resolutionRate: 0,
    };
  }

  // Calcular estatísticas
  const total = data.length;

  // Por status
  const statusCounts: Record<string, number> = {};
  data.forEach((t) => {
    statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
  });
  const byStatus = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
  }));

  // Por prioridade
  const priorityCounts: Record<string, number> = {};
  data.forEach((t) => {
    if (t.priority) {
      priorityCounts[t.priority] = (priorityCounts[t.priority] || 0) + 1;
    }
  });
  const byPriority = Object.entries(priorityCounts).map(
    ([priority, count]) => ({
      priority,
      count,
    })
  );

  // Por departamento
  const deptCounts: Record<string, { name: string; count: number }> = {};
  data.forEach((t) => {
    const dept = t.department as unknown as { id: string; name: string } | null;
    if (dept) {
      if (!deptCounts[dept.id]) {
        deptCounts[dept.id] = { name: dept.name, count: 0 };
      }
      deptCounts[dept.id].count += 1;
    }
  });
  const byDepartment = Object.entries(deptCounts).map(([id, info]) => ({
    departmentId: id,
    department: info.name,
    count: info.count,
  }));

  // Tempo médio de resolução
  const resolvedTickets = data.filter(
    (t) =>
      t.resolved_at && ["resolved", "closed"].includes(t.status)
  );

  let avgResolutionDays = 0;
  if (resolvedTickets.length > 0) {
    const totalDays = resolvedTickets.reduce((sum, t) => {
      const created = new Date(t.created_at).getTime();
      const resolved = new Date(t.resolved_at!).getTime();
      const days = (resolved - created) / (1000 * 60 * 60 * 24);
      return sum + days;
    }, 0);
    avgResolutionDays = Math.round((totalDays / resolvedTickets.length) * 10) / 10;
  }

  // Taxa de resolução
  const resolutionRate =
    total > 0 ? Math.round((resolvedTickets.length / total) * 100) : 0;

  return {
    total,
    byStatus,
    byPriority,
    byDepartment,
    avgResolutionDays,
    resolutionRate,
  };
}
