/**
 * Gapp Mobile - Ticket Attachment Service
 *
 * Servico para upload de anexos de chamados.
 * Reutiliza logica do photoService dos checklists.
 */

import { supabase } from '../../../lib/supabase/client';
import { logger } from '../../../lib/observability';
import type { TicketPhoto, TicketError } from '../types/tickets.types';
import { ATTACHMENT_CONFIG } from '../constants/tickets.constants';

const STORAGE_BUCKET = 'ticket-attachments';

/**
 * Cria um erro tipado
 */
function createAttachmentError(
  code: TicketError['code'],
  message: string,
  originalError?: Error
): TicketError {
  return { code, message, originalError };
}

/**
 * Gera um ID unico para foto
 */
export function generatePhotoId(): string {
  return `photo_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Cria um objeto de foto inicial
 */
export function createPhotoObject(uri: string): TicketPhoto {
  return {
    id: generatePhotoId(),
    uri,
    uploadStatus: 'pending',
  };
}

/**
 * Comprime uma imagem
 */
export async function compressImage(uri: string): Promise<string> {
  try {
    const ImageManipulator = await import('expo-image-manipulator');

    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: ATTACHMENT_CONFIG.photoMaxWidth } }],
      {
        compress: ATTACHMENT_CONFIG.photoQuality,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    logger.info('attachmentService: Image compressed', {
      originalUri: uri,
      compressedUri: result.uri,
    });

    return result.uri;
  } catch {
    logger.warn('attachmentService: expo-image-manipulator not available, using original image');
    return uri;
  }
}

/**
 * Solicita permissao de camera
 */
export async function requestCameraPermission(): Promise<boolean> {
  try {
    const ImagePicker = await import('expo-image-picker');
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    logger.error('attachmentService: Failed to request camera permission', { error });
    return false;
  }
}

/**
 * Solicita permissao de galeria
 */
export async function requestMediaLibraryPermission(): Promise<boolean> {
  try {
    const ImagePicker = await import('expo-image-picker');
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    logger.error('attachmentService: Failed to request media library permission', { error });
    return false;
  }
}

/**
 * Abre a camera ou galeria para selecionar imagem
 */
export async function pickImage(source: 'camera' | 'gallery'): Promise<string | null> {
  try {
    const ImagePicker = await import('expo-image-picker');

    // Solicita permissoes
    if (source === 'camera') {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        logger.warn('attachmentService: Camera permission denied');
        return null;
      }
    } else {
      const hasPermission = await requestMediaLibraryPermission();
      if (!hasPermission) {
        logger.warn('attachmentService: Gallery permission denied');
        return null;
      }
    }

    // Abre picker
    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            quality: 0.8,
          });

    if (result.canceled) {
      logger.info('attachmentService: Image selection cancelled');
      return null;
    }

    logger.info('attachmentService: Image selected', {
      source,
      uri: result.assets[0].uri,
    });

    return result.assets[0].uri;
  } catch (error) {
    logger.error('attachmentService: Failed to pick image', { error });
    throw createAttachmentError('upload_failed', 'Falha ao selecionar imagem', error as Error);
  }
}

/**
 * Faz upload de uma foto para o Supabase Storage
 */
export async function uploadPhoto(
  photo: TicketPhoto,
  ticketId: string,
  onProgress?: (progress: number) => void
): Promise<{ url: string; path: string }> {
  logger.info('attachmentService: Starting upload', {
    photoId: photo.id,
    ticketId,
  });

  try {
    // Comprime a imagem
    const compressedUri = await compressImage(photo.uri);

    // Prepara o arquivo para upload
    const fileName = `${ticketId}/${photo.id}.jpg`;

    // Le o arquivo como blob
    const response = await fetch(compressedUri);
    const blob = await response.blob();

    // Simula progresso (Supabase nao tem callback de progresso nativo)
    onProgress?.(50);

    // Upload para o Supabase Storage
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).upload(fileName, blob, {
      contentType: 'image/jpeg',
      upsert: true,
    });

    if (error) {
      logger.error('attachmentService: Upload failed', { error });
      throw error;
    }

    onProgress?.(100);

    // Gera URL publica
    const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName);

    logger.info('attachmentService: Upload completed', {
      photoId: photo.id,
      path: data.path,
      url: urlData.publicUrl,
    });

    return {
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (error) {
    logger.error('attachmentService: Upload error', { error });
    throw createAttachmentError('upload_failed', 'Falha ao enviar foto', error as Error);
  }
}

/**
 * Faz upload de multiplas fotos
 */
export async function uploadPhotos(
  photos: TicketPhoto[],
  ticketId: string,
  onPhotoProgress?: (photoId: string, progress: number) => void,
  onPhotoComplete?: (photoId: string, url: string) => void,
  onPhotoError?: (photoId: string, error: Error) => void
): Promise<Array<{ photoId: string; url: string; error?: Error }>> {
  const results: Array<{ photoId: string; url: string; error?: Error }> = [];

  for (const photo of photos) {
    try {
      const { url } = await uploadPhoto(photo, ticketId, (progress) =>
        onPhotoProgress?.(photo.id, progress)
      );

      onPhotoComplete?.(photo.id, url);
      results.push({ photoId: photo.id, url });
    } catch (error) {
      onPhotoError?.(photo.id, error as Error);
      results.push({
        photoId: photo.id,
        url: '',
        error: error as Error,
      });
    }
  }

  return results;
}

/**
 * Salva anexo no banco de dados (apos upload)
 */
export async function saveAttachment(
  ticketId: string,
  photoId: string,
  url: string,
  fileName: string
): Promise<void> {
  logger.info('attachmentService: Saving attachment to database', { ticketId, photoId });

  try {
    const { error } = await supabase.from('ticket_attachments').insert({
      ticket_id: ticketId,
      file_name: fileName,
      file_url: url,
      file_size: 0, // Tamanho desconhecido apos upload
      mime_type: 'image/jpeg',
    });

    if (error) {
      logger.error('attachmentService: Failed to save attachment', { error });
      throw error;
    }

    logger.info('attachmentService: Attachment saved', { ticketId });
  } catch (error) {
    logger.error('attachmentService: Failed to save attachment', { error });
    throw createAttachmentError(
      'upload_failed',
      'Falha ao salvar anexo no banco',
      error as Error
    );
  }
}

/**
 * Remove uma foto do Storage
 */
export async function deletePhoto(filePath: string): Promise<void> {
  try {
    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);

    if (error) {
      logger.error('attachmentService: Delete failed', { error });
      throw error;
    }

    logger.info('attachmentService: Photo deleted', { filePath });
  } catch (error) {
    logger.error('attachmentService: Delete error', { error });
    throw createAttachmentError('upload_failed', 'Falha ao remover foto', error as Error);
  }
}

/**
 * Opcoes de fonte de imagem
 */
export function getImageSourceOptions() {
  return [
    { key: 'camera' as const, label: 'Tirar Foto', icon: 'camera-outline' },
    { key: 'gallery' as const, label: 'Escolher da Galeria', icon: 'images-outline' },
  ];
}
