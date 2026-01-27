-- Limpeza segura de chamados de teste (tickets)
-- Critério atual: tickets criados a partir de 2026-01-01 OU criados por usuários com e-mail contendo "teste".
-- Ajuste o critério conforme necessário antes de rodar.
-- Recomendado executar como admin/service role e com backup/snapshot recente.

-- ============================================================
-- 1) Revisão dos tickets que serão afetados
-- ============================================================
WITH test_tickets AS (
  SELECT id, ticket_number, title, created_by, created_at
  FROM public.tickets
  WHERE created_at >= DATE '2026-01-01'
     OR created_by IN (
       SELECT id FROM public.profiles WHERE email ILIKE '%teste%'
     )
)
SELECT COUNT(*) AS total_test_tickets
FROM test_tickets;

-- Lista amostral para conferência
WITH test_tickets AS (
  SELECT id, ticket_number, title, created_by, created_at
  FROM public.tickets
  WHERE created_at >= DATE '2026-01-01'
     OR created_by IN (
       SELECT id FROM public.profiles WHERE email ILIKE '%teste%'
     )
)
SELECT *
FROM test_tickets
ORDER BY created_at DESC
LIMIT 50;

-- ============================================================
-- 2) Anexos: listar arquivos para limpeza manual no Storage
-- ============================================================
WITH test_tickets AS (
  SELECT id
  FROM public.tickets
  WHERE created_at >= DATE '2026-01-01'
     OR created_by IN (
       SELECT id FROM public.profiles WHERE email ILIKE '%teste%'
     )
)
SELECT ticket_id, file_path, file_name
FROM public.ticket_attachments
WHERE ticket_id IN (SELECT id FROM test_tickets);

-- ============================================================
-- 3) Executar limpeza (FKs bloqueadoras + delete com cascade)
-- ============================================================
BEGIN;

WITH test_tickets AS (
  SELECT id
  FROM public.tickets
  WHERE created_at >= DATE '2026-01-01'
     OR created_by IN (
       SELECT id FROM public.profiles WHERE email ILIKE '%teste%'
     )
)
-- Bloqueador 1: uniform_transactions.ticket_id (sem ON DELETE CASCADE)
UPDATE public.uniform_transactions
SET ticket_id = NULL
WHERE ticket_id IN (SELECT id FROM test_tickets);

-- Alternativa (se preferir excluir transações ligadas aos testes):
-- DELETE FROM public.uniform_transactions
-- WHERE ticket_id IN (SELECT id FROM test_tickets);

WITH test_tickets AS (
  SELECT id
  FROM public.tickets
  WHERE created_at >= DATE '2026-01-01'
     OR created_by IN (
       SELECT id FROM public.profiles WHERE email ILIKE '%teste%'
     )
)
-- Bloqueador 2: ticket_claim_details.related_maintenance_ticket_id
UPDATE public.ticket_claim_details
SET related_maintenance_ticket_id = NULL
WHERE related_maintenance_ticket_id IN (SELECT id FROM test_tickets);

WITH test_tickets AS (
  SELECT id
  FROM public.tickets
  WHERE created_at >= DATE '2026-01-01'
     OR created_by IN (
       SELECT id FROM public.profiles WHERE email ILIKE '%teste%'
     )
)
-- Delete principal: cascades cuidam das tabelas filhas
DELETE FROM public.tickets
WHERE id IN (SELECT id FROM test_tickets);

COMMIT;

-- ============================================================
-- 4) Verificações de órfãos (exemplos)
-- ============================================================
SELECT 'ticket_comments' AS table_name, COUNT(*) AS orphaned
FROM public.ticket_comments tc
LEFT JOIN public.tickets t ON t.id = tc.ticket_id
WHERE t.id IS NULL;

SELECT 'ticket_attachments' AS table_name, COUNT(*) AS orphaned
FROM public.ticket_attachments ta
LEFT JOIN public.tickets t ON t.id = ta.ticket_id
WHERE t.id IS NULL;

-- Repita para outras tabelas filhas se necessário.
