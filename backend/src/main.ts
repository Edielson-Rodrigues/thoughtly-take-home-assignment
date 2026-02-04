import cors from '@fastify/cors';
import Fastify from 'fastify';

import { ConfigService } from '@config/config.service';
import { DatabaseProvider } from '@database/database.provider';

import { CacheProvider } from './infrastructure/cache/cache.provider';

const app = Fastify({
  logger: true,
});

const bootstrap = async () => {
  try {
    const configService = ConfigService.getInstance();

    await DatabaseProvider.connect(configService.get('database'));
    await CacheProvider.connect(configService.get('cache'));

    await app.register(cors, { origin: true });

    const port = configService.get('app').port;
    await app.listen({ port, host: '0.0.0.0' });

    console.log(`🚀 Server running at http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

bootstrap();
