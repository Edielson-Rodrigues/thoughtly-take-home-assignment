import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { FastifyInstance } from 'fastify';
import { StatusCodes } from 'http-status-codes';

import { httpRequestHandler } from '@core/middlewares/http-request.middleware';

import { VerifyHealthResponseDTO, VerifyHealthResponseSchema } from './dtos/verify-health.dto';
import { HealthModule } from './health.module';

export function healthRoutes(app: FastifyInstance) {
  const api = app.withTypeProvider<TypeBoxTypeProvider>();
  const controller = HealthModule.build();

  api.get(
    '/',
    {
      schema: {
        summary: 'Verify health',
        tags: ['Health'],
        response: {
          [StatusCodes.OK]: VerifyHealthResponseSchema,
        },
      },
    },
    httpRequestHandler<null, null, null, VerifyHealthResponseDTO>(() => controller.verifyHealth(), StatusCodes.OK),
  );
}
