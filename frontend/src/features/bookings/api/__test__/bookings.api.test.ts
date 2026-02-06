import { beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from '../../../../lib/axios';
import { bookingsApi } from '../bookings.api';

import type { CreateBookingDTO, CreateBookingResponse } from '../../types';

vi.mock('../../../../lib/axios');

describe('Bookings API', () => {
  const mockCreateBookingDTO: CreateBookingDTO = {
    ticketTierId: 'tier-123',
    userEmail: 'user@example.com',
    quantity: 2,
    totalPrice: 200,
    currency: 'USD',
    idempotencyKey: 'uuid-1234-5678-9012-3456',
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
  });

  describe('create', () => {
    it('should create a booking successfully', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: mockCreateBookingResponse });

      const result = await bookingsApi.create(mockCreateBookingDTO);

      expect(api.post).toHaveBeenCalledWith('/bookings', mockCreateBookingDTO);
      expect(result).toEqual(mockCreateBookingResponse);
    });

    it('should send all required fields in the request', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: mockCreateBookingResponse });

      await bookingsApi.create(mockCreateBookingDTO);

      expect(api.post).toHaveBeenCalledWith('/bookings', {
        ticketTierId: 'tier-123',
        userEmail: 'user@example.com',
        quantity: 2,
        totalPrice: 200,
        currency: 'USD',
        idempotencyKey: 'uuid-1234-5678-9012-3456',
      });
    });

    it('should return booking data from response.data', async () => {
      const mockResponse = { data: mockCreateBookingResponse };
      vi.mocked(api.post).mockResolvedValue(mockResponse);

      const result = await bookingsApi.create(mockCreateBookingDTO);

      expect(result).toEqual(mockCreateBookingResponse);
      expect(result).not.toHaveProperty('data');
    });

    it('should handle API errors correctly', async () => {
      const mockError = new Error('Network error');
      vi.mocked(api.post).mockRejectedValue(mockError);

      await expect(bookingsApi.create(mockCreateBookingDTO)).rejects.toThrow('Network error');
      expect(api.post).toHaveBeenCalledWith('/bookings', mockCreateBookingDTO);
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
      vi.mocked(api.post).mockRejectedValue(validationError);

      await expect(bookingsApi.create(mockCreateBookingDTO)).rejects.toEqual(validationError);
    });

    it('should handle conflict errors (duplicate idempotency key)', async () => {
      const conflictError = {
        response: {
          status: 409,
          data: {
            statusCode: 409,
            error: 'Conflict',
            message: 'Duplicate idempotency key',
          },
        },
      };
      vi.mocked(api.post).mockRejectedValue(conflictError);

      await expect(bookingsApi.create(mockCreateBookingDTO)).rejects.toEqual(conflictError);
    });

    it('should create booking with minimum quantity', async () => {
      const minQuantityBooking: CreateBookingDTO = {
        ...mockCreateBookingDTO,
        quantity: 1,
        totalPrice: 100,
      };
      vi.mocked(api.post).mockResolvedValue({ data: mockCreateBookingResponse });

      await bookingsApi.create(minQuantityBooking);

      expect(api.post).toHaveBeenCalledWith('/bookings', minQuantityBooking);
    });

    it('should create booking with large quantity', async () => {
      const largeQuantityBooking: CreateBookingDTO = {
        ...mockCreateBookingDTO,
        quantity: 10,
        totalPrice: 1000,
      };
      vi.mocked(api.post).mockResolvedValue({ data: mockCreateBookingResponse });

      await bookingsApi.create(largeQuantityBooking);

      expect(api.post).toHaveBeenCalledWith('/bookings', largeQuantityBooking);
    });

    it('should preserve idempotency key in request', async () => {
      const uniqueKey = 'test-idempotency-key-456';
      const bookingWithKey: CreateBookingDTO = {
        ...mockCreateBookingDTO,
        idempotencyKey: uniqueKey,
      };
      vi.mocked(api.post).mockResolvedValue({ data: mockCreateBookingResponse });

      await bookingsApi.create(bookingWithKey);

      const callArgs = vi.mocked(api.post).mock.calls[0];
      expect(callArgs[1]).toHaveProperty('idempotencyKey', uniqueKey);
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
      vi.mocked(api.post).mockRejectedValue(serverError);

      await expect(bookingsApi.create(mockCreateBookingDTO)).rejects.toEqual(serverError);
    });

    it('should return booking with correct structure', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: mockCreateBookingResponse });

      const result = await bookingsApi.create(mockCreateBookingDTO);

      expect(result).toHaveProperty('booking');
      expect(result.booking).toHaveProperty('id');
      expect(result.booking).toHaveProperty('userEmail');
      expect(result.booking).toHaveProperty('quantity');
      expect(result.booking).toHaveProperty('totalPrice');
      expect(result.booking).toHaveProperty('ticketTierId');
      expect(result.booking).toHaveProperty('createdAt');
    });
  });
});
