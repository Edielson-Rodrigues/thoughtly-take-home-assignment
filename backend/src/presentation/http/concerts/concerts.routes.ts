import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { FastifyInstance } from 'fastify';
import { StatusCodes } from 'http-status-codes';

import { httpRequestHandler } from '@core/middlewares/http-request.middleware';
import { DatabaseProvider } from '@database/database.provider';

import { ConcertsModule } from './concerts.module';
import { FindConcertsResponseDTO, FindConcertsResponseSchema } from './dtos/find.concerts.dto';

export function concertsRoutes(app: FastifyInstance) {
  const api = app.withTypeProvider<TypeBoxTypeProvider>();

  const dataSource = DatabaseProvider.getDataSource();
  const controller = ConcertsModule.build(dataSource);

  api.get(
    '/',
    {
      schema: {
        summary: 'Find all concerts',
        tags: ['Concerts'],
        response: {
          [StatusCodes.OK]: FindConcertsResponseSchema,
        },
      },
    },
    httpRequestHandler<null, null, null, FindConcertsResponseDTO>(() => controller.findAll(), StatusCodes.OK),
  );

  api.get(
    '/stream',
    {
      schema: {
        summary: 'Stream concerts',
        tags: ['Concerts'],
      },
    },
    (req, reply) => controller.stream(req, reply),
  );
}
