import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { SupervisionReportItem, SupervisionReportStats } from "../actions";

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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
    gap: 8,
  },
  statsCard: {
    width: "18%",
    padding: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 4,
  },
  statsLabel: {
    fontSize: 8,
    color: "#666666",
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
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
  distributionSection: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 20,
  },
  distributionCard: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 4,
  },
  distributionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1f2937",
  },
  distributionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    fontSize: 8,
  },
  table: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    padding: 8,
    fontWeight: "bold",
    fontSize: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    padding: 8,
  },
  tableRowAlt: {
    backgroundColor: "#fafafa",
  },
  colDate: { width: "12%", fontSize: 8 },
  colUnit: { width: "18%", fontSize: 8 },
  colSupervisor: { width: "20%", fontSize: 8 },
  colStatus: { width: "15%", fontSize: 8 },
  colScore: { width: "12%", fontSize: 8 },
  colConformity: { width: "13%", fontSize: 8 },
  colNC: { width: "10%", fontSize: 8 },
  badge: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 7,
  },
  badgeGreen: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  badgeYellow: {
    backgroundColor: "#fef9c3",
    color: "#854d0e",
  },
  badgeOrange: {
    backgroundColor: "#fed7aa",
    color: "#9a3412",
  },
  badgeRed: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
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

const STATUS_LABELS: Record<string, string> = {
  in_progress: "Em Andamento",
  completed: "Concluido",
};

interface SupervisionReportPDFProps {
  executions: SupervisionReportItem[];
  stats: SupervisionReportStats;
  filters: {
    startDate: string;
    endDate: string;
  };
}

export function SupervisionReportPDF({
  executions,
  stats,
  filters,
}: SupervisionReportPDFProps) {
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

  const getScoreBadge = (score: number) => {
    let badgeStyle = styles.badgeRed;
    if (score > 90) badgeStyle = styles.badgeGreen;
    else if (score > 70) badgeStyle = styles.badgeYellow;
    else if (score > 50) badgeStyle = styles.badgeOrange;

    return <Text style={[styles.badge, badgeStyle]}>{score}%</Text>;
  };

  const getStatusBadge = (status: string) => {
    const label = STATUS_LABELS[status] || status;
    const badgeStyle =
      status === "completed" ? styles.badgeGreen : styles.badgeYellow;
    return <Text style={[styles.badge, badgeStyle]}>{label}</Text>;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="landscape">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>RELATORIO DE SUPERVISAO</Text>
          <Text style={styles.headerSubtitle}>
            Periodo: {formatDate(filters.startDate)} a {formatDate(filters.endDate)}
          </Text>
          <View style={styles.headerInfo}>
            <Text>Total de supervisoes: {stats.total}</Text>
            <Text>
              Gerado em: {formatDate(new Date().toISOString())}
            </Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statsCard}>
            <Text style={styles.statsLabel}>Total</Text>
            <Text style={styles.statsValue}>{stats.total}</Text>
          </View>
          <View style={styles.statsCard}>
            <Text style={styles.statsLabel}>Concluidas</Text>
            <Text style={styles.statsValue}>{stats.completed}</Text>
          </View>
          <View style={styles.statsCard}>
            <Text style={styles.statsLabel}>Em Andamento</Text>
            <Text style={styles.statsValue}>{stats.inProgress}</Text>
          </View>
          <View style={styles.statsCard}>
            <Text style={styles.statsLabel}>Com NC</Text>
            <Text style={styles.statsValue}>{stats.withNonConformities}</Text>
          </View>
          <View style={styles.statsCard}>
            <Text style={styles.statsLabel}>Score Medio</Text>
            <Text style={styles.statsValue}>{stats.avgConformityScore}%</Text>
          </View>
        </View>

        {/* Distribution */}
        <View style={styles.distributionSection}>
          <View style={styles.distributionCard}>
            <Text style={styles.distributionTitle}>Distribuicao de Scores</Text>
            {stats.scoreDistribution.map((item) => (
              <View key={item.range} style={styles.distributionItem}>
                <Text>{item.range}</Text>
                <Text>{item.count}</Text>
              </View>
            ))}
          </View>
          <View style={styles.distributionCard}>
            <Text style={styles.distributionTitle}>Por Unidade (Top 5)</Text>
            {stats.byUnit.slice(0, 5).map((item) => (
              <View key={item.unitId} style={styles.distributionItem}>
                <Text>{item.unitCode}</Text>
                <Text>{item.count} ({item.avgScore}%)</Text>
              </View>
            ))}
          </View>
          <View style={styles.distributionCard}>
            <Text style={styles.distributionTitle}>Por Supervisor (Top 5)</Text>
            {stats.bySupervisor.slice(0, 5).map((item) => (
              <View key={item.supervisorId} style={styles.distributionItem}>
                <Text>{item.supervisorName.substring(0, 20)}{item.supervisorName.length > 20 ? "..." : ""}</Text>
                <Text>{item.count} ({item.avgScore}%)</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LISTA DE SUPERVISOES</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.colDate}>Data</Text>
              <Text style={styles.colUnit}>Unidade</Text>
              <Text style={styles.colSupervisor}>Supervisor</Text>
              <Text style={styles.colStatus}>Status</Text>
              <Text style={styles.colScore}>Score</Text>
              <Text style={styles.colConformity}>Conformidade</Text>
              <Text style={styles.colNC}>NC</Text>
            </View>
            {executions.slice(0, 25).map((execution, index) => (
              <View
                key={execution.id}
                style={[
                  styles.tableRow,
                  index % 2 === 1 ? styles.tableRowAlt : {},
                ]}
              >
                <View style={styles.colDate}>
                  <Text>{formatDate(execution.started_at)}</Text>
                  <Text style={{ fontSize: 7, color: "#666" }}>
                    {formatTime(execution.started_at)}
                  </Text>
                </View>
                <View style={styles.colUnit}>
                  <Text style={{ fontWeight: "bold" }}>
                    {execution.unit?.code || "-"}
                  </Text>
                  <Text style={{ fontSize: 7 }}>
                    {(execution.unit?.name || "").substring(0, 15)}
                  </Text>
                </View>
                <Text style={styles.colSupervisor}>
                  {(execution.supervisor?.full_name || "-").substring(0, 20)}
                </Text>
                <View style={styles.colStatus}>
                  {getStatusBadge(execution.status)}
                </View>
                <View style={styles.colScore}>
                  {getScoreBadge(execution.conformity_score)}
                </View>
                <Text style={styles.colConformity}>
                  {execution.conformity_count}/{execution.total_questions}
                </Text>
                <Text style={styles.colNC}>
                  {execution.has_non_conformities ? "Sim" : "Nao"}
                </Text>
              </View>
            ))}
          </View>
          {executions.length > 25 && (
            <Text style={{ fontSize: 8, color: "#666", marginTop: 8 }}>
              Exibindo 25 de {executions.length} supervisoes. Use a exportacao Excel para ver todas.
            </Text>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Relatorio gerado pelo sistema GAPP - GarageInn
          </Text>
        </View>
      </Page>
    </Document>
  );
}
