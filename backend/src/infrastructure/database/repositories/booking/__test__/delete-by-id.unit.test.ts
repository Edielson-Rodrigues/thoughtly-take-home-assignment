import { BookingMock } from '@domain/entities/booking/__mocks__/booking.mocks';

import { BookingRepository } from '../booking.repository';

describe('Database -> Booking Repository - Delete By Id', () => {
  const bookingMock = new BookingMock();

  const repositoryMock = {
    delete: jest.fn().mockResolvedValue(undefined),
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
      const result = await bookingRepository.deleteById(bookingMock.id);

      expect(result).toBeUndefined();
      expect(repositoryMock.delete).toHaveBeenCalledTimes(1);
      expect(repositoryMock.delete).toHaveBeenCalledWith({ id: bookingMock.id });
    });
  });
});
