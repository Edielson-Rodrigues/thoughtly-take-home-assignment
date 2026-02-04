import cors from '@fastify/cors';
import Fastify from 'fastify';

import { ConfigService } from './config/config.service';
import { connectDatabase } from './infrastructure/database/database.config';

const app = Fastify({
  logger: true,
});

const bootstrap = async () => {
  try {
    const configService = ConfigService.getInstance();

    await connectDatabase(configService.get('database'));

    await app.register(cors, { origin: true });

    const port = configService.get('app').port;
    await app.listen({ port, host: '0.0.0.0' });

    console.log(`🚀 Server running at http://localhost:${port}`);
    console.log(`📚 Documentation ready at http://localhost:${port}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

bootstrap();
