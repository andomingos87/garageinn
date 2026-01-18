"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  Calendar,
  User,
  Clock,
  FileText,
  MessageSquare,
  PenLine,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Answer {
  id: string;
  answer: boolean;
  observation: string | null;
  question: {
    id: string;
    question_text: string;
    order_index: number;
    is_required: boolean | null;
    requires_observation_on_no: boolean | null;
  };
}

interface SupervisionReportProps {
  execution: {
    id: string;
    started_at: string;
    completed_at: string | null;
    status: string;
    general_observations: string | null;
    has_non_conformities: boolean | null;
    supervisor_signature?: string | null;
    attendant_signature?: string | null;
    attendant_name?: string | null;
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
    executed_by_profile: {
      id: string;
      full_name: string;
      email: string;
      avatar_url: string | null;
    };
    answers: Answer[];
  };
}

export function SupervisionReport({ execution }: SupervisionReportProps) {
  // Cálculos de métricas
  const totalAnswers = execution.answers.length;
  const conformCount = execution.answers.filter(
    (a) => a.answer === true
  ).length;
  const nonConformCount = execution.answers.filter(
    (a) => a.answer === false
  ).length;
  const conformityScore =
    totalAnswers > 0 ? Math.round((conformCount / totalAnswers) * 100) : 0;

  // Lista de não-conformidades
  const nonConformities = execution.answers
    .filter((a) => a.answer === false)
    .sort((a, b) => a.question.order_index - b.question.order_index);

  // Formatação de datas
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateTime = (dateString: string) => {
    return `${formatDate(dateString)} às ${formatTime(dateString)}`;
  };

  // Calcular duração
  const getDuration = () => {
    if (!execution.completed_at) return null;
    const start = new Date(execution.started_at);
    const end = new Date(execution.completed_at);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.round(diffMs / 60000);
    if (diffMins < 60) return `${diffMins} minutos`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}min`;
  };

  // Cor do score baseada no valor
  const getScoreColor = () => {
    if (conformityScore >= 90) return "text-success";
    if (conformityScore >= 70) return "text-warning";
    return "text-destructive";
  };

  const getScoreBgColor = () => {
    if (conformityScore >= 90) return "bg-success/10";
    if (conformityScore >= 70) return "bg-warning/10";
    return "bg-destructive/10";
  };

  return (
    <div className="space-y-6 print:space-y-4" id="supervision-report">
      {/* Cabeçalho do Relatório */}
      <Card className="border-2 border-primary/20 print:border print:shadow-none">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <ShieldCheck className="h-6 w-6 text-primary" />
              Relatório de Supervisão
            </CardTitle>
            <Badge variant="outline" className="text-sm">
              {execution.template.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Unidade</p>
                <p className="font-medium">{execution.unit.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Data</p>
                <p className="font-medium">
                  {formatDate(execution.started_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Supervisor</p>
                <p className="font-medium">
                  {execution.executed_by_profile.full_name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Duração</p>
                <p className="font-medium">{getDuration() || "Em andamento"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score de Conformidade */}
      <Card
        className={cn(
          "border-2",
          getScoreBgColor(),
          "print:border print:shadow-none"
        )}
      >
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <TrendingUp className={cn("h-10 w-10", getScoreColor())} />
              <div>
                <p className="text-sm text-muted-foreground">
                  Score de Conformidade
                </p>
                <p className={cn("text-4xl font-bold", getScoreColor())}>
                  {conformityScore}%
                </p>
              </div>
            </div>

            {/* Barra de progresso visual */}
            <div className="w-full md:w-64">
              <div className="h-4 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-500",
                    conformityScore >= 90
                      ? "bg-success"
                      : conformityScore >= 70
                        ? "bg-warning"
                        : "bg-destructive"
                  )}
                  style={{ width: `${conformityScore}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Contadores */}
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-success">
                  {conformCount}
                </p>
                <p className="text-xs text-muted-foreground">Conformes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-destructive">
                  {nonConformCount}
                </p>
                <p className="text-xs text-muted-foreground">Não Conformes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{totalAnswers}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Não-conformidades */}
      {nonConformities.length > 0 && (
        <Card className="border-destructive/30 print:border print:shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Não-conformidades ({nonConformities.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {nonConformities.map((item, index) => (
                <div
                  key={item.id}
                  className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-destructive/10 text-destructive text-sm font-medium">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium">
                        {item.question.question_text}
                      </p>
                      {item.observation && (
                        <p className="mt-1 text-sm text-muted-foreground flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 mt-0.5 shrink-0" />
                          {item.observation}
                        </p>
                      )}
                    </div>
                    <XCircle className="h-5 w-5 text-destructive shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Todas as Respostas */}
      <Card className="print:border print:shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Respostas Detalhadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {execution.answers
              .sort((a, b) => a.question.order_index - b.question.order_index)
              .map((answer, index) => (
                <div
                  key={answer.id}
                  className={cn(
                    "flex items-start justify-between gap-4 p-3 rounded-lg border",
                    !answer.answer
                      ? "border-destructive/30 bg-destructive/5"
                      : "border-border bg-background"
                  )}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="text-sm font-medium text-muted-foreground w-6">
                      {index + 1}.
                    </span>
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "text-sm",
                          !answer.answer && "font-medium"
                        )}
                      >
                        {answer.question.question_text}
                      </p>
                      {answer.observation && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Obs: {answer.observation}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0">
                    {answer.answer ? (
                      <Badge className="bg-success/10 text-success border-success/20">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Sim
                      </Badge>
                    ) : (
                      <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                        <XCircle className="mr-1 h-3 w-3" />
                        Não
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Observações Gerais */}
      {execution.general_observations && (
        <Card className="print:border print:shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Observações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {execution.general_observations}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Assinaturas */}
      {(execution.supervisor_signature || execution.attendant_signature) && (
        <Card className="print:border print:shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenLine className="h-5 w-5" />
              Assinaturas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Assinatura do Supervisor */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Supervisor</p>
                {execution.supervisor_signature ? (
                  <div className="border rounded-lg p-2 bg-white">
                    <img
                      src={execution.supervisor_signature}
                      alt="Assinatura do Supervisor"
                      className="max-h-24 mx-auto"
                    />
                  </div>
                ) : (
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      Não assinado
                    </p>
                  </div>
                )}
                <p className="mt-2 font-medium">
                  {execution.executed_by_profile.full_name}
                </p>
                <Separator className="my-2" />
              </div>

              {/* Assinatura do Encarregado */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Encarregado
                </p>
                {execution.attendant_signature ? (
                  <div className="border rounded-lg p-2 bg-white">
                    <img
                      src={execution.attendant_signature}
                      alt="Assinatura do Encarregado"
                      className="max-h-24 mx-auto"
                    />
                  </div>
                ) : (
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      Não assinado
                    </p>
                  </div>
                )}
                <p className="mt-2 font-medium">
                  {execution.attendant_name || "Nome não informado"}
                </p>
                <Separator className="my-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rodapé com data/hora de geração */}
      <div className="text-center text-xs text-muted-foreground print:mt-8">
        <Separator className="mb-4" />
        <p>Relatório gerado em {formatDateTime(new Date().toISOString())}</p>
        <p>
          Início: {formatDateTime(execution.started_at)}
          {execution.completed_at &&
            ` | Fim: ${formatTime(execution.completed_at)}`}
        </p>
      </div>
    </div>
  );
}
