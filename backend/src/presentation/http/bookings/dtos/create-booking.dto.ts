import { Static, Type } from '@sinclair/typebox';

import { BookingEntity } from '@domain/entities/booking/booking.entity';
import { BookingSchema } from '@presentation/docs/schemas/booking.schema';
import { SupportedCurrencies } from '@shared/supported-currencies';

export const CreateBookingBodySchema = Type.Object(
  {
    ticketTierId: Type.String({ format: 'uuid', errorMessage: 'Invalid UUID format for ticketTierId' }),
    userEmail: Type.String({ format: 'email', errorMessage: 'Invalid email format' }),
    quantity: Type.Integer({ minimum: 1, maximum: 10, errorMessage: 'Quantity must be between 1 and 10' }),
    totalPrice: Type.Number({ minimum: 0, errorMessage: 'Total price must be a positive number' }),
    currency: Type.Enum(SupportedCurrencies, { errorMessage: 'Currency must be a valid ISO 4217 code' }),
    idempotencyKey: Type.String({ minLength: 10, errorMessage: 'Idempotency key must be at least 10 characters long' }),
  },
  {
    $id: 'CreateBookingBody',
    errorMessage: {
      required: {
        userEmail: 'User email is required',
        ticketTierId: 'Ticket tier ID is required',
        quantity: 'Quantity is required',
        totalPrice: 'Total price is required',
        currency: 'Currency is required',
        idempotencyKey: 'Idempotency key is required',
      },
    },
  },
);

export const CreateBookingResponseSchema = Type.Object({ booking: BookingSchema }, { $id: 'CreateBookingResponse' });

export type CreateBookingBodyDTO = Static<typeof CreateBookingBodySchema>;
export type CreateBookingResponseDTO = {
  booking: BookingEntity;
};
