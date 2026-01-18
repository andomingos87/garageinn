/**
 * Gapp Mobile - SupervisionSummary Component
 *
 * Componente para exibir o resumo do checklist de supervisao
 * com captura de assinaturas (encarregado e supervisor).
 */

import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors, typography, spacing, colors as themeColors } from '../../../theme';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  SignaturePad,
} from '../../../components/ui';
import {
  ChecklistQuestion,
  ChecklistAnswer,
  SupervisionSignatureData,
} from '../types/checklist.types';

interface SupervisionSummaryProps {
  templateName: string;
  unitName: string;
  questions: ChecklistQuestion[];
  answers: Record<string, ChecklistAnswer>;
  generalObservations: string;
  onObservationsChange: (text: string) => void;
  onSubmit: (signatureData: SupervisionSignatureData) => void;
  onBack: () => void;
  isSubmitting: boolean;
  isValid: boolean;
}

export function SupervisionSummary({
  templateName,
  unitName,
  questions,
  answers,
  generalObservations,
  onObservationsChange,
  onSubmit,
  onBack,
  isSubmitting,
  isValid,
}: SupervisionSummaryProps) {
  const colors = useThemeColors();

  // Estados de assinatura
  const [attendantName, setAttendantName] = useState('');
  const [attendantSignature, setAttendantSignature] = useState<string | null>(null);
  const [supervisorSignature, setSupervisorSignature] = useState<string | null>(null);

  // Contadores
  const totalQuestions = questions.length;
  const answeredQuestions = questions.filter((q) => {
    const answer = answers[q.id];
    return answer?.answer !== null && answer?.answer !== undefined;
  }).length;
  const yesCount = questions.filter((q) => answers[q.id]?.answer === true).length;
  const noCount = questions.filter((q) => answers[q.id]?.answer === false).length;
  const conformityPercent =
    totalQuestions > 0 ? Math.round((yesCount / totalQuestions) * 100) : 0;

  // Nao-conformidades
  const nonConformities = questions.filter((q) => answers[q.id]?.answer === false);

  // Validacao de assinaturas
  const isSignatureValid =
    attendantName.trim().length > 0 &&
    attendantSignature !== null &&
    supervisorSignature !== null;

  const canSubmit = isValid && isSignatureValid;

  // Handler de submit
  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;

    onSubmit({
      attendantName: attendantName.trim(),
      attendantSignature: attendantSignature!,
      supervisorSignature: supervisorSignature!,
    });
  }, [canSubmit, attendantName, attendantSignature, supervisorSignature, onSubmit]);

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoid}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Cabecalho */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Resumo da Supervisao
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Revise as respostas e colete as assinaturas
          </Text>
        </View>

        {/* Info do checklist */}
        <Card style={styles.infoCard}>
          <CardContent>
            <View style={styles.infoRow}>
              <Ionicons
                name="clipboard-outline"
                size={20}
                color={themeColors.primary.DEFAULT}
              />
              <Text style={[styles.infoText, { color: colors.foreground }]}>
                {templateName}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons
                name="business-outline"
                size={20}
                color={themeColors.primary.DEFAULT}
              />
              <Text style={[styles.infoText, { color: colors.foreground }]}>
                {unitName}
              </Text>
            </View>
          </CardContent>
        </Card>

        {/* Estatisticas */}
        <Card style={styles.statsCard}>
          <CardHeader>
            <CardTitle>Resultado</CardTitle>
          </CardHeader>
          <CardContent>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: themeColors.primary.DEFAULT }]}>
                  {answeredQuestions}/{totalQuestions}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                  Respondidas
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: themeColors.success.DEFAULT }]}>
                  {yesCount}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                  Conforme
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: themeColors.destructive.DEFAULT }]}>
                  {noCount}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                  Nao-conforme
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text
                  style={[
                    styles.statValue,
                    {
                      color:
                        conformityPercent >= 80
                          ? themeColors.success.DEFAULT
                          : conformityPercent >= 50
                            ? themeColors.warning.DEFAULT
                            : themeColors.destructive.DEFAULT,
                    },
                  ]}
                >
                  {conformityPercent}%
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                  Conformidade
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Nao-conformidades */}
        {nonConformities.length > 0 && (
          <Card style={styles.nonConformitiesCard}>
            <CardHeader>
              <View style={styles.nonConformitiesHeader}>
                <CardTitle>Nao-conformidades</CardTitle>
                <Badge variant="destructive">{nonConformities.length}</Badge>
              </View>
            </CardHeader>
            <CardContent>
              {nonConformities.map((question, index) => {
                const answer = answers[question.id];
                return (
                  <View
                    key={question.id}
                    style={[
                      styles.nonConformityItem,
                      index < nonConformities.length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.nonConformityIcon}>
                      <Ionicons
                        name="alert-circle"
                        size={20}
                        color={themeColors.destructive.DEFAULT}
                      />
                    </View>
                    <View style={styles.nonConformityContent}>
                      <Text style={[styles.nonConformityText, { color: colors.foreground }]}>
                        {question.questionText}
                      </Text>
                      {answer?.observation && (
                        <Text
                          style={[styles.nonConformityObs, { color: colors.mutedForeground }]}
                        >
                          Obs: {answer.observation}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Observacoes gerais */}
        <Card style={styles.observationsCard}>
          <CardHeader>
            <CardTitle>Observacoes Gerais</CardTitle>
          </CardHeader>
          <CardContent>
            <TextInput
              style={[
                styles.observationsInput,
                {
                  backgroundColor: colors.input,
                  color: colors.foreground,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Adicione observacoes gerais sobre a supervisao..."
              placeholderTextColor={colors.mutedForeground}
              value={generalObservations}
              onChangeText={onObservationsChange}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </CardContent>
        </Card>

        {/* Secao de Assinaturas */}
        <Card style={styles.signaturesCard}>
          <CardHeader>
            <CardTitle>Assinaturas</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Nome do encarregado */}
            <View style={styles.attendantNameContainer}>
              <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
                Nome do Encarregado <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.nameInput,
                  {
                    backgroundColor: colors.input,
                    color: colors.foreground,
                    borderColor: attendantName.trim() ? colors.border : themeColors.warning.DEFAULT,
                  },
                ]}
                placeholder="Digite o nome completo do encarregado"
                placeholderTextColor={colors.mutedForeground}
                value={attendantName}
                onChangeText={setAttendantName}
                autoCapitalize="words"
              />
            </View>

            {/* Assinatura do encarregado */}
            <SignaturePad
              label="Assinatura do Encarregado"
              value={attendantSignature}
              onChange={setAttendantSignature}
              required
              height={180}
              error={
                !attendantSignature && attendantName.trim().length > 0
                  ? 'Assinatura obrigatoria'
                  : undefined
              }
            />

            {/* Assinatura do supervisor */}
            <SignaturePad
              label="Assinatura do Supervisor"
              value={supervisorSignature}
              onChange={setSupervisorSignature}
              required
              height={180}
              error={
                !supervisorSignature && attendantSignature
                  ? 'Assinatura obrigatoria'
                  : undefined
              }
            />
          </CardContent>
        </Card>

        {/* Aviso de validacao */}
        {!canSubmit && (
          <View style={[styles.validationWarning, { backgroundColor: themeColors.warning.light }]}>
            <Ionicons name="warning-outline" size={20} color={themeColors.warning.dark} />
            <Text style={[styles.validationText, { color: themeColors.warning.dark }]}>
              {!isValid
                ? 'Responda todas as perguntas obrigatorias.'
                : !attendantName.trim()
                  ? 'Informe o nome do encarregado.'
                  : !attendantSignature
                    ? 'Colete a assinatura do encarregado.'
                    : 'Colete a assinatura do supervisor.'}
            </Text>
          </View>
        )}

        {/* Botoes */}
        <View style={styles.buttons}>
          <Button
            variant="outline"
            onPress={onBack}
            style={styles.backButton}
            disabled={isSubmitting}
          >
            Voltar e Revisar
          </Button>

          <Button
            variant="default"
            onPress={handleSubmit}
            style={styles.submitButton}
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Finalizar Supervisao'}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  header: {
    marginBottom: spacing[4],
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold as '700',
  },
  subtitle: {
    fontSize: typography.sizes.base,
    marginTop: spacing[1],
  },
  infoCard: {
    marginBottom: spacing[4],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[2],
  },
  infoText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium as '500',
  },
  statsCard: {
    marginBottom: spacing[4],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  statValue: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold as '700',
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    marginTop: spacing[1],
  },
  nonConformitiesCard: {
    marginBottom: spacing[4],
  },
  nonConformitiesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nonConformityItem: {
    flexDirection: 'row',
    paddingVertical: spacing[3],
  },
  nonConformityIcon: {
    marginRight: spacing[3],
    paddingTop: 2,
  },
  nonConformityContent: {
    flex: 1,
  },
  nonConformityText: {
    fontSize: typography.sizes.base,
  },
  nonConformityObs: {
    fontSize: typography.sizes.sm,
    fontStyle: 'italic',
    marginTop: spacing[1],
  },
  observationsCard: {
    marginBottom: spacing[4],
  },
  observationsInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing[3],
    fontSize: typography.sizes.base,
    minHeight: 100,
  },
  signaturesCard: {
    marginBottom: spacing[4],
  },
  attendantNameContainer: {
    marginBottom: spacing[4],
  },
  fieldLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium as '500',
    marginBottom: spacing[2],
  },
  required: {
    color: themeColors.destructive.DEFAULT,
  },
  nameInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing[3],
    fontSize: typography.sizes.base,
  },
  validationWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    padding: spacing[3],
    borderRadius: 8,
    marginBottom: spacing[4],
  },
  validationText: {
    flex: 1,
    fontSize: typography.sizes.sm,
  },
  buttons: {
    gap: spacing[3],
  },
  backButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});
