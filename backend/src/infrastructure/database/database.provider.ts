import path from 'path';

import { DataSource } from 'typeorm';

import { DatabaseConfig } from '@config/validators/database.validator';

/**
 * Database Provider
 *
 * Manages the database connection using TypeORM's DataSource.
 * Ensures we never accidentally open multiple connection pools.
 */
export class DatabaseProvider {
  private static instance: DataSource;

  private constructor() {}

  /**
   * Initializes the database connection or returns the existing one.
   * This method is "idempotent" - calling it twice is safe.
   */
  public static async connect(config: DatabaseConfig): Promise<DataSource> {
    if (this.instance && this.instance.isInitialized) {
      return this.instance;
    }

    const dataSource = new DataSource({
      ...config,
      type: 'postgres',
      entities: [
        path.join(
          __dirname,
          '..',
          '..',
          'domain',
          'entities',
          '**',
          '*.entity.{ts,js}',
        ),
      ],
      migrations: [path.join(__dirname, '..', 'migrations', '*.{ts,js}')],
      synchronize: false,
      migrationsRun: false,
      logging: true,
    });

    try {
      await dataSource.initialize();
      this.instance = dataSource;
      console.log('🔌 Database connected successfully');
      return this.instance;
    } catch (error) {
      console.error('❌ Database connection failed', error);
      process.exit(1);
    }
  }

  /**
   * Singleton accessor to ensure only one DataSource instance is used.
   */
  public static getDataSource(): DataSource {
    if (!this.instance || !this.instance.isInitialized) {
      throw new Error('❌ Database not initialized. Call .connect() first.');
    }
    return this.instance;
  }
}
