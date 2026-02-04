import z from 'zod';

const cacheEnvSchema = z.object({
  CACHE_HOST: z.string(),
  CACHE_PORT: z.coerce.number(),
  CACHE_DB: z.coerce.number().optional().default(0),
});

export const cacheSchema = cacheEnvSchema.transform((env) => ({
  host: env.CACHE_HOST,
  port: env.CACHE_PORT,
  db: env.CACHE_DB,
}));

export type CacheConfig = z.infer<typeof cacheSchema>;
