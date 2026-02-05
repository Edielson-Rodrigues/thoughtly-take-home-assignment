import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Seed Concert Data
 *
 * Populates the database with initial events and ticket inventory
 * based on the challenge requirements.
 *
 * DATA SET:
 * 1. "The Galactic Symphony" (Space-themed Orchestral)
 * 2. "Summer Vibes Festival" (Outdoor Music Festival)
 *
 * PRICING STRATEGY (Per Requirement):
 * - VIP: $100
 * - Front Row: $50
 * - General Admission (GA): $10
 */
export class InsertInitialConcertData1770252527621 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ---------------------------------------------------------
    // 1. INSERT CONCERTS
    // ---------------------------------------------------------
    const concert1Id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const concert2Id = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';

    await queryRunner.query(`
      INSERT INTO concerts (id, name, description, location, date)
      VALUES
        (
          '${concert1Id}',
          'The Galactic Symphony',
          'An immersive orchestral experience journeying through the sounds of the cosmos.',
          'Royal Albert Hall, London',
          NOW() + INTERVAL '30 days'
        ),
        (
          '${concert2Id}',
          'Summer Vibes Festival',
          'The biggest outdoor indie music festival of the year featuring top global artists.',
          'Central Park, New York',
          NOW() + INTERVAL '60 days'
        )
    `);

    // ---------------------------------------------------------
    // 2. INSERT TICKET TIERS (Inventory)
    // ---------------------------------------------------------
    const tiers = [
      { name: 'VIP', price: 100.0, total: 100 },
      { name: 'Front Row', price: 50.0, total: 200 },
      { name: 'General Admission', price: 10.0, total: 1000 },
    ];

    for (const tier of tiers) {
      await queryRunner.query(`
        INSERT INTO ticket_tiers (concert_id, name, price, total_quantity, available_quantity)
        VALUES
          ('${concert1Id}', '${tier.name}', ${tier.price}, ${tier.total}, ${tier.total}),
          ('${concert2Id}', '${tier.name}', ${tier.price}, ${tier.total}, ${tier.total})
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const concertIds = ['a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'];

    await queryRunner.query(`
      DELETE FROM ticket_tiers 
      WHERE concert_id IN ('${concertIds.join("','")}')
    `);

    await queryRunner.query(`
      DELETE FROM concerts 
      WHERE id IN ('${concertIds.join("','")}')
    `);
  }
}
