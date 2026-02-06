import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getDashboard } from '../../api/analytics.api';
import { ANALYTICS_QUERY_KEY, useAnalytics } from '../useAnalytics';

import type { DashboardResponse } from '../../types';

vi.mock('../../api/analytics.api');

describe('useAnalytics', () => {
  let queryClient: QueryClient;

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
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          refetchInterval: false,
        },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should fetch dashboard data without filters', async () => {
    vi.mocked(getDashboard).mockResolvedValue(mockDashboardResponse);

    const { result } = renderHook(() => useAnalytics(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getDashboard).toHaveBeenCalledWith({});
    expect(result.current.data).toEqual(mockDashboardResponse);
  });

  it('should fetch dashboard data with filters', async () => {
    vi.mocked(getDashboard).mockResolvedValue(mockDashboardResponse);

    const filters = {
      concertId: 'concert-123',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      period: 'week' as const,
    };

    const { result } = renderHook(() => useAnalytics(filters), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getDashboard).toHaveBeenCalledWith(filters);
    expect(result.current.data).toEqual(mockDashboardResponse);
  });

  it('should use correct query key without filters', async () => {
    vi.mocked(getDashboard).mockResolvedValue(mockDashboardResponse);

    renderHook(() => useAnalytics(), { wrapper });

    await waitFor(() => {
      const cachedData = queryClient.getQueryData([...ANALYTICS_QUERY_KEY, {}]);
      expect(cachedData).toEqual(mockDashboardResponse);
    });
  });

  it('should use different query keys for different filters', async () => {
    vi.mocked(getDashboard).mockResolvedValue(mockDashboardResponse);

    const filters1 = { concertId: 'concert-123' };
    const filters2 = { concertId: 'concert-456' };

    renderHook(() => useAnalytics(filters1), { wrapper });
    await waitFor(() => {
      expect(getDashboard).toHaveBeenCalledWith(filters1);
    });

    renderHook(() => useAnalytics(filters2), { wrapper });
    await waitFor(() => {
      expect(getDashboard).toHaveBeenCalledWith(filters2);
    });

    expect(getDashboard).toHaveBeenCalledTimes(2);
  });

  it('should cache data with same filters', async () => {
    vi.mocked(getDashboard).mockResolvedValue(mockDashboardResponse);

    const filters = { concertId: 'concert-123' };

    const { result: result1 } = renderHook(() => useAnalytics(filters), { wrapper });

    await waitFor(() => {
      expect(result1.current.isSuccess).toBe(true);
    });

    const cachedData = queryClient.getQueryData([...ANALYTICS_QUERY_KEY, filters]);
    expect(cachedData).toEqual(mockDashboardResponse);
    expect(getDashboard).toHaveBeenCalledTimes(1);
  });

  it('should handle API errors correctly', async () => {
    const mockError = new Error('API error');
    vi.mocked(getDashboard).mockRejectedValue(mockError);

    const { result } = renderHook(() => useAnalytics(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
    expect(result.current.data).toBeUndefined();
  });

  it('should handle empty dashboard response', async () => {
    const emptyResponse: DashboardResponse = {
      summary: {
        totalRevenue: 0,
        totalTicketsSold: 0,
      },
      salesOverTime: [],
      revenueByTier: [],
    };
    vi.mocked(getDashboard).mockResolvedValue(emptyResponse);

    const { result } = renderHook(() => useAnalytics(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(emptyResponse);
  });

  it('should provide refetch method', async () => {
    vi.mocked(getDashboard).mockResolvedValue(mockDashboardResponse);

    const { result } = renderHook(() => useAnalytics(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.refetch).toBeInstanceOf(Function);

    await result.current.refetch();

    expect(getDashboard).toHaveBeenCalledTimes(2);
  });

  it('should handle filter changes correctly', async () => {
    vi.mocked(getDashboard).mockResolvedValue(mockDashboardResponse);

    const { result, rerender } = renderHook(({ filters }) => useAnalytics(filters), {
      initialProps: { filters: { concertId: 'concert-123' } },
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getDashboard).toHaveBeenCalledWith({ concertId: 'concert-123' });

    rerender({ filters: { concertId: 'concert-456' } });

    await waitFor(() => {
      expect(getDashboard).toHaveBeenCalledWith({ concertId: 'concert-456' });
    });

    expect(getDashboard).toHaveBeenCalledTimes(2);
  });

  it('should return correct dashboard structure', async () => {
    vi.mocked(getDashboard).mockResolvedValue(mockDashboardResponse);

    const { result } = renderHook(() => useAnalytics(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveProperty('summary');
    expect(result.current.data).toHaveProperty('salesOverTime');
    expect(result.current.data).toHaveProperty('revenueByTier');
    expect(result.current.data?.summary).toHaveProperty('totalRevenue');
    expect(result.current.data?.summary).toHaveProperty('totalTicketsSold');
  });

  it('should have correct query states during lifecycle', async () => {
    vi.mocked(getDashboard).mockResolvedValue(mockDashboardResponse);

    const { result } = renderHook(() => useAnalytics(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.isError).toBe(false);
  });

  it('should export ANALYTICS_QUERY_KEY constant', () => {
    expect(ANALYTICS_QUERY_KEY).toEqual(['analytics', 'dashboard']);
  });

  it('should handle partial filters', async () => {
    vi.mocked(getDashboard).mockResolvedValue(mockDashboardResponse);

    const filters = { startDate: '2024-01-01' };

    const { result } = renderHook(() => useAnalytics(filters), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getDashboard).toHaveBeenCalledWith(filters);
  });

  it('should handle period filter', async () => {
    vi.mocked(getDashboard).mockResolvedValue(mockDashboardResponse);

    const filters = { period: 'day' as const };

    const { result } = renderHook(() => useAnalytics(filters), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getDashboard).toHaveBeenCalledWith(filters);
  });

  it('should handle server errors (500)', async () => {
    const serverError = {
      response: {
        status: 500,
        data: {
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'Something went wrong',
        },
      },
    };
    vi.mocked(getDashboard).mockRejectedValue(serverError);

    const { result } = renderHook(() => useAnalytics(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(serverError);
  });
});
