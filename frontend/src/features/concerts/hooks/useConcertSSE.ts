import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { CONCERTS_QUERY_KEY } from './useConcerts';

import type { Concert, ConcertStockUpdate } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Hook to subscribe to real-time concert stock updates via SSE
 * Updates React Query cache optimistically without triggering refetch
 */
export function useConcertSSE() {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(`${API_URL}/concerts/stream`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const update: ConcertStockUpdate = JSON.parse(event.data);

        queryClient.setQueryData<Concert[]>(CONCERTS_QUERY_KEY, (oldData) => {
          if (!oldData) return oldData;

          return oldData.map((concert) => {
            if (concert.id !== update.concertId) return concert;

            return {
              ...concert,
              ticketTiers: concert.ticketTiers?.map((tier) => {
                if (tier.id !== update.ticketTierId) return tier;

                return {
                  ...tier,
                  availableQuantity: update.newAvailableQuantity,
                };
              }),
            };
          });
        });
      } catch (err) {
        console.error('[SSE] Failed to parse event:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('[SSE] Connection error:', err);
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [queryClient]);
}
