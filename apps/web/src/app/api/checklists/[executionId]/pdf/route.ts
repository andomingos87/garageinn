import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { SupervisionPDFDocument } from "@/app/(app)/checklists/[executionId]/components/supervision-pdf-document";

interface RouteParams {
  params: Promise<{
    executionId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { executionId } = await params;
    const supabase = await createClient();

    // Verificar autenticação
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Buscar execução
    const { data: execution, error } = await supabase
      .from("checklist_executions")
      .select(
        `
        *,
        template:checklist_templates(id, name, type),
        unit:units(id, name, code),
        executed_by_profile:profiles!executed_by(id, full_name, email)
      `
      )
      .eq("id", executionId)
      .single();

    if (error || !execution) {
      return NextResponse.json(
        { error: "Execução não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se é supervisão completa
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((execution.template as any)?.type !== "supervision") {
      return NextResponse.json(
        { error: "PDF disponível apenas para checklists de supervisão" },
        { status: 400 }
      );
    }

    if (execution.status !== "completed") {
      return NextResponse.json(
        { error: "PDF disponível apenas para execuções completas" },
        { status: 400 }
      );
    }

    // Buscar respostas
    const { data: answers, error: answersError } = await supabase
      .from("checklist_answers")
      .select(
        `
        id,
        answer,
        observation,
        question:checklist_questions(
          id,
          question_text,
          order_index,
          is_required,
          requires_observation_on_no
        )
      `
      )
      .eq("execution_id", executionId);

    if (answersError) {
      console.error("Error fetching answers:", answersError);
      return NextResponse.json(
        { error: "Erro ao buscar respostas" },
        { status: 500 }
      );
    }

    // Montar dados para o PDF
    const executionData = {
      id: execution.id,
      started_at: execution.started_at,
      completed_at: execution.completed_at,
      general_observations: execution.general_observations,
      supervisor_signature: execution.supervisor_signature,
      attendant_signature: execution.attendant_signature,
      attendant_name: execution.attendant_name,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      template: execution.template as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      unit: execution.unit as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      executed_by_profile: execution.executed_by_profile as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      answers: (answers || []).map((a: any) => ({
        id: a.id,
        answer: a.answer,
        observation: a.observation,
        question: a.question,
      })),
    };

    // Gerar PDF
    const pdfBuffer = await renderToBuffer(
      SupervisionPDFDocument({ execution: executionData })
    );

    // Converter Buffer para Uint8Array (compatível com NextResponse)
    const pdfData = new Uint8Array(pdfBuffer);

    // Retornar PDF
    const unitCode = executionData.unit?.code || "unknown";
    const date = new Date(execution.started_at).toISOString().split("T")[0];
    const filename = `supervisao-${unitCode}-${date}.pdf`;

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
