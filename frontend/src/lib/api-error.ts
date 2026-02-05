import type { ApiError } from './axios';

export function getApiErrorMessages(error: unknown): string[] {
  if (isApiError(error)) {
    const data = error.response?.data;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message : [data.message];
    }
  }

  if (error instanceof Error) {
    return [error.message];
  }

  return ['An unexpected error occurred'];
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as ApiError).response?.data === 'object'
  );
}

export function getApiErrorCode(error: unknown): string | null {
  if (isApiError(error)) {
    const errorCode = error.response?.data?.error;
    if (errorCode) {
      return Array.isArray(errorCode) ? errorCode[0] : errorCode;
    }
  }
  return null;
}


export function isApiErrorCode(error: unknown, code: string): boolean {
  return getApiErrorCode(error) === code;
}
