/**
 * Gapp Mobile - New Ticket Screen
 *
 * Formulario para criar novo chamado.
 */

import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { TicketsStackScreenProps } from '../../../navigation/types';
import { useThemeColors } from '../../../theme';
import { TicketForm } from '../components/TicketForm';
import type { Ticket, TicketType } from '../types/tickets.types';
import { logger } from '../../../lib/observability';

type Props = TicketsStackScreenProps<'NewTicket'>;

export function NewTicketScreen({ route, navigation }: Props) {
  const type = (route.params?.type || 'manutencao') as TicketType;
  const colors = useThemeColors();

  React.useEffect(() => {
    logger.info('NewTicketScreen mounted', { type });
  }, [type]);

  const handleSubmitSuccess = useCallback(
    (ticket: Ticket) => {
      logger.info('Ticket created successfully', { ticketId: ticket.id });
      // Navegar para detalhes do chamado criado
      navigation.replace('TicketDetails', { ticketId: ticket.id });
    },
    [navigation]
  );

  const handleCancel = useCallback(() => {
    logger.info('Ticket creation cancelled');
    navigation.goBack();
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TicketForm
        ticketType={type}
        onSubmitSuccess={handleSubmitSuccess}
        onCancel={handleCancel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
