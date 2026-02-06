import { DataSource } from 'typeorm';

import { ConcertsService } from '@app/services/concerts/concerts.service';
import { ConcertRepository } from '@database/repositories/concert/concert.repository';
import { Logger } from '@shared/logger';

import { ConcertUpdateSubject } from '../../../infrastructure/events/concert/concert-update.subject';

import { ConcertsController } from './concerts.controller';

export class ConcertsModule {
  static build(dataSource: DataSource): ConcertsController {
    const repository = new ConcertRepository(dataSource);
    const updateSubject = ConcertUpdateSubject.getInstance();

    const service = new ConcertsService(repository, updateSubject);
    const logger = Logger.getInstance();

    return new ConcertsController(service, logger);
  }
}
