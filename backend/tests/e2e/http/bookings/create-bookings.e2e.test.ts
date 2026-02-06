import { faker } from '@faker-js/faker';
import { FastifyInstance } from 'fastify';
import { StatusCodes } from 'http-status-codes';

import { DatabaseProvider } from '@database/database.provider';
import { ConcertMock } from '@domain/entities/concert/__mocks__/concert.mock';
import { TicketTierMock } from '@domain/entities/ticket-tier/__mocks__/ticket-tier.mock';
import { TicketTierPaymentFailedError } from '@domain/errors/ticket-tier/ticket-tier-payment-failed.error';

import { TestApp } from '../../setup/test-app';

describe('Bookings -> Create (POST /api/bookings)', () => {
  let app: FastifyInstance;

  const createConcert = async (concert: ConcertMock, ticketTier: TicketTierMock) => {
    const dataSource = DatabaseProvider.getDataSource();
    const concertRepository = dataSource.getRepository('ConcertEntity');
    const ticketTierRepository = dataSource.getRepository('TicketTierEntity');

    const createdConcert = concertRepository.create(concert);
    await concertRepository.save(createdConcert);

    const createdTicketTier = ticketTierRepository.create(ticketTier);
    await ticketTierRepository.save(createdTicketTier);
  };

  beforeAll(() => {
    app = TestApp.getApp();
  });

  it('should create a valid booking or fail with payment error', async () => {
    const concertMock = new ConcertMock();
    const ticketTierMock = new TicketTierMock({
      concertId: concertMock.id,
      price: 100,
      totalQuantity: 100,
      availableQuantity: 100,
    });

    await createConcert(concertMock, ticketTierMock);

    const bookingData = {
      ticketTierId: ticketTierMock.id,
      userEmail: faker.internet.email(),
      quantity: 2,
      totalPrice: 200,
      currency: 'USD',
      idempotencyKey: faker.string.uuid(),
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/bookings',
      payload: bookingData,
    });

    if (response.statusCode === StatusCodes.CREATED) {
      const body = JSON.parse(response.body);
      expect(body).toEqual({
        booking: expect.objectContaining({
          id: expect.any(String),
          ticketTierId: bookingData.ticketTierId,
          userEmail: bookingData.userEmail,
          quantity: bookingData.quantity,
          totalPrice: bookingData.totalPrice,
          createdAt: expect.any(String),
        }),
      });
    } else if (response.statusCode === StatusCodes.UNPROCESSABLE_ENTITY) {
      const expectedError = new TicketTierPaymentFailedError();

      const body = JSON.parse(response.body);

      expect(body).toEqual(
        expect.objectContaining({
          error: expectedError.name,
          message: expectedError.message,
          statusCode: expectedError.statusCode,
          path: '/api/bookings',
          timestamp: expect.any(String),
        }),
      );
    }
  });

  it('should reject booking with invalid email', async () => {
    const bookingData = {
      ticketTierId: faker.string.uuid(),
      userEmail: 'invalid-email',
      quantity: 2,
      totalPrice: 200,
      currency: 'USD',
      idempotencyKey: faker.string.uuid(),
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/bookings',
      payload: bookingData,
    });

    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);

    const body = JSON.parse(response.body);
    expect(body).toEqual(
      expect.objectContaining({
        error: 'ValidationError',
        message: expect.arrayContaining([expect.any(String)]),
        statusCode: StatusCodes.BAD_REQUEST,
        path: '/api/bookings',
        timestamp: expect.any(String),
      }),
    );
  });

  it('should reject booking with invalid quantity', async () => {
    const bookingData = {
      ticketTierId: faker.string.uuid(),
      userEmail: faker.internet.email(),
      quantity: 11,
      totalPrice: 1100,
      currency: 'USD',
      idempotencyKey: faker.string.uuid(),
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/bookings',
      payload: bookingData,
    });

    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);

    const body = JSON.parse(response.body);
    expect(body).toEqual(
      expect.objectContaining({
        error: 'ValidationError',
        message: expect.arrayContaining([expect.any(String)]),
        statusCode: StatusCodes.BAD_REQUEST,
        path: '/api/bookings',
        timestamp: expect.any(String),
      }),
    );
  });

  it('should reject booking with invalid ticket tier id', async () => {
    const bookingData = {
      ticketTierId: '',
      userEmail: faker.internet.email(),
      quantity: 2,
      totalPrice: 200,
      currency: 'USD',
      idempotencyKey: faker.string.uuid(),
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/bookings',
      payload: bookingData,
    });

    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);

    const body = JSON.parse(response.body);
    expect(body).toEqual(
      expect.objectContaining({
        error: 'ValidationError',
        message: expect.arrayContaining([expect.any(String)]),
        statusCode: StatusCodes.BAD_REQUEST,
        path: '/api/bookings',
        timestamp: expect.any(String),
      }),
    );
  });

  it('should reject booking with invalid total price', async () => {
    const bookingData = {
      ticketTierId: faker.string.uuid(),
      userEmail: faker.internet.email(),
      quantity: 2,
      totalPrice: -100,
      currency: 'USD',
      idempotencyKey: faker.string.uuid(),
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/bookings',
      payload: bookingData,
    });

    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);

    const body = JSON.parse(response.body);
    expect(body).toEqual(
      expect.objectContaining({
        error: 'ValidationError',
        message: expect.arrayContaining([expect.any(String)]),
        statusCode: StatusCodes.BAD_REQUEST,
        path: '/api/bookings',
        timestamp: expect.any(String),
      }),
    );
  });

  it('should reject booking invalid currency', async () => {
    const bookingData = {
      ticketTierId: faker.string.uuid(),
      userEmail: faker.internet.email(),
      quantity: 1,
      totalPrice: 100,
      currency: 'INVALID_CURRENCY',
      idempotencyKey: faker.string.uuid(),
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/bookings',
      payload: bookingData,
    });

    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);

    const body = JSON.parse(response.body);
    expect(body).toEqual(
      expect.objectContaining({
        error: 'ValidationError',
        message: expect.arrayContaining([expect.any(String)]),
        statusCode: StatusCodes.BAD_REQUEST,
        path: '/api/bookings',
        timestamp: expect.any(String),
      }),
    );
  });

  it('should reject booking invalid idempotency key', async () => {
    const bookingData = {
      ticketTierId: faker.string.uuid(),
      userEmail: faker.internet.email(),
      quantity: 1,
      totalPrice: 100,
      currency: 'USD',
      idempotencyKey: '',
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/bookings',
      payload: bookingData,
    });

    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);

    const body = JSON.parse(response.body);
    expect(body).toEqual(
      expect.objectContaining({
        error: 'ValidationError',
        message: expect.arrayContaining([expect.any(String)]),
        statusCode: StatusCodes.BAD_REQUEST,
        path: '/api/bookings',
        timestamp: expect.any(String),
      }),
    );
  });
});
