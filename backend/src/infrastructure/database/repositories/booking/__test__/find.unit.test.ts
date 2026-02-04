import { FindOptionsWhere } from 'typeorm';

import { BookingMock } from '@domain/entities/booking/__mocks__/booking.mocks';
import { BookingEntity } from '@domain/entities/booking/booking.entity';
import { BookingRelations } from '@domain/entities/booking/booking.interface';

import { BookingRepository } from '../booking.repository';

describe('Database -> Booking Repository - Find', () => {
  const bookingMock = new BookingMock();

  const mockRepository = {
    findOne: jest.fn().mockResolvedValue(bookingMock),
  };

  const mockDataSource = {
    getRepository: jest.fn().mockReturnValue(mockRepository),
  };

  let bookingRepository: BookingRepository;

  beforeAll(() => {
    bookingRepository = new BookingRepository(mockDataSource as any);
  });

  afterEach(() => jest.clearAllMocks());

  describe('SUCCESS CASES', () => {
    it('should return booking when found', async () => {
      const filters: FindOptionsWhere<BookingEntity> = { id: bookingMock.id };
      const relations: BookingRelations = { ticketTier: true };

      const result = await bookingRepository.find(filters, relations);

      expect(result).toStrictEqual(bookingMock);
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
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
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: filters,
        relations: undefined,
      });
    });

    it('should return null when booking not found', async () => {
      const filters: FindOptionsWhere<BookingEntity> = {
        id: 'non-existent-id',
      };

      mockRepository.findOne.mockResolvedValueOnce(null);

      const result = await bookingRepository.find(filters);

      expect(result).toBeNull();
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: filters,
        relations: undefined,
      });
    });
  });
});
