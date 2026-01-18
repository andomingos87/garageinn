/**
 * Gapp Mobile - TicketTimeline Component
 *
 * Timeline de historico de mudancas do chamado.
 */

import React from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors, typography, spacing, colors as themeColors } from '../../../theme';
import type { TicketHistoryEntry } from '../types/tickets.types';
import { STATUS_LABELS } from '../constants/tickets.constants';

interface TicketTimelineProps {
  history: TicketHistoryEntry[];
}

/**
 * Formata data/hora
 */
function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Retorna icone para acao
 */
function getActionIcon(action: string): string {
  switch (action) {
    case 'created':
      return 'add-circle';
    case 'status_changed':
      return 'sync-circle';
    case 'assigned':
      return 'person';
    case 'priority_changed':
      return 'flag';
    case 'comment_added':
      return 'chatbubble';
    case 'attachment_added':
      return 'attach';
    default:
      return 'ellipse';
  }
}

/**
 * Retorna cor para acao
 */
function getActionColor(action: string): string {
  switch (action) {
    case 'created':
      return themeColors.success.DEFAULT;
    case 'status_changed':
      return themeColors.info.DEFAULT;
    case 'assigned':
      return themeColors.primary.DEFAULT;
    case 'priority_changed':
      return themeColors.warning.DEFAULT;
    default:
      return themeColors.neutral[500];
  }
}

/**
 * Formata descricao da acao
 */
function formatActionDescription(entry: TicketHistoryEntry): string {
  switch (entry.action) {
    case 'created':
      return 'Chamado criado';
    case 'status_changed':
      const oldStatus = STATUS_LABELS[entry.oldValue as keyof typeof STATUS_LABELS] || entry.oldValue;
      const newStatus = STATUS_LABELS[entry.newValue as keyof typeof STATUS_LABELS] || entry.newValue;
      return `Status alterado: ${oldStatus} → ${newStatus}`;
    case 'assigned':
      return `Atribuido a ${entry.newValue}`;
    case 'priority_changed':
      return `Prioridade alterada: ${entry.oldValue || 'nenhuma'} → ${entry.newValue}`;
    case 'comment_added':
      return 'Comentario adicionado';
    case 'attachment_added':
      return 'Anexo adicionado';
    default:
      return entry.action;
  }
}

function TimelineItem({
  entry,
  isLast,
}: {
  entry: TicketHistoryEntry;
  isLast: boolean;
}) {
  const colors = useThemeColors();
  const iconName = getActionIcon(entry.action);
  const iconColor = getActionColor(entry.action);

  return (
    <View style={styles.timelineItem}>
      {/* Linha conectora */}
      <View style={styles.lineContainer}>
        <View style={[styles.iconCircle, { backgroundColor: iconColor }]}>
          <Ionicons name={iconName as any} size={14} color="white" />
        </View>
        {!isLast && (
          <View style={[styles.line, { backgroundColor: colors.border }]} />
        )}
      </View>

      {/* Conteudo */}
      <View style={styles.content}>
        <Text style={[styles.description, { color: colors.foreground }]}>
          {formatActionDescription(entry)}
        </Text>
        <View style={styles.meta}>
          <Text style={[styles.author, { color: colors.mutedForeground }]}>
            {entry.createdByName}
          </Text>
          <Text style={[styles.date, { color: colors.mutedForeground }]}>
            {formatDateTime(entry.createdAt)}
          </Text>
        </View>
      </View>
    </View>
  );
}

export function TicketTimeline({ history }: TicketTimelineProps) {
  const colors = useThemeColors();

  if (history.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="time-outline" size={32} color={colors.mutedForeground} />
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
          Nenhum historico disponivel
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={history}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <TimelineItem entry={item} isLast={index === history.length - 1} />
      )}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing[4],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[8],
    gap: spacing[2],
  },
  emptyText: {
    fontSize: typography.sizes.base,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 60,
  },
  lineContainer: {
    width: 32,
    alignItems: 'center',
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: 4,
    marginBottom: -4,
  },
  content: {
    flex: 1,
    paddingLeft: spacing[3],
    paddingBottom: spacing[4],
  },
  description: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium as '500',
    marginBottom: spacing[1],
  },
  meta: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  author: {
    fontSize: typography.sizes.sm,
  },
  date: {
    fontSize: typography.sizes.sm,
  },
});
