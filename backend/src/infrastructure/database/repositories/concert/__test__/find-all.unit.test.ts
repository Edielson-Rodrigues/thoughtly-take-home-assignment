import { FindOptionsWhere } from 'typeorm';

import { ConcertMock } from '@domain/entities/concert/__mocks__/concert.mock';
import { ConcertEntity } from '@domain/entities/concert/concert.entity';
import { ConcertRelations } from '@domain/entities/concert/concert.interface';

import { ConcertRepository } from '../concert.repository';

describe('Database -> Concert Repository - Find All', () => {
  const concertMock = new ConcertMock();
  const concertList = ConcertMock.getList(2);

  const repositoryMock = {
    find: jest.fn().mockResolvedValue(concertList),
  };

  const dataSourceMock = {
    getRepository: jest.fn().mockReturnValue(repositoryMock),
  };

  let concertRepository: ConcertRepository;

  beforeAll(() => {
    concertRepository = new ConcertRepository(dataSourceMock as any);
  });

  afterEach(() => jest.clearAllMocks());

  describe('SUCCESS CASES', () => {
    it('should return concerts when found', async () => {
      const filters: FindOptionsWhere<ConcertEntity> = { id: concertMock.id };
      const relations: ConcertRelations = { ticketTiers: true };

      const result = await concertRepository.findAll(filters, relations);

      expect(result).toStrictEqual(concertList);
      expect(repositoryMock.find).toHaveBeenCalledTimes(1);
      expect(repositoryMock.find).toHaveBeenCalledWith({
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

      const result = await concertRepository.findAll(filters);

      expect(result).toStrictEqual(concertList);
      expect(repositoryMock.find).toHaveBeenCalledWith({
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

      repositoryMock.find.mockResolvedValueOnce([]);

      const result = await concertRepository.findAll(filters);

      expect(result).toEqual([]);
      expect(repositoryMock.find).toHaveBeenCalledTimes(1);
      expect(repositoryMock.find).toHaveBeenCalledWith({
        where: filters,
        relations: undefined,
        order: {
          createdAt: 'DESC',
        },
      });
    });
  });
});
