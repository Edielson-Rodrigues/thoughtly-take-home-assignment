import pino from 'pino';

import { SupportedCurrencies } from '@shared/supported-currencies';

import { PaymentGatewayProvider } from '../payment-gatewat.provider';

describe('Providers -> Payment Gateway Provider - Process', () => {
  const loggerMock = {
    error: jest.fn(),
    info: jest.fn(),
  } as unknown as pino.Logger;

  let paymentGatewayProvider: PaymentGatewayProvider;

  beforeAll(() => {
    paymentGatewayProvider = new PaymentGatewayProvider(loggerMock);
  });

  afterEach(() => jest.clearAllMocks());

  describe('SUCCESS CASES', () => {
    it('should return true and log success when payment is approved', async () => {
      const amount = 100;

      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const result = await paymentGatewayProvider.process(amount, SupportedCurrencies.USD);

      expect(result).toBe(true);
      expect(loggerMock.info).toHaveBeenCalledWith(`Payment of $${amount} with ${SupportedCurrencies.USD} approved.`);
      expect(loggerMock.error).not.toHaveBeenCalled();
    });
  });

  describe('ERROR CASES', () => {
    it('should return false and log error when payment fails', async () => {
      const amount = 100;

      jest.spyOn(Math, 'random').mockReturnValue(0.1);

      const result = await paymentGatewayProvider.process(amount, SupportedCurrencies.USD);

      expect(result).toBe(false);
      expect(loggerMock.error).toHaveBeenCalledWith(`Payment of $${amount} with ${SupportedCurrencies.USD} failed.`);
      expect(loggerMock.info).not.toHaveBeenCalled();
    });
  });
});
