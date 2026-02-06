import { BookingEntity } from '@domain/entities/booking/booking.entity';
import { DashboardFilterDTO } from '@presentation/http/analytics/dtos/dashbord.dto';

import { AnalyticsRepository } from '../analytics.repository';

describe('Database -> Analytics Repository - Get Sales Over Time', () => {
  const filters: DashboardFilterDTO = {
    concertId: '123e4567-e89b-12d3-a456-426614174000',
    startDate: '2023-01-01T00:00:00.000Z',
    endDate: '2023-12-31T23:59:59.999Z',
    period: 'day',
  };

  const mockResults = [
    {
      date: new Date('2023-01-01T00:00:00.000Z'),
      revenue: '100.00',
      tickets: '10',
    },
    {
      date: new Date('2023-01-02T00:00:00.000Z'),
      revenue: '200.00',
      tickets: '20',
    },
  ];

  const queryBuilderMock = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue(mockResults),
  };

  const repositoryMock = {
    createQueryBuilder: jest.fn().mockReturnValue(queryBuilderMock),
  };

  const dataSourceMock = {
    getRepository: jest.fn().mockReturnValue(repositoryMock),
  };

  let analyticsRepository: AnalyticsRepository;

  beforeAll(() => {
    analyticsRepository = new AnalyticsRepository(dataSourceMock as any);
  });

  afterEach(() => jest.clearAllMocks());

  describe('SUCCESS CASES', () => {
    it('should return sales over time with filters applied', async () => {
      const result = await analyticsRepository.getSalesOverTime(filters);

      expect(result).toStrictEqual([
        {
          date: '2023-01-01T00:00:00.000Z',
          revenue: 100,
          tickets: 10,
        },
        {
          date: '2023-01-02T00:00:00.000Z',
          revenue: 200,
          tickets: 20,
        },
      ]);

      expect(dataSourceMock.getRepository).toHaveBeenCalledTimes(1);
      expect(dataSourceMock.getRepository).toHaveBeenCalledWith(BookingEntity);

      expect(repositoryMock.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(repositoryMock.createQueryBuilder).toHaveBeenCalledWith('booking');

      expect(queryBuilderMock.select).toHaveBeenCalledTimes(1);
      expect(queryBuilderMock.select).toHaveBeenCalledWith("DATE_TRUNC('day', booking.created_at)", 'date');

      expect(queryBuilderMock.addSelect).toHaveBeenCalledTimes(2);
      expect(queryBuilderMock.addSelect).toHaveBeenNthCalledWith(1, 'SUM(booking.total_price)', 'revenue');
      expect(queryBuilderMock.addSelect).toHaveBeenNthCalledWith(2, 'SUM(booking.quantity)', 'tickets');

      // applyFilters calls
      expect(queryBuilderMock.leftJoin).toHaveBeenCalledTimes(2);
      expect(queryBuilderMock.leftJoin).toHaveBeenNthCalledWith(1, 'booking.ticketTier', 'tier');
      expect(queryBuilderMock.leftJoin).toHaveBeenNthCalledWith(2, 'tier.concert', 'concert');

      expect(queryBuilderMock.andWhere).toHaveBeenCalledTimes(3);
      expect(queryBuilderMock.andWhere).toHaveBeenNthCalledWith(1, 'concert.id = :concertId', {
        concertId: filters.concertId,
      });
      expect(queryBuilderMock.andWhere).toHaveBeenNthCalledWith(2, 'booking.created_at >= :startDate', {
        startDate: new Date(filters.startDate!),
      });
      expect(queryBuilderMock.andWhere).toHaveBeenNthCalledWith(3, 'booking.created_at <= :endDate', {
        endDate: new Date(filters.endDate!),
      });

      expect(queryBuilderMock.groupBy).toHaveBeenCalledTimes(1);
      expect(queryBuilderMock.groupBy).toHaveBeenCalledWith("DATE_TRUNC('day', booking.created_at)");

      expect(queryBuilderMock.orderBy).toHaveBeenCalledTimes(1);
      expect(queryBuilderMock.orderBy).toHaveBeenCalledWith('date', 'ASC');

      expect(queryBuilderMock.getRawMany).toHaveBeenCalledTimes(1);
    });

    it('should return sales over time with no filters and default period', async () => {
      const emptyFilters: DashboardFilterDTO = {};

      const result = await analyticsRepository.getSalesOverTime(emptyFilters);

      expect(result).toStrictEqual([
        {
          date: '2023-01-01T00:00:00.000Z',
          revenue: 100,
          tickets: 10,
        },
        {
          date: '2023-01-02T00:00:00.000Z',
          revenue: 200,
          tickets: 20,
        },
      ]);

      expect(queryBuilderMock.select).toHaveBeenCalledWith("DATE_TRUNC('day', booking.created_at)", 'date');
      expect(queryBuilderMock.leftJoin).toHaveBeenCalledTimes(2);
      expect(queryBuilderMock.andWhere).not.toHaveBeenCalled();
      expect(queryBuilderMock.groupBy).toHaveBeenCalledWith("DATE_TRUNC('day', booking.created_at)");
    });

    it('should handle different period', async () => {
      const hourFilters: DashboardFilterDTO = { period: 'hour' };

      await analyticsRepository.getSalesOverTime(hourFilters);

      expect(queryBuilderMock.select).toHaveBeenCalledWith("DATE_TRUNC('hour', booking.created_at)", 'date');
      expect(queryBuilderMock.groupBy).toHaveBeenCalledWith("DATE_TRUNC('hour', booking.created_at)");
    });

    it('should handle empty results', async () => {
      queryBuilderMock.getRawMany.mockResolvedValueOnce([]);

      const result = await analyticsRepository.getSalesOverTime(filters);

      expect(result).toStrictEqual([]);
    });
  });
});
