-- Migration: Add ticket_purchase_items
-- Date: 2026-02-01
-- Description: Store multiple purchase items per ticket

-- ============================================================================
-- Table: ticket_purchase_items
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ticket_purchase_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_of_measure text,
  estimated_price numeric(12,2),
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ticket_purchase_items_ticket_id
  ON public.ticket_purchase_items(ticket_id);

-- Updated_at trigger
DROP TRIGGER IF EXISTS update_ticket_purchase_items_updated_at ON public.ticket_purchase_items;
CREATE TRIGGER update_ticket_purchase_items_updated_at
  BEFORE UPDATE ON public.ticket_purchase_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Backfill from ticket_purchase_details (idempotent)
-- ============================================================================
INSERT INTO public.ticket_purchase_items (
  ticket_id,
  item_name,
  quantity,
  unit_of_measure,
  estimated_price,
  sort_order
)
SELECT
  tpd.ticket_id,
  tpd.item_name,
  tpd.quantity,
  tpd.unit_of_measure,
  tpd.estimated_price,
  0
FROM public.ticket_purchase_details tpd
WHERE tpd.item_name IS NOT NULL
  AND tpd.quantity IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.ticket_purchase_items tpi
    WHERE tpi.ticket_id = tpd.ticket_id
  );

-- ============================================================================
-- RLS policies
-- ============================================================================
ALTER TABLE public.ticket_purchase_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ticket_purchase_items_select" ON public.ticket_purchase_items;
CREATE POLICY "ticket_purchase_items_select" ON public.ticket_purchase_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.tickets t
      WHERE t.id = ticket_id
        AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid() OR is_admin())
    )
  );

DROP POLICY IF EXISTS "ticket_purchase_items_insert" ON public.ticket_purchase_items;
CREATE POLICY "ticket_purchase_items_insert" ON public.ticket_purchase_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.tickets t
      WHERE t.id = ticket_id
        AND (t.created_by = auth.uid() OR is_admin())
    )
  );

DROP POLICY IF EXISTS "ticket_purchase_items_update_admin" ON public.ticket_purchase_items;
CREATE POLICY "ticket_purchase_items_update_admin" ON public.ticket_purchase_items
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "ticket_purchase_items_delete_admin" ON public.ticket_purchase_items;
CREATE POLICY "ticket_purchase_items_delete_admin" ON public.ticket_purchase_items
  FOR DELETE TO authenticated
  USING (is_admin());
