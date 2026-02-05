import { Type, Static } from '@sinclair/typebox';

export const BookingSchema = Type.Object(
  {
    id: Type.String({ format: 'uuid' }),
    userEmail: Type.String({ format: 'email' }),
    quantity: Type.Integer(),
    totalPrice: Type.Number(),
    ticketTierId: Type.String({ format: 'uuid' }),
    createdAt: Type.String({ format: 'date-time' }),
  },
  { $id: 'Booking' },
);

export type BookingResponse = Static<typeof BookingSchema>;
