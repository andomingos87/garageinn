export interface ComercialFilters {
  status?: string;
  priority?: string;
  category_id?: string;
  unit_id?: string;
  assigned_to?: string;
  comercial_type?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ComercialStats {
  total: number;
  awaitingTriage: number;
  inProgress: number;
  resolved: number;
}

export interface ComercialCategory {
  id: string;
  name: string;
  department_id: string;
  status: string;
}
