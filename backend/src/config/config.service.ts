import path from 'path';

import * as dotenv from 'dotenv';
import z from 'zod';

import { EnvConfig, rootSchema } from './validators';

/**
 * Config Service
 *
 * Centralizes and validates application configuration by:
 * 1. Loading environment variables from .env
 * 2. Validating types using Zod (Fail Fast strategy)
 * 3. Providing type-safe access to config values
 *
 * This ensures the application crashes immediately at startup if
 * required variables are missing, preventing runtime errors later.
 */
export class ConfigService {
  private static instance: ConfigService;
  private readonly config: EnvConfig;

  private constructor() {
    dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });

    const parsed = rootSchema.safeParse(process.env);
    if (!parsed.success) {
      console.error(
        '❌ Invalid environment variables:',
        z.treeifyError(parsed.error),
      );
      throw new Error('Invalid environment variables');
    }

    this.config = parsed.data;
  }

  /**
   * Retrieves a configuration value with full type safety.
   * Typescript will infer the return type based on the key.
   */
  get<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
    // eslint-disable-next-line security/detect-object-injection
    return this.config[key];
  }

  /**
   * Singleton accessor to ensure config is parsed only once.
   */
  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }

    return ConfigService.instance;
  }
}
