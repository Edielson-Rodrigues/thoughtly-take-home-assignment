import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { FastifyInstance } from 'fastify';
import { StatusCodes } from 'http-status-codes';

import { httpRequestHandler } from '@core/middlewares/http-request.middleware';
import { DatabaseProvider } from '@database/database.provider';

import { AnalyticsModule } from './analytics.module';
import {
  DashboardFilterDTO,
  DashboardFilterSchema,
  DashboardResponseDTO,
  DashboardResponseSchema,
} from './dtos/dashbord.dto';

export function analyticsRoutes(app: FastifyInstance) {
  const api = app.withTypeProvider<TypeBoxTypeProvider>();

  const dataSource = DatabaseProvider.getDataSource();
  const controller = AnalyticsModule.build(dataSource);

  api.get(
    '/dashboard',
    {
      schema: {
        summary: 'Get Sales Analytics Dashboard',
        description: 'Returns aggregated sales data including total revenue, sales over time, and revenue by tier.',
        tags: ['Analytics'],
        querystring: DashboardFilterSchema,
        response: {
          [StatusCodes.OK]: DashboardResponseSchema,
        },
      },
    },
    httpRequestHandler<null, DashboardFilterDTO, null, DashboardResponseDTO>(
      ({ query }) => controller.getDashboard(query),
      StatusCodes.OK,
    ),
  );
}
