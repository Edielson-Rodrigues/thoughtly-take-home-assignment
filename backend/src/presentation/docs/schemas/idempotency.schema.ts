import { Type, Static } from '@sinclair/typebox';

export const IdempotencySchema = Type.Object(
  {
    key: Type.String(),
    userEmail: Type.String({ format: 'email' }),
    path: Type.String(),
    requestPayload: Type.Any(),
    responseBody: Type.Any(),
    responseStatus: Type.Integer(),
    createdAt: Type.String({ format: 'date-time' }),
  },
  { $id: 'Idempotency' },
);

export type IdempotencyResponse = Static<typeof IdempotencySchema>;
