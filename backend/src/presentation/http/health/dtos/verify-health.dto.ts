import { Type, Static } from '@sinclair/typebox';

export const VerifyHealthResponseSchema = Type.Object({
  status: Type.String(),
  timestamp: Type.String({ format: 'date-time' }),
});

export type VerifyHealthResponseDTO = Static<typeof VerifyHealthResponseSchema>;
