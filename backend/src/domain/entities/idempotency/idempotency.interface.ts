export interface IIdempotency {
  key: string;
  userEmail: string;
  path: string;
  requestPayload: Record<string, any>;
  responseBody: Record<string, any>;
  responseStatus: number;
  createdAt: Date;
}
