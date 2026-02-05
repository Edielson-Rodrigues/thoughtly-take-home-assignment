import { AnalyticsRepository } from '@database/repositories/analytics/analytics.repository';
import { DashboardFilterDTO, DashboardResponseDTO } from '@presentation/http/analytics/dtos/dashbord.dto';

/**
 * ANALYTICS SERVICE
 *
 * Handles data aggregation for the analytics dashboard,
 * including summary statistics, sales over time, and revenue by ticket tier.
 */
export class AnalyticsService {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  /**
   * Retrieves the dashboard data based on the provided filters.
   */
  async getDashboard(filters: DashboardFilterDTO): Promise<DashboardResponseDTO> {
    const [summary, salesOverTime, revenueByTier] = await Promise.all([
      this.analyticsRepository.getSummaryStats(filters),
      this.analyticsRepository.getSalesOverTime(filters),
      this.analyticsRepository.getRevenueByTier(filters),
    ]);

    const totalRevenue = summary.totalRevenue;
    const revenueByTierWithPercentage = revenueByTier.map((item) => ({
      ...item,
      percentage: totalRevenue > 0 ? Number(((item.revenue / totalRevenue) * 100).toFixed(2)) : 0,
    }));

    return {
      summary,
      salesOverTime,
      revenueByTier: revenueByTierWithPercentage,
    };
  }
}
