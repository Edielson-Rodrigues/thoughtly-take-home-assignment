import { describe, expect, it } from 'vitest';

import { getApiErrorCode, getApiErrorMessages, isApiError, isApiErrorCode } from '../api-error';

import type { ApiError } from '../axios';

describe('api-error utils', () => {
  describe('getApiErrorMessages', () => {
    it('should return array of messages from API error with array message', () => {
      const error: ApiError = {
        response: {
          data: {
            statusCode: 400,
            error: 'Bad Request',
            message: ['Field is required', 'Invalid format'],
            timestamp: '2024-01-01T00:00:00.000Z',
            path: '/api/test',
          },
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          config: {} as any,
        },
        config: {} as any,
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Request failed',
      };

      const messages = getApiErrorMessages(error);

      expect(messages).toEqual(['Field is required', 'Invalid format']);
    });

    it('should return array with single message from API error with string message', () => {
      const error: ApiError = {
        response: {
          data: {
            statusCode: 404,
            error: 'Not Found',
            message: 'Resource not found',
            timestamp: '2024-01-01T00:00:00.000Z',
            path: '/api/test',
          },
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config: {} as any,
        },
        config: {} as any,
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Request failed',
      };

      const messages = getApiErrorMessages(error);

      expect(messages).toEqual(['Resource not found']);
    });

    it('should return error message from Error instance', () => {
      const error = new Error('Network error');

      const messages = getApiErrorMessages(error);

      expect(messages).toEqual(['Network error']);
    });

    it('should return default message for unknown error', () => {
      const error = null;

      const messages = getApiErrorMessages(error);

      expect(messages).toEqual(['An unexpected error occurred']);
    });

    it('should return default message for error without response data', () => {
      const error: Partial<ApiError> = {
        config: {} as any,
        isAxiosError: true,
        name: 'AxiosError',
        message: 'Request failed',
      };

      const messages = getApiErrorMessages(error);

      expect(messages).toEqual(['An unexpected error occurred']);
    });

    it('should handle error with response but no message', () => {
      const error: ApiError = {
        response: {
          data: {
            statusCode: 500,
            error: 'Internal Server Error',
            message: '',
            timestamp: '2024-01-01T00:00:00.000Z',
            path: '/api/test',
          },
          status: 500,
          statusText: 'Internal Server Error',
          headers: {},
          config: {} as any,
        },
        config: {} as any,
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Request failed',
      };

      const messages = getApiErrorMessages(error);

      expect(messages).toEqual(['An unexpected error occurred']);
    });
  });

  describe('isApiError', () => {
    it('should return true for valid ApiError', () => {
      const error: ApiError = {
        response: {
          data: {
            statusCode: 400,
            error: 'Bad Request',
            message: 'Invalid input',
            timestamp: '2024-01-01T00:00:00.000Z',
            path: '/api/test',
          },
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          config: {} as any,
        },
        config: {} as any,
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Request failed',
      };

      expect(isApiError(error)).toBe(true);
    });

    it('should return false for regular Error', () => {
      const error = new Error('Network error');

      expect(isApiError(error)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isApiError(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isApiError(undefined)).toBe(false);
    });

    it('should return false for string', () => {
      expect(isApiError('error')).toBe(false);
    });

    it('should return false for object without response', () => {
      const error = { message: 'Error' };

      expect(isApiError(error)).toBe(false);
    });

    it('should return false for object with response but no data', () => {
      const error = {
        response: {
          status: 400,
        },
      };

      expect(isApiError(error)).toBe(false);
    });
  });

  describe('getApiErrorCode', () => {
    it('should return error code from API error with string error', () => {
      const error: ApiError = {
        response: {
          data: {
            statusCode: 400,
            error: 'Bad Request',
            message: 'Invalid input',
            timestamp: '2024-01-01T00:00:00.000Z',
            path: '/api/test',
          },
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          config: {} as any,
        },
        config: {} as any,
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Request failed',
      };

      const code = getApiErrorCode(error);

      expect(code).toBe('Bad Request');
    });

    it('should return first error code from API error with array error', () => {
      const error: ApiError = {
        response: {
          data: {
            statusCode: 400,
            error: ['Validation Error', 'Format Error'],
            message: 'Multiple errors',
            timestamp: '2024-01-01T00:00:00.000Z',
            path: '/api/test',
          },
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          config: {} as any,
        },
        config: {} as any,
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Request failed',
      };

      const code = getApiErrorCode(error);

      expect(code).toBe('Validation Error');
    });

    it('should return null for non-API error', () => {
      const error = new Error('Network error');

      const code = getApiErrorCode(error);

      expect(code).toBeNull();
    });

    it('should return null for error without error code', () => {
      const error: ApiError = {
        response: {
          data: {
            statusCode: 500,
            error: '',
            message: 'Server error',
            timestamp: '2024-01-01T00:00:00.000Z',
            path: '/api/test',
          },
          status: 500,
          statusText: 'Internal Server Error',
          headers: {},
          config: {} as any,
        },
        config: {} as any,
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Request failed',
      };

      const code = getApiErrorCode(error);

      expect(code).toBeNull();
    });

    it('should return null for null error', () => {
      const code = getApiErrorCode(null);

      expect(code).toBeNull();
    });
  });

  describe('isApiErrorCode', () => {
    it('should return true when error code matches', () => {
      const error: ApiError = {
        response: {
          data: {
            statusCode: 404,
            error: 'Not Found',
            message: 'Resource not found',
            timestamp: '2024-01-01T00:00:00.000Z',
            path: '/api/test',
          },
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config: {} as any,
        },
        config: {} as any,
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Request failed',
      };

      expect(isApiErrorCode(error, 'Not Found')).toBe(true);
    });

    it('should return false when error code does not match', () => {
      const error: ApiError = {
        response: {
          data: {
            statusCode: 404,
            error: 'Not Found',
            message: 'Resource not found',
            timestamp: '2024-01-01T00:00:00.000Z',
            path: '/api/test',
          },
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config: {} as any,
        },
        config: {} as any,
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Request failed',
      };

      expect(isApiErrorCode(error, 'Bad Request')).toBe(false);
    });

    it('should return false for non-API error', () => {
      const error = new Error('Network error');

      expect(isApiErrorCode(error, 'Not Found')).toBe(false);
    });

    it('should return false for null error', () => {
      expect(isApiErrorCode(null, 'Not Found')).toBe(false);
    });

    it('should handle array error codes correctly', () => {
      const error: ApiError = {
        response: {
          data: {
            statusCode: 400,
            error: ['Validation Error', 'Format Error'],
            message: 'Multiple errors',
            timestamp: '2024-01-01T00:00:00.000Z',
            path: '/api/test',
          },
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          config: {} as any,
        },
        config: {} as any,
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Request failed',
      };

      expect(isApiErrorCode(error, 'Validation Error')).toBe(true);
      expect(isApiErrorCode(error, 'Format Error')).toBe(false);
    });
  });
});
