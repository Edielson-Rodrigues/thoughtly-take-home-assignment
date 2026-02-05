import { StatusCodes } from 'http-status-codes';

import { AppError } from '@core/errors/app.error';

export class InvalidPaymentForTicketTierError extends AppError {
  constructor(params: { reason: string }) {
    super(StatusCodes.UNPROCESSABLE_ENTITY, 'The payment for the ticket tier is invalid. Reason: {{reason}}', params);
  }
}
