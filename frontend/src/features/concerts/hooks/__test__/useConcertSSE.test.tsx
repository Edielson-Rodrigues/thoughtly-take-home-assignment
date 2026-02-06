import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CONCERTS_QUERY_KEY } from '../useConcerts';
import { useConcertSSE } from '../useConcertSSE';

import type { Concert, ConcertStockUpdate } from '../../types';

describe('useConcertSSE', () => {
  let queryClient: QueryClient;
  let mockEventSource: {
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
    onmessage: ((event: MessageEvent) => void) | null;
    onerror: ((event: Event) => void) | null;
  };

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
        {
          id: 'tier-general',
          name: 'General',
          price: 50,
          totalQuantity: 500,
          availableQuantity: 200,
          concertId: 'concert-123',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    queryClient.setQueryData(CONCERTS_QUERY_KEY, mockConcerts);

    mockEventSource = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      close: vi.fn(),
      onmessage: null,
      onerror: null,
    };

    window.EventSource = vi.fn(function (this: any) {
      return mockEventSource;
    }) as any;
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should create EventSource connection on mount', () => {
    renderHook(() => useConcertSSE(), { wrapper });

    expect(window.EventSource).toHaveBeenCalledTimes(1);
    expect(window.EventSource).toHaveBeenCalledWith('http://localhost:8000/api/concerts/stream');
  });

  it('should update ticket tier quantity on SSE message', async () => {
    renderHook(() => useConcertSSE(), { wrapper });

    const update: ConcertStockUpdate = {
      concertId: 'concert-123',
      ticketTierId: 'tier-vip',
      newAvailableQuantity: 45,
    };

    const messageEvent = new MessageEvent('message', {
      data: JSON.stringify(update),
    });
    mockEventSource.onmessage?.(messageEvent);

    await waitFor(() => {
      const cachedData = queryClient.getQueryData<Concert[]>(CONCERTS_QUERY_KEY);
      const updatedTier = cachedData?.[0].ticketTiers?.find((t) => t.id === 'tier-vip');
      expect(updatedTier?.availableQuantity).toBe(45);
    });
  });

  it('should only update matching concert and tier', async () => {
    renderHook(() => useConcertSSE(), { wrapper });

    const update: ConcertStockUpdate = {
      concertId: 'concert-123',
      ticketTierId: 'tier-vip',
      newAvailableQuantity: 30,
    };

    const messageEvent = new MessageEvent('message', {
      data: JSON.stringify(update),
    });
    mockEventSource.onmessage?.(messageEvent);

    await waitFor(() => {
      const cachedData = queryClient.getQueryData<Concert[]>(CONCERTS_QUERY_KEY);
      const vipTier = cachedData?.[0].ticketTiers?.find((t) => t.id === 'tier-vip');
      const generalTier = cachedData?.[0].ticketTiers?.find((t) => t.id === 'tier-general');

      expect(vipTier?.availableQuantity).toBe(30); // Updated
      expect(generalTier?.availableQuantity).toBe(200); // Unchanged
    });
  });

  it('should not update cache if concert does not match', async () => {
    renderHook(() => useConcertSSE(), { wrapper });

    const update: ConcertStockUpdate = {
      concertId: 'concert-999', // Non-existent concert
      ticketTierId: 'tier-vip',
      newAvailableQuantity: 10,
    };

    const messageEvent = new MessageEvent('message', {
      data: JSON.stringify(update),
    });
    mockEventSource.onmessage?.(messageEvent);

    await waitFor(() => {
      const cachedData = queryClient.getQueryData<Concert[]>(CONCERTS_QUERY_KEY);
      const vipTier = cachedData?.[0].ticketTiers?.find((t) => t.id === 'tier-vip');
      expect(vipTier?.availableQuantity).toBe(50); // Unchanged
    });
  });

  it('should handle invalid JSON gracefully', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderHook(() => useConcertSSE(), { wrapper });

    const messageEvent = new MessageEvent('message', {
      data: 'invalid json{',
    });
    mockEventSource.onmessage?.(messageEvent);

    expect(consoleErrorSpy).toHaveBeenCalledWith('[SSE] Failed to parse event:', expect.any(Error));

    consoleErrorSpy.mockRestore();
  });

  it('should handle SSE connection error', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderHook(() => useConcertSSE(), { wrapper });

    const errorEvent = new Event('error');
    mockEventSource.onerror?.(errorEvent);

    expect(consoleErrorSpy).toHaveBeenCalledWith('[SSE] Connection error:', errorEvent);

    consoleErrorSpy.mockRestore();
  });

  it('should close EventSource connection on unmount', () => {
    const { unmount } = renderHook(() => useConcertSSE(), { wrapper });

    unmount();

    expect(mockEventSource.close).toHaveBeenCalledTimes(1);
  });

  it('should handle multiple updates correctly', async () => {
    renderHook(() => useConcertSSE(), { wrapper });

    const update1: ConcertStockUpdate = {
      concertId: 'concert-123',
      ticketTierId: 'tier-vip',
      newAvailableQuantity: 45,
    };
    mockEventSource.onmessage?.(new MessageEvent('message', { data: JSON.stringify(update1) }));

    await waitFor(() => {
      const cachedData = queryClient.getQueryData<Concert[]>(CONCERTS_QUERY_KEY);
      const vipTier = cachedData?.[0].ticketTiers?.find((t) => t.id === 'tier-vip');
      expect(vipTier?.availableQuantity).toBe(45);
    });

    const update2: ConcertStockUpdate = {
      concertId: 'concert-123',
      ticketTierId: 'tier-general',
      newAvailableQuantity: 180,
    };
    mockEventSource.onmessage?.(new MessageEvent('message', { data: JSON.stringify(update2) }));

    await waitFor(() => {
      const cachedData = queryClient.getQueryData<Concert[]>(CONCERTS_QUERY_KEY);
      const generalTier = cachedData?.[0].ticketTiers?.find((t) => t.id === 'tier-general');
      expect(generalTier?.availableQuantity).toBe(180);
    });
  });

  it('should not update if cache data is undefined', async () => {
    queryClient.clear(); // Clear cache

    renderHook(() => useConcertSSE(), { wrapper });

    const update: ConcertStockUpdate = {
      concertId: 'concert-123',
      ticketTierId: 'tier-vip',
      newAvailableQuantity: 30,
    };

    const messageEvent = new MessageEvent('message', {
      data: JSON.stringify(update),
    });
    mockEventSource.onmessage?.(messageEvent);

    const cachedData = queryClient.getQueryData<Concert[]>(CONCERTS_QUERY_KEY);
    expect(cachedData).toBeUndefined();
  });

  it('should preserve other concert properties when updating', async () => {
    renderHook(() => useConcertSSE(), { wrapper });

    const update: ConcertStockUpdate = {
      concertId: 'concert-123',
      ticketTierId: 'tier-vip',
      newAvailableQuantity: 25,
    };

    const messageEvent = new MessageEvent('message', {
      data: JSON.stringify(update),
    });
    mockEventSource.onmessage?.(messageEvent);

    await waitFor(() => {
      const cachedData = queryClient.getQueryData<Concert[]>(CONCERTS_QUERY_KEY);
      const concert = cachedData?.[0];

      expect(concert?.name).toBe('Rock Concert');
      expect(concert?.location).toBe('Madison Square Garden');
      expect(concert?.ticketTiers).toHaveLength(2);
    });
  });

  it('should preserve other tier properties when updating quantity', async () => {
    renderHook(() => useConcertSSE(), { wrapper });

    const update: ConcertStockUpdate = {
      concertId: 'concert-123',
      ticketTierId: 'tier-vip',
      newAvailableQuantity: 40,
    };

    const messageEvent = new MessageEvent('message', {
      data: JSON.stringify(update),
    });
    mockEventSource.onmessage?.(messageEvent);

    await waitFor(() => {
      const cachedData = queryClient.getQueryData<Concert[]>(CONCERTS_QUERY_KEY);
      const vipTier = cachedData?.[0].ticketTiers?.find((t) => t.id === 'tier-vip');

      expect(vipTier?.name).toBe('VIP');
      expect(vipTier?.price).toBe(150);
      expect(vipTier?.totalQuantity).toBe(100);
      expect(vipTier?.availableQuantity).toBe(40); // Only this changed
    });
  });

  it('should use correct API URL from environment', () => {
    renderHook(() => useConcertSSE(), { wrapper });

    expect(window.EventSource).toHaveBeenCalledWith(expect.stringContaining('/concerts/stream'));
  });
});
