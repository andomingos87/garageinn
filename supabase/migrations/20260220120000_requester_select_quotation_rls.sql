-- Migration: Allow ticket requester to select quotation
-- Date: 2026-02-20
-- Description: RLS only permitted quotation creator to update. Solicitante (ticket requester)
-- must be able to set is_selected/status on quotations of their ticket.
-- Adds UPDATE policy for ticket.created_by = auth.uid(), keeping existing creator-only policy.

CREATE POLICY "requester_can_select_quotation"
ON public.ticket_quotations
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.tickets t
    WHERE t.id = ticket_quotations.ticket_id
      AND t.created_by = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.tickets t
    WHERE t.id = ticket_quotations.ticket_id
      AND t.created_by = auth.uid()
  )
);
