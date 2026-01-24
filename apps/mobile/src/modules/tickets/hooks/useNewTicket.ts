/**
 * Gapp Mobile - useNewTicket Hook
 *
 * Hook para gerenciar criacao de novo chamado.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import * as ticketsService from '../services/ticketsService';
import * as attachmentService from '../services/attachmentService';
import type {
  Ticket,
  TicketType,
  TicketCategory,
  Unit,
  TicketPhoto,
  PerceivedUrgency,
} from '../types/tickets.types';
import { TICKET_TYPE_TO_DEPARTMENT } from '../constants/tickets.constants';
import { logger } from '../../../lib/observability';

interface UseNewTicketOptions {
  ticketType: TicketType;
  onSuccess?: (ticket: Ticket) => void;
}

interface FormErrors {
  title?: string;
  description?: string;
  categoryId?: string;
}

interface UseNewTicketReturn {
  // Campos do formulario
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  categoryId: string;
  setCategoryId: (value: string) => void;
  unitId: string;
  setUnitId: (value: string) => void;
  perceivedUrgency: PerceivedUrgency | undefined;
  setPerceivedUrgency: (value: PerceivedUrgency | undefined) => void;

  // Fotos
  photos: TicketPhoto[];
  addPhoto: (photo: TicketPhoto) => void;
  removePhoto: (photoId: string) => void;
  updatePhotoStatus: (photoId: string, status: TicketPhoto['uploadStatus'], url?: string) => void;

  // Dados auxiliares
  categories: TicketCategory[];
  units: Unit[];
  loadingData: boolean;
  departmentId: string;

  // Validacao
  errors: FormErrors;
  validate: () => boolean;
  clearErrors: () => void;

  // Submissao
  submit: () => Promise<void>;
  submitting: boolean;
  submitError: string | null;

  // Reset
  reset: () => void;
}

export function useNewTicket(options: UseNewTicketOptions): UseNewTicketReturn {
  const { ticketType, onSuccess } = options;
  const departmentId = TICKET_TYPE_TO_DEPARTMENT[ticketType];

  // Campos do formulario
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [perceivedUrgency, setPerceivedUrgency] = useState<PerceivedUrgency | undefined>(undefined);

  // Fotos
  const [photos, setPhotos] = useState<TicketPhoto[]>([]);

  // Dados auxiliares
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Validacao
  const [errors, setErrors] = useState<FormErrors>({});

  // Submissao
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isMounted = useRef(true);

  // Carregar dados auxiliares
  const loadAuxiliaryData = useCallback(async () => {
    setLoadingData(true);

    try {
      const [categoriesData, unitsData] = await Promise.all([
        ticketsService.fetchCategories(departmentId),
        ticketsService.fetchUserUnits(),
      ]);

      if (!isMounted.current) return;

      setCategories(categoriesData);
      setUnits(unitsData);

      // Se so tem uma unidade, seleciona automaticamente
      if (unitsData.length === 1) {
        setUnitId(unitsData[0].id);
      }

      logger.info('useNewTicket: Auxiliary data loaded', {
        categoriesCount: categoriesData.length,
        unitsCount: unitsData.length,
      });
    } catch (err) {
      logger.error('useNewTicket: Failed to load auxiliary data', { error: err });
    } finally {
      if (isMounted.current) {
        setLoadingData(false);
      }
    }
  }, [departmentId]);

  // Adicionar foto
  const addPhoto = useCallback((photo: TicketPhoto) => {
    setPhotos((prev) => [...prev, photo]);
  }, []);

  // Remover foto
  const removePhoto = useCallback((photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  }, []);

  // Atualizar status da foto
  const updatePhotoStatus = useCallback(
    (photoId: string, status: TicketPhoto['uploadStatus'], url?: string) => {
      setPhotos((prev) =>
        prev.map((p) => (p.id === photoId ? { ...p, uploadStatus: status, uploadedUrl: url } : p))
      );
    },
    []
  );

  // Validacao
  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Titulo e obrigatorio';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Titulo deve ter no minimo 3 caracteres';
    }

    if (!description.trim()) {
      newErrors.description = 'Descricao e obrigatoria';
    } else if (description.trim().length < 10) {
      newErrors.description = 'Descricao deve ter no minimo 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title, description]);

  // Limpar erros
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Submit
  const submit = useCallback(async () => {
    if (!validate()) {
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Criar o chamado
      const ticket = await ticketsService.createTicket({
        title: title.trim(),
        description: description.trim(),
        departmentId,
        categoryId: categoryId || undefined,
        unitId: unitId || undefined,
        perceivedUrgency,
      });

      if (!isMounted.current) return;

      logger.info('useNewTicket: Ticket created', { ticketId: ticket.id });

      // 2. Upload das fotos (se houver)
      if (photos.length > 0) {
        const pendingPhotos = photos.filter((p) => p.uploadStatus === 'pending');

        for (const photo of pendingPhotos) {
          try {
            updatePhotoStatus(photo.id, 'uploading');

            const { url } = await attachmentService.uploadPhoto(photo, ticket.id);

            // Salvar no banco
            await attachmentService.saveAttachment(ticket.id, photo.id, url, `${photo.id}.jpg`);

            updatePhotoStatus(photo.id, 'uploaded', url);

            logger.info('useNewTicket: Photo uploaded', { photoId: photo.id, ticketId: ticket.id });
          } catch (err) {
            updatePhotoStatus(photo.id, 'failed');
            logger.error('useNewTicket: Photo upload failed', { photoId: photo.id, error: err });
            // Continua com as outras fotos
          }
        }
      }

      // 3. Callback de sucesso
      onSuccess?.(ticket);
    } catch (err) {
      if (!isMounted.current) return;
      const message = err instanceof Error ? err.message : 'Erro ao criar chamado';
      setSubmitError(message);
      logger.error('useNewTicket: Failed to create ticket', { error: err });
    } finally {
      if (isMounted.current) {
        setSubmitting(false);
      }
    }
  }, [
    validate,
    title,
    description,
    departmentId,
    categoryId,
    unitId,
    perceivedUrgency,
    photos,
    updatePhotoStatus,
    onSuccess,
  ]);

  // Reset
  const reset = useCallback(() => {
    setTitle('');
    setDescription('');
    setCategoryId('');
    setUnitId(units.length === 1 ? units[0].id : '');
    setPerceivedUrgency(undefined);
    setPhotos([]);
    setErrors({});
    setSubmitError(null);
  }, [units]);

  // Carregar dados ao montar
  useEffect(() => {
    loadAuxiliaryData();
  }, [loadAuxiliaryData]);

  // Cleanup
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    // Campos
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

    // Fotos
    photos,
    addPhoto,
    removePhoto,
    updatePhotoStatus,

    // Dados auxiliares
    categories,
    units,
    loadingData,
    departmentId,

    // Validacao
    errors,
    validate,
    clearErrors,

    // Submissao
    submit,
    submitting,
    submitError,

    // Reset
    reset,
  };
}
