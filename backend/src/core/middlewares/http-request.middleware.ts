import { FastifyReply, FastifyRequest } from 'fastify';
import { StatusCodes } from 'http-status-codes';

export type ActionRequest<TBody = any, TQuery = any, TParams = any> = {
  body: TBody;
  query: TQuery;
  params: TParams;
  path: string;
};

export const httpRequestHandler = <TBody, TQuery, TParams, TRes>(
  handler: (req: ActionRequest<TBody, TQuery, TParams>) => Promise<TRes> | TRes,
  statusCode: StatusCodes = StatusCodes.OK,
) => {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await handler({
      body: req.body as TBody,
      query: req.query as TQuery,
      params: req.params as TParams,
      path: req.url,
    });

    return reply.status(statusCode).send(result);
  };
};
