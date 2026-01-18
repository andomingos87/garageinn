/**
 * Gapp Mobile - TicketForm Component
 *
 * Formulario completo para criacao de chamados.
 */

import React, { useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors, typography, spacing, colors as themeColors } from '../../../theme';
import { Button, Input, TextArea, Card, CardContent, Loading } from '../../../components/ui';
import { PhotoPicker } from '../../checklists/components/PhotoPicker';
import { useNewTicket } from '../hooks/useNewTicket';
import * as attachmentService from '../services/attachmentService';
import type { Ticket, TicketType, TicketPhoto } from '../types/tickets.types';
import { TICKET_TYPES, PERCEIVED_URGENCY_OPTIONS } from '../constants/tickets.constants';

interface TicketFormProps {
  ticketType: TicketType;
  onSubmitSuccess: (ticket: Ticket) => void;
  onCancel: () => void;
}

export function TicketForm({ ticketType, onSubmitSuccess, onCancel }: TicketFormProps) {
  const colors = useThemeColors();

  const {
    title,
    setTitle,
    description,
    setDescription,
    categoryId,
    setCategoryId,
    unitId,
    setUnitId,
    perceivedUrgency,
    setPerceivedUrgency,
    photos,
    addPhoto,
    removePhoto,
    categories,
    units,
    loadingData,
    errors,
    submit,
    submitting,
    submitError,
  } = useNewTicket({
    ticketType,
    onSuccess: onSubmitSuccess,
  });

  const ticketTypeInfo = TICKET_TYPES.find((t) => t.key === ticketType);

  // Handler para adicionar foto
  const handlePhotoAdd = useCallback(
    (photo: TicketPhoto) => {
      addPhoto(photo);
    },
    [addPhoto]
  );

  // Handler para remover foto
  const handlePhotoRemove = useCallback(
    (photoId: string) => {
      removePhoto(photoId);
    },
    [removePhoto]
  );

  // Handler para selecionar imagem
  const handlePickImage = useCallback(async (source: 'camera' | 'gallery') => {
    try {
      const uri = await attachmentService.pickImage(source);
      if (uri) {
        const photo = attachmentService.createPhotoObject(uri);
        addPhoto(photo);
      }
    } catch (error) {
      Alert.alert('Erro', 'Nao foi possivel acessar a camera/galeria.');
    }
  }, [addPhoto]);

  // Handler de submit
  const handleSubmit = useCallback(async () => {
    try {
      await submit();
    } catch {
      // Erro ja tratado no hook
    }
  }, [submit]);

  if (loadingData) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Loading size="large" />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
          Carregando...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header com tipo */}
        <View style={styles.header}>
          <View style={[styles.typeIcon, { backgroundColor: ticketTypeInfo?.color || themeColors.primary.DEFAULT }]}>
            <Ionicons
              name={(ticketTypeInfo?.icon as any) || 'document-outline'}
              size={24}
              color="white"
            />
          </View>
          <Text style={[styles.typeLabel, { color: colors.foreground }]}>
            Novo Chamado - {ticketTypeInfo?.label || ticketType}
          </Text>
        </View>

        {/* Erro de submit */}
        {submitError && (
          <Card style={styles.errorCard}>
            <CardContent>
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle" size={20} color={themeColors.destructive.DEFAULT} />
                <Text style={styles.errorText}>{submitError}</Text>
              </View>
            </CardContent>
          </Card>
        )}

        {/* Formulario */}
        <Card>
          <CardContent style={styles.formContent}>
            {/* Titulo */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.foreground }]}>
                Titulo *
              </Text>
              <Input
                value={title}
                onChangeText={setTitle}
                placeholder="Descreva brevemente o problema"
                maxLength={100}
              />
              {errors.title && (
                <Text style={styles.fieldError}>{errors.title}</Text>
              )}
            </View>

            {/* Categoria */}
            {categories.length > 0 && (
              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.foreground }]}>
                  Categoria
                </Text>
                <View style={styles.selectContainer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {categories.map((cat) => (
                      <Button
                        key={cat.id}
                        variant={categoryId === cat.id ? 'default' : 'outline'}
                        size="sm"
                        onPress={() => setCategoryId(cat.id)}
                        style={styles.selectButton}
                      >
                        {cat.name}
                      </Button>
                    ))}
                  </ScrollView>
                </View>
              </View>
            )}

            {/* Unidade */}
            {units.length > 1 && (
              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.foreground }]}>
                  Unidade
                </Text>
                <View style={styles.selectContainer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {units.map((unit) => (
                      <Button
                        key={unit.id}
                        variant={unitId === unit.id ? 'default' : 'outline'}
                        size="sm"
                        onPress={() => setUnitId(unit.id)}
                        style={styles.selectButton}
                      >
                        {unit.name}
                      </Button>
                    ))}
                  </ScrollView>
                </View>
              </View>
            )}

            {/* Descricao */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.foreground }]}>
                Descricao *
              </Text>
              <TextArea
                value={description}
                onChangeText={setDescription}
                placeholder="Descreva detalhadamente o problema, incluindo quando ocorreu e o impacto..."
                numberOfLines={4}
                maxLength={1000}
              />
              {errors.description && (
                <Text style={styles.fieldError}>{errors.description}</Text>
              )}
            </View>

            {/* Urgencia Percebida */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.foreground }]}>
                Urgencia Percebida
              </Text>
              <View style={styles.urgencyContainer}>
                {PERCEIVED_URGENCY_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant={perceivedUrgency === option.value ? 'default' : 'outline'}
                    size="sm"
                    onPress={() => setPerceivedUrgency(option.value)}
                    style={styles.urgencyButton}
                  >
                    {option.label}
                  </Button>
                ))}
              </View>
            </View>

            {/* Fotos */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.foreground }]}>
                Fotos (opcional)
              </Text>
              <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                Adicione fotos para ajudar a ilustrar o problema
              </Text>
              <PhotoPicker
                photos={photos.map((p) => ({
                  id: p.id,
                  uri: p.uri,
                  uploadStatus: p.uploadStatus,
                  uploadedUrl: p.uploadedUrl,
                }))}
                onPhotoAdd={handlePhotoAdd as any}
                onPhotoRemove={handlePhotoRemove}
                maxPhotos={5}
                disabled={submitting}
              />
            </View>
          </CardContent>
        </Card>

        {/* Botoes */}
        <View style={styles.buttons}>
          <Button
            variant="outline"
            onPress={onCancel}
            disabled={submitting}
            style={styles.button}
          >
            Cancelar
          </Button>
          <Button
            onPress={handleSubmit}
            loading={submitting}
            disabled={submitting}
            style={styles.button}
          >
            Criar Chamado
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
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
  },
  loadingText: {
    marginTop: spacing[2],
    fontSize: typography.sizes.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
    gap: spacing[3],
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeLabel: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as '600',
  },
  errorCard: {
    marginBottom: spacing[4],
    borderColor: themeColors.destructive.DEFAULT,
    borderWidth: 1,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  errorText: {
    color: themeColors.destructive.DEFAULT,
    fontSize: typography.sizes.sm,
    flex: 1,
  },
  formContent: {
    gap: spacing[4],
  },
  field: {
    gap: spacing[2],
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium as '500',
  },
  hint: {
    fontSize: typography.sizes.xs,
  },
  fieldError: {
    color: themeColors.destructive.DEFAULT,
    fontSize: typography.sizes.xs,
  },
  selectContainer: {
    marginTop: spacing[1],
  },
  selectButton: {
    marginRight: spacing[2],
  },
  urgencyContainer: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  urgencyButton: {
    flex: 1,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[4],
  },
  button: {
    flex: 1,
  },
});
