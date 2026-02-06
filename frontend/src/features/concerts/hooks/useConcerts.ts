import { useQuery } from '@tanstack/react-query';

import { concertsApi } from '../api/concerts.api';

import type { Concert } from '../types';

export const CONCERTS_QUERY_KEY = ['concerts'] as const;

export function useConcerts() {
  return useQuery({
    queryKey: CONCERTS_QUERY_KEY,
    queryFn: async (): Promise<Concert[]> => {
      const response = await concertsApi.findAll();
      return response.concerts;
    },
  });
}
