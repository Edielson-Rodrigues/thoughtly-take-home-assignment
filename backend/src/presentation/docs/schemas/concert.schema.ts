import { Type, Static } from '@sinclair/typebox';

export const ConcertSchema = Type.Object(
  {
    id: Type.String({ format: 'uuid' }),
    name: Type.String({ maxLength: 255 }),
    description: Type.String(),
    location: Type.String({ maxLength: 255 }),
    date: Type.String({ format: 'date-time' }),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.Optional(Type.String({ format: 'date-time' })),
  },
  { $id: 'Concert' },
);

export type ConcertResponse = Static<typeof ConcertSchema>;
