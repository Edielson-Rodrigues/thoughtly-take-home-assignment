import axios, { AxiosError } from 'axios';

/**
 * API Error Response type - matches backend httpErrorHandler
 * @see backend\src\core\middlewares\http-error.middleware.ts
 */
export interface ApiErrorResponse {
  statusCode: number;
  error: string | string[];
  message: string | string[];
  timestamp: string;
  path: string;
}

export type ApiError = AxiosError<ApiErrorResponse>;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    console.debug(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error: ApiError) => {
    console.error('[API Error]', error.response?.data || error.message);
    return Promise.reject(error);
  },
);
