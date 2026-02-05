import { FastifyInstance } from 'fastify';
import { StatusCodes } from 'http-status-codes';

import { TestApp } from '../../setup/test-app';

describe('Health -> Verify Health (GET /api/health)', () => {
  let app: FastifyInstance;

  beforeAll(() => {
    app = TestApp.getApp();
  });

  it('should return health status', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/health',
    });

    expect(response.statusCode).toBe(StatusCodes.OK);

    const body = JSON.parse(response.body);
    expect(body).toEqual({
      status: 'ok',
      timestamp: expect.any(String),
    });
    expect(new Date(body.timestamp)).toBeInstanceOf(Date);
  });
});
