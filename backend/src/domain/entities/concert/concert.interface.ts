import { TicketTier } from '../ticket-tier/ticket-tier.entity';

export interface IConcert {
  id: string;
  name: string;
  description: string;
  location: string;
  date: Date;
  ticketTiers?: TicketTier[];
  createdAt: Date;
  updatedAt: Date;
}

export type CreateConcert = Omit<IConcert, 'id' | 'createdAt' | 'updatedAt'>;
