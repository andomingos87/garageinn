-- ============================================
-- Migration 010: Visibilidade do Gerente de Operacoes
-- GarageInn App - Ajustes de RLS e aprovacoes
-- ============================================
-- Execute apos 006_update_ticket_needs_approval.sql
-- ============================================

-- ============================================
-- Helpers: Operacoes (criador e gerente)
-- ============================================

CREATE OR REPLACE FUNCTION public.is_operacoes_creator(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_ops_creator boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    JOIN departments d ON d.id = r.department_id
    WHERE ur.user_id = p_user_id
    AND d.name = 'Operações'
    AND r.name IN ('Manobrista', 'Encarregado', 'Supervisor')
  ) INTO v_is_ops_creator;

  RETURN COALESCE(v_is_ops_creator, false);
END;
$$;

CREATE OR REPLACE FUNCTION public.is_operacoes_gerente()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_ops_manager boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    JOIN departments d ON d.id = r.department_id
    WHERE ur.user_id = auth.uid()
    AND d.name = 'Operações'
    AND r.name = 'Gerente'
  ) INTO v_is_ops_manager;

  RETURN COALESCE(v_is_ops_manager, false);
END;
$$;

-- ============================================
-- Aprovação: regra baseada no criador (Operacoes)
-- ============================================

CREATE OR REPLACE FUNCTION public.ticket_needs_approval(
  p_created_by uuid,
  p_department_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Regra baseada no criador; departamento do chamado nao e criterio.
  RETURN is_operacoes_creator(p_created_by);
END;
$$;

-- ============================================
-- RLS: visibilidade do Gerente de Operacoes por criador
-- ============================================

DROP POLICY IF EXISTS "tickets_select_operacoes_creator" ON public.tickets;
CREATE POLICY "tickets_select_operacoes_creator" ON public.tickets
  FOR SELECT
  TO authenticated
  USING (is_operacoes_gerente() AND is_operacoes_creator(created_by));
