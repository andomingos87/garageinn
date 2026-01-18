/**
 * Gapp Mobile - TicketPriorityBadge Component
 *
 * Badge colorido para exibir prioridade do chamado.
 */

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { typography } from '../../../theme';
import type { TicketPriority } from '../types/tickets.types';
import { PRIORITY_LABELS, PRIORITY_COLORS } from '../constants/tickets.constants';

interface TicketPriorityBadgeProps {
  priority: TicketPriority | null;
  size?: 'sm' | 'md';
}

export function TicketPriorityBadge({ priority, size = 'md' }: TicketPriorityBadgeProps) {
  if (!priority) {
    return (
      <View
        style={[
          styles.badge,
          size === 'sm' && styles.badgeSm,
          { backgroundColor: '#F3F4F6' },
        ]}
      >
        <Text
          style={[
            styles.text,
            size === 'sm' && styles.textSm,
            { color: '#6B7280' },
          ]}
        >
          Nao definida
        </Text>
      </View>
    );
  }

  const label = PRIORITY_LABELS[priority] || priority;
  const colors = PRIORITY_COLORS[priority] || { bg: '#F3F4F6', text: '#374151' };

  return (
    <View
      style={[
        styles.badge,
        size === 'sm' && styles.badgeSm,
        { backgroundColor: colors.bg },
      ]}
    >
      <Text
        style={[
          styles.text,
          size === 'sm' && styles.textSm,
          { color: colors.text },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  text: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium as '500',
  },
  textSm: {
    fontSize: typography.sizes.xs,
  },
});
