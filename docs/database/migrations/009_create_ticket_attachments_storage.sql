-- ============================================
-- Migration 009: Storage para anexos de chamados
-- ============================================

-- Criar bucket de anexos (publico para uso via URL)
INSERT INTO storage.buckets (id, name, public)
VALUES ('ticket-attachments', 'ticket-attachments', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Garantir RLS ativo
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Permitir leitura de anexos vinculados a tickets acessiveis
CREATE POLICY "ticket_attachments_storage_select" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'ticket-attachments'
    AND EXISTS (
      SELECT 1
      FROM public.tickets t
      WHERE (
        t.id::text = split_part(name, '/', 1)
        OR t.id::text = split_part(name, '/', 2)
      )
      AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid() OR is_admin())
    )
  );

-- Permitir upload de anexos vinculados a tickets acessiveis
CREATE POLICY "ticket_attachments_storage_insert" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'ticket-attachments'
    AND EXISTS (
      SELECT 1
      FROM public.tickets t
      WHERE (
        t.id::text = split_part(name, '/', 1)
        OR t.id::text = split_part(name, '/', 2)
      )
      AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid() OR is_admin())
    )
  );

-- Permitir update de anexos vinculados a tickets acessiveis
CREATE POLICY "ticket_attachments_storage_update" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'ticket-attachments'
    AND EXISTS (
      SELECT 1
      FROM public.tickets t
      WHERE (
        t.id::text = split_part(name, '/', 1)
        OR t.id::text = split_part(name, '/', 2)
      )
      AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid() OR is_admin())
    )
  );

-- Permitir delete de anexos vinculados a tickets acessiveis
CREATE POLICY "ticket_attachments_storage_delete" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'ticket-attachments'
    AND EXISTS (
      SELECT 1
      FROM public.tickets t
      WHERE (
        t.id::text = split_part(name, '/', 1)
        OR t.id::text = split_part(name, '/', 2)
      )
      AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid() OR is_admin())
    )
  );
