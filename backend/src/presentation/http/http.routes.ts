import { FastifyInstance } from 'fastify';

import { httpErrorHandler } from '@core/middlewares/http-error.middleware';

import { analyticsRoutes } from './analytics/analytics.routes';
import { bookingsRoutes } from './bookings/bookings.routes';
import { concertsRoutes } from './concerts/concerts.routes';
import { healthRoutes } from './health/health.routes';

export async function httpRoutes(app: FastifyInstance<any, any, any, any>) {
  app.setErrorHandler(httpErrorHandler);

  await app.register(analyticsRoutes, { prefix: '/analytics' });
  await app.register(bookingsRoutes, { prefix: '/bookings' });
  await app.register(concertsRoutes, { prefix: '/concerts' });
  await app.register(healthRoutes, { prefix: '/health' });
}
