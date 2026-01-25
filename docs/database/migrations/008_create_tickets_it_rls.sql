-- ============================================
-- Migration 008: Politicas RLS para detalhes de TI
-- ============================================

ALTER TABLE public.ticket_it_details ENABLE ROW LEVEL SECURITY;

-- Permitir inserir detalhes de TI quando o usuario possui acesso ao ticket
CREATE POLICY "ticket_it_details_insert" ON public.ticket_it_details
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tickets t
      WHERE t.id = ticket_it_details.ticket_id
      AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid() OR is_admin())
    )
  );

-- Permitir atualizar detalhes de TI quando o usuario possui acesso ao ticket
CREATE POLICY "ticket_it_details_update" ON public.ticket_it_details
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tickets t
      WHERE t.id = ticket_it_details.ticket_id
      AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid() OR is_admin())
    )
  );
