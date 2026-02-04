import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

/**
 * Migration: Create Ticket Tiers Table
 *
 * Establishes the inventory structure for the application.
 * This table is the "Hot Path" for concurrency, holding the
 * `available_quantity` counter that defines the atomic locking strategy.
 */
export class CreateTicketTiersTable1770184554522 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'ticket_tiers',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            primaryKeyConstraintName: 'pk__ticket_tiers__id',
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'concert_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'total_quantity',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'available_quantity',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'ticket_tiers',
      new TableForeignKey({
        name: 'fk__ticket_tiers__concerts',
        columnNames: ['concert_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'concerts',
        onDelete: 'CASCADE',
      }),
    );

    /**
     * INDEX: Concert Lookup Optimization
     *
     * Optimizes the Catalog View (GET /concerts/:id) by:
     * 1. Eliminating full table scans when fetching tiers for a specific concert.
     * 2. Reducing latency for the most frequent read operation in the app.
     *
     * Critical for maintaining <100ms response times under load.
     */
    await queryRunner.createIndex(
      'ticket_tiers',
      new TableIndex({
        name: 'idx__ticket_tiers__concert_id',
        columnNames: ['concert_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('ticket_tiers');

    if (table) {
      const concertIdForeignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('concert_id') !== -1,
      );
      if (concertIdForeignKey) {
        await queryRunner.dropForeignKey('ticket_tiers', concertIdForeignKey);
      }

      const concertIdIndex = table.indices.find(
        (idx) => idx.columnNames.indexOf('concert_id') !== -1,
      );
      if (concertIdIndex) {
        await queryRunner.dropIndex('ticket_tiers', concertIdIndex);
      }

      await queryRunner.dropTable('ticket_tiers');
    }
  }
}
