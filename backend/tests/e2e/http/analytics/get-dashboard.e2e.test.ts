import { faker } from '@faker-js/faker';
import { FastifyInstance } from 'fastify';
import { StatusCodes } from 'http-status-codes';

import { DatabaseProvider } from '@database/database.provider';
import { ConcertMock } from '@domain/entities/concert/__mocks__/concert.mock';
import { TicketTierMock } from '@domain/entities/ticket-tier/__mocks__/ticket-tier.mock';

import { TestApp } from '../../setup/test-app';

describe('Analytics -> Get Dashboard (GET /api/analytics/dashboard)', () => {
  let app: FastifyInstance;

  const createSalesScenario = async (
    concertMock: ConcertMock,
    ticketTierMock: TicketTierMock,
    quantitySold: number = 2,
    createdAt: Date = new Date(),
  ) => {
    const dataSource = DatabaseProvider.getDataSource();
    const concertRepo = dataSource.getRepository('ConcertEntity');
    const ticketTierRepo = dataSource.getRepository('TicketTierEntity');
    const bookingRepo = dataSource.getRepository('BookingEntity');

    const createdConcert = concertRepo.create(concertMock);
    await concertRepo.save(createdConcert);

    const createdTier = ticketTierRepo.create(ticketTierMock);
    await ticketTierRepo.save(createdTier);

    const booking = bookingRepo.create({
      ticketTier: createdTier,
      userEmail: faker.internet.email(),
      quantity: quantitySold,
      totalPrice: ticketTierMock.price * quantitySold,
      currency: 'USD',
      idempotencyKey: faker.string.uuid(),
      createdAt: createdAt,
    });

    return await bookingRepo.save(booking);
  };

  beforeAll(() => {
    app = TestApp.getApp();
  });

  it('should return dashboard analytics with default filters', async () => {
    const concertMock = new ConcertMock();
    const ticketTierMock = new TicketTierMock({
      concertId: concertMock.id,
      price: 100,
      totalQuantity: 50,
      availableQuantity: 48,
    });

    await createSalesScenario(concertMock, ticketTierMock, 2);

    const response = await app.inject({
      method: 'GET',
      url: '/api/analytics/dashboard',
    });

    expect(response.statusCode).toBe(StatusCodes.OK);

    const body = JSON.parse(response.body);

    expect(body).toEqual({
      summary: {
        totalRevenue: 200,
        totalTicketsSold: 2,
      },
      salesOverTime: expect.arrayContaining([
        expect.objectContaining({
          date: expect.any(String),
          revenue: 200,
          tickets: 2,
        }),
      ]),
      revenueByTier: expect.arrayContaining([
        expect.objectContaining({
          tierName: ticketTierMock.name,
          revenue: 200,
          percentage: 100,
        }),
      ]),
    });
  });

  it('should filter analytics by concert ID', async () => {
    const concert1 = new ConcertMock();
    const tier1 = new TicketTierMock({ concertId: concert1.id, price: 50 });

    const concert2 = new ConcertMock();
    const tier2 = new TicketTierMock({ concertId: concert2.id, price: 100 });

    await createSalesScenario(concert1, tier1, 2);
    await createSalesScenario(concert2, tier2, 3);

    const queryString = new URLSearchParams({
      concertId: concert1.id,
    }).toString();

    const response = await app.inject({
      method: 'GET',
      url: `/api/analytics/dashboard?${queryString}`,
    });

    expect(response.statusCode).toBe(StatusCodes.OK);

    const body = JSON.parse(response.body);

    expect(body).toEqual({
      summary: {
        totalRevenue: 100, // 2 ingressos * 50
        totalTicketsSold: 2,
      },
      salesOverTime: expect.arrayContaining([
        expect.objectContaining({
          date: expect.any(String),
          revenue: 100,
          tickets: 2,
        }),
      ]),
      revenueByTier: expect.arrayContaining([
        expect.objectContaining({
          tierName: tier1.name,
          revenue: 100,
          percentage: 100,
        }),
      ]),
    });
  });

  it('should filter analytics by date range', async () => {
    const concert = new ConcertMock();
    const tier = new TicketTierMock({ concertId: concert.id, price: 100 });

    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 2);

    const recentDate = new Date();

    await createSalesScenario(concert, tier, 1, pastDate);
    await createSalesScenario(concert, tier, 1, recentDate);

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    const queryString = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: new Date().toISOString(),
    }).toString();

    const response = await app.inject({
      method: 'GET',
      url: `/api/analytics/dashboard?${queryString}`,
    });

    expect(response.statusCode).toBe(StatusCodes.OK);
    const body = JSON.parse(response.body);

    expect(body).toEqual({
      summary: {
        totalRevenue: 100,
        totalTicketsSold: 1,
      },
      salesOverTime: expect.arrayContaining([
        expect.objectContaining({
          date: expect.any(String),
          revenue: 100,
          tickets: 1,
        }),
      ]),
      revenueByTier: expect.arrayContaining([
        expect.objectContaining({
          tierName: tier.name,
          revenue: 100,
          percentage: 100,
        }),
      ]),
    });
  });

  it('should return empty data for range with no sales', async () => {
    const futureStart = faker.date.future();
    const futureEnd = new Date(futureStart);
    futureEnd.setDate(futureEnd.getDate() + 7);

    const queryString = new URLSearchParams({
      startDate: futureStart.toISOString(),
      endDate: futureEnd.toISOString(),
    }).toString();

    const response = await app.inject({
      method: 'GET',
      url: `/api/analytics/dashboard?${queryString}`,
    });

    expect(response.statusCode).toBe(StatusCodes.OK);
    const body = JSON.parse(response.body);

    expect(body).toEqual({
      summary: {
        totalRevenue: 0,
        totalTicketsSold: 0,
      },
      salesOverTime: [],
      revenueByTier: [],
    });
  });

  it('should return empty data for non-existent concert ID', async () => {
    const randomId = faker.string.uuid();

    const queryString = new URLSearchParams({
      concertId: randomId,
    }).toString();

    const response = await app.inject({
      method: 'GET',
      url: `/api/analytics/dashboard?${queryString}`,
    });

    expect(response.statusCode).toBe(StatusCodes.OK);
    const body = JSON.parse(response.body);

    expect(body).toEqual({
      summary: {
        totalRevenue: 0,
        totalTicketsSold: 0,
      },
      salesOverTime: [],
      revenueByTier: [],
    });
  });

  // --- ERROR CASES (VALIDATION) ---

  it('should reject invalid concert ID format', async () => {
    const queryString = new URLSearchParams({
      concertId: 'invalid-uuid',
    }).toString();

    const response = await app.inject({
      method: 'GET',
      url: `/api/analytics/dashboard?${queryString}`,
    });

    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);

    const body = JSON.parse(response.body);
    expect(body).toEqual(
      expect.objectContaining({
        error: 'ValidationError',
        message: expect.arrayContaining([expect.any(String)]),
        statusCode: StatusCodes.BAD_REQUEST,
        path: expect.stringContaining('/api/analytics/dashboard'),
        timestamp: expect.any(String),
      }),
    );
  });

  it('should reject invalid start date format', async () => {
    const queryString = new URLSearchParams({
      startDate: 'not-a-date',
    }).toString();

    const response = await app.inject({
      method: 'GET',
      url: `/api/analytics/dashboard?${queryString}`,
    });

    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);

    const body = JSON.parse(response.body);
    expect(body).toEqual(
      expect.objectContaining({
        error: 'ValidationError',
        message: expect.arrayContaining([expect.any(String)]),
        statusCode: StatusCodes.BAD_REQUEST,
      }),
    );
  });

  it('should reject invalid end date format', async () => {
    const queryString = new URLSearchParams({
      endDate: 'not-a-date',
    }).toString();

    const response = await app.inject({
      method: 'GET',
      url: `/api/analytics/dashboard?${queryString}`,
    });

    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);

    const body = JSON.parse(response.body);
    expect(body).toEqual(
      expect.objectContaining({
        error: 'ValidationError',
        message: expect.arrayContaining([expect.any(String)]),
        statusCode: StatusCodes.BAD_REQUEST,
      }),
    );
  });

  it('should reject invalid period value', async () => {
    const queryString = new URLSearchParams({
      period: 'century',
    }).toString();

    const response = await app.inject({
      method: 'GET',
      url: `/api/analytics/dashboard?${queryString}`,
    });

    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);

    const body = JSON.parse(response.body);
    expect(body).toEqual(
      expect.objectContaining({
        error: 'ValidationError',
        message: expect.arrayContaining([expect.any(String)]),
        statusCode: StatusCodes.BAD_REQUEST,
      }),
    );
  });
});
