import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

/**
 * Migration: Create Bookings Table
 *
 * Represents the immutable ledger of confirmed sales.
 * This table serves as the single source of truth for revenue
 * and user purchase history.
 */
export class CreateBookingsTable1770184569270 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'bookings',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            primaryKeyConstraintName: 'pk__bookings__id',
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tier_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'user_email',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'quantity',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'total_price',
            type: 'decimal',
            precision: 10,
            scale: 2,
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
      'bookings',
      new TableForeignKey({
        name: 'fk__bookings__ticket_tiers',
        columnNames: ['tier_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'ticket_tiers',
        onDelete: 'NO ACTION',
      }),
    );

    /**
     * INDEX: User History Optimization
     *
     * Supports the "My Orders" feature by:
     * 1. Allowing O(log n) retrieval of a specific user's bookings.
     * 2. Preventing timeouts as the bookings table grows to millions of rows.
     */
    await queryRunner.createIndex(
      'bookings',
      new TableIndex({
        name: 'idx__bookings__user_email',
        columnNames: ['user_email'],
      }),
    );

    /**
     * INDEX: Tier Analytics Optimization
     *
     * Supports Admin Dashboards and Reporting by:
     * 1. Enabling fast aggregation of sales per ticket tier.
     */
    await queryRunner.createIndex(
      'bookings',
      new TableIndex({
        name: 'idx__bookings__tier_id',
        columnNames: ['tier_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('bookings');

    if (table) {
      const tierIdForeignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('tier_id') !== -1,
      );
      if (tierIdForeignKey) {
        await queryRunner.dropForeignKey('bookings', tierIdForeignKey);
      }

      const userEmailIndex = table.indices.find(
        (idx) => idx.columnNames.indexOf('user_email') !== -1,
      );
      if (userEmailIndex) {
        await queryRunner.dropIndex('bookings', userEmailIndex);
      }

      const tierIdIndex = table.indices.find(
        (idx) => idx.columnNames.indexOf('tier_id') !== -1,
      );
      if (tierIdIndex) {
        await queryRunner.dropIndex('bookings', tierIdIndex);
      }

      await queryRunner.dropTable('bookings');
    }
  }
}
