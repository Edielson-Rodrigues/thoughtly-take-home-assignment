import { Type, Static } from '@sinclair/typebox';

export const DashboardFilterSchema = Type.Object({
  concertId: Type.Optional(Type.String({ format: 'uuid' })),
  startDate: Type.Optional(Type.String({ format: 'date-time' })),
  endDate: Type.Optional(Type.String({ format: 'date-time' })),
  period: Type.Optional(
    Type.Union([Type.Literal('hour'), Type.Literal('day'), Type.Literal('week')], { default: 'day' }),
  ),
});

export type DashboardFilterDTO = Static<typeof DashboardFilterSchema>;

const SummaryStats = Type.Object({
  totalRevenue: Type.Number(),
  totalTicketsSold: Type.Number(),
});

const TimeSeriesData = Type.Object({
  date: Type.String(),
  revenue: Type.Number(),
  tickets: Type.Number(),
});

const RevenueByTierData = Type.Object({
  tierName: Type.String(),
  revenue: Type.Number(),
  percentage: Type.Number(),
});

export const DashboardResponseSchema = Type.Object({
  summary: SummaryStats,
  salesOverTime: Type.Array(TimeSeriesData),
  revenueByTier: Type.Array(RevenueByTierData),
});

export type DashboardResponseDTO = Static<typeof DashboardResponseSchema>;
