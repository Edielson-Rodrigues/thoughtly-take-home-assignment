import path from 'path';

import { DataSource } from 'typeorm';

import { DatabaseConfig } from '../../config/validators/database.validator';

export const connectDatabase = async (config: DatabaseConfig) => {
  try {
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

    await dataSource.initialize();
    console.log('🔌 Database connected successfully');
    return dataSource;
  } catch (error) {
    console.error('❌ Database connection failed', error);
    process.exit(1);
  }
};
