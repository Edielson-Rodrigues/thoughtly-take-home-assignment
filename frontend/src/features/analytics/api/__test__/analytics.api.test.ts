import { beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from '../../../../lib/axios';
import { getDashboard } from '../analytics.api';

import type { DashboardResponse } from '../../types';

vi.mock('../../../../lib/axios');

describe('Analytics API', () => {
  const mockDashboardResponse: DashboardResponse = {
    summary: {
      totalRevenue: 10000,
      totalTicketsSold: 100,
    },
    salesOverTime: [
      {
        date: '2024-01-01',
        revenue: 5000,
        tickets: 50,
      },
      {
        date: '2024-01-02',
        revenue: 5000,
        tickets: 50,
      },
    ],
    revenueByTier: [
      {
        tierName: 'VIP',
        concertName: 'Rock Concert',
        revenue: 6000,
        percentage: 60,
      },
      {
        tierName: 'General',
        concertName: 'Rock Concert',
        revenue: 4000,
        percentage: 40,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDashboard', () => {
    it('should fetch dashboard data without filters', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockDashboardResponse });

      const result = await getDashboard();

      expect(api.get).toHaveBeenCalledWith('/analytics/dashboard');
      expect(result).toEqual(mockDashboardResponse);
    });

    it('should fetch dashboard data with concertId filter', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockDashboardResponse });

      const filters = { concertId: 'concert-123' };
      const result = await getDashboard(filters);

      expect(api.get).toHaveBeenCalledWith('/analytics/dashboard?concertId=concert-123');
      expect(result).toEqual(mockDashboardResponse);
    });

    it('should fetch dashboard data with startDate filter', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockDashboardResponse });

      const filters = { startDate: '2024-01-01' };
      const result = await getDashboard(filters);

      expect(api.get).toHaveBeenCalledWith('/analytics/dashboard?startDate=2024-01-01');
      expect(result).toEqual(mockDashboardResponse);
    });

    it('should fetch dashboard data with endDate filter', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockDashboardResponse });

      const filters = { endDate: '2024-12-31' };
      const result = await getDashboard(filters);

      expect(api.get).toHaveBeenCalledWith('/analytics/dashboard?endDate=2024-12-31');
      expect(result).toEqual(mockDashboardResponse);
    });

    it('should fetch dashboard data with period filter', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockDashboardResponse });

      const filters = { period: 'day' as const };
      const result = await getDashboard(filters);

      expect(api.get).toHaveBeenCalledWith('/analytics/dashboard?period=day');
      expect(result).toEqual(mockDashboardResponse);
    });

    it('should fetch dashboard data with multiple filters', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockDashboardResponse });

      const filters = {
        concertId: 'concert-123',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        period: 'week' as const,
      };
      const result = await getDashboard(filters);

      expect(api.get).toHaveBeenCalledWith(
        '/analytics/dashboard?concertId=concert-123&startDate=2024-01-01&endDate=2024-12-31&period=week',
      );
      expect(result).toEqual(mockDashboardResponse);
    });

    it('should fetch dashboard data with empty filters object', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockDashboardResponse });

      const result = await getDashboard({});

      expect(api.get).toHaveBeenCalledWith('/analytics/dashboard');
      expect(result).toEqual(mockDashboardResponse);
    });

    it('should handle API errors correctly', async () => {
      const mockError = new Error('Network error');
      vi.mocked(api.get).mockRejectedValue(mockError);

      await expect(getDashboard()).rejects.toThrow('Network error');
      expect(api.get).toHaveBeenCalledWith('/analytics/dashboard');
    });

    it('should return data from response.data', async () => {
      const mockResponse = { data: mockDashboardResponse };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await getDashboard();

      expect(result).toEqual(mockDashboardResponse);
      expect(result).not.toHaveProperty('data');
    });

    it('should ignore undefined filter values', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockDashboardResponse });

      const filters = {
        concertId: undefined,
        startDate: '2024-01-01',
        endDate: undefined,
        period: undefined,
      };
      const result = await getDashboard(filters);

      expect(api.get).toHaveBeenCalledWith('/analytics/dashboard?startDate=2024-01-01');
      expect(result).toEqual(mockDashboardResponse);
    });

    it('should handle filters with special characters correctly', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockDashboardResponse });

      const filters = {
        concertId: 'concert name with spaces',
      };
      const result = await getDashboard(filters);

      expect(api.get).toHaveBeenCalledWith(
        '/analytics/dashboard?concertId=concert+name+with+spaces',
      );
      expect(result).toEqual(mockDashboardResponse);
    });
  });
});
