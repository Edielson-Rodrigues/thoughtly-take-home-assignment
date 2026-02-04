import { FindOptionsWhere } from 'typeorm';

import { ConcertMock } from '@domain/entities/concert/__mocks__/concert.mock';
import { ConcertEntity } from '@domain/entities/concert/concert.entity';
import { ConcertRelations } from '@domain/entities/concert/concert.interface';

import { ConcertRepository } from '../concert.repository';

describe('Database -> Concert Repository - Find', () => {
  const concertMock = new ConcertMock();
  const concertList = ConcertMock.getList(2);

  const mockRepository = {
    find: jest.fn().mockResolvedValue(concertList),
  };

  const mockDataSource = {
    getRepository: jest.fn().mockReturnValue(mockRepository),
  };

  let concertRepository: ConcertRepository;

  beforeAll(() => {
    concertRepository = new ConcertRepository(mockDataSource as any);
  });

  afterEach(() => jest.clearAllMocks());

  describe('SUCCESS CASES', () => {
    it('should return concerts when found', async () => {
      const filters: FindOptionsWhere<ConcertEntity> = { id: concertMock.id };
      const relations: ConcertRelations = { ticketTiers: true };

      const result = await concertRepository.find(filters, relations);

      expect(result).toStrictEqual(concertList);
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: filters,
        relations: relations,
        order: {
          createdAt: 'DESC',
        },
      });
    });

    it('should find concerts without relations', async () => {
      const filters: FindOptionsWhere<ConcertEntity> = {
        location: concertMock.location,
      };

      const result = await concertRepository.find(filters);

      expect(result).toStrictEqual(concertList);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: filters,
        relations: undefined,
        order: {
          createdAt: 'DESC',
        },
      });
    });

    it('should return empty array when no concerts found', async () => {
      const filters: FindOptionsWhere<ConcertEntity> = {
        id: 'non-existent-id',
      };

      mockRepository.find.mockResolvedValueOnce([]);

      const result = await concertRepository.find(filters);

      expect(result).toEqual([]);
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: filters,
        relations: undefined,
        order: {
          createdAt: 'DESC',
        },
      });
    });
  });
});
