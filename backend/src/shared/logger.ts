import pino, { Logger as PinoLogger } from 'pino';

import { AppConfig } from '@config/validators/app.validator';

export class Logger {
  private static instance: PinoLogger;

  private constructor() {}

  public static initialize(appConfig: Omit<AppConfig, 'port'>): PinoLogger {
    if (this.instance) {
      return this.instance;
    }

    const { environment } = appConfig;

    this.instance = pino({
      level: environment === 'production' ? 'info' : 'debug',
      transport:
        environment !== 'production'
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'SYS:standard',
              },
            }
          : undefined,
    });

    return this.instance;
  }

  public static getInstance(): PinoLogger {
    if (!this.instance) {
      throw new Error('Logger not initialized. Call .initialize() first.');
    }
    return Logger.instance;
  }
}
