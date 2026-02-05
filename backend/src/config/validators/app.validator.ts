import z from 'zod';

const appEnvSchema = z.object({
  API_PORT: z.coerce.number().optional().default(8000),
  ENVIRONMENT: z.enum(['development', 'test', 'production']).optional().default('production'),
});

export const appSchema = appEnvSchema.transform((env) => ({
  port: env.API_PORT,
  environment: env.ENVIRONMENT,
}));

export type AppConfig = z.infer<typeof appSchema>;
