import { DataSource, FindOptionsWhere, Repository } from 'typeorm';

import { TicketTierEntity } from '@domain/entities/ticket-tier/ticket-tier.entity';
import { TicketTierRelations } from '@domain/entities/ticket-tier/ticket-tier.interface';

/**
 * TICKET TIER REPOSITORY
 *
 * Manages the inventory of tickets (Tiers) for specific concerts.
 *
 * This repository is key for the "Booking Flow", as the system needs to
 * validate price and existence of a tier before attempting a purchase.
 */
export class TicketTierRepository {
  private readonly typeOrmRepo: Repository<TicketTierEntity>;

  constructor(private readonly dataSource: DataSource) {
    this.typeOrmRepo = this.dataSource.getRepository(TicketTierEntity);
  }

  /**
   * Retrieves a specific ticket tier by filters (e.g., ID).
   *
   * Used during the booking process to validate that the tier exists
   * and to fetch its current price/details before locking stock.
   */
  async findOne(
    filters: FindOptionsWhere<TicketTierEntity>,
    relations?: TicketTierRelations,
  ): Promise<TicketTierEntity | null> {
    return await this.typeOrmRepo.findOne({
      where: filters,
      relations: relations,
    });
  }
}
