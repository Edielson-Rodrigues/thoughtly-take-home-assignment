import { api } from '../../../lib/axios';
import type { DashboardResponse, DashboardFilters } from '../types';

export async function getDashboard(filters: DashboardFilters = {}): Promise<DashboardResponse> {
  const params = new URLSearchParams();

  if (filters.concertId) {
    params.append('concertId', filters.concertId);
  }
  if (filters.startDate) {
    params.append('startDate', filters.startDate);
  }
  if (filters.endDate) {
    params.append('endDate', filters.endDate);
  }
  if (filters.period) {
    params.append('period', filters.period);
  }

  const queryString = params.toString();
  const url = queryString ? `/analytics/dashboard?${queryString}` : '/analytics/dashboard';

  const response = await api.get<DashboardResponse>(url);
  return response.data;
}
