export interface FinanceiroFilters {
  status?: string;
  priority?: string;
  category_id?: string;
  unit_id?: string;
  assigned_to?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface FinanceiroStats {
  total: number;
  awaitingTriage: number;
  inProgress: number;
  resolved: number;
}

export interface FinanceiroCategory {
  id: string;
  name: string;
  department_id: string;
  status: string;
}
