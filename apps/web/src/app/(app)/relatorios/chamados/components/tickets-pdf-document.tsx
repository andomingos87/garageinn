import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { TicketReportItem, TicketReportStats } from "../actions";

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
    gap: 10,
  },
  statsCard: {
    width: "23%",
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
    fontSize: 16,
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
  colNumber: { width: "12%", fontSize: 8 },
  colTitle: { width: "25%", fontSize: 8 },
  colStatus: { width: "15%", fontSize: 8 },
  colPriority: { width: "12%", fontSize: 8 },
  colDept: { width: "12%", fontSize: 8 },
  colUnit: { width: "12%", fontSize: 8 },
  colDate: { width: "12%", fontSize: 8 },
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
  badgePurple: {
    backgroundColor: "#f3e8ff",
    color: "#7c3aed",
  },
  badgeRed: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
  badgeBlue: {
    backgroundColor: "#dbeafe",
    color: "#1e40af",
  },
  badgeGray: {
    backgroundColor: "#f3f4f6",
    color: "#4b5563",
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
  awaiting_approval_encarregado: "Aguard. Aprov. (Enc.)",
  awaiting_approval_supervisor: "Aguard. Aprov. (Sup.)",
  awaiting_approval_gerente: "Aguard. Aprov. (Ger.)",
  awaiting_triage: "Aguard. Triagem",
  prioritized: "Priorizado",
  in_progress: "Em Andamento",
  quoting: "Em Cotacao",
  approved: "Aprovado",
  awaiting_return: "Aguard. Retorno",
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

interface TicketsPDFDocumentProps {
  tickets: TicketReportItem[];
  stats: TicketReportStats;
  filters: {
    startDate: string;
    endDate: string;
  };
}

export function TicketsPDFDocument({
  tickets,
  stats,
  filters,
}: TicketsPDFDocumentProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTicketNumber = (ticket: TicketReportItem) => {
    const prefix = ticket.department
      ? DEPARTMENT_PREFIXES[ticket.department.name] || "TKT"
      : "TKT";
    return `${prefix}-${ticket.ticket_number.toString().padStart(5, "0")}`;
  };

  const getStatusBadge = (status: string) => {
    const label = STATUS_LABELS[status] || status;
    let badgeStyle = styles.badgeGray;

    if (["resolved", "closed"].includes(status)) badgeStyle = styles.badgeGreen;
    else if (["in_progress", "quoting"].includes(status)) badgeStyle = styles.badgePurple;
    else if (["prioritized", "approved"].includes(status)) badgeStyle = styles.badgeBlue;
    else if (status.startsWith("awaiting")) badgeStyle = styles.badgeYellow;
    else if (["denied", "cancelled"].includes(status)) badgeStyle = styles.badgeRed;

    return <Text style={[styles.badge, badgeStyle]}>{label}</Text>;
  };

  const getPriorityBadge = (priority: string | null) => {
    if (!priority) return <Text>-</Text>;
    const label = PRIORITY_LABELS[priority] || priority;
    let badgeStyle = styles.badgeGray;

    if (priority === "urgent") badgeStyle = styles.badgeRed;
    else if (priority === "high") badgeStyle = styles.badgeYellow;
    else if (priority === "medium") badgeStyle = styles.badgeBlue;

    return <Text style={[styles.badge, badgeStyle]}>{label}</Text>;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="landscape">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>RELATORIO DE CHAMADOS</Text>
          <Text style={styles.headerSubtitle}>
            Periodo: {formatDate(filters.startDate)} a {formatDate(filters.endDate)}
          </Text>
          <View style={styles.headerInfo}>
            <Text>Total de chamados: {stats.total}</Text>
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
            <Text style={styles.statsLabel}>Taxa Resolucao</Text>
            <Text style={styles.statsValue}>{stats.resolutionRate}%</Text>
          </View>
          <View style={styles.statsCard}>
            <Text style={styles.statsLabel}>Tempo Medio</Text>
            <Text style={styles.statsValue}>{stats.avgResolutionDays} dias</Text>
          </View>
          <View style={styles.statsCard}>
            <Text style={styles.statsLabel}>Departamentos</Text>
            <Text style={styles.statsValue}>{stats.byDepartment.length}</Text>
          </View>
        </View>

        {/* Distribution */}
        <View style={styles.distributionSection}>
          <View style={styles.distributionCard}>
            <Text style={styles.distributionTitle}>Por Status</Text>
            {stats.byStatus.slice(0, 5).map((item) => (
              <View key={item.status} style={styles.distributionItem}>
                <Text>{STATUS_LABELS[item.status] || item.status}</Text>
                <Text>{item.count}</Text>
              </View>
            ))}
          </View>
          <View style={styles.distributionCard}>
            <Text style={styles.distributionTitle}>Por Prioridade</Text>
            {stats.byPriority.map((item) => (
              <View key={item.priority} style={styles.distributionItem}>
                <Text>{PRIORITY_LABELS[item.priority] || item.priority}</Text>
                <Text>{item.count}</Text>
              </View>
            ))}
          </View>
          <View style={styles.distributionCard}>
            <Text style={styles.distributionTitle}>Por Departamento</Text>
            {stats.byDepartment.slice(0, 5).map((item) => (
              <View key={item.departmentId} style={styles.distributionItem}>
                <Text>{item.department}</Text>
                <Text>{item.count}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LISTA DE CHAMADOS</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.colNumber}>Numero</Text>
              <Text style={styles.colTitle}>Titulo</Text>
              <Text style={styles.colStatus}>Status</Text>
              <Text style={styles.colPriority}>Prioridade</Text>
              <Text style={styles.colDept}>Departamento</Text>
              <Text style={styles.colUnit}>Unidade</Text>
              <Text style={styles.colDate}>Data</Text>
            </View>
            {tickets.slice(0, 30).map((ticket, index) => (
              <View
                key={ticket.id}
                style={[
                  styles.tableRow,
                  index % 2 === 1 ? styles.tableRowAlt : {},
                ]}
              >
                <Text style={styles.colNumber}>
                  {formatTicketNumber(ticket)}
                </Text>
                <Text style={styles.colTitle}>
                  {ticket.title.substring(0, 50)}{ticket.title.length > 50 ? "..." : ""}
                </Text>
                <View style={styles.colStatus}>
                  {getStatusBadge(ticket.status)}
                </View>
                <View style={styles.colPriority}>
                  {getPriorityBadge(ticket.priority)}
                </View>
                <Text style={styles.colDept}>
                  {ticket.department?.name || "-"}
                </Text>
                <Text style={styles.colUnit}>
                  {ticket.unit?.code || "-"}
                </Text>
                <Text style={styles.colDate}>
                  {formatDate(ticket.created_at)}
                </Text>
              </View>
            ))}
          </View>
          {tickets.length > 30 && (
            <Text style={{ fontSize: 8, color: "#666", marginTop: 8 }}>
              Exibindo 30 de {tickets.length} chamados. Use a exportacao Excel para ver todos.
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
