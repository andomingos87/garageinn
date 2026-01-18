import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { createClient } from "@/lib/supabase/server";
import {
  canAccessReports,
  getReportTickets,
  getReportStats,
} from "@/app/(app)/relatorios/chamados/actions";

const STATUS_LABELS: Record<string, string> = {
  awaiting_approval_encarregado: "Aguardando Aprovacao (Encarregado)",
  awaiting_approval_supervisor: "Aguardando Aprovacao (Supervisor)",
  awaiting_approval_gerente: "Aguardando Aprovacao (Gerente)",
  awaiting_triage: "Aguardando Triagem",
  prioritized: "Priorizado",
  in_progress: "Em Andamento",
  quoting: "Em Cotacao",
  approved: "Aprovado",
  awaiting_return: "Aguardando Retorno",
  resolved: "Resolvido",
  closed: "Fechado",
  denied: "Negado",
  cancelled: "Cancelado",
};

const PRIORITY_LABELS: Record<string, string> = {
  low: "Baixa",
  medium: "Media",
  high: "Alta",
  urgent: "Urgente",
};

const DEPARTMENT_PREFIXES: Record<string, string> = {
  "Operacoes": "OPS",
  "Compras e Manutencao": "CPM",
  "Financeiro": "FIN",
  "RH": "RH",
  "Comercial": "COM",
  "Sinistros": "SIN",
  "TI": "TI",
  "Auditoria": "AUD",
};

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verificar autenticacao
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    // Verificar permissao
    const hasAccess = await canAccessReports();
    if (!hasAccess) {
      return NextResponse.json({ error: "Sem permissao" }, { status: 403 });
    }

    // Parse dos parametros
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Periodo obrigatorio" },
        { status: 400 }
      );
    }

    const filters = {
      startDate,
      endDate,
      statuses: searchParams.get("statuses")?.split(",").filter(Boolean),
      departments: searchParams.get("departments")?.split(",").filter(Boolean),
      priorities: searchParams.get("priorities")?.split(",").filter(Boolean),
      unitIds: searchParams.get("unitIds")?.split(",").filter(Boolean),
      search: searchParams.get("search") || undefined,
    };

    // Buscar dados (limite maior para Excel)
    const [reportData, stats] = await Promise.all([
      getReportTickets(filters, 1, 1000, "created_at", "desc"),
      getReportStats(filters),
    ]);

    // Criar workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "GAPP - GarageInn";
    workbook.created = new Date();

    // Sheet: Resumo
    const summarySheet = workbook.addWorksheet("Resumo");
    summarySheet.columns = [
      { header: "Metrica", key: "metric", width: 30 },
      { header: "Valor", key: "value", width: 20 },
    ];

    // Header styling
    summarySheet.getRow(1).font = { bold: true };
    summarySheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFDC2626" },
    };
    summarySheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

    summarySheet.addRows([
      { metric: "Periodo", value: `${startDate} a ${endDate}` },
      { metric: "Total de Chamados", value: stats.total },
      { metric: "Taxa de Resolucao", value: `${stats.resolutionRate}%` },
      { metric: "Tempo Medio de Resolucao", value: `${stats.avgResolutionDays} dias` },
      { metric: "", value: "" },
      { metric: "POR STATUS", value: "" },
    ]);

    stats.byStatus.forEach((item) => {
      summarySheet.addRow({
        metric: STATUS_LABELS[item.status] || item.status,
        value: item.count,
      });
    });

    summarySheet.addRows([
      { metric: "", value: "" },
      { metric: "POR PRIORIDADE", value: "" },
    ]);

    stats.byPriority.forEach((item) => {
      summarySheet.addRow({
        metric: PRIORITY_LABELS[item.priority] || item.priority,
        value: item.count,
      });
    });

    summarySheet.addRows([
      { metric: "", value: "" },
      { metric: "POR DEPARTAMENTO", value: "" },
    ]);

    stats.byDepartment.forEach((item) => {
      summarySheet.addRow({
        metric: item.department,
        value: item.count,
      });
    });

    // Sheet: Chamados
    const ticketsSheet = workbook.addWorksheet("Chamados");
    ticketsSheet.columns = [
      { header: "Numero", key: "number", width: 15 },
      { header: "Titulo", key: "title", width: 40 },
      { header: "Status", key: "status", width: 25 },
      { header: "Prioridade", key: "priority", width: 12 },
      { header: "Departamento", key: "department", width: 20 },
      { header: "Unidade", key: "unit", width: 15 },
      { header: "Criado por", key: "createdBy", width: 25 },
      { header: "Atribuido a", key: "assignedTo", width: 25 },
      { header: "Criado em", key: "createdAt", width: 18 },
      { header: "Resolvido em", key: "resolvedAt", width: 18 },
    ];

    // Header styling
    ticketsSheet.getRow(1).font = { bold: true };
    ticketsSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFDC2626" },
    };
    ticketsSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

    // Add data
    reportData.tickets.forEach((ticket) => {
      const prefix = ticket.department
        ? DEPARTMENT_PREFIXES[ticket.department.name] || "TKT"
        : "TKT";
      const ticketNumber = `${prefix}-${ticket.ticket_number.toString().padStart(5, "0")}`;

      ticketsSheet.addRow({
        number: ticketNumber,
        title: ticket.title,
        status: STATUS_LABELS[ticket.status] || ticket.status,
        priority: ticket.priority
          ? PRIORITY_LABELS[ticket.priority] || ticket.priority
          : "-",
        department: ticket.department?.name || "-",
        unit: ticket.unit ? `${ticket.unit.code} - ${ticket.unit.name}` : "-",
        createdBy: ticket.created_by_profile?.full_name || "-",
        assignedTo: ticket.assigned_to_profile?.full_name || "-",
        createdAt: new Date(ticket.created_at).toLocaleString("pt-BR"),
        resolvedAt: ticket.resolved_at
          ? new Date(ticket.resolved_at).toLocaleString("pt-BR")
          : "-",
      });
    });

    // Auto-filter
    ticketsSheet.autoFilter = {
      from: "A1",
      to: `J${reportData.tickets.length + 1}`,
    };

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Nome do arquivo
    const filename = `relatorio-chamados-${startDate}-${endDate}.xlsx`;

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error generating Excel:", error);
    return NextResponse.json({ error: "Erro ao gerar Excel" }, { status: 500 });
  }
}
