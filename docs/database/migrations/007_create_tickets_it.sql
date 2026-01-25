-- ============================================
-- Migration 007: Chamados de TI - Prontos para Execucao
-- ============================================

CREATE OR REPLACE VIEW public.tickets_it_ready AS
SELECT *
FROM public.tickets_it_with_details
WHERE status = 'awaiting_triage';
