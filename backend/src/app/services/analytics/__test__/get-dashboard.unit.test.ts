import { DashboardFilterDTO, DashboardResponseDTO } from '@presentation/http/analytics/dtos/dashbord.dto';

import { AnalyticsService } from '../analytics.service';

describe('Service -> Analytics -> Get Dashboard', () => {
  const summaryStatsMock = {
    totalRevenue: 1000,
    totalTicketsSold: 50,
  };

  const salesOverTimeMock = [
    {
      date: '2023-01-01T00:00:00.000Z',
      revenue: 500,
      tickets: 25,
    },
    {
      date: '2023-01-02T00:00:00.000Z',
      revenue: 500,
      tickets: 25,
    },
  ];

  const revenueByTierMock = [
    {
      tierName: 'VIP',
      revenue: 600,
    },
    {
      tierName: 'General',
      revenue: 400,
    },
  ];

  const analyticsRepositoryMock = {
    getSummaryStats: jest.fn().mockResolvedValue(summaryStatsMock),
    getSalesOverTime: jest.fn().mockResolvedValue(salesOverTimeMock),
    getRevenueByTier: jest.fn().mockResolvedValue(revenueByTierMock),
  };

  let analyticsService: AnalyticsService;

  beforeAll(() => {
    analyticsService = new AnalyticsService(analyticsRepositoryMock as any);
  });

  afterEach(() => jest.clearAllMocks());

  describe('SUCCESS CASES', () => {
    it('should return dashboard data with calculated percentages', async () => {
      const filters: DashboardFilterDTO = {
        concertId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: '2023-01-01T00:00:00.000Z',
        endDate: '2023-12-31T23:59:59.999Z',
        period: 'day',
      };

      const result = await analyticsService.getDashboard(filters);

      const expectedRevenueByTier = [
        {
          tierName: 'VIP',
          revenue: 600,
          percentage: 60,
        },
        {
          tierName: 'General',
          revenue: 400,
          percentage: 40,
        },
      ];

      const expected: DashboardResponseDTO = {
        summary: summaryStatsMock,
        salesOverTime: salesOverTimeMock,
        revenueByTier: expectedRevenueByTier,
      };

      expect(result).toStrictEqual(expected);
      expect(analyticsRepositoryMock.getSummaryStats).toHaveBeenCalledTimes(1);
      expect(analyticsRepositoryMock.getSummaryStats).toHaveBeenCalledWith(filters);
      expect(analyticsRepositoryMock.getSalesOverTime).toHaveBeenCalledTimes(1);
      expect(analyticsRepositoryMock.getSalesOverTime).toHaveBeenCalledWith(filters);
      expect(analyticsRepositoryMock.getRevenueByTier).toHaveBeenCalledTimes(1);
      expect(analyticsRepositoryMock.getRevenueByTier).toHaveBeenCalledWith(filters);
    });

    it('should handle empty revenue by tier', async () => {
      const emptyRevenueByTier: { tierName: string; revenue: number }[] = [];
      analyticsRepositoryMock.getRevenueByTier.mockResolvedValueOnce(emptyRevenueByTier);

      const filters: DashboardFilterDTO = {};

      const result = await analyticsService.getDashboard(filters);

      expect(result.revenueByTier).toStrictEqual([]);
      expect(analyticsRepositoryMock.getSummaryStats).toHaveBeenCalledTimes(1);
      expect(analyticsRepositoryMock.getSummaryStats).toHaveBeenCalledWith(filters);
      expect(analyticsRepositoryMock.getSalesOverTime).toHaveBeenCalledTimes(1);
      expect(analyticsRepositoryMock.getSalesOverTime).toHaveBeenCalledWith(filters);
      expect(analyticsRepositoryMock.getRevenueByTier).toHaveBeenCalledTimes(1);
      expect(analyticsRepositoryMock.getRevenueByTier).toHaveBeenCalledWith(filters);
    });

    it('should calculate percentages correctly with zero total revenue', async () => {
      const zeroSummary = {
        totalRevenue: 0,
        totalTicketsSold: 0,
      };
      analyticsRepositoryMock.getSummaryStats.mockResolvedValueOnce(zeroSummary);

      const filters: DashboardFilterDTO = {};

      const result = await analyticsService.getDashboard(filters);

      const expectedRevenueByTier = [
        {
          tierName: 'VIP',
          revenue: 600,
          percentage: 0,
        },
        {
          tierName: 'General',
          revenue: 400,
          percentage: 0,
        },
      ];

      expect(result.revenueByTier).toStrictEqual(expectedRevenueByTier);
      expect(analyticsRepositoryMock.getSummaryStats).toHaveBeenCalledTimes(1);
      expect(analyticsRepositoryMock.getSummaryStats).toHaveBeenCalledWith(filters);
      expect(analyticsRepositoryMock.getSalesOverTime).toHaveBeenCalledTimes(1);
      expect(analyticsRepositoryMock.getSalesOverTime).toHaveBeenCalledWith(filters);
      expect(analyticsRepositoryMock.getRevenueByTier).toHaveBeenCalledTimes(1);
      expect(analyticsRepositoryMock.getRevenueByTier).toHaveBeenCalledWith(filters);
    });
  });
});
