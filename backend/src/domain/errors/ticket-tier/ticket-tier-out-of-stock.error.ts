import { StatusCodes } from 'http-status-codes';

import { AppError } from '@core/errors/app.error';

export class TicketTierOutOfStockError extends AppError {
  constructor() {
    super(StatusCodes.UNPROCESSABLE_ENTITY, 'The ticket tier is out of stock.');
  }
}
