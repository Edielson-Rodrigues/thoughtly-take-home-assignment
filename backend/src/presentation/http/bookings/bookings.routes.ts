import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { FastifyInstance } from 'fastify';
import { StatusCodes } from 'http-status-codes';

import { CacheProvider } from '@cache/cache.provider';
import { httpRequestHandler } from '@core/middlewares/http-request.middleware';
import { DatabaseProvider } from '@database/database.provider';

import { BookingsModule } from './bookings.module';
import {
  CreateBookingBodyDTO,
  CreateBookingBodySchema,
  CreateBookingResponseDTO,
  CreateBookingResponseSchema,
} from './dtos/create-booking.dto';

export function bookingsRoutes(app: FastifyInstance) {
  const api = app.withTypeProvider<TypeBoxTypeProvider>();

  const dataSource = DatabaseProvider.getDataSource();
  const cacheClient = CacheProvider.getClient();
  const controller = BookingsModule.build(dataSource, cacheClient);

  api.post(
    '/',
    {
      schema: {
        summary: 'Create a new booking',
        tags: ['Bookings'],
        body: CreateBookingBodySchema,
        response: {
          [StatusCodes.CREATED]: CreateBookingResponseSchema,
        },
      },
    },
    httpRequestHandler<CreateBookingBodyDTO, null, null, CreateBookingResponseDTO>(
      ({ body, path }) => controller.create(body, path),
      StatusCodes.CREATED,
    ),
  );
}
