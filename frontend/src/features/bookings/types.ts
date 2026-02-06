/**
 * Supported currencies - matches backend SupportedCurrencies
 * @see backend/src/shared/supported-currencies.ts
 */
export const SupportedCurrencies = {
  USD: 'USD',
} as const;

export type SupportedCurrencies = (typeof SupportedCurrencies)[keyof typeof SupportedCurrencies];

/**
 * Booking entity - matches backend BookingEntity
 * @see backend/src/domain/entities/booking/booking.entity.ts
 */
export interface Booking {
  id: string;
  userEmail: string;
  quantity: number;
  totalPrice: number;
  ticketTierId: string;
  createdAt: string;
}

/**
 * Request body for POST /bookings
 * @see backend/src/presentation/http/bookings/dtos/create-booking.dto.ts
 */
export interface CreateBookingDTO {
  ticketTierId: string;
  userEmail: string;
  quantity: number;
  totalPrice: number;
  currency: SupportedCurrencies;
  idempotencyKey: string;
}

/**
 * Response type for POST /bookings
 * @see backend/src/presentation/http/bookings/dtos/create-booking.dto.ts
 */
export interface CreateBookingResponse {
  booking: Booking;
}

/**
 * Known backend error codes for bookings
 * @see backend/src/domain/errors/ticket-tier/
 */
export const BookingErrorCodes = {
  SOLD_OUT: 'TicketTierOutOfStockError',
  PAYMENT_FAILED: 'TicketTierPaymentFailedError',
  NOT_FOUND: 'TicketTierNotFoundError',
  INVALID_PAYMENT: 'InvalidPaymentForTicketTierError',
} as const;
