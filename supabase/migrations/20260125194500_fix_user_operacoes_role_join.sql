-- Migration: Fix join in get_user_operacoes_role_name
-- Date: 2026-01-25
-- Description: Align department join with schema (roles.department_id)

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
  JOIN departments d ON r.department_id = d.id
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
