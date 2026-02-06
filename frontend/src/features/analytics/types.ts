export interface SummaryStats {
  totalRevenue: number;
  totalTicketsSold: number;
}

export interface TimeSeriesData {
  date: string;
  revenue: number;
  tickets: number;
}

export interface RevenueByTierData {
  tierName: string;
  concertName: string;
  revenue: number;
  percentage: number;
}

export interface DashboardResponse {
  summary: SummaryStats;
  salesOverTime: TimeSeriesData[];
  revenueByTier: RevenueByTierData[];
}

export const DashboardPeriods = {
  DAY: 'day',
  WEEK: 'week',
} as const;

export type DashboardPeriod = (typeof DashboardPeriods)[keyof typeof DashboardPeriods];

export interface DashboardFilters {
  concertId?: string;
  startDate?: string;
  endDate?: string;
  period?: DashboardPeriod;
}
