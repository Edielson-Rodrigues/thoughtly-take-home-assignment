import { DataSource, FindOptionsWhere, Repository } from 'typeorm';

import { BookingEntity } from '@domain/entities/booking/booking.entity';
import { BookingRelations, CreateBooking } from '@domain/entities/booking/booking.interface';
import { TicketTierEntity } from '@domain/entities/ticket-tier/ticket-tier.entity';

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
   *
   * This logic ensures that 50,000 concurrent users can never buy
   * more tickets than physically exist.
   */
  async createWithAtomicLock(data: CreateBooking): Promise<BookingEntity | null> {
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
        throw new Error('SOLD_OUT');
      }

      // -------------------------------------------------------
      // STEP 3: CREATE BOOKING
      // -------------------------------------------------------
      // Since we successfully secured the inventory, we can now
      // safely write the receipt (Booking) to the ledger.
      const booking = manager.create(BookingEntity, {
        userEmail: data.userEmail,
        ticketTierId: data.ticketTierId,
        quantity: data.quantity,
        totalPrice: data.totalPrice,
      });

      return await manager.save(booking);
    });
  }

  /**
   * Retrieves a booking by ID.
   */
  async find(filters: FindOptionsWhere<BookingEntity>, relations?: BookingRelations): Promise<BookingEntity | null> {
    return await this.typeOrmRepo.findOne({
      where: filters,
      relations: relations,
    });
  }
}
