import { beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from '../../../../lib/axios';
import { concertsApi } from '../concerts.api';

import type { Concert, FindConcertsResponse } from '../../types';

vi.mock('../../../../lib/axios');

describe('Concerts API', () => {
  const mockConcert: Concert = {
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
  };

  const mockFindConcertsResponse: FindConcertsResponse = {
    concerts: [mockConcert],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should fetch all concerts successfully', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockFindConcertsResponse });

      const result = await concertsApi.findAll();

      expect(api.get).toHaveBeenCalledWith('/concerts');
      expect(result).toEqual(mockFindConcertsResponse);
    });

    it('should return concerts from response.data', async () => {
      const mockResponse = { data: mockFindConcertsResponse };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await concertsApi.findAll();

      expect(result).toEqual(mockFindConcertsResponse);
      expect(result).not.toHaveProperty('data');
    });

    it('should return array of concerts with correct structure', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockFindConcertsResponse });

      const result = await concertsApi.findAll();

      expect(result).toHaveProperty('concerts');
      expect(Array.isArray(result.concerts)).toBe(true);
      expect(result.concerts).toHaveLength(1);
    });

    it('should return concert with all required fields', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockFindConcertsResponse });

      const result = await concertsApi.findAll();
      const concert = result.concerts[0];

      expect(concert).toHaveProperty('id');
      expect(concert).toHaveProperty('name');
      expect(concert).toHaveProperty('description');
      expect(concert).toHaveProperty('location');
      expect(concert).toHaveProperty('date');
      expect(concert).toHaveProperty('createdAt');
    });

    it('should return concerts with ticket tiers', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockFindConcertsResponse });

      const result = await concertsApi.findAll();
      const concert = result.concerts[0];

      expect(concert).toHaveProperty('ticketTiers');
      expect(Array.isArray(concert.ticketTiers)).toBe(true);
      expect(concert.ticketTiers).toHaveLength(2);
    });

    it('should return ticket tiers with correct structure', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockFindConcertsResponse });

      const result = await concertsApi.findAll();
      const tier = result.concerts[0].ticketTiers![0];

      expect(tier).toHaveProperty('id');
      expect(tier).toHaveProperty('name');
      expect(tier).toHaveProperty('price');
      expect(tier).toHaveProperty('totalQuantity');
      expect(tier).toHaveProperty('availableQuantity');
      expect(tier).toHaveProperty('concertId');
      expect(tier).toHaveProperty('createdAt');
    });

    it('should handle empty concerts array', async () => {
      const emptyResponse: FindConcertsResponse = { concerts: [] };
      vi.mocked(api.get).mockResolvedValue({ data: emptyResponse });

      const result = await concertsApi.findAll();

      expect(result.concerts).toHaveLength(0);
      expect(Array.isArray(result.concerts)).toBe(true);
    });

    it('should handle multiple concerts', async () => {
      const multipleConcerts: FindConcertsResponse = {
        concerts: [
          mockConcert,
          {
            ...mockConcert,
            id: 'concert-456',
            name: 'Jazz Night',
          },
          {
            ...mockConcert,
            id: 'concert-789',
            name: 'Classical Symphony',
          },
        ],
      };
      vi.mocked(api.get).mockResolvedValue({ data: multipleConcerts });

      const result = await concertsApi.findAll();

      expect(result.concerts).toHaveLength(3);
      expect(result.concerts[0].id).toBe('concert-123');
      expect(result.concerts[1].id).toBe('concert-456');
      expect(result.concerts[2].id).toBe('concert-789');
    });

    it('should handle API errors correctly', async () => {
      const mockError = new Error('Network error');
      vi.mocked(api.get).mockRejectedValue(mockError);

      await expect(concertsApi.findAll()).rejects.toThrow('Network error');
      expect(api.get).toHaveBeenCalledWith('/concerts');
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
      vi.mocked(api.get).mockRejectedValue(serverError);

      await expect(concertsApi.findAll()).rejects.toEqual(serverError);
    });

    it('should handle concerts without ticket tiers', async () => {
      const concertWithoutTiers: FindConcertsResponse = {
        concerts: [
          {
            id: 'concert-999',
            name: 'Future Concert',
            description: 'Coming soon',
            location: 'TBA',
            date: '2025-01-01T00:00:00.000Z',
            createdAt: '2024-01-01T00:00:00.000Z',
          },
        ],
      };
      vi.mocked(api.get).mockResolvedValue({ data: concertWithoutTiers });

      const result = await concertsApi.findAll();

      expect(result.concerts[0]).not.toHaveProperty('ticketTiers');
    });

    it('should call GET endpoint without query parameters', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockFindConcertsResponse });

      await concertsApi.findAll();

      expect(api.get).toHaveBeenCalledTimes(1);
      expect(api.get).toHaveBeenCalledWith('/concerts');
    });

    it('should preserve ticket tier quantities', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockFindConcertsResponse });

      const result = await concertsApi.findAll();
      const vipTier = result.concerts[0].ticketTiers![0];

      expect(vipTier.totalQuantity).toBe(100);
      expect(vipTier.availableQuantity).toBe(50);
      expect(vipTier.price).toBe(150);
    });
  });
});
