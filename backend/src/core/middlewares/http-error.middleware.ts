import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { StatusCodes } from 'http-status-codes';

import { AppError } from '@core/errors/app.error';

export const httpErrorHandler = (
  error: FastifyError | Error | AppError,
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = 'Internal Server Error';
  let errorName: string | string[] = 'InternalServerError';

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    errorName = error.name;
  } else if ('validation' in error) {
    errorName = 'ValidationError';
    statusCode = (error as any).statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    message = (error as any).validation ? (error as any).validation.map((curr: any) => curr.message) : error.message;
  } else if ('statusCode' in error && typeof error.statusCode === 'number') {
    statusCode = error.statusCode;
    message = error.message;
  }

  if (statusCode >= 500) {
    request.log.error(error, `❌ Uncaught Error on ${request.url}`);
  } else {
    request.log.warn(`⚠️ Application Error: ${message}`);
  }

  reply.status(statusCode).send({
    statusCode,
    error: errorName,
    message,
    timestamp: new Date().toISOString(),
    path: request.url,
  });
};
