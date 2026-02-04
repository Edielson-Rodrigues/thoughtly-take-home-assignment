import path from 'path';

import * as dotenv from 'dotenv';
import z from 'zod';

import { EnvConfig, rootSchema } from './validators';

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

  get<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
    // eslint-disable-next-line security/detect-object-injection
    return this.config[key];
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }

    return ConfigService.instance;
  }
}
