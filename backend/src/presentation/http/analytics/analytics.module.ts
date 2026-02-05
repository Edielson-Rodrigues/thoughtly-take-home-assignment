import { DataSource } from 'typeorm';

import { AnalyticsService } from '@app/services/analytics/analytics.service';
import { AnalyticsRepository } from '@database/repositories/analytics/analytics.repository';

import { AnalyticsController } from './analytics.controller';

export class AnalyticsModule {
  static build(dataSource: DataSource): AnalyticsController {
    const repository = new AnalyticsRepository(dataSource);
    const service = new AnalyticsService(repository);

    return new AnalyticsController(service);
  }
}
