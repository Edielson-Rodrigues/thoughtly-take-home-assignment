import { Type, Static } from '@sinclair/typebox';

export const TicketTierSchema = Type.Object(
  {
    id: Type.String({ format: 'uuid' }),
    name: Type.String({ example: 'VIP', maxLength: 100 }),
    price: Type.Number({ example: 250.0 }),
    totalQuantity: Type.Integer(),
    availableQuantity: Type.Integer(),
    concertId: Type.String({ format: 'uuid' }),
    createdAt: Type.String({ format: 'date-time' }),
  },
  { $id: 'TicketTier' },
);

export type TicketTierResponse = Static<typeof TicketTierSchema>;
