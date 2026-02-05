import { StatusCodes } from 'http-status-codes';

import { AppError } from '@core/errors/app.error';

export class TicketTierNotFoundError extends AppError {
  constructor(params: { id: string }) {
    super(StatusCodes.NOT_FOUND, 'The ticket tier with ID {{id}} was not found.', params);
  }
}
