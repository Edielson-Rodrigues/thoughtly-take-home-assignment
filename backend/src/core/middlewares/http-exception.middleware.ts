import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { StatusCodes } from 'http-status-codes';

import { AppException } from '@core/errors/app.exception';

export const httpExceptionHandler = (
  error: FastifyError | Error | AppException,
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = 'Internal Server Error';
  let errorName = 'InternalServerError';

  if (error instanceof AppException) {
    statusCode = error.statusCode;
    message = error.message;
    errorName = error.name;
  } else if ('statusCode' in error && typeof error.statusCode === 'number') {
    statusCode = error.statusCode;
    message = error.message;
  }

  if (statusCode >= 500) {
    request.log.error(error, `❌ Uncaught Exception on ${request.url}`);
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
