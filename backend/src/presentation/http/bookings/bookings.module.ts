import { Logger } from '@shared/logger';
import Redis from 'ioredis';
import { DataSource } from 'typeorm';

import { BookingService } from '@app/services/bookings/bookings.service';
import { IdempotencyRepository } from '@cache/repositories/idempotency/idempotency.repository';
import { BookingRepository } from '@database/repositories/booking/booking.repository';
import { TicketTierRepository } from '@database/repositories/ticket-tier/ticket-tier.repository';

import { ConcertUpdateSubject } from '../../../infrastructure/events/concert/concert-update.subject';
import { PaymentGatewayProvider } from '../../../infrastructure/providers/payment-gateway/payment-gatewat.provider';

import { BookingsController } from './bookings.controller';

export class BookingsModule {
  static build(dataSource: DataSource, cacheClient: Redis): BookingsController {
    const bookingRepository = new BookingRepository(dataSource);
    const ticketTierRepository = new TicketTierRepository(dataSource);
    const idempotencyRepository = new IdempotencyRepository(cacheClient);
    const logger = Logger.getInstance();
    const paymentGatewayProvider = new PaymentGatewayProvider(logger);
    const concertUpdateSubject = ConcertUpdateSubject.getInstance();

    const bookingService = new BookingService(
      bookingRepository,
      ticketTierRepository,
      idempotencyRepository,
      paymentGatewayProvider,
      concertUpdateSubject,
    );
    return new BookingsController(bookingService);
  }
}
