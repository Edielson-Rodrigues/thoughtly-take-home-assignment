import { Type } from '@sinclair/typebox';

import { ConcertEntity } from '@domain/entities/concert/concert.entity';
import { ConcertSchema } from '@presentation/docs/schemas/concert.schema';
import { TicketTierSchema } from '@presentation/docs/schemas/ticket-tier.schema';

export const ConcertWithTiersSchema = Type.Intersect(
  [
    ConcertSchema,
    Type.Object({
      ticketTiers: Type.Array(TicketTierSchema),
    }),
  ],
  { $id: 'ConcertWithTiers' },
);

export const FindConcertsResponseSchema = Type.Object(
  {
    concerts: Type.Array(ConcertWithTiersSchema),
  },
  { $id: 'FindConcertsResponse' },
);

export type FindConcertsResponseDTO = {
  concerts: ConcertEntity[];
};
