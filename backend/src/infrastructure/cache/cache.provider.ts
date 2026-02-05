import Redis from 'ioredis';

import { CacheConfig } from '@config/validators/cache.validator';

import { Logger } from '../../shared/logger';

/**
 * Cache Provider
 *
 * Manages the cache connection using ioredis.
 * Ensures we never accidentally open multiple connection pools.
 */
export class CacheProvider {
  private static instance: Redis;

  private constructor() {}

  /**
   * Initializes the cache connection or returns the existing one.
   * This method is "idempotent" - calling it twice is safe.
   */
  public static async connect(config: CacheConfig): Promise<Redis> {
    if (this.instance && this.instance.status === 'ready') {
      return this.instance;
    }

    const client = new Redis({
      ...config,
      lazyConnect: true,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    const logger = Logger.getInstance();
    try {
      await client.connect();
      this.instance = client;
      logger.info('Cache connected successfully');
      return this.instance;
    } catch (error) {
      logger.error(error, 'Cache connection failed');
      process.exit(1);
    }
  }

  /**
   * Singleton accessor to ensure only one Cache instance is used.
   */
  public static getClient(): Redis {
    if (!this.instance) {
      throw new Error('❌ Cache not initialized. Call .connect() first.');
    }
    return this.instance;
  }
}
