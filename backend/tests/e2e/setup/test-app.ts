import * as path from 'path';

import cors from '@fastify/cors';
import { Logger } from '@shared/logger';
import ajvErrors from 'ajv-errors';
import { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import pino from 'pino';
import { DataSource } from 'typeorm';

import { CacheProvider } from '../../../src/infrastructure/cache/cache.provider';
import { DatabaseProvider } from '../../../src/infrastructure/database/database.provider';
import { httpRoutes } from '../../../src/presentation/http/http.routes';

import { TestContainers } from './test-containers';

export class TestApp {
  private static app: FastifyInstance;
  private static dataSource: DataSource;
  private static logger: pino.Logger;

  static async create(): Promise<FastifyInstance> {
    this.logger = Logger.initialize({ environment: 'test' });

    await this.initializeDatabase();
    await this.initializeCache();

    this.app = await this.initializeServer();

    this.logger.info('Test application created');
    return this.app;
  }

  private static async initializeDatabase(): Promise<void> {
    const dbContainer = TestContainers.getDatabaseContainer();

    const dbConfig = {
      host: dbContainer.getHost(),
      port: dbContainer.getPort(),
      username: dbContainer.getUsername(),
      password: dbContainer.getPassword(),
      database: dbContainer.getDatabase(),
      ssl: false,
      migrationsRun: true,
      migrations: [path.join(process.cwd(), 'src', 'infrastructure', 'database', 'migrations', '*.{ts,js}')],
      logging: false,
    };

    this.dataSource = await DatabaseProvider.connect(dbConfig);

    (DatabaseProvider as any).instance = this.dataSource;
  }

  private static async initializeCache(): Promise<void> {
    const cacheContainer = TestContainers.getCacheContainer();
    await CacheProvider.connect({
      host: cacheContainer.getHost(),
      port: cacheContainer.getPort(),
      db: 0,
    });
  }

  private static async initializeServer(): Promise<FastifyInstance> {
    const app = Fastify({
      logger: false,
      disableRequestLogging: true,
      ajv: {
        customOptions: { allErrors: true },
        plugins: [ajvErrors as any],
      },
    });

    await app.register(cors, { origin: true });
    await app.register(httpRoutes, { prefix: '/api' });

    await app.ready();
    return app;
  }

  static async clearData(): Promise<void> {
    await Promise.all([this.clearDatabase(), this.clearCache()]);
    this.logger.info('Test data cleared');
  }

  private static async clearDatabase(): Promise<void> {
    if (!this.dataSource || !this.dataSource.isInitialized) return;

    try {
      const entities = this.dataSource.entityMetadatas;
      for (const entity of entities) {
        const repository = this.dataSource.getRepository(entity.name);
        await repository.query(`TRUNCATE TABLE "${entity.tableName}" RESTART IDENTITY CASCADE;`);
      }
    } catch (error) {
      this.logger.error(error, 'Failed to clear database:');
      throw error;
    }
  }

  private static async clearCache(): Promise<void> {
    try {
      const cache = CacheProvider.getClient();
      if (cache) await cache.flushall();
    } catch (error) {
      this.logger.error(error, 'Failed to clear cache:');
    }
  }

  static async close(): Promise<void> {
    if (this.app) await this.app.close();

    if (this.dataSource?.isInitialized) {
      await this.dataSource.destroy();
      (DatabaseProvider as any).instance = undefined;
    }

    try {
      const cache = CacheProvider.getClient();
      if (cache) await cache.quit();
    } catch (error) {
      this.logger.error(error, 'Error closing cache:');
    }

    this.logger.info('Test application closed');
  }

  static getApp(): FastifyInstance {
    if (!this.app) throw new Error('Test app not initialized. Call TestApp.create() first.');
    return this.app;
  }
}
