export interface TiFilters {
  status?: string;
  priority?: string;
  category_id?: string;
  unit_id?: string;
  parent_ticket_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TiStats {
  total: number;
  ready: number;
  inProgress: number;
  closed: number;
}

export interface TiCategory {
  id: string;
  name: string;
  department_id: string;
  status: string;
}

export interface TiTicketListItem {
  id: string;
  ticket_number: number;
  title: string;
  status: string;
  priority: string | null;
  perceived_urgency: string | null;
  created_at: string;
  category_name: string | null;
  equipment_type: string | null;
  unit_name: string | null;
  unit_code: string | null;
  created_by_name: string | null;
  created_by_avatar: string | null;
  assigned_to_name: string | null;
  assigned_to_avatar: string | null;
  parent_ticket_id?: string | null;
  origin_ticket_type?: string | null;
}

export interface ParentTicketInfo {
  id: string;
  ticket_number: number;
  title: string;
  status: string;
  department_name: string;
}

export interface TiApproval {
  id: string;
  approval_level: number;
  approval_role: string;
  status: string;
  notes: string | null;
  decision_at: string | null;
  approver: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
}

export interface TiComment {
  id: string;
  content: string;
  created_at: string;
  author: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
}

export interface TiHistory {
  id: string;
  action: string;
  new_value: string | null;
  created_at: string;
  user: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
}

export interface TiAttachment {
  id: string;
  file_name: string;
  file_path: string;
  created_at: string;
  uploader: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
}

export interface TiTicketDetail extends TiTicketListItem {
  description: string;
  parent_ticket_id?: string | null;
  origin_ticket_type?: string | null;
  parent_ticket?: ParentTicketInfo | null;
  approvals: TiApproval[];
  comments: TiComment[];
  history: TiHistory[];
  attachments: TiAttachment[];
}
