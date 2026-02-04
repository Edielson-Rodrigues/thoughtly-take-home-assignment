import { StatusCodes } from 'http-status-codes';

import { AppException } from '@core/errors/app.exception';

export class TicketTierOutOfStockException extends AppException {
  constructor() {
    super(StatusCodes.UNPROCESSABLE_ENTITY, 'The ticket tier is out of stock.');
  }
}
