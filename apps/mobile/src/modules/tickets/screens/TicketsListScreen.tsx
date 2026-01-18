/**
 * Gapp Mobile - Tickets List Screen
 *
 * Lista de chamados com filtros e paginacao.
 */

import React, { useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  RefreshControl,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { TicketsStackScreenProps } from '../../../navigation/types';
import { useThemeColors, typography, spacing, colors as themeColors } from '../../../theme';
import { Card, CardContent, EmptyState, Loading } from '../../../components/ui';
import { TicketCard } from '../components/TicketCard';
import { useTickets } from '../hooks/useTickets';
import { TICKET_TYPES } from '../constants/tickets.constants';
import type { TicketSummary, TicketType } from '../types/tickets.types';
import { logger } from '../../../lib/observability';

type NavigationProp = TicketsStackScreenProps<'TicketsList'>['navigation'];

export function TicketsListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const colors = useThemeColors();

  const {
    tickets,
    total,
    loading,
    refreshing,
    error,
    refresh,
    loadMore,
    hasMore,
  } = useTickets({ autoLoad: true });

  React.useEffect(() => {
    logger.info('TicketsListScreen mounted');
  }, []);

  const handleNewTicket = useCallback((type: TicketType) => {
    logger.info('Creating new ticket', { type });
    navigation.navigate('NewTicket', { type });
  }, [navigation]);

  const handleViewTicket = useCallback((ticketId: string) => {
    logger.info('Viewing ticket', { ticketId });
    navigation.navigate('TicketDetails', { ticketId });
  }, [navigation]);

  const renderTicket = useCallback(
    ({ item }: { item: TicketSummary }) => (
      <TicketCard ticket={item} onPress={() => handleViewTicket(item.id)} />
    ),
    [handleViewTicket]
  );

  const renderFooter = useCallback(() => {
    if (!hasMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={themeColors.primary.DEFAULT} />
      </View>
    );
  }, [hasMore]);

  const renderEmpty = useCallback(() => {
    if (loading) return null;
    return (
      <EmptyState
        title="Nenhum chamado"
        description="Voce ainda nao possui chamados. Crie um novo chamado usando os botoes acima."
        icon="document-text-outline"
      />
    );
  }, [loading]);

  const renderHeader = useCallback(() => (
    <View>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Chamados
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Gerencie seus chamados e solicitacoes
        </Text>
      </View>

      {/* Tipos de chamado */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
        Abrir Novo Chamado
      </Text>

      <View style={styles.typesGrid}>
        {TICKET_TYPES.map((type) => (
          <Pressable
            key={type.key}
            style={[
              styles.typeCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => handleNewTicket(type.key)}
          >
            <View style={[styles.typeIconContainer, { backgroundColor: type.color }]}>
              <Ionicons name={type.icon as any} size={24} color="white" />
            </View>
            <Text style={[styles.typeLabel, { color: colors.foreground }]}>
              {type.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Titulo da lista */}
      <View style={styles.listHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Meus Chamados
        </Text>
        {total > 0 && (
          <Text style={[styles.totalCount, { color: colors.mutedForeground }]}>
            {total} {total === 1 ? 'chamado' : 'chamados'}
          </Text>
        )}
      </View>
    </View>
  ), [colors, handleNewTicket, total]);

  // Loading inicial
  if (loading && tickets.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Loading size="large" />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
            Carregando chamados...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Erro
  if (error && tickets.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={themeColors.destructive.DEFAULT} />
          <Text style={[styles.errorText, { color: colors.foreground }]}>
            {error}
          </Text>
          <Pressable onPress={refresh} style={styles.retryButton}>
            <Text style={[styles.retryText, { color: themeColors.primary.DEFAULT }]}>
              Tentar novamente
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id}
        renderItem={renderTicket}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={themeColors.primary.DEFAULT}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[3],
  },
  loadingText: {
    fontSize: typography.sizes.base,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[8],
    gap: spacing[3],
  },
  errorText: {
    fontSize: typography.sizes.base,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
  },
  retryText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium as '500',
  },
  header: {
    marginBottom: spacing[6],
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold as '700',
  },
  subtitle: {
    fontSize: typography.sizes.base,
    marginTop: spacing[1],
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as '600',
    marginBottom: spacing[3],
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  typeCard: {
    width: '47%',
    padding: spacing[4],
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: spacing[2],
  },
  typeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium as '500',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  totalCount: {
    fontSize: typography.sizes.sm,
  },
  footer: {
    paddingVertical: spacing[4],
    alignItems: 'center',
  },
});
