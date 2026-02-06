import { api } from '../../../lib/axios';
import type { CreateBookingDTO, CreateBookingResponse } from '../types';

export const bookingsApi = {
  create: async (data: CreateBookingDTO): Promise<CreateBookingResponse> => {
    const response = await api.post<CreateBookingResponse>('/bookings', data);
    return response.data;
  },
};
