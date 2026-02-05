import { FastifyInstance } from 'fastify';
import { StatusCodes } from 'http-status-codes';

import { DatabaseProvider } from '@database/database.provider';
import { ConcertMock } from '@domain/entities/concert/__mocks__/concert.mock';
import { TicketTierMock } from '@domain/entities/ticket-tier/__mocks__/ticket-tier.mock';

import { TestApp } from '../../setup/test-app';

describe('Concerts -> Find All (GET /api/concerts)', () => {
  let app: FastifyInstance;

  const concertMock = new ConcertMock();
  const ticketTierMock = new TicketTierMock({
    concertId: concertMock.id,
  });

  const createConcert = async () => {
    const dataSource = DatabaseProvider.getDataSource();
    const concertRepository = dataSource.getRepository('ConcertEntity');
    const ticketTierRepository = dataSource.getRepository('TicketTierEntity');

    const concert = concertRepository.create(concertMock);
    await concertRepository.save(concert);

    const ticketTier = ticketTierRepository.create(ticketTierMock);
    await ticketTierRepository.save(ticketTier);
  };

  beforeAll(() => {
    app = TestApp.getApp();
  });

  it('should return empty array when no concerts exist', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/concerts',
    });

    expect(response.statusCode).toStrictEqual(StatusCodes.OK);
    const body = JSON.parse(response.body);
    expect(body).toEqual({
      concerts: [],
    });
  });

  it('should return list of concerts with ticket tiers', async () => {
    await createConcert();

    const response = await app.inject({
      method: 'GET',
      url: '/api/concerts',
    });

    expect(response.statusCode).toBe(StatusCodes.OK);

    const body = JSON.parse(response.body);

    expect(body).toEqual({
      concerts: [
        {
          id: concertMock.id,
          name: concertMock.name,
          description: concertMock.description,
          location: concertMock.location,
          date: concertMock.date.toISOString(),
          createdAt: concertMock.createdAt.toISOString(),
          updatedAt: concertMock.updatedAt?.toISOString(),
          ticketTiers: [
            {
              id: ticketTierMock.id,
              name: ticketTierMock.name,
              price: ticketTierMock.price,
              totalQuantity: ticketTierMock.totalQuantity,
              availableQuantity: ticketTierMock.availableQuantity,
              concertId: ticketTierMock.concertId,
              createdAt: ticketTierMock.createdAt.toISOString(),
            },
          ],
        },
      ],
    });
  });
});
