import cors from '@fastify/cors';
import { Logger } from '@shared/logger';
import ajvErrors from 'ajv-errors';
import Fastify from 'fastify';

import { CacheProvider } from '@cache/cache.provider';
import { ConfigService } from '@config/config.service';
import { DatabaseProvider } from '@database/database.provider';
import { buildDocs } from '@presentation/docs/build-docs';
import { httpRoutes } from '@presentation/http/http.routes';

const createApp = (configService: ConfigService) => {
  const { environment } = configService.get('app');
  const logger = Logger.initialize({ environment });

  return {
    app: Fastify({
      loggerInstance: logger,
      ajv: {
        customOptions: { allErrors: true },
        plugins: [ajvErrors as any],
      },
    }),
    logger,
  };
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
    await buildDocs(app);

    await app.register(cors, { origin: true });
    await app.register(httpRoutes, { prefix: '/api' });

    await app.listen({ port, host: '0.0.0.0' });

    logger.info(`Server running at http://localhost:${port}`);
    logger.info(`Documentation available at http://localhost:${port}/docs`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

bootstrap();
