import { VerifyHealthResponseDTO } from './dtos/verify-health.dto';

export class HealthController {
  verifyHealth(): VerifyHealthResponseDTO {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
