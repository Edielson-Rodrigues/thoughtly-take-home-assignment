import { DataSource, SelectQueryBuilder } from 'typeorm';

import { BookingEntity } from '@domain/entities/booking/booking.entity';
import { DashboardFilterDTO } from '@presentation/http/analytics/dtos/dashbord.dto';

type TimeSeriesResult = {
  date: Date;
  revenue: string;
  tickets: string;
};

/**
 * ANALYTICS REPOSITORY
 *
 * Provides data aggregation methods for the analytics dashboard.
 * Each method corresponds to a specific widget on the dashboard,
 * applying filters as needed to retrieve relevant metrics.
 */
export class AnalyticsRepository {
  constructor(private readonly dataSource: DataSource) {}

  private applyFilters(
    query: SelectQueryBuilder<BookingEntity>,
    filters: DashboardFilterDTO,
  ): SelectQueryBuilder<BookingEntity> {
    const q = query.leftJoin('booking.ticketTier', 'tier').leftJoin('tier.concert', 'concert');

    if (filters.concertId) {
      q.andWhere('concert.id = :concertId', { concertId: filters.concertId });
    }

    if (filters.startDate) {
      q.andWhere('booking.created_at >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      q.andWhere('booking.created_at <= :endDate', { endDate: filters.endDate });
    }

    return q;
  }

  /**
   * WIDGET A: Summary Cards (Total Revenue, Tickets Sold)
   */
  async getSummaryStats(filters: DashboardFilterDTO) {
    let query = this.dataSource
      .getRepository(BookingEntity)
      .createQueryBuilder('booking')
      .select('SUM(booking.total_price)', 'totalRevenue')
      .addSelect('SUM(booking.quantity)', 'totalTicketsSold');

    query = this.applyFilters(query, filters);

    const result = await query.getRawOne();

    return {
      totalRevenue: Number(result.totalRevenue || 0),
      totalTicketsSold: Number(result.totalTicketsSold || 0),
    };
  }

  /**
   * WIDGET B: Sales Over Time (Line Chart)
   * Uses Postgres DATE_TRUNC to group by hour, day, or week.
   */
  async getSalesOverTime(filters: DashboardFilterDTO) {
    const period = filters.period ?? 'day';

    const dateExpression = `DATE_TRUNC('${period}', booking.created_at)`;

    let query = this.dataSource
      .getRepository(BookingEntity)
      .createQueryBuilder('booking')
      .select(dateExpression, 'date')
      .addSelect('SUM(booking.total_price)', 'revenue')
      .addSelect('SUM(booking.quantity)', 'tickets');

    query = this.applyFilters(query, filters);

    const results = await query.groupBy(dateExpression).orderBy('date', 'ASC').getRawMany<TimeSeriesResult>();

    return results.map((row) => ({
      date: new Date(row.date).toISOString(),
      revenue: Number(row.revenue),
      tickets: Number(row.tickets),
    }));
  }

  /**
   * WIDGET C: Revenue by Tier (Donut Chart)
   */
  async getRevenueByTier(filters: DashboardFilterDTO) {
    let query = this.dataSource
      .getRepository(BookingEntity)
      .createQueryBuilder('booking')
      .select('tier.name', 'tierName')
      .addSelect('SUM(booking.total_price)', 'revenue');

    query = this.applyFilters(query, filters);

    const results = await query.groupBy('tier.id').addGroupBy('tier.name').orderBy('revenue', 'DESC').getRawMany();

    return results.map((row) => ({
      tierName: row.tierName,
      revenue: Number(row.revenue),
    }));
  }
}
