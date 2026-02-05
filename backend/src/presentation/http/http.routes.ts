import { FastifyInstance } from 'fastify';

import { analyticsRoutes } from './analytics/analytics.routes';
import { bookingsRoutes } from './bookings/bookings.routes';
import { concertsRoutes } from './concerts/concerts.routes';

export async function httpRoutes(app: FastifyInstance<any, any, any, any>) {
  app.get('/health', () => ({ status: 'ok', timestamp: new Date() }));

  await app.register(analyticsRoutes, { prefix: '/analytics' });
  await app.register(bookingsRoutes, { prefix: '/bookings' });
  await app.register(concertsRoutes, { prefix: '/concerts' });
}
