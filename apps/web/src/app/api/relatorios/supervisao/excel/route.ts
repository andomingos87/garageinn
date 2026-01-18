import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { createClient } from "@/lib/supabase/server";
import {
  canAccessSupervisionReports,
  getSupervisionReportData,
  getSupervisionReportStats,
} from "@/app/(app)/relatorios/supervisao/actions";

const STATUS_LABELS: Record<string, string> = {
  in_progress: "Em Andamento",
  completed: "Concluido",
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
    const hasAccess = await canAccessSupervisionReports();
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
      unitIds: searchParams.get("unitIds")?.split(",").filter(Boolean),
      supervisorIds: searchParams.get("supervisorIds")?.split(",").filter(Boolean),
      hasNonConformities: searchParams.get("hasNonConformities") === "true",
    };

    // Buscar dados (limite maior para Excel)
    const [reportData, stats] = await Promise.all([
      getSupervisionReportData(filters, 1, 1000, "started_at", "desc"),
      getSupervisionReportStats(filters),
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
      { metric: "Total de Supervisoes", value: stats.total },
      { metric: "Concluidas", value: stats.completed },
      { metric: "Em Andamento", value: stats.inProgress },
      { metric: "Com Nao Conformidades", value: stats.withNonConformities },
      { metric: "Score Medio de Conformidade", value: `${stats.avgConformityScore}%` },
      { metric: "", value: "" },
      { metric: "DISTRIBUICAO DE SCORES", value: "" },
    ]);

    stats.scoreDistribution.forEach((item) => {
      summarySheet.addRow({
        metric: item.range,
        value: item.count,
      });
    });

    summarySheet.addRows([
      { metric: "", value: "" },
      { metric: "POR UNIDADE", value: "" },
    ]);

    stats.byUnit.forEach((item) => {
      summarySheet.addRow({
        metric: `${item.unitCode} - ${item.unitName}`,
        value: `${item.count} (${item.avgScore}%)`,
      });
    });

    summarySheet.addRows([
      { metric: "", value: "" },
      { metric: "POR SUPERVISOR", value: "" },
    ]);

    stats.bySupervisor.forEach((item) => {
      summarySheet.addRow({
        metric: item.supervisorName,
        value: `${item.count} (${item.avgScore}%)`,
      });
    });

    // Sheet: Supervisoes
    const supervisionsSheet = workbook.addWorksheet("Supervisoes");
    supervisionsSheet.columns = [
      { header: "Data", key: "date", width: 12 },
      { header: "Hora", key: "time", width: 8 },
      { header: "Codigo Unidade", key: "unitCode", width: 15 },
      { header: "Nome Unidade", key: "unitName", width: 30 },
      { header: "Supervisor", key: "supervisor", width: 30 },
      { header: "Status", key: "status", width: 15 },
      { header: "Score (%)", key: "score", width: 12 },
      { header: "Conformes", key: "conformity", width: 12 },
      { header: "Total Questoes", key: "total", width: 15 },
      { header: "Nao Conformidades", key: "hasNC", width: 18 },
      { header: "Observacoes", key: "observations", width: 40 },
    ];

    // Header styling
    supervisionsSheet.getRow(1).font = { bold: true };
    supervisionsSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFDC2626" },
    };
    supervisionsSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

    // Add data
    reportData.executions.forEach((execution) => {
      const startedAt = new Date(execution.started_at);

      supervisionsSheet.addRow({
        date: startedAt.toLocaleDateString("pt-BR"),
        time: startedAt.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        unitCode: execution.unit?.code || "-",
        unitName: execution.unit?.name || "-",
        supervisor: execution.supervisor?.full_name || "-",
        status: STATUS_LABELS[execution.status] || execution.status,
        score: execution.conformity_score,
        conformity: execution.conformity_count,
        total: execution.total_questions,
        hasNC: execution.has_non_conformities ? "Sim" : "Nao",
        observations: execution.general_observations || "",
      });
    });

    // Conditional formatting for score
    supervisionsSheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const scoreCell = row.getCell("score");
        const scoreValue = scoreCell.value as number;
        if (scoreValue !== undefined) {
          if (scoreValue > 90) {
            scoreCell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFDCFCE7" },
            };
          } else if (scoreValue > 70) {
            scoreCell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFFEF9C3" },
            };
          } else if (scoreValue > 50) {
            scoreCell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFFED7AA" },
            };
          } else {
            scoreCell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFFEE2E2" },
            };
          }
        }
      }
    });

    // Auto-filter
    supervisionsSheet.autoFilter = {
      from: "A1",
      to: `K${reportData.executions.length + 1}`,
    };

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Nome do arquivo
    const filename = `relatorio-supervisao-${startDate}-${endDate}.xlsx`;

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
