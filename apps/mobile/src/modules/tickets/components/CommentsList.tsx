/**
 * Gapp Mobile - CommentsList Component
 *
 * Lista de comentarios com input para novo comentario.
 */

import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors, typography, spacing, colors as themeColors } from '../../../theme';
import { Button, Card, CardContent } from '../../../components/ui';
import type { TicketComment } from '../types/tickets.types';

interface CommentsListProps {
  comments: TicketComment[];
  onAddComment: (content: string) => Promise<void>;
  addingComment: boolean;
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

  if (diffMinutes < 1) return 'Agora';
  if (diffMinutes < 60) return `${diffMinutes} min`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays} dias`;

  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

/**
 * Gera iniciais do nome
 */
function getInitials(name: string): string {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Gera cor baseada no nome
 */
function getAvatarColor(name: string): string {
  const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function CommentItem({ comment }: { comment: TicketComment }) {
  const colors = useThemeColors();
  const initials = getInitials(comment.createdByName);
  const avatarColor = getAvatarColor(comment.createdByName);

  return (
    <View style={styles.commentItem}>
      <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={[styles.commentAuthor, { color: colors.foreground }]}>
            {comment.createdByName}
          </Text>
          <Text style={[styles.commentDate, { color: colors.mutedForeground }]}>
            {formatRelativeDate(comment.createdAt)}
          </Text>
        </View>
        <Text style={[styles.commentText, { color: colors.foreground }]}>
          {comment.content}
        </Text>
        {comment.isInternal && (
          <View style={styles.internalBadge}>
            <Ionicons name="lock-closed" size={10} color={themeColors.warning.DEFAULT} />
            <Text style={styles.internalText}>Interno</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export function CommentsList({ comments, onAddComment, addingComment }: CommentsListProps) {
  const colors = useThemeColors();
  const [newComment, setNewComment] = useState('');

  const handleSubmit = useCallback(async () => {
    if (!newComment.trim()) return;

    try {
      await onAddComment(newComment.trim());
      setNewComment('');
    } catch {
      // Erro tratado no parent
    }
  }, [newComment, onAddComment]);

  const renderComment = useCallback(
    ({ item }: { item: TicketComment }) => <CommentItem comment={item} />,
    []
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Lista de comentarios */}
      {comments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubble-outline" size={32} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Nenhum comentario ainda
          </Text>
        </View>
      ) : (
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={renderComment}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Input novo comentario */}
      <Card style={styles.inputCard}>
        <CardContent style={styles.inputContent}>
          <TextInput
            style={[
              styles.input,
              { color: colors.foreground, backgroundColor: colors.muted },
            ]}
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Escreva um comentario..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            maxLength={500}
            editable={!addingComment}
          />
          <Button
            size="sm"
            onPress={handleSubmit}
            disabled={!newComment.trim() || addingComment}
            loading={addingComment}
            style={styles.sendButton}
          >
            <Ionicons name="send" size={18} color="white" />
          </Button>
        </CardContent>
      </Card>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: spacing[4],
    paddingBottom: spacing[2],
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
  commentItem: {
    flexDirection: 'row',
    marginBottom: spacing[4],
    gap: spacing[3],
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold as '600',
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[1],
  },
  commentAuthor: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium as '500',
  },
  commentDate: {
    fontSize: typography.sizes.xs,
  },
  commentText: {
    fontSize: typography.sizes.base,
    lineHeight: 22,
  },
  internalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing[1],
  },
  internalText: {
    fontSize: typography.sizes.xs,
    color: themeColors.warning.DEFAULT,
  },
  inputCard: {
    margin: spacing[4],
    marginTop: 0,
  },
  inputContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing[2],
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 8,
    fontSize: typography.sizes.base,
  },
  sendButton: {
    width: 44,
    height: 44,
    paddingHorizontal: 0,
  },
});
