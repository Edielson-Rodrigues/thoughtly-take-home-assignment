import { StatusCodes } from 'http-status-codes';

import { AppError } from '@core/errors/app.error';

export class TicketTierPaymentFailedError extends AppError {
  constructor() {
    super(StatusCodes.UNPROCESSABLE_ENTITY, 'The payment for the ticket tier has failed.');
  }
}
