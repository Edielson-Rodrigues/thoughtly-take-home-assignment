import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CONCERTS_QUERY_KEY } from '../../../concerts/hooks/useConcerts';
import { bookingsApi } from '../../api/bookings.api';
import { useCreateBooking } from '../useCreateBooking';

import type { CreateBookingDTO, CreateBookingResponse } from '../../types';

vi.mock('../../api/bookings.api');

describe('useCreateBooking', () => {
  let queryClient: QueryClient;

  const mockCreateBookingDTO: CreateBookingDTO = {
    ticketTierId: 'tier-123',
    userEmail: 'user@example.com',
    quantity: 2,
    totalPrice: 200,
    currency: 'USD',
    idempotencyKey: 'unique-key-123',
  };

  const mockCreateBookingResponse: CreateBookingResponse = {
    booking: {
      id: 'booking-123',
      userEmail: 'user@example.com',
      quantity: 2,
      totalPrice: 200,
      ticketTierId: 'tier-123',
      createdAt: '2024-01-01T00:00:00.000Z',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should create booking successfully', async () => {
    vi.mocked(bookingsApi.create).mockResolvedValue(mockCreateBookingResponse);

    const { result } = renderHook(() => useCreateBooking(), { wrapper });

    result.current.mutate(mockCreateBookingDTO);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(bookingsApi.create).toHaveBeenCalledWith(mockCreateBookingDTO);
    expect(bookingsApi.create).toHaveBeenCalledTimes(1);
  });

  it('should return only the booking object from response', async () => {
    vi.mocked(bookingsApi.create).mockResolvedValue(mockCreateBookingResponse);

    const { result } = renderHook(() => useCreateBooking(), { wrapper });

    result.current.mutate(mockCreateBookingDTO);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockCreateBookingResponse.booking);
    expect(result.current.data).not.toHaveProperty('booking');
  });

  it('should invalidate concerts query on success', async () => {
    vi.mocked(bookingsApi.create).mockResolvedValue(mockCreateBookingResponse);

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateBooking(), { wrapper });

    result.current.mutate(mockCreateBookingDTO);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: CONCERTS_QUERY_KEY });
  });

  it('should handle mutation error correctly', async () => {
    const mockError = new Error('Network error');
    vi.mocked(bookingsApi.create).mockRejectedValue(mockError);

    const { result } = renderHook(() => useCreateBooking(), { wrapper });

    result.current.mutate(mockCreateBookingDTO);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
    expect(result.current.data).toBeUndefined();
  });

  it('should handle validation errors from API', async () => {
    const validationError = {
      response: {
        status: 400,
        data: {
          statusCode: 400,
          error: 'Bad Request',
          message: ['quantity must be a positive number'],
        },
      },
    };
    vi.mocked(bookingsApi.create).mockRejectedValue(validationError);

    const { result } = renderHook(() => useCreateBooking(), { wrapper });

    result.current.mutate(mockCreateBookingDTO);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(validationError);
  });

  it('should allow multiple mutations', async () => {
    vi.mocked(bookingsApi.create).mockResolvedValue(mockCreateBookingResponse);

    const { result } = renderHook(() => useCreateBooking(), { wrapper });

    result.current.mutate(mockCreateBookingDTO);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(bookingsApi.create).toHaveBeenCalledTimes(1);

    const secondBooking = { ...mockCreateBookingDTO, idempotencyKey: 'uuid-1234-5678-9012-3456' };
    result.current.mutate(secondBooking);

    await waitFor(() => {
      expect(bookingsApi.create).toHaveBeenCalledTimes(2);
    });

    expect(bookingsApi.create).toHaveBeenCalledWith(secondBooking);
  });

  it('should not invalidate queries when mutation fails', async () => {
    const mockError = new Error('API error');
    vi.mocked(bookingsApi.create).mockRejectedValue(mockError);

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateBooking(), { wrapper });

    result.current.mutate(mockCreateBookingDTO);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(invalidateSpy).not.toHaveBeenCalled();
  });

  it('should transform response correctly with mutateAsync', async () => {
    vi.mocked(bookingsApi.create).mockResolvedValue(mockCreateBookingResponse);

    const { result } = renderHook(() => useCreateBooking(), { wrapper });

    const booking = await result.current.mutateAsync(mockCreateBookingDTO);

    expect(booking).toEqual(mockCreateBookingResponse.booking);
    expect(booking.id).toBe('booking-123');
    expect(booking.userEmail).toBe('user@example.com');
  });

  it('should provide access to mutation methods', () => {
    const { result } = renderHook(() => useCreateBooking(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current.mutate).toBeInstanceOf(Function);
    expect(result.current.mutateAsync).toBeInstanceOf(Function);
  });
});
