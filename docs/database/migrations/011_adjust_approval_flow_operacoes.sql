-- ============================================
-- Migration 011: Ajuste do Fluxo de Aprovação de Operações
-- GarageInn App - Operações Approval Flow
-- ============================================
-- Execute após 010_ops_manager_visibility.sql
--
-- Objetivo: Ajustar o fluxo de aprovação para respeitar a hierarquia
-- de Operações (Manobrista → Encarregado → Supervisor → Gerente)
-- pulando níveis anteriores quando o criador já ocupa cargo superior.
-- ============================================

-- ============================================
-- FUNÇÃO: get_highest_operacoes_role
-- Retorna o nível mais alto do usuário em Operações
-- Níveis: 1=Manobrista, 2=Encarregado, 3=Supervisor, 4=Gerente
-- Retorna 0 se não pertence a Operações
-- ============================================

CREATE OR REPLACE FUNCTION public.get_highest_operacoes_role(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_max_level integer := 0;
BEGIN
  SELECT COALESCE(MAX(
    CASE r.name
      WHEN 'Manobrista' THEN 1
      WHEN 'Encarregado' THEN 2
      WHEN 'Supervisor' THEN 3
      WHEN 'Gerente' THEN 4
      ELSE 0
    END
  ), 0)
  INTO v_max_level
  FROM user_roles ur
  JOIN roles r ON r.id = ur.role_id
  JOIN departments d ON d.id = r.department_id
  WHERE ur.user_id = p_user_id
  AND d.name = 'Operações';

  RETURN v_max_level;
END;
$$;

-- ============================================
-- FUNÇÃO: ticket_needs_approval (atualizada)
-- Verifica se um chamado precisa de aprovação
-- Regra: Apenas Manobrista, Encarregado e Supervisor precisam
-- Gerente de Operações NÃO precisa de aprovação
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
  v_ops_level integer;
BEGIN
  -- Obter o nível mais alto em Operações
  v_ops_level := get_highest_operacoes_role(p_created_by);

  -- Se não pertence a Operações (nível 0) ou é Gerente (nível 4), não precisa aprovação
  IF v_ops_level = 0 OR v_ops_level = 4 THEN
    RETURN false;
  END IF;

  -- Manobrista (1), Encarregado (2) e Supervisor (3) precisam de aprovação
  RETURN true;
END;
$$;

-- ============================================
-- FUNÇÃO: get_initial_approval_status
-- Retorna o status inicial baseado no cargo do criador
-- ============================================

CREATE OR REPLACE FUNCTION public.get_initial_approval_status(p_created_by uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ops_level integer;
BEGIN
  v_ops_level := get_highest_operacoes_role(p_created_by);

  -- Retorna o status inicial baseado no nível
  RETURN CASE v_ops_level
    WHEN 1 THEN 'awaiting_approval_encarregado'  -- Manobrista: inicia em Encarregado
    WHEN 2 THEN 'awaiting_approval_supervisor'   -- Encarregado: pula para Supervisor
    WHEN 3 THEN 'awaiting_approval_gerente'      -- Supervisor: pula para Gerente
    ELSE 'awaiting_triage'                       -- Gerente ou outros: vai direto para triagem
  END;
END;
$$;

-- ============================================
-- FUNÇÃO: create_ticket_approvals (atualizada)
-- Cria registros de aprovação baseados no cargo do criador
-- Evita auto-aprovação pulando níveis iguais ou inferiores
-- ============================================

CREATE OR REPLACE FUNCTION public.create_ticket_approvals(p_ticket_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_created_by uuid;
  v_ops_level integer;
  v_approval_level integer := 0;
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
    v_approval_level := v_approval_level + 1;
    INSERT INTO ticket_approvals (
      ticket_id,
      approval_level,
      approval_role,
      status
    ) VALUES (
      p_ticket_id,
      v_approval_level,
      'Encarregado',
      'pending'
    );
  END IF;

  -- Aprovação nível 2 - Supervisor (se criador é Manobrista ou Encarregado)
  IF v_ops_level < 3 THEN
    v_approval_level := v_approval_level + 1;
    INSERT INTO ticket_approvals (
      ticket_id,
      approval_level,
      approval_role,
      status
    ) VALUES (
      p_ticket_id,
      v_approval_level,
      'Supervisor',
      'pending'
    );
  END IF;

  -- Aprovação nível 3 - Gerente (sempre, exceto para Gerente)
  IF v_ops_level < 4 THEN
    v_approval_level := v_approval_level + 1;
    INSERT INTO ticket_approvals (
      ticket_id,
      approval_level,
      approval_role,
      status
    ) VALUES (
      p_ticket_id,
      v_approval_level,
      'Gerente',
      'pending'
    );
  END IF;
END;
$$;

-- ============================================
-- FUNÇÃO: get_pending_approval_count
-- Retorna a quantidade de aprovações pendentes para um chamado
-- ============================================

CREATE OR REPLACE FUNCTION public.get_pending_approval_count(p_ticket_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*)::integer INTO v_count
  FROM ticket_approvals
  WHERE ticket_id = p_ticket_id
  AND status = 'pending';

  RETURN v_count;
END;
$$;

-- ============================================
-- Comentários de documentação
-- ============================================

COMMENT ON FUNCTION public.get_highest_operacoes_role(uuid) IS
'Retorna o nível hierárquico mais alto do usuário em Operações (1=Manobrista, 2=Encarregado, 3=Supervisor, 4=Gerente, 0=não pertence)';

COMMENT ON FUNCTION public.ticket_needs_approval(uuid, uuid) IS
'Verifica se um chamado precisa de aprovação baseado no cargo do criador em Operações. Gerente não precisa de aprovação.';

COMMENT ON FUNCTION public.get_initial_approval_status(uuid) IS
'Retorna o status inicial do chamado baseado no cargo do criador em Operações';

COMMENT ON FUNCTION public.create_ticket_approvals(uuid) IS
'Cria registros de aprovação apenas para níveis acima do criador, evitando auto-aprovação';

COMMENT ON FUNCTION public.get_pending_approval_count(uuid) IS
'Retorna a quantidade de aprovações pendentes para um chamado';
