import { execSync } from 'child_process';

import { Logger } from '../shared/logger';

const logger = Logger.initialize({
  environment: 'development',
});

const name = process.argv[2];

if (!name) {
  logger.error('Please provide a name for the migration.');
  logger.error('Example: npm run migration:create CreateUsersTable');
  process.exit(1);
}

const migrationPath = `src/infrastructure/database/migrations/${name}`;

logger.info(`Creating migration at: ${migrationPath}`);

try {
  execSync(
    `node -r dotenv/config --require ts-node/register ./node_modules/typeorm/cli.js migration:create ${migrationPath}`,
    { stdio: 'inherit' },
  );
} catch (error) {
  logger.error(error, 'Failed to create migration');
}
