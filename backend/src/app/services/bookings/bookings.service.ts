import { StatusCodes } from 'http-status-codes';

import { IdempotencyRepository } from '@cache/repositories/idempotency/idempotency.repository';
import { BookingRepository } from '@database/repositories/booking/booking.repository';
import { TicketTierRepository } from '@database/repositories/ticket-tier/ticket-tier.repository';
import { BookingEntity } from '@domain/entities/booking/booking.entity';
import { InvalidPaymentForTicketTierError } from '@domain/errors/ticket-tier/invalid-payment-for-ticket-tier.error';
import { TicketTierNotFoundError } from '@domain/errors/ticket-tier/ticket-tier-not-found.error';
import { TicketTierPaymentFailedError } from '@domain/errors/ticket-tier/ticket-tier-payment-failed.error';
import { CreateBookingBodyDTO } from '@presentation/http/bookings/dtos/create-booking.dto';

import { ConcertUpdateSubject } from '../../../infrastructure/events/concert/concert-update.subject';
import { PaymentGatewayProvider } from '../../../infrastructure/providers/payment-gateway/payment-gatewat.provider';

/**
 * BOOKING SERVICE
 *
 * Handles the creation of bookings, including payment processing,
 * ticket tier validation, and idempotency.
 */
export class BookingService {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly ticketTierRepository: TicketTierRepository,
    private readonly idempotencyRepository: IdempotencyRepository,
    private readonly paymentGatewayProvider: PaymentGatewayProvider,
    private readonly concertUpdateSubject: ConcertUpdateSubject,
  ) {}

  /**
   * Creates a new booking with the provided data.
   *
   * Steps:
   * 1. Check for existing booking using idempotency key.
   * 2. Validate ticket tier existence and pricing.
   * 3. Create booking with atomic lock to prevent overselling.
   * 4. Process payment through the payment gateway.
   * 5. If payment fails, rollback booking and restore stock.
   * 6. Notify via SSE about updated ticket availability.
   * 7. Cache the result for idempotency.
   */
  async create(data: CreateBookingBodyDTO, path: string): Promise<BookingEntity> {
    const cachedResult = await this.idempotencyRepository.findByKey<BookingEntity>(data.idempotencyKey);
    if (cachedResult) {
      return cachedResult.responseBody;
    }

    const savedResult = await this.bookingRepository.findOne({ idempotencyKey: data.idempotencyKey });
    if (savedResult) {
      return savedResult;
    }

    const tier = await this.ticketTierRepository.findOne({ id: data.ticketTierId });
    if (!tier) {
      throw new TicketTierNotFoundError({ id: data.ticketTierId });
    }

    const expectedPrice = Number(tier.price) * data.quantity;
    if (expectedPrice !== data.totalPrice) {
      throw new InvalidPaymentForTicketTierError({
        reason: `Expected total price ${expectedPrice}, but got ${data.totalPrice}`,
      });
    }

    const booking = await this.bookingRepository.createWithAtomicLock({
      userEmail: data.userEmail,
      ticketTierId: data.ticketTierId,
      quantity: data.quantity,
      totalPrice: data.totalPrice,
      idempotencyKey: data.idempotencyKey,
    });

    const isPaid = await this.paymentGatewayProvider.process(data.totalPrice, data.currency);
    if (!isPaid) {
      await this.bookingRepository.deleteById(booking.id);
      await this.ticketTierRepository.increaseStock(data.ticketTierId, data.quantity);

      throw new TicketTierPaymentFailedError();
    }

    this.concertUpdateSubject.next({
      concertId: tier.concertId,
      ticketTierId: tier.id,
      newAvailableQuantity: tier.availableQuantity - data.quantity,
    });

    await this.idempotencyRepository.create({
      key: data.idempotencyKey,
      createdAt: new Date(),
      responseBody: booking,
      requestPayload: data,
      responseStatus: StatusCodes.CREATED,
      userEmail: data.userEmail,
      path,
    });

    return booking;
  }
}
