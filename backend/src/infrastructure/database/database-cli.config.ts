import * as path from 'path';

import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: true,
  entities: [path.join(process.cwd(), 'src', 'domain', 'entities', '**', '*.entity.{ts,js}')],
  migrations: [
    path.join(process.cwd(), 'src', 'infrastructure', 'database', 'migrations', '*.{ts,js}'),
    path.join(process.cwd(), 'src', 'infrastructure', 'database', 'seeds', '*.{ts,js}'),
  ],
});
