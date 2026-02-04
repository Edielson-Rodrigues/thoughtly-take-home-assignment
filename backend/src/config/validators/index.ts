import z from 'zod';

import { appSchema } from './app.validator';
import { databaseSchema } from './database.validator';

export const rootSchema = z.any().transform((env) => ({
  database: databaseSchema.parse(env),
  app: appSchema.parse(env),
}));

export type EnvConfig = z.infer<typeof rootSchema>;
