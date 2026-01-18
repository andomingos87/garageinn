import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import {
  canAccessReports,
  getReportTickets,
  getReportStats,
} from "@/app/(app)/relatorios/chamados/actions";
import { TicketsPDFDocument } from "@/app/(app)/relatorios/chamados/components/tickets-pdf-document";

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

    // Buscar dados (limite maior para PDF)
    const [reportData, stats] = await Promise.all([
      getReportTickets(filters, 1, 100, "created_at", "desc"),
      getReportStats(filters),
    ]);

    // Gerar PDF
    const pdfBuffer = await renderToBuffer(
      TicketsPDFDocument({
        tickets: reportData.tickets,
        stats,
        filters: { startDate, endDate },
      })
    );

    // Converter Buffer para Uint8Array
    const pdfData = new Uint8Array(pdfBuffer);

    // Nome do arquivo
    const filename = `relatorio-chamados-${startDate}-${endDate}.pdf`;

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
