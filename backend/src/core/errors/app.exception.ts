import { StatusCodes } from 'http-status-codes';

/**
 * APP EXCEPTION (BASE)
 *
 * The foundational error class for the entire application.
 *
 * Features:
 * 1. Standardizes error responses with HTTP Status Codes.
 * 2. Supports dynamic message formatting using {{key}} placeholders.
 *
 * @example
 * throw new AppException(StatusCodes.NOT_FOUND, "User {{id}} not found", { id: 123 });
 * Result Message: "User 123 not found"
 */
export class AppException extends Error {
  public readonly statusCode: StatusCodes;
  public readonly params?: Record<string, any>;

  constructor(statusCode: StatusCodes, message: string, params?: Record<string, any>) {
    super(message);
    this.statusCode = statusCode;
    this.params = params;
    this.name = this.constructor.name;
    this.message = this.formatMessageWithParams();
  }

  private formatMessageWithParams(): string {
    if (!this.params) {
      return this.message;
    }

    return Object.entries(this.params).reduce((msg, [key, value]) => {
      // Replaces literal {{key}} with the provided value
      return msg.replace(`{{${key}}}`, String(value));
    }, this.message);
  }
}
