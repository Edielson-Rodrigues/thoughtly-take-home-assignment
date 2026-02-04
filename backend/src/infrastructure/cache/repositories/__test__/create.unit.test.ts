import { IdempotencyMock } from '@domain/entities/idempotency/__mocks__/idempotency.mock';

import { IdempotencyRepository } from '../idempotency.repository';

describe('Cache -> Idempotency Repository - Create', () => {
  const idempotencyMock = new IdempotencyMock();

  const mockRedisClient = {
    set: jest.fn().mockResolvedValue(void 0),
  };

  let idempotencyRepository: IdempotencyRepository;

  beforeAll(() => {
    idempotencyRepository = new IdempotencyRepository(mockRedisClient as any);
  });

  afterEach(() => jest.clearAllMocks());

  describe('SUCCESS CASSES', () => {
    it('should store idempotency key with default TTL', async () => {
      await idempotencyRepository.create(idempotencyMock);

      expect(mockRedisClient.set).toHaveBeenCalledTimes(1);
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        `idempotency:${idempotencyMock.key}`,
        JSON.stringify(idempotencyMock),
        'EX',
        60 * 60 * 24,
      );
    });

    it('should store idempotency key with custom TTL', async () => {
      const customTTL = 60 * 10;

      await idempotencyRepository.create(idempotencyMock, customTTL);

      expect(mockRedisClient.set).toHaveBeenCalledTimes(1);
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        `idempotency:${idempotencyMock.key}`,
        JSON.stringify(idempotencyMock),
        'EX',
        customTTL,
      );
    });
  });
});
