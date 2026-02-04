import { IIdempotency } from './idempotency.interface';

export class Idempotency implements IIdempotency {
  key: string;
  userEmail: string;
  path: string;
  requestPayload: Record<string, any>;
  responseBody: Record<string, any>;
  responseStatus: number;
  createdAt: Date;
}
