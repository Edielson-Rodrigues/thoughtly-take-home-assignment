import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CONCERTS_QUERY_KEY } from '../../concerts/hooks/useConcerts';
import { bookingsApi } from '../api/bookings.api';
import type { CreateBookingDTO, Booking } from '../types';

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookingDTO): Promise<Booking> =>
      bookingsApi.create(data).then((res) => res.booking),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONCERTS_QUERY_KEY });
    },
  });
}
