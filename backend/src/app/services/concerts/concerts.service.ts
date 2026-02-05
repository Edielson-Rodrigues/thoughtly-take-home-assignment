import { map, Observable } from 'rxjs';
import { FindOptionsWhere } from 'typeorm';

import { ConcertRepository } from '@database/repositories/concert/concert.repository';
import { ConcertEntity } from '@domain/entities/concert/concert.entity';
import { ConcertRelations } from '@domain/entities/concert/concert.interface';

import { ConcertUpdateSubject } from '../../../infrastructure/events/concert/concert-update.subject';

/**
 * CONCERT SERVICE
 *
 * Orchestrates the retrieval of concert data and real-time streams.
 */
export class ConcertsService {
  constructor(
    private readonly concertRepository: ConcertRepository,
    private readonly updatesSubject: ConcertUpdateSubject,
  ) {}

  /**
   * Fetches the complete catalog with all ticket tiers.
   * Used for the initial page load.
   */
  async findAll(filters: FindOptionsWhere<ConcertEntity>, relations?: ConcertRelations): Promise<ConcertEntity[]> {
    return await this.concertRepository.findAll(filters, relations);
  }

  /**
   * Creates an Observable stream formatted for Server-Sent Events (SSE).
   *
   * Transformation:
   * RxJS 'map' converts the raw update object into the SSE text format:
   * "data: { ...JSON... }\n\n"
   */
  subscribeToUpdates(): Observable<string> {
    return this.updatesSubject.asObservable().pipe(
      map((update) => {
        return `data: ${JSON.stringify(update)}\n\n`;
      }),
    );
  }
}
