-- Migration: Fix RLS policies for ticket_quotations
-- Branch: 006-fix-compras-bugs
-- Date: 2026-01-25
-- Description: Allow compradores to manage quotations on tickets

-- ============================================================================
-- POLICY 1: Compradores can INSERT quotations
-- ============================================================================
-- Allows users with Comprador/Supervisor/Gerente roles in Compras or Manutenção
-- departments to insert new quotations.

CREATE POLICY "compradores_can_insert_quotations"
ON public.ticket_quotations
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    INNER JOIN public.roles r ON ur.role_id = r.id
    INNER JOIN public.departments d ON r.department_id = d.id
    WHERE ur.user_id = auth.uid()
      AND d.name IN ('Compras', 'Manutenção')
      AND r.name IN ('Comprador', 'Supervisor', 'Gerente')
  )
);

-- ============================================================================
-- POLICY 2: Compradores can UPDATE their own quotations
-- ============================================================================
-- Allows users to update quotations they created.

CREATE POLICY "compradores_can_update_own_quotations"
ON public.ticket_quotations
FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- ============================================================================
-- POLICY 3: Compradores can DELETE their own quotations
-- ============================================================================
-- Allows users to delete quotations they created.

CREATE POLICY "compradores_can_delete_own_quotations"
ON public.ticket_quotations
FOR DELETE
TO authenticated
USING (created_by = auth.uid());
