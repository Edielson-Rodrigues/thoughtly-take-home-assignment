import { useQuery } from '@tanstack/react-query';

import { getDashboard } from '../api/analytics.api';

import type { DashboardFilters, DashboardResponse } from '../types';

export const ANALYTICS_QUERY_KEY = ['analytics', 'dashboard'] as const;

export function useAnalytics(filters: DashboardFilters = {}) {
  return useQuery<DashboardResponse>({
    queryKey: [...ANALYTICS_QUERY_KEY, filters],
    queryFn: () => getDashboard(filters),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}
