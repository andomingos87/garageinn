-- Fix approval_level to be role-based (absolute), not sequential
-- Ensures approval_level matches approval_role: Encarregado=1, Supervisor=2, Gerente=3

-- 1) Normalize existing approval records
UPDATE public.ticket_approvals
SET approval_level = CASE approval_role
  WHEN 'Encarregado' THEN 1
  WHEN 'Supervisor' THEN 2
  WHEN 'Gerente' THEN 3
  ELSE approval_level
END
WHERE approval_role IN ('Encarregado', 'Supervisor', 'Gerente')
  AND approval_level IS DISTINCT FROM CASE approval_role
    WHEN 'Encarregado' THEN 1
    WHEN 'Supervisor' THEN 2
    WHEN 'Gerente' THEN 3
  END;

-- 2) Update create_ticket_approvals to use fixed levels per role
CREATE OR REPLACE FUNCTION public.create_ticket_approvals(p_ticket_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_created_by uuid;
  v_ops_level integer;
BEGIN
  -- Obter criador do chamado
  SELECT created_by INTO v_created_by
  FROM tickets
  WHERE id = p_ticket_id;

  IF v_created_by IS NULL THEN
    RAISE EXCEPTION 'Chamado não encontrado';
  END IF;

  -- Obter nível do criador em Operações
  v_ops_level := get_highest_operacoes_role(v_created_by);

  -- Se não pertence a Operações ou é Gerente, não criar aprovações
  IF v_ops_level = 0 OR v_ops_level = 4 THEN
    RETURN;
  END IF;

  -- Criar aprovações apenas para níveis ACIMA do criador
  -- Manobrista (1): cria para Encarregado, Supervisor, Gerente
  -- Encarregado (2): cria para Supervisor, Gerente
  -- Supervisor (3): cria para Gerente

  -- Aprovação nível 1 - Encarregado (apenas se criador é Manobrista)
  IF v_ops_level < 2 THEN
    INSERT INTO ticket_approvals (
      ticket_id,
      approval_level,
      approval_role,
      status
    ) VALUES (
      p_ticket_id,
      1,
      'Encarregado',
      'pending'
    );
  END IF;

  -- Aprovação nível 2 - Supervisor (se criador é Manobrista ou Encarregado)
  IF v_ops_level < 3 THEN
    INSERT INTO ticket_approvals (
      ticket_id,
      approval_level,
      approval_role,
      status
    ) VALUES (
      p_ticket_id,
      2,
      'Supervisor',
      'pending'
    );
  END IF;

  -- Aprovação nível 3 - Gerente (sempre, exceto para Gerente)
  IF v_ops_level < 4 THEN
    INSERT INTO ticket_approvals (
      ticket_id,
      approval_level,
      approval_role,
      status
    ) VALUES (
      p_ticket_id,
      3,
      'Gerente',
      'pending'
    );
  END IF;
END;
$$;
