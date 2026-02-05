import { FindOptionsWhere } from 'typeorm';

import { BookingMock } from '@domain/entities/booking/__mocks__/booking.mock';
import { BookingEntity } from '@domain/entities/booking/booking.entity';
import { BookingRelations } from '@domain/entities/booking/booking.interface';

import { BookingRepository } from '../booking.repository';

describe('Database -> Booking Repository - Find', () => {
  const bookingMock = new BookingMock();

  const repositoryMock = {
    findOne: jest.fn().mockResolvedValue(bookingMock),
  };

  const dataSourceMock = {
    getRepository: jest.fn().mockReturnValue(repositoryMock),
  };

  let bookingRepository: BookingRepository;

  beforeAll(() => {
    bookingRepository = new BookingRepository(dataSourceMock as any);
  });

  afterEach(() => jest.clearAllMocks());

  describe('SUCCESS CASES', () => {
    it('should return booking when found', async () => {
      const filters: FindOptionsWhere<BookingEntity> = { id: bookingMock.id };
      const relations: BookingRelations = { ticketTier: true };

      const result = await bookingRepository.find(filters, relations);

      expect(result).toStrictEqual(bookingMock);
      expect(repositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(repositoryMock.findOne).toHaveBeenCalledWith({
        where: filters,
        relations: relations,
      });
    });

    it('should find booking without relations', async () => {
      const filters: FindOptionsWhere<BookingEntity> = {
        userEmail: bookingMock.userEmail,
      };

      const result = await bookingRepository.find(filters);

      expect(result).toStrictEqual(bookingMock);
      expect(repositoryMock.findOne).toHaveBeenCalledWith({
        where: filters,
        relations: undefined,
      });
    });

    it('should return null when booking not found', async () => {
      const filters: FindOptionsWhere<BookingEntity> = {
        id: 'non-existent-id',
      };

      repositoryMock.findOne.mockResolvedValueOnce(null);

      const result = await bookingRepository.find(filters);

      expect(result).toBeNull();
      expect(repositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(repositoryMock.findOne).toHaveBeenCalledWith({
        where: filters,
        relations: undefined,
      });
    });
  });
});
