import { Logger } from '@shared/logger';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis';
import pino from 'pino';

export class TestContainers {
  private static databaseContainer: StartedPostgreSqlContainer;
  private static redisContainer: StartedRedisContainer;
  private static logger: pino.Logger;

  static async start(): Promise<void> {
    this.logger = Logger.initialize({ environment: 'test' });

    this.logger.info('Starting test containers...');

    this.databaseContainer = await new PostgreSqlContainer('postgres:17-alpine')
      .withDatabase('concert_bookings_test')
      .withUsername('postgres')
      .withPassword('postgres')
      .withExposedPorts(5432)
      .start();

    this.redisContainer = await new RedisContainer('redis:7-alpine').withExposedPorts(6379).start();

    this.logger.info(`Database running on port ${this.databaseContainer.getPort()}`);
    this.logger.info(`Cache running on port ${this.redisContainer.getPort()}`);
  }

  static getDatabaseContainer(): StartedPostgreSqlContainer {
    if (!this.databaseContainer) {
      throw new Error('Database container not started');
    }
    return this.databaseContainer;
  }

  static getCacheContainer(): StartedRedisContainer {
    if (!this.redisContainer) {
      throw new Error('Cache container not started');
    }
    return this.redisContainer;
  }

  static async stop(): Promise<void> {
    this.logger.info('Stopping test containers...');
    if (this.databaseContainer) {
      await this.databaseContainer.stop();
    }
    if (this.redisContainer) {
      await this.redisContainer.stop();
    }
    this.logger.info('All containers stopped');
  }
}
