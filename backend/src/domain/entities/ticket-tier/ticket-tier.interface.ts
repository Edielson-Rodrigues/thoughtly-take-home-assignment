import { BookingEntity } from '../booking/booking.entity';
import { ConcertEntity } from '../concert/concert.entity';

export interface ITicketTier {
  id: string;
  name: string;
  price: number;
  totalQuantity: number;
  availableQuantity: number;
  concertId: string;
  bookings?: BookingEntity[];
  concert?: ConcertEntity;
  createdAt: Date;
}

export type TicketTierRelations = Record<'bookings' | 'concert', boolean>;
export type CreateTicketTier = Omit<ITicketTier, 'id' | 'createdAt' | 'availableQuantity'>;
