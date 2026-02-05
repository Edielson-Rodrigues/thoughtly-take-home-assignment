import { Type, Static } from '@sinclair/typebox';

export const ConcertSchema = Type.Object(
  {
    id: Type.String({ format: 'uuid' }),
    name: Type.String({ example: 'Festival de Verão' }),
    description: Type.String(),
    location: Type.String(),
    date: Type.String({ format: 'date-time' }),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
  },
  { $id: 'Concert' },
);

export type ConcertResponse = Static<typeof ConcertSchema>;
