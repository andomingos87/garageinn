-- Migration: Fix RLS Approval Policies for Hierarchical Approvals
-- Feature: 008-fix-rls-approval
-- Date: 2026-01-25
--
-- Problem: RLS policies were missing for ticket_approvals UPDATE and tickets UPDATE for approvers.
-- This caused silent failures when users above Manobrista level created tickets.
--
-- Solution: Create helper functions and RLS policies that use `approval_role` (absolute)
-- instead of `approval_level` (relative) to determine if a user can approve a ticket.

-- Drop existing policies first (in case of re-run)
DROP POLICY IF EXISTS "tickets_update_approver" ON public.tickets;
DROP POLICY IF EXISTS "ticket_approvals_update_approver" ON public.ticket_approvals;

-- Drop existing functions if they exist (to recreate with correct logic)
DROP FUNCTION IF EXISTS public.can_approve_ticket(uuid, uuid);
DROP FUNCTION IF EXISTS public.get_user_operacoes_role_name(uuid);

-- ============================================================================
-- FUNCTION: get_user_operacoes_role_name
-- Returns the user's highest Operações department role as a text string.
-- Used by RLS policies to determine if user can approve.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_user_operacoes_role_name(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_role_name text;
BEGIN
  SELECT r.name INTO v_role_name
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  JOIN departments d ON ur.department_id = d.id
  WHERE ur.user_id = p_user_id
    AND d.name = 'Operações'
    AND r.name IN ('Gerente', 'Supervisor', 'Encarregado', 'Manobrista')
  ORDER BY CASE r.name
    WHEN 'Gerente' THEN 4
    WHEN 'Supervisor' THEN 3
    WHEN 'Encarregado' THEN 2
    WHEN 'Manobrista' THEN 1
  END DESC
  LIMIT 1;

  RETURN v_role_name;
END;
$$;

-- ============================================================================
-- FUNCTION: can_approve_ticket
-- Determines if a user can approve a specific ticket based on:
-- 1. The ticket's current status (which role is expected to approve)
-- 2. The user's role in the Operações department
-- Returns true only if user's role matches the expected approval role.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.can_approve_ticket(p_ticket_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_ticket_status text;
  v_expected_role text;
  v_user_role text;
BEGIN
  -- 1. Get ticket status
  SELECT status INTO v_ticket_status
  FROM tickets
  WHERE id = p_ticket_id;

  -- If ticket not found, deny
  IF v_ticket_status IS NULL THEN
    RETURN false;
  END IF;

  -- 2. Map ticket status to expected approval role
  v_expected_role := CASE v_ticket_status
    WHEN 'awaiting_approval_encarregado' THEN 'Encarregado'
    WHEN 'awaiting_approval_supervisor' THEN 'Supervisor'
    WHEN 'awaiting_approval_gerente' THEN 'Gerente'
    ELSE NULL
  END;

  -- If ticket is not in an approval-pending status, deny
  IF v_expected_role IS NULL THEN
    RETURN false;
  END IF;

  -- 3. Get user's highest Operações role
  v_user_role := get_user_operacoes_role_name(p_user_id);

  -- 4. User can approve if their role matches the expected role
  RETURN v_user_role = v_expected_role;
END;
$$;

-- ============================================================================
-- RLS POLICY: ticket_approvals_update_approver
-- Allows users to UPDATE ticket_approvals records when:
-- 1. They can approve the ticket (role matches expected)
-- 2. The approval record's role matches the ticket's expected role
-- 3. OR they are an admin
-- ============================================================================
CREATE POLICY "ticket_approvals_update_approver"
ON public.ticket_approvals
FOR UPDATE
TO authenticated
USING (
  -- Admin bypass
  is_admin()
  OR
  (
    -- User can approve this ticket AND
    can_approve_ticket(ticket_id, auth.uid())
    AND
    -- This approval record is for the current approval step
    approval_role = (
      SELECT CASE t.status
        WHEN 'awaiting_approval_encarregado' THEN 'Encarregado'
        WHEN 'awaiting_approval_supervisor' THEN 'Supervisor'
        WHEN 'awaiting_approval_gerente' THEN 'Gerente'
      END
      FROM tickets t
      WHERE t.id = ticket_id
    )
  )
)
WITH CHECK (
  -- Same conditions for the new row state
  is_admin()
  OR
  can_approve_ticket(ticket_id, auth.uid())
);

-- ============================================================================
-- RLS POLICY: tickets_update_approver
-- Allows users to UPDATE tickets when they are the current approver.
-- This enables advancing the ticket status during approval.
-- ============================================================================
CREATE POLICY "tickets_update_approver"
ON public.tickets
FOR UPDATE
TO authenticated
USING (
  -- Admin bypass
  is_admin()
  OR
  -- User can approve this ticket
  can_approve_ticket(id, auth.uid())
)
WITH CHECK (
  -- Admin can update to any status
  is_admin()
  OR
  (
    -- Approvers can only set valid approval progression statuses
    can_approve_ticket(id, auth.uid())
    AND
    status IN (
      'awaiting_approval_supervisor',
      'awaiting_approval_gerente',
      'awaiting_triage',
      'rejected'
    )
  )
);

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON FUNCTION public.get_user_operacoes_role_name IS
  'Returns the user''s highest Operações department role name (Gerente > Supervisor > Encarregado > Manobrista)';

COMMENT ON FUNCTION public.can_approve_ticket IS
  'Checks if a user can approve a ticket based on ticket status and user''s Operações role';

COMMENT ON POLICY "ticket_approvals_update_approver" ON public.ticket_approvals IS
  'Allows approvers to update approval records when their role matches the expected approval step';

COMMENT ON POLICY "tickets_update_approver" ON public.tickets IS
  'Allows approvers to update ticket status during the approval workflow';
