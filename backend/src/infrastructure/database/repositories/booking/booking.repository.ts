import { DataSource, FindOptionsWhere, Repository } from 'typeorm';

import { BookingEntity } from '@domain/entities/booking/booking.entity';
import { BookingRelations, CreateBooking } from '@domain/entities/booking/booking.interface';
import { TicketTierEntity } from '@domain/entities/ticket-tier/ticket-tier.entity';
import { TicketTierOutOfStockError } from '@domain/errors/ticket-tier/ticket-tier-out-of-stock.error';

/**
 * BOOKING REPOSITORY
 *
 * Manages the persistence of booking records.
 *
 * This class is responsible for the system's most critical operation:
 * The Atomic Transaction that prevents overselling tickets.
 */
export class BookingRepository {
  private readonly typeOrmRepo: Repository<BookingEntity>;

  constructor(private readonly dataSource: DataSource) {
    this.typeOrmRepo = this.dataSource.getRepository(BookingEntity);
  }

  /**
   * ATOMIC LOCK TRANSACTION
   *
   * Solves the "Double Booking" problem (Race Condition) by:
   * 1. Starting a database transaction.
   * 2. Attempting to decrement stock ONLY IF available > quantity.
   * 3. Creating the booking record only if step 2 succeeds.
   * 4. Using unique constraint on idempotency_key to prevent simultaneous duplicates.
   *
   * This logic ensures that 50,000 concurrent users can never buy
   * more tickets than physically exist AND prevents duplicate bookings
   * even when requests arrive within milliseconds of each other.
   */
  async createWithAtomicLock(data: CreateBooking): Promise<BookingEntity> {
    return await this.dataSource.transaction(async (manager) => {
      // -------------------------------------------------------
      // STEP 1: ATOMIC UPDATE (The Guard)
      // -------------------------------------------------------
      // We run an UPDATE query directly. This locks the specific row
      // for the duration of the update and is atomic.
      //
      const updateResult = await manager
        .createQueryBuilder()
        .update(TicketTierEntity)
        .set({
          availableQuantity: () => `available_quantity - ${data.quantity}`,
        })
        .where('id = :id', { id: data.ticketTierId })
        .andWhere('available_quantity >= :qty', { qty: data.quantity })
        .execute();

      // -------------------------------------------------------
      // STEP 2: VERIFICATION
      // -------------------------------------------------------
      // If affected == 0, it means the WHERE clause failed (stock < quantity).
      // We throw immediately to abort the transaction.
      if (updateResult.affected === 0) {
        throw new TicketTierOutOfStockError();
      }

      // -------------------------------------------------------
      // STEP 3: CREATE BOOKING
      // -------------------------------------------------------
      // Since we successfully secured the inventory, we can now safely write.
      const booking = manager.create(BookingEntity, {
        userEmail: data.userEmail,
        ticketTierId: data.ticketTierId,
        quantity: data.quantity,
        totalPrice: data.totalPrice,
        idempotencyKey: data.idempotencyKey,
      });

      return await manager.save(booking);
    });
  }

  /**
   * Retrieves a booking by given filters.
   */
  async findOne(filters: FindOptionsWhere<BookingEntity>, relations?: BookingRelations): Promise<BookingEntity | null> {
    return await this.typeOrmRepo.findOne({
      where: filters,
      relations: relations,
    });
  }

  /**
   * Deletes a booking by ID. Used for cleanup after failed payments.
   */
  async deleteById(id: string): Promise<void> {
    await this.typeOrmRepo.delete({ id });
  }
}
