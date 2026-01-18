/**
 * Gapp Mobile - TicketStatusBadge Component
 *
 * Badge colorido para exibir status do chamado.
 */

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { typography } from '../../../theme';
import type { TicketStatus } from '../types/tickets.types';
import { STATUS_LABELS, STATUS_COLORS } from '../constants/tickets.constants';

interface TicketStatusBadgeProps {
  status: TicketStatus;
  size?: 'sm' | 'md';
}

export function TicketStatusBadge({ status, size = 'md' }: TicketStatusBadgeProps) {
  const label = STATUS_LABELS[status] || status;
  const colors = STATUS_COLORS[status] || { bg: '#F3F4F6', text: '#374151' };

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
