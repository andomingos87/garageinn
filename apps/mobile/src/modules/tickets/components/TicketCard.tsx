/**
 * Gapp Mobile - TicketCard Component
 *
 * Card para exibir resumo de um chamado na listagem.
 */

import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors, typography, spacing } from '../../../theme';
import { Card, CardContent } from '../../../components/ui';
import { TicketStatusBadge } from './TicketStatusBadge';
import { TicketPriorityBadge } from './TicketPriorityBadge';
import type { TicketSummary } from '../types/tickets.types';

interface TicketCardProps {
  ticket: TicketSummary;
  onPress: () => void;
}

/**
 * Formata data relativa
 */
function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return 'Agora';
  }
  if (diffMinutes < 60) {
    return `Ha ${diffMinutes} min`;
  }
  if (diffHours < 24) {
    return `Ha ${diffHours}h`;
  }
  if (diffDays === 1) {
    return 'Ha 1 dia';
  }
  if (diffDays < 7) {
    return `Ha ${diffDays} dias`;
  }
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `Ha ${weeks} semana${weeks > 1 ? 's' : ''}`;
  }

  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export function TicketCard({ ticket, onPress }: TicketCardProps) {
  const colors = useThemeColors();

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <Card style={[styles.card, pressed && styles.cardPressed]}>
          <CardContent style={styles.content}>
            {/* Header: Numero e Badges */}
            <View style={styles.header}>
              <Text style={[styles.ticketNumber, { color: colors.mutedForeground }]}>
                #{ticket.ticketNumber}
              </Text>
              <View style={styles.badges}>
                <TicketStatusBadge status={ticket.status} size="sm" />
                {ticket.priority && (
                  <TicketPriorityBadge priority={ticket.priority} size="sm" />
                )}
              </View>
            </View>

            {/* Titulo */}
            <Text
              style={[styles.title, { color: colors.foreground }]}
              numberOfLines={2}
            >
              {ticket.title}
            </Text>

            {/* Departamento */}
            <View style={styles.departmentRow}>
              <Ionicons
                name="business-outline"
                size={14}
                color={colors.mutedForeground}
              />
              <Text style={[styles.department, { color: colors.mutedForeground }]}>
                {ticket.departmentName}
              </Text>
            </View>

            {/* Footer: Unidade e Data */}
            <View style={styles.footer}>
              {ticket.unitName ? (
                <View style={styles.unitRow}>
                  <Ionicons
                    name="location-outline"
                    size={14}
                    color={colors.mutedForeground}
                  />
                  <Text
                    style={[styles.unit, { color: colors.mutedForeground }]}
                    numberOfLines={1}
                  >
                    {ticket.unitName}
                  </Text>
                </View>
              ) : (
                <View />
              )}
              <Text style={[styles.date, { color: colors.mutedForeground }]}>
                {formatRelativeDate(ticket.createdAt)}
              </Text>
            </View>
          </CardContent>
        </Card>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing[3],
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  content: {
    gap: spacing[2],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketNumber: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium as '500',
  },
  badges: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  title: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium as '500',
    lineHeight: 22,
  },
  departmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  department: {
    fontSize: typography.sizes.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[1],
  },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    flex: 1,
  },
  unit: {
    fontSize: typography.sizes.sm,
    flex: 1,
  },
  date: {
    fontSize: typography.sizes.sm,
  },
});
