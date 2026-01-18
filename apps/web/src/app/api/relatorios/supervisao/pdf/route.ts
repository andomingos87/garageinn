import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import {
  canAccessSupervisionReports,
  getSupervisionReportData,
  getSupervisionReportStats,
} from "@/app/(app)/relatorios/supervisao/actions";
import { SupervisionReportPDF } from "@/app/(app)/relatorios/supervisao/components/supervision-report-pdf";

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

    // Buscar dados (limite maior para PDF)
    const [reportData, stats] = await Promise.all([
      getSupervisionReportData(filters, 1, 100, "started_at", "desc"),
      getSupervisionReportStats(filters),
    ]);

    // Gerar PDF
    const pdfBuffer = await renderToBuffer(
      SupervisionReportPDF({
        executions: reportData.executions,
        stats,
        filters: { startDate, endDate },
      })
    );

    // Converter Buffer para Uint8Array
    const pdfData = new Uint8Array(pdfBuffer);

    // Nome do arquivo
    const filename = `relatorio-supervisao-${startDate}-${endDate}.pdf`;

    return new NextResponse(pdfData, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json({ error: "Erro ao gerar PDF" }, { status: 500 });
  }
}
