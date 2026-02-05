import { fastifySwagger } from '@fastify/swagger';
import { fastifySwaggerUi } from '@fastify/swagger-ui';
import { FastifyInstance } from 'fastify';

import { ConfigService } from '@config/config.service';

import { BookingSchema } from './schemas/booking.schema';
import { ConcertSchema } from './schemas/concert.schema';
import { IdempotencySchema } from './schemas/idempotency.schema';
import { TicketTierSchema } from './schemas/ticket-tier.schema';

export const buildDocs = async (app: FastifyInstance<any, any, any, any>, configService: ConfigService) => {
  const { port } = configService.get('app');

  app.addSchema(ConcertSchema);
  app.addSchema(TicketTierSchema);
  app.addSchema(BookingSchema);
  app.addSchema(IdempotencySchema);

  await app.register(fastifySwagger, {
    swagger: {
      info: {
        title: 'Concerts API',
        description: 'API documentation for the Concerts project',
        version: '0.1.0',
      },
      host: `localhost:${port}`,
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
    },
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });
};
