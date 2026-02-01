-- Migration: Fix RLS for ticket_purchase_items select
-- Date: 2026-02-01
-- Description: Align item visibility with ticket visibility

DROP POLICY IF EXISTS "ticket_purchase_items_select" ON public.ticket_purchase_items;
CREATE POLICY "ticket_purchase_items_select" ON public.ticket_purchase_items
  FOR SELECT TO authenticated
  USING (can_view_ticket(ticket_id));
