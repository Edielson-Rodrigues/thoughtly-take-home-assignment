import { execSync } from 'child_process';

const name = process.argv[2];

if (!name) {
  console.error('❌ Por favor, forneça um nome para a migração.');
  console.error('Exemplo: npm run migration:create CreateUsersTable');
  process.exit(1);
}

const migrationPath = `src/infrastructure/database/migrations/${name}`;

console.log(`Criando migração em: ${migrationPath}`);

try {
  execSync(
    `node -r dotenv/config --require ts-node/register ./node_modules/typeorm/cli.js migration:create ${migrationPath}`,
    { stdio: 'inherit' },
  );
} catch (error) {
  console.error('❌ Erro ao criar migração', error);
}
