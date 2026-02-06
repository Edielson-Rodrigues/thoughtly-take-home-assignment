import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { concertsApi } from '../../api/concerts.api';
import { CONCERTS_QUERY_KEY, useConcerts } from '../useConcerts';

import type { Concert, FindConcertsResponse } from '../../types';

vi.mock('../../api/concerts.api');

describe('useConcerts', () => {
  let queryClient: QueryClient;

  const mockConcerts: Concert[] = [
    {
      id: 'concert-123',
      name: 'Rock Concert',
      description: 'Amazing rock concert',
      location: 'Madison Square Garden',
      date: '2024-12-31T20:00:00.000Z',
      createdAt: '2024-01-01T00:00:00.000Z',
      ticketTiers: [
        {
          id: 'tier-vip',
          name: 'VIP',
          price: 150,
          totalQuantity: 100,
          availableQuantity: 50,
          concertId: 'concert-123',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ],
    },
    {
      id: 'concert-456',
      name: 'Jazz Night',
      description: 'Smooth jazz evening',
      location: 'Blue Note',
      date: '2024-11-15T19:00:00.000Z',
      createdAt: '2024-01-02T00:00:00.000Z',
    },
  ];

  const mockResponse: FindConcertsResponse = {
    concerts: mockConcerts,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should fetch concerts successfully', async () => {
    vi.mocked(concertsApi.findAll).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useConcerts(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockConcerts);
    expect(concertsApi.findAll).toHaveBeenCalledTimes(1);
  });

  it('should return array of concerts from response', async () => {
    vi.mocked(concertsApi.findAll).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useConcerts(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(Array.isArray(result.current.data)).toBe(true);
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data).not.toHaveProperty('concerts');
  });

  it('should use correct query key', async () => {
    vi.mocked(concertsApi.findAll).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useConcerts(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const cachedData = queryClient.getQueryData(CONCERTS_QUERY_KEY);
    expect(cachedData).toEqual(mockConcerts);
  });

  it('should handle API errors correctly', async () => {
    const mockError = new Error('Network error');
    vi.mocked(concertsApi.findAll).mockRejectedValue(mockError);

    const { result } = renderHook(() => useConcerts(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
    expect(result.current.data).toBeUndefined();
  });

  it('should handle empty concerts array', async () => {
    const emptyResponse: FindConcertsResponse = { concerts: [] };
    vi.mocked(concertsApi.findAll).mockResolvedValue(emptyResponse);

    const { result } = renderHook(() => useConcerts(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.data).toHaveLength(0);
  });

  it('should cache data after successful fetch', async () => {
    vi.mocked(concertsApi.findAll).mockResolvedValue(mockResponse);

    const { result: result1 } = renderHook(() => useConcerts(), { wrapper });

    await waitFor(() => {
      expect(result1.current.isSuccess).toBe(true);
    });

    const cachedData = queryClient.getQueryData(CONCERTS_QUERY_KEY);
    expect(cachedData).toEqual(mockConcerts);
    expect(concertsApi.findAll).toHaveBeenCalledTimes(1);
  });

  it('should refetch data when invalidated', async () => {
    vi.mocked(concertsApi.findAll).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useConcerts(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(concertsApi.findAll).toHaveBeenCalledTimes(1);

    await queryClient.invalidateQueries({ queryKey: CONCERTS_QUERY_KEY });

    await waitFor(() => {
      expect(concertsApi.findAll).toHaveBeenCalledTimes(2);
    });
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
    vi.mocked(concertsApi.findAll).mockRejectedValue(serverError);

    const { result } = renderHook(() => useConcerts(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(serverError);
  });

  it('should preserve concert structure with ticket tiers', async () => {
    vi.mocked(concertsApi.findAll).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useConcerts(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const concertWithTiers = result.current.data![0];
    expect(concertWithTiers).toHaveProperty('ticketTiers');
    expect(concertWithTiers.ticketTiers).toHaveLength(1);
    expect(concertWithTiers.ticketTiers![0]).toHaveProperty('name', 'VIP');
  });

  it('should provide refetch method', async () => {
    vi.mocked(concertsApi.findAll).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useConcerts(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.refetch).toBeInstanceOf(Function);

    await result.current.refetch();

    expect(concertsApi.findAll).toHaveBeenCalledTimes(2);
  });

  it('should have correct query states during lifecycle', async () => {
    vi.mocked(concertsApi.findAll).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useConcerts(), { wrapper });

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

  it('should export CONCERTS_QUERY_KEY constant', () => {
    expect(CONCERTS_QUERY_KEY).toEqual(['concerts']);
  });
});
