-- ============================================
-- Migration 006: Ajuste ticket_needs_approval para TI
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
DECLARE
  v_is_manobrista boolean;
  v_is_target_dept boolean;
BEGIN
  -- Verifica se o criador é Manobrista
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = p_created_by
    AND r.name = 'Manobrista'
  ) INTO v_is_manobrista;

  -- Se não é manobrista, não precisa aprovação
  IF NOT v_is_manobrista THEN
    RETURN false;
  END IF;

  -- Verifica se o departamento destino é elegível (Compras e Manutenção ou TI)
  SELECT EXISTS (
    SELECT 1
    FROM departments
    WHERE id = p_department_id
    AND name IN ('Compras e Manutenção', 'TI')
  ) INTO v_is_target_dept;

  RETURN v_is_target_dept;
END;
$$;
