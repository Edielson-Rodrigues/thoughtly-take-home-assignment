import { beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from '../axios';

import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

describe('axios configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('instance configuration', () => {
    it('should have correct baseURL', () => {
      expect(api.defaults.baseURL).toBeDefined();
      expect(api.defaults.baseURL).toContain('/api');
    });

    it('should have correct default headers', () => {
      expect(api.defaults.headers['Content-Type']).toBe('application/json');
    });

    it('should be an axios instance', () => {
      expect(api.request).toBeDefined();
      expect(api.get).toBeDefined();
      expect(api.post).toBeDefined();
      expect(api.put).toBeDefined();
      expect(api.patch).toBeDefined();
      expect(api.delete).toBeDefined();
    });
  });

  describe('request interceptor', () => {
    it('should call the request interceptor', () => {
      const consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

      const config: InternalAxiosRequestConfig = {
        method: 'GET',
        url: '/test',
        headers: {},
      } as InternalAxiosRequestConfig;
      const interceptor = api.interceptors.request.handlers?.[0];

      if (interceptor?.fulfilled) {
        interceptor.fulfilled(config);
      }

      expect(consoleDebugSpy).toHaveBeenCalledWith(expect.stringContaining('[API]'));
      expect(consoleDebugSpy).toHaveBeenCalledWith(expect.stringContaining('GET'));

      consoleDebugSpy.mockRestore();
    });

    it('should return config from request interceptor', () => {
      const config: InternalAxiosRequestConfig = {
        method: 'POST',
        url: '/test',
        data: { test: 'data' },
        headers: {},
      } as InternalAxiosRequestConfig;
      const interceptor = api.interceptors.request.handlers?.[0];

      if (interceptor?.fulfilled) {
        const result = interceptor.fulfilled(config);
        expect(result).toEqual(config);
      }
    });
  });

  describe('response interceptor', () => {
    it('should pass through successful response', () => {
      const mockResponse: AxiosResponse = {
        data: { result: 'success' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };
      const interceptor = api.interceptors.response.handlers?.[0];

      if (interceptor?.fulfilled) {
        const result = interceptor.fulfilled(mockResponse);
        expect(result).toEqual(mockResponse);
      }
    });

    it('should log error on failed response with data', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockError = {
        response: {
          data: {
            statusCode: 400,
            error: 'Bad Request',
            message: 'Invalid input',
            timestamp: '2024-01-01T00:00:00.000Z',
            path: '/api/test',
          },
          status: 400,
        },
        message: 'Request failed',
      };

      const interceptor = api.interceptors.response.handlers?.[0];

      if (interceptor?.rejected) {
        await expect(interceptor.rejected(mockError)).rejects.toBeDefined();

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '[API Error]',
          expect.objectContaining({
            statusCode: 400,
            error: 'Bad Request',
          }),
        );
      }

      consoleErrorSpy.mockRestore();
    });

    it('should log error message when no response data', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockError = {
        message: 'Network Error',
      };

      const interceptor = api.interceptors.response.handlers?.[0];

      if (interceptor?.rejected) {
        await expect(interceptor.rejected(mockError)).rejects.toBeDefined();

        expect(consoleErrorSpy).toHaveBeenCalledWith('[API Error]', 'Network Error');
      }

      consoleErrorSpy.mockRestore();
    });
  });

  describe('HTTP methods', () => {
    it('should have GET method', () => {
      expect(typeof api.get).toBe('function');
    });

    it('should have POST method', () => {
      expect(typeof api.post).toBe('function');
    });

    it('should have PUT method', () => {
      expect(typeof api.put).toBe('function');
    });

    it('should have PATCH method', () => {
      expect(typeof api.patch).toBe('function');
    });

    it('should have DELETE method', () => {
      expect(typeof api.delete).toBe('function');
    });

    it('should have REQUEST method', () => {
      expect(typeof api.request).toBe('function');
    });
  });

  describe('interceptors', () => {
    it('should have request interceptors configured', () => {
      expect(api.interceptors.request.handlers!.length).toBeGreaterThan(0);
    });

    it('should have response interceptors configured', () => {
      expect(api.interceptors.response.handlers!.length).toBeGreaterThan(0);
    });
  });
});
