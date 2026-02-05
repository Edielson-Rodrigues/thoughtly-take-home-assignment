import { FindOptionsWhere } from 'typeorm';

import { ConcertMock } from '@domain/entities/concert/__mocks__/concert.mock';
import { ConcertEntity } from '@domain/entities/concert/concert.entity';
import { ConcertRelations } from '@domain/entities/concert/concert.interface';

import { ConcertsService } from '../concerts.service';

describe('Service -> Concerts -> Find All', () => {
  const concertsMock = ConcertMock.getList(2);

  const concertRepositoryMock = {
    findAll: jest.fn().mockResolvedValue(concertsMock),
  };

  const concertUpdateSubjectMock = {
    asObservable: jest.fn(),
  };

  let concertsService: ConcertsService;

  beforeAll(() => {
    concertsService = new ConcertsService(concertRepositoryMock as any, concertUpdateSubjectMock as any);
  });

  afterEach(() => jest.clearAllMocks());

  describe('SUCCESS CASES', () => {
    it('should return concerts when found with filters and relations', async () => {
      const filters: FindOptionsWhere<ConcertEntity> = { id: concertsMock[0].id };
      const relations: ConcertRelations = { ticketTiers: true };

      const result = await concertsService.findAll(filters, relations);

      expect(result).toStrictEqual(concertsMock);
      expect(concertRepositoryMock.findAll).toHaveBeenCalledTimes(1);
      expect(concertRepositoryMock.findAll).toHaveBeenCalledWith(filters, relations);
    });

    it('should find concerts without relations', async () => {
      const filters: FindOptionsWhere<ConcertEntity> = {
        location: concertsMock[0].location,
      };

      const result = await concertsService.findAll(filters);

      expect(result).toStrictEqual(concertsMock);
      expect(concertRepositoryMock.findAll).toHaveBeenCalledWith(filters, undefined);
    });
  });
});
