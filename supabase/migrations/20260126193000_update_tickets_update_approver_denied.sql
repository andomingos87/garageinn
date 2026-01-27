-- Update tickets_update_approver to allow denied
-- Align RLS policy with tickets_status_check constraint

DROP POLICY IF EXISTS "tickets_update_approver" ON public.tickets;

CREATE POLICY "tickets_update_approver"
ON public.tickets
FOR UPDATE
TO authenticated
USING (
  is_admin()
  OR can_approve_ticket(id, auth.uid())
)
WITH CHECK (
  is_admin()
  OR (
    can_approve_ticket(id, auth.uid())
    AND status IN (
      'awaiting_approval_supervisor',
      'awaiting_approval_gerente',
      'awaiting_triage',
      'denied'
    )
  )
);
