import { api } from '../../../lib/axios';
import type { FindConcertsResponse } from '../types';

export const concertsApi = {
  findAll: async (): Promise<FindConcertsResponse> => {
    const response = await api.get<FindConcertsResponse>('/concerts');
    return response.data;
  },
};
