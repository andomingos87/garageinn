/**
 * Gapp Mobile - SignaturePad Component
 *
 * Componente para captura de assinatura digital usando touch.
 * Baseado em react-native-signature-canvas.
 */

import React, { useRef, useCallback, useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors, typography, spacing, colors as themeColors } from '../../theme';

export interface SignaturePadProps {
  /** Label exibido acima do pad */
  label: string;
  /** Valor atual da assinatura (base64) */
  value?: string | null;
  /** Callback quando assinatura muda */
  onChange: (dataUrl: string | null) => void;
  /** Altura do pad em pixels */
  height?: number;
  /** Se o componente está desabilitado */
  disabled?: boolean;
  /** Se a assinatura é obrigatória */
  required?: boolean;
  /** Callback quando limpar */
  onClear?: () => void;
  /** Mensagem de erro */
  error?: string;
}

/**
 * Componente de captura de assinatura digital.
 *
 * @example
 * ```tsx
 * <SignaturePad
 *   label="Assinatura do Supervisor"
 *   value={signature}
 *   onChange={setSignature}
 *   required
 * />
 * ```
 */
export function SignaturePad({
  label,
  value,
  onChange,
  height = 200,
  disabled = false,
  required = false,
  onClear,
  error,
}: SignaturePadProps) {
  const colors = useThemeColors();
  const signatureRef = useRef<React.ElementRef<typeof SignatureCanvas>>(null);
  const [hasSignature, setHasSignature] = useState(!!value);

  // Configuracao do estilo do canvas
  const webStyle = `
    .m-signature-pad {
      box-shadow: none;
      border: none;
      background-color: transparent;
    }
    .m-signature-pad--body {
      border: none;
    }
    .m-signature-pad--footer {
      display: none;
    }
    body, html {
      background-color: transparent;
    }
  `;

  // Quando assinatura termina
  const handleEnd = useCallback(() => {
    signatureRef.current?.readSignature();
  }, []);

  // Recebe a assinatura em base64
  const handleOK = useCallback(
    (signature: string) => {
      if (signature && signature !== 'data:,') {
        setHasSignature(true);
        onChange(signature);
      }
    },
    [onChange]
  );

  // Quando canvas esta vazio
  const handleEmpty = useCallback(() => {
    setHasSignature(false);
    onChange(null);
  }, [onChange]);

  // Limpar assinatura
  const handleClear = useCallback(() => {
    signatureRef.current?.clearSignature();
    setHasSignature(false);
    onChange(null);
    onClear?.();
  }, [onChange, onClear]);

  // Carregar assinatura existente
  const handleData = useCallback(
    (data: string) => {
      if (data) {
        setHasSignature(true);
      }
    },
    []
  );

  return (
    <View style={styles.container}>
      {/* Label */}
      <View style={styles.labelContainer}>
        <Text style={[styles.label, { color: colors.foreground }]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
        {hasSignature && (
          <View style={styles.capturedBadge}>
            <Ionicons name="checkmark-circle" size={16} color={themeColors.success.DEFAULT} />
            <Text style={[styles.capturedText, { color: themeColors.success.DEFAULT }]}>
              Capturada
            </Text>
          </View>
        )}
      </View>

      {/* Canvas de assinatura */}
      <View
        style={[
          styles.canvasContainer,
          {
            height,
            backgroundColor: colors.card,
            borderColor: error ? themeColors.destructive.DEFAULT : colors.border,
          },
          disabled && styles.disabled,
        ]}
      >
        {disabled ? (
          <View style={styles.disabledOverlay}>
            {value ? (
              <Text style={[styles.disabledText, { color: colors.mutedForeground }]}>
                Assinatura salva
              </Text>
            ) : (
              <Text style={[styles.disabledText, { color: colors.mutedForeground }]}>
                Desabilitado
              </Text>
            )}
          </View>
        ) : (
          <SignatureCanvas
            ref={signatureRef}
            onEnd={handleEnd}
            onOK={handleOK}
            onEmpty={handleEmpty}
            onGetData={handleData}
            webStyle={webStyle}
            backgroundColor="transparent"
            penColor={colors.foreground}
            dataURL={value || undefined}
            descriptionText=""
            clearText=""
            confirmText=""
            autoClear={false}
            imageType="image/png"
          />
        )}

        {/* Linha guia */}
        {!disabled && !hasSignature && (
          <View style={styles.guideContainer} pointerEvents="none">
            <View style={[styles.guideLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.guideText, { color: colors.mutedForeground }]}>
              Assine aqui
            </Text>
          </View>
        )}
      </View>

      {/* Erro */}
      {error && (
        <Text style={[styles.errorText, { color: themeColors.destructive.DEFAULT }]}>
          {error}
        </Text>
      )}

      {/* Botao limpar */}
      {!disabled && hasSignature && (
        <Pressable
          style={[styles.clearButton, { borderColor: colors.border }]}
          onPress={handleClear}
        >
          <Ionicons name="trash-outline" size={18} color={themeColors.destructive.DEFAULT} />
          <Text style={[styles.clearText, { color: themeColors.destructive.DEFAULT }]}>
            Limpar Assinatura
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  label: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium as '500',
  },
  required: {
    color: themeColors.destructive.DEFAULT,
  },
  capturedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  capturedText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium as '500',
  },
  canvasContainer: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  disabled: {
    opacity: 0.6,
  },
  disabledOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledText: {
    fontSize: typography.sizes.base,
    fontStyle: 'italic',
  },
  guideContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  guideLine: {
    width: '100%',
    height: 1,
    marginBottom: spacing[1],
  },
  guideText: {
    fontSize: typography.sizes.sm,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: typography.sizes.sm,
    marginTop: spacing[1],
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderWidth: 1,
    borderRadius: 8,
    marginTop: spacing[2],
  },
  clearText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium as '500',
  },
});
