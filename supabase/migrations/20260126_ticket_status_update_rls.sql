-- Migration: Allow Compras/Manutenção status updates
-- Date: 2026-01-26
-- Description: Enable status updates for authorized roles in Compras/Manutenção

DROP POLICY IF EXISTS "tickets_update_compras_manutencao" ON public.tickets;

CREATE POLICY "tickets_update_compras_manutencao"
ON public.tickets
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    JOIN public.departments d ON d.id = r.department_id
    WHERE ur.user_id = auth.uid()
      AND d.name IN ('Compras', 'Manutenção', 'Compras e Manutenção')
      AND r.name IN ('Comprador', 'Supervisor', 'Gerente')
  )
  AND EXISTS (
    SELECT 1
    FROM public.departments dept
    WHERE dept.id = tickets.department_id
      AND dept.name IN ('Compras', 'Manutenção', 'Compras e Manutenção')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    JOIN public.departments d ON d.id = r.department_id
    WHERE ur.user_id = auth.uid()
      AND d.name IN ('Compras', 'Manutenção', 'Compras e Manutenção')
      AND r.name IN ('Comprador', 'Supervisor', 'Gerente')
  )
  AND EXISTS (
    SELECT 1
    FROM public.departments dept
    WHERE dept.id = tickets.department_id
      AND dept.name IN ('Compras', 'Manutenção', 'Compras e Manutenção')
  )
);
