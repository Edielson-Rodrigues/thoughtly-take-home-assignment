import { DataSource, FindOptionsWhere, Repository } from 'typeorm';

import { ConcertEntity } from '@domain/entities/concert/concert.entity';
import { ConcertRelations } from '@domain/entities/concert/concert.interface';

/**
 * CONCERT REPOSITORY
 *
 * Manages retrieval of concert events.
 *
 * This repository serves as the backbone for the "Catalog" feature,
 * allowing users to browse upcoming shows and fetch details for specific events.
 */
export class ConcertRepository {
  private readonly typeOrmRepo: Repository<ConcertEntity>;

  constructor(private readonly dataSource: DataSource) {
    this.typeOrmRepo = this.dataSource.getRepository(ConcertEntity);
  }

  /**
   * Retrieves a list of concerts.
   */
  async find(filters: FindOptionsWhere<ConcertEntity>, relations?: ConcertRelations): Promise<ConcertEntity[]> {
    return await this.typeOrmRepo.find({
      where: filters,
      relations: relations,
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
