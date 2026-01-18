/**
 * Gapp Mobile - Ticket Details Screen
 *
 * Detalhes completos de um chamado.
 */

import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TicketsStackScreenProps } from '../../../navigation/types';
import { useThemeColors, typography, spacing, colors as themeColors } from '../../../theme';
import { Card, CardHeader, CardTitle, CardContent, Loading, EmptyState } from '../../../components/ui';
import { TicketStatusBadge } from '../components/TicketStatusBadge';
import { TicketPriorityBadge } from '../components/TicketPriorityBadge';
import { CommentsList } from '../components/CommentsList';
import { TicketTimeline } from '../components/TicketTimeline';
import { useTicketDetails } from '../hooks/useTicketDetails';
import { logger } from '../../../lib/observability';

type Props = TicketsStackScreenProps<'TicketDetails'>;

type TabType = 'info' | 'comments' | 'history';

/**
 * Formata data
 */
function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function TicketDetailsScreen({ route }: Props) {
  const { ticketId } = route.params;
  const colors = useThemeColors();
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const {
    ticket,
    comments,
    history,
    attachments,
    loading,
    error,
    refresh,
    addComment,
    addingComment,
  } = useTicketDetails(ticketId);

  React.useEffect(() => {
    logger.info('TicketDetailsScreen mounted', { ticketId });
  }, [ticketId]);

  const handleAddComment = useCallback(
    async (content: string) => {
      await addComment(content);
    },
    [addComment]
  );

  // Loading
  if (loading && !ticket) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <Loading size="large" />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
          Carregando chamado...
        </Text>
      </View>
    );
  }

  // Erro
  if (error && !ticket) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <EmptyState
          title="Erro ao carregar"
          description={error}
          icon="alert-circle-outline"
        />
      </View>
    );
  }

  // Chamado nao encontrado
  if (!ticket) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <EmptyState
          title="Chamado nao encontrado"
          description="O chamado solicitado nao existe ou voce nao tem permissao para visualiza-lo."
          icon="document-outline"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header do chamado */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={themeColors.primary.DEFAULT}
          />
        }
        stickyHeaderIndices={activeTab !== 'info' ? [1] : undefined}
      >
        {/* Info do Chamado */}
        <View style={styles.header}>
          <View style={styles.ticketHeader}>
            <Text style={[styles.ticketNumber, { color: colors.mutedForeground }]}>
              #{ticket.ticketNumber}
            </Text>
            <View style={styles.badges}>
              <TicketStatusBadge status={ticket.status} />
              {ticket.priority && <TicketPriorityBadge priority={ticket.priority} />}
            </View>
          </View>
          <Text style={[styles.ticketTitle, { color: colors.foreground }]}>
            {ticket.title}
          </Text>
          <Text style={[styles.department, { color: colors.mutedForeground }]}>
            {ticket.departmentName}
            {ticket.categoryName && ` - ${ticket.categoryName}`}
          </Text>
        </View>

        {/* Tabs */}
        <View style={[styles.tabs, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <Pressable
            style={[styles.tab, activeTab === 'info' && styles.tabActive]}
            onPress={() => setActiveTab('info')}
          >
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={activeTab === 'info' ? themeColors.primary.DEFAULT : colors.mutedForeground}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'info' ? themeColors.primary.DEFAULT : colors.mutedForeground },
              ]}
            >
              Detalhes
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'comments' && styles.tabActive]}
            onPress={() => setActiveTab('comments')}
          >
            <Ionicons
              name="chatbubbles-outline"
              size={20}
              color={activeTab === 'comments' ? themeColors.primary.DEFAULT : colors.mutedForeground}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'comments' ? themeColors.primary.DEFAULT : colors.mutedForeground },
              ]}
            >
              Comentarios ({comments.length})
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'history' && styles.tabActive]}
            onPress={() => setActiveTab('history')}
          >
            <Ionicons
              name="time-outline"
              size={20}
              color={activeTab === 'history' ? themeColors.primary.DEFAULT : colors.mutedForeground}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'history' ? themeColors.primary.DEFAULT : colors.mutedForeground },
              ]}
            >
              Historico
            </Text>
          </Pressable>
        </View>

        {/* Conteudo da Tab */}
        {activeTab === 'info' && (
          <View style={styles.tabContent}>
            {/* Descricao */}
            <Card style={styles.section}>
              <CardHeader>
                <CardTitle>Descricao</CardTitle>
              </CardHeader>
              <CardContent>
                <Text style={[styles.description, { color: colors.foreground }]}>
                  {ticket.description || 'Sem descricao'}
                </Text>
              </CardContent>
            </Card>

            {/* Informacoes */}
            <Card style={styles.section}>
              <CardHeader>
                <CardTitle>Informacoes</CardTitle>
              </CardHeader>
              <CardContent style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>
                    Unidade
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.foreground }]}>
                    {ticket.unitName || 'Nao especificada'}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>
                    Criado por
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.foreground }]}>
                    {ticket.createdByName}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>
                    Responsavel
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.foreground }]}>
                    {ticket.assignedToName || 'Nao atribuido'}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>
                    Criado em
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.foreground }]}>
                    {formatDate(ticket.createdAt)}
                  </Text>
                </View>
                {ticket.dueDate && (
                  <View style={styles.infoItem}>
                    <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>
                      Previsao
                    </Text>
                    <Text style={[styles.infoValue, { color: colors.foreground }]}>
                      {formatDate(ticket.dueDate)}
                    </Text>
                  </View>
                )}
                {ticket.resolvedAt && (
                  <View style={styles.infoItem}>
                    <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>
                      Resolvido em
                    </Text>
                    <Text style={[styles.infoValue, { color: colors.foreground }]}>
                      {formatDate(ticket.resolvedAt)}
                    </Text>
                  </View>
                )}
              </CardContent>
            </Card>

            {/* Anexos */}
            {attachments.length > 0 && (
              <Card style={styles.section}>
                <CardHeader>
                  <CardTitle>Anexos ({attachments.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <View style={styles.attachmentsGrid}>
                    {attachments.map((attachment) => (
                      <Pressable
                        key={attachment.id}
                        style={styles.attachmentItem}
                        onPress={() => setPreviewImage(attachment.url)}
                      >
                        <Image
                          source={{ uri: attachment.url }}
                          style={styles.attachmentImage}
                          resizeMode="cover"
                        />
                      </Pressable>
                    ))}
                  </View>
                </CardContent>
              </Card>
            )}

            {/* Motivo de negacao */}
            {ticket.denialReason && (
              <Card style={[styles.section, { borderColor: themeColors.destructive.DEFAULT }]}>
                <CardHeader>
                  <CardTitle>Motivo da Negacao</CardTitle>
                </CardHeader>
                <CardContent>
                  <Text style={[styles.description, { color: themeColors.destructive.DEFAULT }]}>
                    {ticket.denialReason}
                  </Text>
                </CardContent>
              </Card>
            )}
          </View>
        )}

        {activeTab === 'comments' && (
          <View style={styles.tabContentFull}>
            <CommentsList
              comments={comments}
              onAddComment={handleAddComment}
              addingComment={addingComment}
            />
          </View>
        )}

        {activeTab === 'history' && (
          <View style={styles.tabContentFull}>
            <TicketTimeline history={history} />
          </View>
        )}
      </ScrollView>

      {/* Modal de preview de imagem */}
      <Modal
        visible={!!previewImage}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        <Pressable style={styles.previewOverlay} onPress={() => setPreviewImage(null)}>
          {previewImage && (
            <View style={styles.previewContainer}>
              <Image
                source={{ uri: previewImage }}
                style={styles.previewImage}
                resizeMode="contain"
              />
              <Pressable
                style={styles.previewCloseButton}
                onPress={() => setPreviewImage(null)}
              >
                <Ionicons name="close" size={30} color="white" />
              </Pressable>
            </View>
          )}
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing[3],
    fontSize: typography.sizes.base,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: spacing[4],
    gap: spacing[2],
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketNumber: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as '600',
  },
  badges: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  ticketTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold as '700',
    lineHeight: 28,
  },
  department: {
    fontSize: typography.sizes.base,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: spacing[4],
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    marginRight: spacing[2],
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: themeColors.primary.DEFAULT,
  },
  tabText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium as '500',
  },
  tabContent: {
    padding: spacing[4],
    gap: spacing[4],
  },
  tabContentFull: {
    flex: 1,
  },
  section: {
    marginBottom: 0,
  },
  description: {
    fontSize: typography.sizes.base,
    lineHeight: 24,
  },
  infoGrid: {
    gap: spacing[3],
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: typography.sizes.sm,
  },
  infoValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium as '500',
  },
  attachmentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  attachmentItem: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
  },
  attachmentImage: {
    width: '100%',
    height: '100%',
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '80%',
  },
  previewCloseButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    padding: spacing[2],
  },
});
