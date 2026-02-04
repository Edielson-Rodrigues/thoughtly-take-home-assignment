import z from 'zod';

const dbEnvSchema = z.object({
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number(),
  DB_USERNAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  DB_SSL: z.string().optional().default('false'),
});

export const databaseSchema = dbEnvSchema.transform((env) => ({
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  ssl: env.DB_SSL === 'true',
}));

export type DatabaseConfig = z.infer<typeof databaseSchema>;
