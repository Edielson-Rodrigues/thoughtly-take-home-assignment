import { EntityManager } from 'typeorm';

import { BookingMock } from '@domain/entities/booking/__mocks__/booking.mocks';
import { BookingEntity } from '@domain/entities/booking/booking.entity';
import { CreateBooking } from '@domain/entities/booking/booking.interface';
import { TicketTierMock } from '@domain/entities/ticket-tier/__mocks__/ticket-tier.mock';
import { TicketTierEntity } from '@domain/entities/ticket-tier/ticket-tier.entity';
import { TicketTierOutOfStockException } from '@domain/errors/ticket-tier/ticket-tier-out-of-stock.exception';

import { BookingRepository } from '../booking.repository';

describe('Database -> Booking Repository - Create With Atomic Lock', () => {
  const bookingMock = new BookingMock();
  const ticketTierMock = new TicketTierMock();

  const createBookingData: CreateBooking = {
    userEmail: bookingMock.userEmail,
    ticketTierId: ticketTierMock.id,
    quantity: bookingMock.quantity,
    totalPrice: bookingMock.totalPrice,
  };

  const mockManager = {
    createQueryBuilder: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({ affected: 1 }),
    create: jest.fn().mockReturnValue(bookingMock),
    save: jest.fn().mockResolvedValue(bookingMock),
  };

  const mockDataSource = {
    transaction: jest.fn().mockImplementation(async (callback: any) => {
      return await callback(mockManager as unknown as EntityManager);
    }),
    getRepository: jest.fn(),
  };

  let bookingRepository: BookingRepository;

  beforeAll(() => {
    bookingRepository = new BookingRepository(mockDataSource as any);
  });

  afterEach(() => jest.clearAllMocks());

  describe('SUCCESS CASES', () => {
    it('should create booking when stock is available', async () => {
      const result = await bookingRepository.createWithAtomicLock(createBookingData);

      expect(result).toStrictEqual(bookingMock);
      expect(mockDataSource.transaction).toHaveBeenCalledTimes(1);
      expect(mockManager.createQueryBuilder).toHaveBeenCalledTimes(1);

      expect(mockManager.update).toHaveBeenCalledTimes(1);
      expect(mockManager.update).toHaveBeenCalledWith(TicketTierEntity);

      expect(mockManager.set).toHaveBeenCalledTimes(1);
      expect(mockManager.set).toHaveBeenCalledWith({
        availableQuantity: expect.any(Function),
      });

      expect(mockManager.where).toHaveBeenCalledTimes(1);
      expect(mockManager.where).toHaveBeenCalledWith('id = :id', {
        id: createBookingData.ticketTierId,
      });

      expect(mockManager.andWhere).toHaveBeenCalledTimes(1);
      expect(mockManager.andWhere).toHaveBeenCalledWith('available_quantity >= :qty', {
        qty: createBookingData.quantity,
      });

      expect(mockManager.execute).toHaveBeenCalledTimes(1);

      expect(mockManager.create).toHaveBeenCalledTimes(1);
      expect(mockManager.create).toHaveBeenCalledWith(BookingEntity, {
        userEmail: createBookingData.userEmail,
        ticketTierId: createBookingData.ticketTierId,
        quantity: createBookingData.quantity,
        totalPrice: createBookingData.totalPrice,
      });
      expect(mockManager.save).toHaveBeenCalledWith(bookingMock);
    });
  });

  describe('ERROR CASES', () => {
    it('should throw SOLD_OUT error when stock is insufficient', async () => {
      const updateResult = { affected: 0 };

      mockManager.execute.mockResolvedValueOnce(updateResult);

      await expect(bookingRepository.createWithAtomicLock(createBookingData)).rejects.toThrow(
        TicketTierOutOfStockException,
      );

      expect(mockDataSource.transaction).toHaveBeenCalledTimes(1);
      expect(mockManager.createQueryBuilder).toHaveBeenCalledTimes(1);

      expect(mockManager.update).toHaveBeenCalledTimes(1);
      expect(mockManager.update).toHaveBeenCalledWith(TicketTierEntity);

      expect(mockManager.set).toHaveBeenCalledTimes(1);
      expect(mockManager.set).toHaveBeenCalledWith({
        availableQuantity: expect.any(Function),
      });

      expect(mockManager.where).toHaveBeenCalledTimes(1);
      expect(mockManager.where).toHaveBeenCalledWith('id = :id', {
        id: createBookingData.ticketTierId,
      });

      expect(mockManager.andWhere).toHaveBeenCalledTimes(1);
      expect(mockManager.andWhere).toHaveBeenCalledWith('available_quantity >= :qty', {
        qty: createBookingData.quantity,
      });

      expect(mockManager.execute).toHaveBeenCalledTimes(1);

      expect(mockManager.create).not.toHaveBeenCalled();
      expect(mockManager.save).not.toHaveBeenCalled();
    });
  });
});
