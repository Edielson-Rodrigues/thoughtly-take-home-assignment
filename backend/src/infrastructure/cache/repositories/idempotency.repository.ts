import Redis from 'ioredis';

import { Idempotency } from '../../../domain/entities/idempotency/idempotency.entity';

/**
 * IDEMPOTENCY REPOSITORY (Redis)
 *
 * Implements the storage mechanism for Idempotency Keys using Redis.
 *
 * Why Redis?
 * 1. Speed: Key lookups are sub-millisecond (in-memory), essential for
 * checking every incoming POST request without adding latency.
 * 2. TTL (Time-To-Live): Redis natively handles the expiration of old keys
 * (e.g., 24h), removing the need for complex database cleanup jobs.
 */
export class IdempotencyRepository {
  private readonly DEFAULT_TTL = 60 * 60 * 24;

  constructor(private readonly cacheClient: Redis) {}

  async create(
    data: Idempotency,
    ttlSeconds = this.DEFAULT_TTL,
  ): Promise<void> {
    const key = `idempotency:${data.key}`;
    const value = JSON.stringify(data);

    // 'EX' sets the atomic expiration time in seconds
    await this.cacheClient.set(key, value, 'EX', ttlSeconds);
  }

  async findByKey(key: string): Promise<Idempotency | null> {
    const rawData = await this.cacheClient.get(`idempotency:${key}`);
    if (!rawData) {
      return null;
    }

    const parsed = JSON.parse(rawData);
    if (parsed.createdAt) {
      parsed.createdAt = new Date(parsed.createdAt);
    }

    return parsed as Idempotency;
  }
}
