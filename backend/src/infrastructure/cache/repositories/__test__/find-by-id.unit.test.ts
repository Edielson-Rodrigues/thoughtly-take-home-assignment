import { IdempotencyMock } from '@domain/entities/idempotency/__mocks__/idempotency.mock';

import { IdempotencyRepository } from '../idempotency.repository';

describe('Cache -> Idempotency Repository - Find By Key', () => {
  const idempotencyMock = new IdempotencyMock();
  const idempotencyKeySaved = JSON.stringify({
    ...idempotencyMock,
    createdAt: idempotencyMock.createdAt.toISOString(),
  });

  const mockRedisClient = {
    get: jest.fn().mockResolvedValue(idempotencyKeySaved),
  };

  let idempotencyRepository: IdempotencyRepository;

  beforeAll(() => {
    idempotencyRepository = new IdempotencyRepository(mockRedisClient as any);
  });

  afterEach(() => jest.clearAllMocks());

  describe('SUCCESS CASES', () => {
    it('should return idempotency when key exists', async () => {
      const result = await idempotencyRepository.findByKey(idempotencyMock.key);

      expect(result).toEqual(idempotencyMock);
      expect(mockRedisClient.get).toHaveBeenCalledTimes(1);
      expect(mockRedisClient.get).toHaveBeenCalledWith(
        `idempotency:${idempotencyMock.key}`,
      );
    });

    it('should return null when key does not exist', async () => {
      mockRedisClient.get.mockResolvedValueOnce(null);

      const result = await idempotencyRepository.findByKey('non-existent-key');

      expect(mockRedisClient.get).toHaveBeenCalledTimes(1);
      expect(mockRedisClient.get).toHaveBeenCalledWith(
        'idempotency:non-existent-key',
      );
      expect(result).toBeNull();
    });
  });
});
