-- ============================================
-- Migration 005: View Chamados de TI
-- ============================================

CREATE OR REPLACE VIEW public.tickets_it_with_details AS
SELECT
  t.id,
  t.ticket_number,
  t.title,
  t.description,
  t.status,
  t.priority,
  t.perceived_urgency,
  t.created_at,
  t.updated_at,
  t.department_id,
  d.name AS department_name,
  t.category_id,
  c.name AS category_name,
  t.unit_id,
  u.name AS unit_name,
  u.code AS unit_code,
  t.created_by,
  creator.full_name AS created_by_name,
  creator.avatar_url AS created_by_avatar,
  t.assigned_to,
  assignee.full_name AS assigned_to_name,
  assignee.avatar_url AS assigned_to_avatar,
  it.equipment_type
FROM public.tickets t
JOIN public.departments d ON d.id = t.department_id
LEFT JOIN public.ticket_categories c ON c.id = t.category_id
LEFT JOIN public.units u ON u.id = t.unit_id
LEFT JOIN public.profiles creator ON creator.id = t.created_by
LEFT JOIN public.profiles assignee ON assignee.id = t.assigned_to
LEFT JOIN public.ticket_it_details it ON it.ticket_id = t.id
WHERE d.name = 'TI';
