import { StatusCodes } from 'http-status-codes';

import { BookingMock } from '@domain/entities/booking/__mocks__/booking.mocks';
import { TicketTierMock } from '@domain/entities/ticket-tier/__mocks__/ticket-tier.mock';
import { InvalidPaymentForTicketTierError } from '@domain/errors/ticket-tier/invalid-payment-for-ticket-tier.error';
import { TicketTierNotFoundError } from '@domain/errors/ticket-tier/ticket-tier-not-found.error';
import { TicketTierPaymentFailedError } from '@domain/errors/ticket-tier/ticket-tier-payment-failed.error';
import { CreateBookingBodyDTO } from '@presentation/http/bookings/dtos/create-booking.dto';

import { BookingService } from '../bookings.service';

describe('Service -> Bookings -> Create', () => {
  const bookingMock = new BookingMock();
  const ticketTierMock = new TicketTierMock();

  const expectedTotalPrice = Number(ticketTierMock.price) * bookingMock.quantity;

  const createBookingData: CreateBookingBodyDTO = {
    ticketTierId: ticketTierMock.id,
    userEmail: bookingMock.userEmail,
    quantity: bookingMock.quantity,
    totalPrice: expectedTotalPrice,
    currency: 'USD',
    idempotencyKey: 'unique-key-12345',
  };

  const path = '/bookings';

  const bookingRepositoryMock = {
    createWithAtomicLock: jest.fn().mockResolvedValue(bookingMock),
    deleteById: jest.fn().mockResolvedValue(undefined),
  };

  const ticketTierRepositoryMock = {
    findOne: jest.fn().mockResolvedValue(ticketTierMock),
    increaseStock: jest.fn().mockResolvedValue(undefined),
  };

  const idempotencyRepositoryMock = {
    findByKey: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue(undefined),
  };

  const paymentGatewayProviderMock = {
    process: jest.fn().mockResolvedValue(true),
  };

  const concertUpdateSubjectMock = {
    next: jest.fn(),
  };

  let bookingService: BookingService;

  beforeAll(() => {
    bookingService = new BookingService(
      bookingRepositoryMock as any,
      ticketTierRepositoryMock as any,
      idempotencyRepositoryMock as any,
      paymentGatewayProviderMock as any,
      concertUpdateSubjectMock as any,
    );
  });

  afterEach(() => jest.clearAllMocks());

  describe('SUCCESS CASES', () => {
    it('should create booking successfully when all conditions are met', async () => {
      const result = await bookingService.create(createBookingData, path);

      expect(result).toStrictEqual(bookingMock);

      expect(idempotencyRepositoryMock.findByKey).toHaveBeenCalledTimes(1);
      expect(idempotencyRepositoryMock.findByKey).toHaveBeenCalledWith(createBookingData.idempotencyKey);

      expect(ticketTierRepositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(ticketTierRepositoryMock.findOne).toHaveBeenCalledWith({ id: createBookingData.ticketTierId });

      expect(bookingRepositoryMock.createWithAtomicLock).toHaveBeenCalledTimes(1);
      expect(bookingRepositoryMock.createWithAtomicLock).toHaveBeenCalledWith({
        userEmail: createBookingData.userEmail,
        ticketTierId: createBookingData.ticketTierId,
        quantity: createBookingData.quantity,
        totalPrice: createBookingData.totalPrice,
      });

      expect(paymentGatewayProviderMock.process).toHaveBeenCalledTimes(1);
      expect(paymentGatewayProviderMock.process).toHaveBeenCalledWith(createBookingData.totalPrice);

      expect(concertUpdateSubjectMock.next).toHaveBeenCalledTimes(1);
      expect(concertUpdateSubjectMock.next).toHaveBeenCalledWith({
        concertId: ticketTierMock.concertId,
        ticketTierId: ticketTierMock.id,
        newAvailableQuantity: ticketTierMock.availableQuantity - createBookingData.quantity,
      });

      expect(idempotencyRepositoryMock.create).toHaveBeenCalledTimes(1);
      expect(idempotencyRepositoryMock.create).toHaveBeenCalledWith({
        key: createBookingData.idempotencyKey,
        createdAt: expect.any(Date),
        responseBody: bookingMock,
        requestPayload: createBookingData,
        responseStatus: StatusCodes.CREATED,
        userEmail: createBookingData.userEmail,
        path,
      });

      expect(bookingRepositoryMock.deleteById).not.toHaveBeenCalled();
      expect(ticketTierRepositoryMock.increaseStock).not.toHaveBeenCalled();
    });

    it('should return cached result if idempotency key exists', async () => {
      const cachedResult = { responseBody: bookingMock };
      idempotencyRepositoryMock.findByKey.mockResolvedValueOnce(cachedResult);

      const result = await bookingService.create(createBookingData, path);

      expect(result).toStrictEqual(bookingMock);
      expect(idempotencyRepositoryMock.findByKey).toHaveBeenCalledTimes(1);
      expect(idempotencyRepositoryMock.findByKey).toHaveBeenCalledWith(createBookingData.idempotencyKey);

      expect(ticketTierRepositoryMock.findOne).not.toHaveBeenCalled();
      expect(bookingRepositoryMock.createWithAtomicLock).not.toHaveBeenCalled();
      expect(paymentGatewayProviderMock.process).not.toHaveBeenCalled();
      expect(concertUpdateSubjectMock.next).not.toHaveBeenCalled();
      expect(idempotencyRepositoryMock.create).not.toHaveBeenCalled();

      expect(bookingRepositoryMock.deleteById).not.toHaveBeenCalled();
      expect(ticketTierRepositoryMock.increaseStock).not.toHaveBeenCalled();
    });
  });

  describe('ERROR CASES', () => {
    it('should throw TICKET_TIER_NOT_FOUND when ticket tier does not exist', async () => {
      ticketTierRepositoryMock.findOne.mockResolvedValueOnce(null);

      await expect(bookingService.create(createBookingData, path)).rejects.toThrow(TicketTierNotFoundError);

      expect(idempotencyRepositoryMock.findByKey).toHaveBeenCalledTimes(1);
      expect(idempotencyRepositoryMock.findByKey).toHaveBeenCalledWith(createBookingData.idempotencyKey);

      expect(ticketTierRepositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(ticketTierRepositoryMock.findOne).toHaveBeenCalledWith({ id: createBookingData.ticketTierId });

      expect(bookingRepositoryMock.createWithAtomicLock).not.toHaveBeenCalled();
      expect(paymentGatewayProviderMock.process).not.toHaveBeenCalled();
      expect(concertUpdateSubjectMock.next).not.toHaveBeenCalled();
      expect(idempotencyRepositoryMock.create).not.toHaveBeenCalled();

      expect(bookingRepositoryMock.deleteById).not.toHaveBeenCalled();
      expect(ticketTierRepositoryMock.increaseStock).not.toHaveBeenCalled();
    });

    it('should throw INVALID_PAYMENT when total price does not match expected', async () => {
      const invalidData = { ...createBookingData, totalPrice: ticketTierMock.price * createBookingData.quantity + 1 };

      await expect(bookingService.create(invalidData, path)).rejects.toThrow(InvalidPaymentForTicketTierError);

      expect(idempotencyRepositoryMock.findByKey).toHaveBeenCalledTimes(1);
      expect(idempotencyRepositoryMock.findByKey).toHaveBeenCalledWith(invalidData.idempotencyKey);

      expect(ticketTierRepositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(ticketTierRepositoryMock.findOne).toHaveBeenCalledWith({ id: invalidData.ticketTierId });

      expect(bookingRepositoryMock.createWithAtomicLock).not.toHaveBeenCalled();
      expect(paymentGatewayProviderMock.process).not.toHaveBeenCalled();
      expect(concertUpdateSubjectMock.next).not.toHaveBeenCalled();
      expect(idempotencyRepositoryMock.create).not.toHaveBeenCalled();

      expect(bookingRepositoryMock.deleteById).not.toHaveBeenCalled();
      expect(ticketTierRepositoryMock.increaseStock).not.toHaveBeenCalled();
    });

    it('should throw PAYMENT_FAILED and rollback when payment fails', async () => {
      paymentGatewayProviderMock.process.mockResolvedValueOnce(false);

      await expect(bookingService.create(createBookingData, path)).rejects.toThrow(TicketTierPaymentFailedError);

      expect(idempotencyRepositoryMock.findByKey).toHaveBeenCalledTimes(1);
      expect(idempotencyRepositoryMock.findByKey).toHaveBeenCalledWith(createBookingData.idempotencyKey);

      expect(ticketTierRepositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(ticketTierRepositoryMock.findOne).toHaveBeenCalledWith({ id: createBookingData.ticketTierId });

      expect(bookingRepositoryMock.createWithAtomicLock).toHaveBeenCalledTimes(1);
      expect(bookingRepositoryMock.createWithAtomicLock).toHaveBeenCalledWith({
        userEmail: createBookingData.userEmail,
        ticketTierId: createBookingData.ticketTierId,
        quantity: createBookingData.quantity,
        totalPrice: createBookingData.totalPrice,
      });

      expect(paymentGatewayProviderMock.process).toHaveBeenCalledTimes(1);
      expect(paymentGatewayProviderMock.process).toHaveBeenCalledWith(createBookingData.totalPrice);

      expect(bookingRepositoryMock.deleteById).toHaveBeenCalledTimes(1);
      expect(bookingRepositoryMock.deleteById).toHaveBeenCalledWith(bookingMock.id);

      expect(ticketTierRepositoryMock.increaseStock).toHaveBeenCalledTimes(1);
      expect(ticketTierRepositoryMock.increaseStock).toHaveBeenCalledWith(
        createBookingData.ticketTierId,
        createBookingData.quantity,
      );

      expect(concertUpdateSubjectMock.next).not.toHaveBeenCalled();
      expect(idempotencyRepositoryMock.create).not.toHaveBeenCalled();
    });
  });
});
