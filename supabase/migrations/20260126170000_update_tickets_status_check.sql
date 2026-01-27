-- Update ticket status check constraint to match all workflows
alter table public.tickets
  drop constraint if exists tickets_status_check;

alter table public.tickets
  add constraint tickets_status_check
  check (
    status = any (
      array[
        'awaiting_approval_encarregado',
        'awaiting_approval_supervisor',
        'awaiting_approval_gerente',
        'awaiting_triage',
        'prioritized',
        'in_progress',
        'quoting',
        'awaiting_approval',
        'approved',
        'purchasing',
        'in_delivery',
        'delivered',
        'evaluating',
        'technical_analysis',
        'executing',
        'waiting_parts',
        'completed',
        'in_analysis',
        'in_investigation',
        'awaiting_customer',
        'awaiting_quotations',
        'in_repair',
        'awaiting_payment',
        'awaiting_return',
        'resolved',
        'closed',
        'denied',
        'cancelled'
      ]::text[]
    )
  );
