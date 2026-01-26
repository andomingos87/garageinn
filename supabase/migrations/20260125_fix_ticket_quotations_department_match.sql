-- Migration: Expand department match for ticket_quotations insert RLS
-- Date: 2026-01-25
-- Description: Allow Compras e Manutenção department to insert quotations

ALTER POLICY "compradores_can_insert_quotations"
ON public.ticket_quotations
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    INNER JOIN public.roles r ON ur.role_id = r.id
    INNER JOIN public.departments d ON r.department_id = d.id
    WHERE ur.user_id = auth.uid()
      AND d.name IN ('Compras', 'Manutenção', 'Compras e Manutenção')
      AND r.name IN ('Comprador', 'Supervisor', 'Gerente')
  )
);
