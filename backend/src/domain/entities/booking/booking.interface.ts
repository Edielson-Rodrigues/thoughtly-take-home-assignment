import { TicketTierEntity } from '../ticket-tier/ticket-tier.entity';

export interface IBooking {
  id: string;
  userEmail: string;
  quantity: number;
  totalPrice: number;
  ticketTier?: TicketTierEntity;
  ticketTierId: string;
  idempotencyKey: string;
  createdAt: Date;
}

export type BookingRelations = Record<'ticketTier', boolean>;
export type CreateBooking = Omit<IBooking, 'id' | 'ticketTier' | 'createdAt'>;
