import cors from '@fastify/cors';
import Fastify from 'fastify';

import { CacheProvider } from '@cache/cache.provider';
import { ConfigService } from '@config/config.service';
import { httpErrorHandler } from '@core/middlewares/http-error.middleware';
import { DatabaseProvider } from '@database/database.provider';
import { buildDocs } from '@presentation/docs/build-docs';
import { httpRoutes } from '@presentation/http/http.routes';

import { Logger } from './shared/logger';

const createApp = (configService: ConfigService) => {
  const { environment } = configService.get('app');
  const logger = Logger.initialize({ environment });

  return { app: Fastify({ loggerInstance: logger }), logger };
};

const connectInfra = async (configService: ConfigService) => {
  await DatabaseProvider.connect(configService.get('database'));
  await CacheProvider.connect(configService.get('cache'));
};

const bootstrap = async () => {
  const configService = ConfigService.getInstance();
  const { app, logger } = createApp(configService);

  try {
    const { port } = configService.get('app');

    await connectInfra(configService);
    await buildDocs(app, configService);

    await app.register(cors, { origin: true });
    await app.register(httpRoutes, { prefix: '/api' });

    app.setErrorHandler(httpErrorHandler);

    await app.listen({ port, host: '0.0.0.0' });

    logger.info(`Server running at http://localhost:${port}`);
    logger.info(`Documentation available at http://localhost:${port}/docs`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

bootstrap();
