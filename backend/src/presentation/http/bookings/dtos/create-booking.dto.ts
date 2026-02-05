import { Static, Type } from '@sinclair/typebox';

import { BookingEntity } from '@domain/entities/booking/booking.entity';
import { BookingSchema } from '@presentation/docs/schemas/booking.schema';

export const CreateBookingBodySchema = Type.Object(
  {
    ticketTierId: Type.String({ format: 'uuid' }),
    userEmail: Type.String({ format: 'email' }),
    quantity: Type.Integer({ minimum: 1, maximum: 10 }),
    totalPrice: Type.Number({ minimum: 0 }),
    currency: Type.String({ minLength: 3, maxLength: 3 }),
    idempotencyKey: Type.String({ minLength: 10 }),
  },
  { $id: 'CreateBookingBody' },
);

export const CreateBookingResponseSchema = Type.Object({ booking: BookingSchema }, { $id: 'CreateBookingResponse' });

export type CreateBookingBodyDTO = Static<typeof CreateBookingBodySchema>;
export type CreateBookingResponseDTO = {
  booking: BookingEntity;
};
