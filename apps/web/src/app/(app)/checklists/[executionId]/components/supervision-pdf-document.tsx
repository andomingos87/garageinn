import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// Estilos do PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#dc2626",
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#dc2626",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#666666",
  },
  headerInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    fontSize: 9,
    color: "#666666",
  },
  scoreSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 4,
  },
  scoreTitle: {
    fontSize: 11,
    color: "#666666",
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: "bold",
  },
  scoreGreen: {
    color: "#16a34a",
  },
  scoreYellow: {
    color: "#ca8a04",
  },
  scoreRed: {
    color: "#dc2626",
  },
  scoreBar: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    marginTop: 8,
    marginBottom: 8,
  },
  scoreBarFill: {
    height: 8,
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 8,
    color: "#666666",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1f2937",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 4,
  },
  sectionTitleRed: {
    color: "#dc2626",
  },
  answerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 8,
    marginBottom: 4,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
  },
  answerRowNonConform: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  answerNumber: {
    width: 20,
    fontSize: 9,
    color: "#666666",
  },
  answerText: {
    flex: 1,
    fontSize: 9,
    paddingRight: 10,
  },
  answerStatus: {
    width: 40,
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "right",
  },
  answerStatusYes: {
    color: "#16a34a",
  },
  answerStatusNo: {
    color: "#dc2626",
  },
  observation: {
    fontSize: 8,
    color: "#666666",
    marginTop: 4,
    paddingLeft: 20,
    fontStyle: "italic",
  },
  nonConformItem: {
    padding: 8,
    marginBottom: 4,
    backgroundColor: "#fef2f2",
    borderLeftWidth: 3,
    borderLeftColor: "#dc2626",
    borderRadius: 4,
  },
  nonConformNumber: {
    fontSize: 8,
    color: "#dc2626",
    fontWeight: "bold",
  },
  nonConformText: {
    fontSize: 9,
    marginTop: 2,
  },
  nonConformObs: {
    fontSize: 8,
    color: "#666666",
    marginTop: 4,
    fontStyle: "italic",
  },
  observationsBox: {
    padding: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 4,
    minHeight: 40,
  },
  observationsText: {
    fontSize: 9,
    color: "#374151",
    lineHeight: 1.4,
  },
  signaturesSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  signatureBox: {
    width: "45%",
    alignItems: "center",
  },
  signatureLabel: {
    fontSize: 9,
    color: "#666666",
    marginBottom: 8,
  },
  signatureImage: {
    width: 150,
    height: 60,
    objectFit: "contain",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    padding: 4,
  },
  signatureName: {
    fontSize: 9,
    fontWeight: "bold",
    marginTop: 4,
    textAlign: "center",
  },
  signatureLine: {
    width: "100%",
    height: 1,
    backgroundColor: "#000000",
    marginTop: 8,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#999999",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
  },
});

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

interface SupervisionPDFProps {
  execution: {
    id: string;
    started_at: string;
    completed_at: string | null;
    general_observations: string | null;
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
    };
    answers: Answer[];
  };
}

export function SupervisionPDFDocument({ execution }: SupervisionPDFProps) {
  // Cálculos
  const totalAnswers = execution.answers.length;
  const conformCount = execution.answers.filter(
    (a) => a.answer === true
  ).length;
  const nonConformCount = execution.answers.filter(
    (a) => a.answer === false
  ).length;
  const conformityScore =
    totalAnswers > 0 ? Math.round((conformCount / totalAnswers) * 100) : 0;

  const nonConformities = execution.answers
    .filter((a) => a.answer === false)
    .sort((a, b) => a.question.order_index - b.question.order_index);

  const sortedAnswers = [...execution.answers].sort(
    (a, b) => a.question.order_index - b.question.order_index
  );

  // Formatação de datas
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreStyle = () => {
    if (conformityScore >= 90) return styles.scoreGreen;
    if (conformityScore >= 70) return styles.scoreYellow;
    return styles.scoreRed;
  };

  const getScoreBarColor = () => {
    if (conformityScore >= 90) return "#16a34a";
    if (conformityScore >= 70) return "#ca8a04";
    return "#dc2626";
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>RELATÓRIO DE SUPERVISÃO</Text>
          <Text style={styles.headerSubtitle}>{execution.template.name}</Text>
          <View style={styles.headerInfo}>
            <Text>
              Unidade: {execution.unit.name} ({execution.unit.code})
            </Text>
            <Text>Data: {formatDate(execution.started_at)}</Text>
            <Text>Supervisor: {execution.executed_by_profile.full_name}</Text>
          </View>
        </View>

        {/* Score Section */}
        <View style={styles.scoreSection}>
          <Text style={styles.scoreTitle}>SCORE DE CONFORMIDADE</Text>
          <Text style={[styles.scoreValue, getScoreStyle()]}>
            {conformityScore}%
          </Text>
          <View style={styles.scoreBar}>
            <View
              style={[
                styles.scoreBarFill,
                {
                  width: `${conformityScore}%`,
                  backgroundColor: getScoreBarColor(),
                },
              ]}
            />
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: "#16a34a" }]}>
                {conformCount}
              </Text>
              <Text style={styles.statLabel}>Conformes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: "#dc2626" }]}>
                {nonConformCount}
              </Text>
              <Text style={styles.statLabel}>Não Conformes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalAnswers}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        </View>

        {/* Non-conformities */}
        {nonConformities.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, styles.sectionTitleRed]}>
              NÃO-CONFORMIDADES ({nonConformities.length})
            </Text>
            {nonConformities.map((item, index) => (
              <View key={item.id} style={styles.nonConformItem}>
                <Text style={styles.nonConformNumber}>#{index + 1}</Text>
                <Text style={styles.nonConformText}>
                  {item.question.question_text}
                </Text>
                {item.observation && (
                  <Text style={styles.nonConformObs}>
                    Obs: {item.observation}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* All Answers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RESPOSTAS DETALHADAS</Text>
          {sortedAnswers.map((answer, index) => (
            <View
              key={answer.id}
              style={
                !answer.answer
                  ? [styles.answerRow, styles.answerRowNonConform]
                  : styles.answerRow
              }
            >
              <Text style={styles.answerNumber}>{index + 1}.</Text>
              <Text style={styles.answerText}>
                {answer.question.question_text}
              </Text>
              <Text
                style={[
                  styles.answerStatus,
                  answer.answer
                    ? styles.answerStatusYes
                    : styles.answerStatusNo,
                ]}
              >
                {answer.answer ? "SIM" : "NÃO"}
              </Text>
            </View>
          ))}
        </View>

        {/* General Observations */}
        {execution.general_observations && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>OBSERVAÇÕES GERAIS</Text>
            <View style={styles.observationsBox}>
              <Text style={styles.observationsText}>
                {execution.general_observations}
              </Text>
            </View>
          </View>
        )}

        {/* Signatures */}
        {(execution.supervisor_signature || execution.attendant_signature) && (
          <View style={styles.signaturesSection}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>Supervisor</Text>
              {execution.supervisor_signature && (
                // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image doesn't support alt
                <Image
                  style={styles.signatureImage}
                  src={execution.supervisor_signature}
                />
              )}
              <View style={styles.signatureLine} />
              <Text style={styles.signatureName}>
                {execution.executed_by_profile.full_name}
              </Text>
            </View>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>Encarregado</Text>
              {execution.attendant_signature && (
                // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image doesn't support alt
                <Image
                  style={styles.signatureImage}
                  src={execution.attendant_signature}
                />
              )}
              <View style={styles.signatureLine} />
              <Text style={styles.signatureName}>
                {execution.attendant_name || "Não informado"}
              </Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Relatório gerado em {formatDate(new Date().toISOString())} às{" "}
            {formatTime(new Date().toISOString())}
          </Text>
          <Text>
            Início: {formatDate(execution.started_at)}{" "}
            {formatTime(execution.started_at)}
            {execution.completed_at &&
              ` | Fim: ${formatTime(execution.completed_at)}`}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
