import { BookingEntity } from '@domain/entities/booking/booking.entity';
import { DashboardFilterDTO } from '@presentation/http/analytics/dtos/dashbord.dto';

import { AnalyticsRepository } from '../analytics.repository';

describe('Database -> Analytics Repository - Get Summary Stats', () => {
  const filters: DashboardFilterDTO = {
    concertId: '123e4567-e89b-12d3-a456-426614174000',
    startDate: '2023-01-01T00:00:00.000Z',
    endDate: '2023-12-31T23:59:59.999Z',
    period: 'day',
  };

  const mockResult = {
    totalRevenue: '150.00',
    totalTicketsSold: '15',
  };

  const queryBuilderMock = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getRawOne: jest.fn().mockResolvedValue(mockResult),
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
    it('should return summary stats with filters applied', async () => {
      const result = await analyticsRepository.getSummaryStats(filters);

      expect(result).toStrictEqual({
        totalRevenue: 150,
        totalTicketsSold: 15,
      });

      expect(dataSourceMock.getRepository).toHaveBeenCalledTimes(1);
      expect(dataSourceMock.getRepository).toHaveBeenCalledWith(BookingEntity);

      expect(repositoryMock.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(repositoryMock.createQueryBuilder).toHaveBeenCalledWith('booking');

      expect(queryBuilderMock.select).toHaveBeenCalledTimes(1);
      expect(queryBuilderMock.select).toHaveBeenCalledWith('SUM(booking.total_price)', 'totalRevenue');

      expect(queryBuilderMock.addSelect).toHaveBeenCalledTimes(1);
      expect(queryBuilderMock.addSelect).toHaveBeenCalledWith('SUM(booking.quantity)', 'totalTicketsSold');

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

      expect(queryBuilderMock.getRawOne).toHaveBeenCalledTimes(1);
    });

    it('should return summary stats with no filters', async () => {
      const emptyFilters: DashboardFilterDTO = {};

      const result = await analyticsRepository.getSummaryStats(emptyFilters);

      expect(result).toStrictEqual({
        totalRevenue: 150,
        totalTicketsSold: 15,
      });

      expect(dataSourceMock.getRepository).toHaveBeenCalledTimes(1);
      expect(repositoryMock.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(queryBuilderMock.select).toHaveBeenCalledTimes(1);
      expect(queryBuilderMock.addSelect).toHaveBeenCalledTimes(1);

      expect(queryBuilderMock.leftJoin).toHaveBeenCalledTimes(2);
      expect(queryBuilderMock.andWhere).not.toHaveBeenCalled();

      expect(queryBuilderMock.getRawOne).toHaveBeenCalledTimes(1);
    });

    it('should handle null result values', async () => {
      const nullResult = {
        totalRevenue: null,
        totalTicketsSold: null,
      };

      queryBuilderMock.getRawOne.mockResolvedValueOnce(nullResult);

      const result = await analyticsRepository.getSummaryStats(filters);

      expect(result).toStrictEqual({
        totalRevenue: 0,
        totalTicketsSold: 0,
      });
    });
  });
});
