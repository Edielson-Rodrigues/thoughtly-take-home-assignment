import { BookingEntity } from '@domain/entities/booking/booking.entity';
import { DashboardFilterDTO } from '@presentation/http/analytics/dtos/dashbord.dto';

import { AnalyticsRepository } from '../analytics.repository';

describe('Database -> Analytics Repository - Get Revenue By Tier', () => {
  const filters: DashboardFilterDTO = {
    concertId: '123e4567-e89b-12d3-a456-426614174000',
    startDate: '2023-01-01T00:00:00.000Z',
    endDate: '2023-12-31T23:59:59.999Z',
    period: 'day',
  };

  const mockResults = [
    {
      tierName: 'VIP',
      revenue: '500.00',
    },
    {
      tierName: 'General',
      revenue: '300.00',
    },
  ];

  const queryBuilderMock = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    addGroupBy: jest.fn().mockReturnThis(),
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
    it('should return revenue by tier with filters applied', async () => {
      const result = await analyticsRepository.getRevenueByTier(filters);

      expect(result).toStrictEqual([
        {
          tierName: 'VIP',
          revenue: 500,
        },
        {
          tierName: 'General',
          revenue: 300,
        },
      ]);

      expect(dataSourceMock.getRepository).toHaveBeenCalledTimes(1);
      expect(dataSourceMock.getRepository).toHaveBeenCalledWith(BookingEntity);

      expect(repositoryMock.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(repositoryMock.createQueryBuilder).toHaveBeenCalledWith('booking');

      expect(queryBuilderMock.select).toHaveBeenCalledTimes(1);
      expect(queryBuilderMock.select).toHaveBeenCalledWith('tier.name', 'tierName');

      expect(queryBuilderMock.addSelect).toHaveBeenCalledTimes(1);
      expect(queryBuilderMock.addSelect).toHaveBeenCalledWith('SUM(booking.total_price)', 'revenue');

      expect(queryBuilderMock.leftJoin).toHaveBeenCalledTimes(2);
      expect(queryBuilderMock.leftJoin).toHaveBeenNthCalledWith(1, 'booking.ticketTier', 'tier');
      expect(queryBuilderMock.leftJoin).toHaveBeenNthCalledWith(2, 'tier.concert', 'concert');

      expect(queryBuilderMock.andWhere).toHaveBeenCalledTimes(3);
      expect(queryBuilderMock.andWhere).toHaveBeenNthCalledWith(1, 'concert.id = :concertId', {
        concertId: filters.concertId,
      });
      expect(queryBuilderMock.andWhere).toHaveBeenNthCalledWith(2, 'booking.created_at >= :startDate', {
        startDate: filters.startDate,
      });
      expect(queryBuilderMock.andWhere).toHaveBeenNthCalledWith(3, 'booking.created_at <= :endDate', {
        endDate: filters.endDate,
      });

      expect(queryBuilderMock.groupBy).toHaveBeenCalledTimes(1);
      expect(queryBuilderMock.groupBy).toHaveBeenCalledWith('tier.id');

      expect(queryBuilderMock.addGroupBy).toHaveBeenCalledTimes(1);
      expect(queryBuilderMock.addGroupBy).toHaveBeenCalledWith('tier.name');

      expect(queryBuilderMock.orderBy).toHaveBeenCalledTimes(1);
      expect(queryBuilderMock.orderBy).toHaveBeenCalledWith('revenue', 'DESC');

      expect(queryBuilderMock.getRawMany).toHaveBeenCalledTimes(1);
    });

    it('should return revenue by tier with no filters', async () => {
      const emptyFilters: DashboardFilterDTO = {};

      const result = await analyticsRepository.getRevenueByTier(emptyFilters);

      expect(result).toStrictEqual([
        {
          tierName: 'VIP',
          revenue: 500,
        },
        {
          tierName: 'General',
          revenue: 300,
        },
      ]);

      expect(queryBuilderMock.leftJoin).toHaveBeenCalledTimes(2);
      expect(queryBuilderMock.andWhere).not.toHaveBeenCalled();
      expect(queryBuilderMock.groupBy).toHaveBeenCalledWith('tier.id');
      expect(queryBuilderMock.addGroupBy).toHaveBeenCalledWith('tier.name');
      expect(queryBuilderMock.orderBy).toHaveBeenCalledWith('revenue', 'DESC');
    });

    it('should handle empty results', async () => {
      queryBuilderMock.getRawMany.mockResolvedValueOnce([]);

      const result = await analyticsRepository.getRevenueByTier(filters);

      expect(result).toStrictEqual([]);
    });
  });
});
