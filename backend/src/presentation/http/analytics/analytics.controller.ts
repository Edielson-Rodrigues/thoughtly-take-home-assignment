import { AnalyticsService } from '@app/services/analytics/analytics.service';

import { DashboardFilterDTO, DashboardResponseDTO } from './dtos/dashbord.dto';

export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  async getDashboard(filters: DashboardFilterDTO): Promise<DashboardResponseDTO> {
    return await this.analyticsService.getDashboard(filters);
  }
}
