#!/bin/sh
set -e

echo "⏳ Aguardando serviços essenciais..."

echo "🔄 Rodando Migrations (TypeORM)..."

npx typeorm migration:run -d dist/infrastructure/database/database-cli.config.js

echo "🚀 Iniciando a API..."
exec "$@"