export interface TiFilters {
  status?: string;
  priority?: string;
  category_id?: string;
  unit_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TiStats {
  total: number;
  awaitingTriage: number;
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
}
