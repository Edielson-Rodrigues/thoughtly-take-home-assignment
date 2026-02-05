/**
 * Ticket Tier types - matches backend TicketTierEntity
 * @see backend/src/domain/entities/ticket-tier/ticket-tier.entity.ts
 */
export interface TicketTier {
  id: string;
  name: string;
  price: number;
  totalQuantity: number;
  availableQuantity: number;
  concertId: string;
  createdAt: string;
}

/**
 * Concert types - matches backend ConcertEntity
 * @see backend/src/domain/entities/concert/concert.entity.ts
 */
export interface Concert {
  id: string;
  name: string;
  description: string;
  location: string;
  date: string;
  ticketTiers?: TicketTier[];
  createdAt: string;
  updatedAt?: string;
}

/**
 * Response type for GET /concerts
 * @see backend/src/presentation/http/concerts/dtos/find.concerts.dto.ts
 */
export interface FindConcertsResponse {
  concerts: Concert[];
}
