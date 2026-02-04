import z from "zod";

const appEnvSchema = z.object({
  API_PORT: z.coerce.number().optional().default(8000),
});

export const appSchema = appEnvSchema.transform((env) => ({
  port: env.API_PORT,
}));

export type AppConfig = z.infer<typeof appSchema>;
