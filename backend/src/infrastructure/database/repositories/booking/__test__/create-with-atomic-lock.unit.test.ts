import { EntityManager } from 'typeorm';

import { BookingMock } from '@domain/entities/booking/__mocks__/booking.mock';
import { BookingEntity } from '@domain/entities/booking/booking.entity';
import { CreateBooking } from '@domain/entities/booking/booking.interface';
import { TicketTierMock } from '@domain/entities/ticket-tier/__mocks__/ticket-tier.mock';
import { TicketTierEntity } from '@domain/entities/ticket-tier/ticket-tier.entity';
import { TicketTierOutOfStockError } from '@domain/errors/ticket-tier/ticket-tier-out-of-stock.error';

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

  const managerMock = {
    createQueryBuilder: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({ affected: 1 }),
    create: jest.fn().mockReturnValue(bookingMock),
    save: jest.fn().mockResolvedValue(bookingMock),
  };

  const dataSourceMock = {
    transaction: jest.fn().mockImplementation(async (callback: any) => {
      return await callback(managerMock as unknown as EntityManager);
    }),
    getRepository: jest.fn(),
  };

  let bookingRepository: BookingRepository;

  beforeAll(() => {
    bookingRepository = new BookingRepository(dataSourceMock as any);
  });

  afterEach(() => jest.clearAllMocks());

  describe('SUCCESS CASES', () => {
    it('should create booking when stock is available', async () => {
      const result = await bookingRepository.createWithAtomicLock(createBookingData);

      expect(result).toStrictEqual(bookingMock);
      expect(dataSourceMock.transaction).toHaveBeenCalledTimes(1);
      expect(managerMock.createQueryBuilder).toHaveBeenCalledTimes(1);

      expect(managerMock.update).toHaveBeenCalledTimes(1);
      expect(managerMock.update).toHaveBeenCalledWith(TicketTierEntity);

      expect(managerMock.set).toHaveBeenCalledTimes(1);
      expect(managerMock.set).toHaveBeenCalledWith({
        availableQuantity: expect.any(Function),
      });

      expect(managerMock.where).toHaveBeenCalledTimes(1);
      expect(managerMock.where).toHaveBeenCalledWith('id = :id', {
        id: createBookingData.ticketTierId,
      });

      expect(managerMock.andWhere).toHaveBeenCalledTimes(1);
      expect(managerMock.andWhere).toHaveBeenCalledWith('available_quantity >= :qty', {
        qty: createBookingData.quantity,
      });

      expect(managerMock.execute).toHaveBeenCalledTimes(1);

      expect(managerMock.create).toHaveBeenCalledTimes(1);
      expect(managerMock.create).toHaveBeenCalledWith(BookingEntity, {
        userEmail: createBookingData.userEmail,
        ticketTierId: createBookingData.ticketTierId,
        quantity: createBookingData.quantity,
        totalPrice: createBookingData.totalPrice,
      });
      expect(managerMock.save).toHaveBeenCalledWith(bookingMock);
    });
  });

  describe('ERROR CASES', () => {
    it('should throw SOLD_OUT error when stock is insufficient', async () => {
      const updateResult = { affected: 0 };

      managerMock.execute.mockResolvedValueOnce(updateResult);

      await expect(bookingRepository.createWithAtomicLock(createBookingData)).rejects.toThrow(
        TicketTierOutOfStockError,
      );

      expect(dataSourceMock.transaction).toHaveBeenCalledTimes(1);
      expect(managerMock.createQueryBuilder).toHaveBeenCalledTimes(1);

      expect(managerMock.update).toHaveBeenCalledTimes(1);
      expect(managerMock.update).toHaveBeenCalledWith(TicketTierEntity);

      expect(managerMock.set).toHaveBeenCalledTimes(1);
      expect(managerMock.set).toHaveBeenCalledWith({
        availableQuantity: expect.any(Function),
      });

      expect(managerMock.where).toHaveBeenCalledTimes(1);
      expect(managerMock.where).toHaveBeenCalledWith('id = :id', {
        id: createBookingData.ticketTierId,
      });

      expect(managerMock.andWhere).toHaveBeenCalledTimes(1);
      expect(managerMock.andWhere).toHaveBeenCalledWith('available_quantity >= :qty', {
        qty: createBookingData.quantity,
      });

      expect(managerMock.execute).toHaveBeenCalledTimes(1);

      expect(managerMock.create).not.toHaveBeenCalled();
      expect(managerMock.save).not.toHaveBeenCalled();
    });
  });
});
