import pino from 'pino';

export class PaymentGatewayProvider {
  constructor(private readonly logger: pino.Logger) {}

  async process(amount: number): Promise<boolean> {
    const delay = Math.floor(Math.random() * 600) + 200;
    await new Promise((resolve) => setTimeout(resolve, delay));

    const isSuccess = Math.random() > 0.2;
    if (!isSuccess) {
      this.logger.error(`Payment of $${amount} failed.`);
      return false;
    }

    this.logger.info(`Payment of $${amount} approved.`);
    return true;
  }
}
