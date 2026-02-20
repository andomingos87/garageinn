-- Migration: Add parent ticket support and purchase approver function
-- Adds parent_ticket_id and origin_ticket_type columns to tickets,
-- defines can_view_ticket() (referenced but never created), creates
-- get_purchase_approver(), and adds child-ticket visibility RLS policy.

-- ============================================================
-- 1.1  Add columns to tickets
-- ============================================================

ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS parent_ticket_id uuid REFERENCES public.tickets(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS origin_ticket_type text;

CREATE INDEX IF NOT EXISTS idx_tickets_parent_ticket_id
  ON public.tickets(parent_ticket_id);

-- ============================================================
-- 1.2  can_view_ticket(p_ticket_id uuid)
-- Consolidates all visibility rules for a single ticket.
-- SECURITY DEFINER so it can be called from RLS without recursion.
-- ============================================================

CREATE OR REPLACE FUNCTION public.can_view_ticket(p_ticket_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  v_ticket RECORD;
BEGIN
  SELECT created_by, assigned_to, department_id, unit_id
    INTO v_ticket
    FROM tickets
   WHERE id = p_ticket_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Creator or assignee
  IF v_ticket.created_by = auth.uid() OR v_ticket.assigned_to = auth.uid() THEN
    RETURN true;
  END IF;

  -- Admin (includes Diretor)
  IF is_admin() THEN
    RETURN true;
  END IF;

  -- User has a role in the same department as the ticket
  IF EXISTS (
    SELECT 1
      FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
     WHERE ur.user_id = auth.uid()
       AND r.department_id = v_ticket.department_id
  ) THEN
    RETURN true;
  END IF;

  -- User is linked to the ticket's unit
  IF v_ticket.unit_id IS NOT NULL AND EXISTS (
    SELECT 1
      FROM user_units uu
     WHERE uu.user_id = auth.uid()
       AND uu.unit_id = v_ticket.unit_id
  ) THEN
    RETURN true;
  END IF;

  -- Gerente de Operações can see tickets created by Operações line staff
  IF is_operacoes_gerente() AND is_operacoes_creator(v_ticket.created_by) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

COMMENT ON FUNCTION public.can_view_ticket(uuid) IS
  'Returns true when the authenticated user is allowed to view the given ticket. '
  'Consolidates creator, assignee, admin, department, unit, and Operações-manager rules. '
  'Uses SECURITY DEFINER to avoid RLS recursion.';

-- ============================================================
-- 1.3  get_purchase_approver(p_created_by uuid)
-- Determines the approving role for a purchase ticket based on
-- the creator''s role: Gerente → Diretor, otherwise → Gerente.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_purchase_approver(p_created_by uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  v_is_gerente boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
      FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
     WHERE ur.user_id = p_created_by
       AND r.name = 'Gerente'
       AND r.is_global = false
  ) INTO v_is_gerente;

  IF v_is_gerente THEN
    RETURN 'Diretor';
  ELSE
    RETURN 'Gerente';
  END IF;
END;
$$;

COMMENT ON FUNCTION public.get_purchase_approver(uuid) IS
  'Returns the role that should approve a purchase ticket. '
  'If the creator holds a department-level Gerente role, returns ''Diretor''; otherwise returns ''Gerente''.';

-- ============================================================
-- 1.4  RLS policy: child tickets inherit parent visibility
-- ============================================================

DROP POLICY IF EXISTS "tickets_select_child_of_visible_parent" ON public.tickets;
CREATE POLICY "tickets_select_child_of_visible_parent" ON public.tickets
  FOR SELECT TO authenticated
  USING (
    parent_ticket_id IS NOT NULL
    AND can_view_ticket(parent_ticket_id)
  );
