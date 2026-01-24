-- ============================================
-- Migration 004: Chamados de TI - Detalhes
-- ============================================

CREATE TABLE IF NOT EXISTS public.ticket_it_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL UNIQUE REFERENCES public.tickets(id) ON DELETE CASCADE,
  equipment_type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.ticket_it_details ENABLE ROW LEVEL SECURITY;

-- Politicas: quem pode ver o ticket pode ver os detalhes
CREATE POLICY "ticket_it_details_select" ON public.ticket_it_details
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tickets t
      WHERE t.id = ticket_id
      AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "ticket_it_details_admin" ON public.ticket_it_details
  FOR ALL TO authenticated
  USING (is_admin());
