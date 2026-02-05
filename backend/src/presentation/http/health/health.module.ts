import { HealthController } from './health.controller';

export class HealthModule {
  static build(): HealthController {
    return new HealthController();
  }
}
