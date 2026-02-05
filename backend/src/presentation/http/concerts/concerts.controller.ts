import { FastifyReply, FastifyRequest } from 'fastify';
import pino from 'pino';

import { ConcertsService } from '@app/services/concerts/concerts.service';

import { FindConcertsResponseDTO } from './dtos/find.concerts.dto';

export class ConcertsController {
  constructor(
    private readonly concertService: ConcertsService,
    private readonly logger: pino.Logger,
  ) {}

  async findAll(): Promise<FindConcertsResponseDTO> {
    const concerts = await this.concertService.findAll({}, { ticketTiers: true });
    return { concerts };
  }

  stream(req: FastifyRequest, reply: FastifyReply) {
    reply.raw.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    reply.raw.setHeader('Access-Control-Allow-Credentials', 'true');

    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.flushHeaders();

    const subscription = this.concertService.subscribeToUpdates().subscribe({
      next: (data) => {
        reply.raw.write(data);
      },
      error: (err) => {
        this.logger.error({ err }, 'SSE Stream Error');
        reply.raw.end();
      },
    });

    req.raw.on('close', () => {
      this.logger.info('SSE Client disconnected');
      subscription.unsubscribe();
    });
  }
}
